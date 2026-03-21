import { writeFileSync, appendFileSync, mkdirSync } from "fs";
import type { Address, TransactionReceipt } from "viem";
import { decodeEventLog } from "viem";
import { LANDLORDS_GAME_ABI } from "../../agents/src/chain/abi.js";
import type { Agent, GameState, PlayerState, PropertyState, GameMode } from "../../agents/src/agent.js";
import { ZERO_ADDRESS } from "../../agents/src/agent.js";
import type { GameLog } from "./logger.js";
import { createGameLog, addTurnLog, addRoundSnapshot, finalizeGame, gini } from "./logger.js";

const JAIL_FEE = 50;
const MONOPOLIST_JAIL_TURNS = 3;

/** Known contract revert reasons — extracted from error message */
const REVERT_REASONS = [
  "NotYourTurn", "PlayerInJail", "AlreadyRolled", "GameNotActive",
  "VotePending", "MustRollFirst", "InsufficientFunds", "PropertyNotAvailable",
  "NotPropertyOwner", "MaxHousesReached", "NotInJail", "NoBuyoutInProsperity",
  "VotingDisabled", "SwitchAlreadyProposed", "AlreadyVoted", "NoSwitchProposed",
  "CantBuyInProsperityPark",
] as const;

/** 4-byte selectors for custom errors — decoded via `cast sig "ErrorName()"`.
 *  Custom errors on-chain produce raw hex selectors, not human-readable strings.
 *  Viem can't decode them without the ABI in the error context. */
const ERROR_SELECTORS: Record<string, string> = {
  "0x7c9a1cf9": "AlreadyVoted",
  "0x99e66ee9": "VotePending",
  "0xdbd05e83": "AlreadyRolled",
  "0xe60c8f58": "NotYourTurn",
  "0xa316da96": "SwitchAlreadyProposed",
  "0x6b303685": "NoSwitchProposed",
  "0x00a30971": "GameNotActive",
  "0x59dc4d72": "PlayerInJail",
  "0x7c35fd11": "VotingDisabled",
  "0x94b3c8bf": "MustRollFirst",
  "0xf5b3d09d": "NotInJail",
  "0x41c7afef": "NoBuyoutInProsperity",
  "0x356680b7": "InsufficientFunds",
  "0xda03c7e9": "PropertyNotAvailable",
  "0x9a517dab": "NotPropertyOwner",
  "0x5a7a01c6": "MaxHousesReached",
  "0xfbc30e0d": "CantBuyInProsperityPark",
};

/** Parse the contract revert reason from a viem error — walks the full error tree */
function parseRevertReason(e: any): string {
  // 1. Check all string fields that viem might put the custom error name in
  const candidates = [
    e.shortMessage, e.message, e.details,
    e.cause?.shortMessage, e.cause?.message, e.cause?.reason, e.cause?.details,
    e.cause?.cause?.shortMessage, e.cause?.cause?.message,
    e.walk?.((inner: any) => inner?.data?.errorName)?.data?.errorName,
  ];
  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    for (const reason of REVERT_REASONS) {
      if (candidate.includes(reason)) return reason;
    }
  }

  // 2. Try viem's error data (custom errors have errorName)
  try {
    const walked = typeof e.walk === "function" ? e.walk() : null;
    if (walked?.data?.errorName) return walked.data.errorName;
  } catch {}

  // 3. Match raw revert data hex against known 4-byte selectors
  const dataFields = [
    e.data, e.cause?.data, e.cause?.cause?.data,
    typeof e.walk === "function" ? e.walk()?.data?.data : null,
  ];
  for (const d of dataFields) {
    if (typeof d === "string" && d.startsWith("0x") && d.length >= 10) {
      const selector = d.slice(0, 10).toLowerCase();
      if (ERROR_SELECTORS[selector]) return ERROR_SELECTORS[selector];
    }
    // viem sometimes nests data as { data: "0x..." }
    if (d && typeof d === "object" && typeof d.data === "string") {
      const selector = d.data.slice(0, 10).toLowerCase();
      if (ERROR_SELECTORS[selector]) return ERROR_SELECTORS[selector];
    }
  }

  // 4. Fallback — dump everything useful
  const short = e.shortMessage || "";
  const cause = e.cause?.shortMessage || e.cause?.message || "";
  const details = e.details || "";
  return `${short} | cause: ${cause} | details: ${details}`.slice(0, 200);
}

export interface GameLoopConfig {
  publicClient: any;
  contractAddress: Address;
  gameId: bigint;
  agents: Agent[];
  agentWallets: any[];
  logDir?: string; // Directory for orchestrator JSONL log
  mode?: GameMode; // Explicit mode — avoids stale-read on Sepolia
}

// ─── Orchestrator telemetry log (JSONL, separate from game JSON) ───

class OrchestratorLog {
  private filePath: string | null = null;

  init(dir: string, gameId: number) {
    if (dir) {
      mkdirSync(dir, { recursive: true });
      this.filePath = `${dir}/orchestrator-${gameId}.jsonl`;
      writeFileSync(this.filePath, ""); // Create/truncate
    }
  }

  append(event: Record<string, unknown>) {
    if (!this.filePath) return;
    appendFileSync(this.filePath, JSON.stringify(event) + "\n");
  }
}

// ─── Local game state (updated exclusively from receipt events) ───

interface LocalPlayer {
  address: Address;
  cash: number;
  position: number;
  inJail: boolean;
  turnsInJail: number;
  lastContributionRound: number;
  dividendsReceived: number;
}

interface LocalGameState {
  currentPlayerIndex: number;
  gameOver: boolean;
  winner: Address | null;
  hasRolled: boolean;
  modeSwitchProposed: boolean;
  round: number;
  turnsTaken: number;
  mode: number;
  modeSwitchCount: number;
  votingEnabled: boolean;
  treasury: number;
  lastDice1: number;
  lastDice2: number;
  players: LocalPlayer[];
  properties: { owner: Address; houses: number }[];
  lastSignals: boolean[]; // Phase 3: signals from end of previous turn
}

// ─── Board space cache (40 reads per contract lifetime) ───

interface BoardSpace {
  name: string;
  spaceType: number;
  price: number;
}

let cachedBoardSpaces: BoardSpace[] | null = null;

async function getBoardSpaces(publicClient: any, contractAddress: Address): Promise<BoardSpace[]> {
  if (cachedBoardSpaces) return cachedBoardSpaces;
  const spaces: BoardSpace[] = [];
  for (let i = 0; i < 40; i++) {
    const space = await publicClient.readContract({
      address: contractAddress,
      abi: LANDLORDS_GAME_ABI,
      functionName: "getSpace",
      args: [BigInt(i)],
    }) as any;
    spaces.push({ name: space.name, spaceType: space.spaceType, price: Number(space.price) });
  }
  cachedBoardSpaces = spaces;
  return spaces;
}

export function resetBoardCache() {
  cachedBoardSpaces = null;
}

// ─── Contract interaction ───

interface ContractGameState {
  gameId: bigint;
  tournamentId: bigint;
  mode: number;
  treasury: bigint;
  currentPlayerIndex: bigint;
  round: bigint;
  turnsTaken: bigint;
  gameOver: boolean;
  winner: Address;
  lastDice1: bigint;
  lastDice2: bigint;
  modeSwitchCount: bigint;
  modeSwitchProposed: boolean;
  votingEnabled: boolean;
  hasRolled: boolean;
  monopolistWinThreshold: bigint;
  prosperityWinThreshold: bigint;
  players: {
    addr: Address;
    cash: bigint;
    position: bigint;
    inJail: boolean;
    turnsInJail: number;
    lastContributionRound: bigint;
    dividendsReceived: bigint;
  }[];
  properties: { owner: Address; houses: number }[];
}

async function readGameState(
  publicClient: any,
  contractAddress: Address,
  gameId: bigint,
): Promise<ContractGameState> {
  const result = await publicClient.readContract({
    address: contractAddress,
    abi: LANDLORDS_GAME_ABI,
    functionName: "getFullState",
    args: [gameId],
  }) as any;

  return {
    gameId: result.gameId, tournamentId: result.tournamentId, mode: result.mode,
    treasury: result.treasury, currentPlayerIndex: result.currentPlayerIndex,
    round: result.round, turnsTaken: result.turnsTaken, gameOver: result.gameOver,
    winner: result.winner, lastDice1: result.lastDice1, lastDice2: result.lastDice2,
    modeSwitchCount: result.modeSwitchCount, modeSwitchProposed: result.modeSwitchProposed,
    votingEnabled: result.votingEnabled, hasRolled: result.hasRolled,
    monopolistWinThreshold: result.monopolistWinThreshold,
    prosperityWinThreshold: result.prosperityWinThreshold,
    players: result.players, properties: result.properties,
  };
}

function initLocalState(raw: ContractGameState): LocalGameState {
  return {
    currentPlayerIndex: Number(raw.currentPlayerIndex),
    gameOver: raw.gameOver,
    winner: raw.winner === ZERO_ADDRESS ? null : raw.winner,
    hasRolled: raw.hasRolled,
    modeSwitchProposed: raw.modeSwitchProposed,
    round: Number(raw.round),
    turnsTaken: Number(raw.turnsTaken),
    mode: raw.mode,
    modeSwitchCount: Number(raw.modeSwitchCount),
    votingEnabled: raw.votingEnabled,
    treasury: Number(raw.treasury),
    lastDice1: Number(raw.lastDice1),
    lastDice2: Number(raw.lastDice2),
    players: raw.players.map(p => ({
      address: p.addr,
      cash: Number(p.cash),
      position: Number(p.position),
      inJail: p.inJail,
      turnsInJail: p.turnsInJail,
      lastContributionRound: Number(p.lastContributionRound),
      dividendsReceived: Number(p.dividendsReceived),
    })),
    properties: raw.properties.map(p => ({ owner: p.owner, houses: p.houses })),
    lastSignals: [],
  };
}

// ─── Receipt event parsing ───

function playerIndex(state: LocalGameState, addr: Address): number {
  return state.players.findIndex(p => p.address.toLowerCase() === addr.toLowerCase());
}

function applyReceipt(state: LocalGameState, receipt: TransactionReceipt): void {
  for (const log of receipt.logs) {
    let decoded: any;
    try {
      decoded = decodeEventLog({ abi: LANDLORDS_GAME_ABI, data: log.data, topics: log.topics });
    } catch { continue; }

    const args = decoded.args as any;
    switch (decoded.eventName) {
      case "TurnStarted": {
        const idx = playerIndex(state, args.player);
        if (idx >= 0) state.currentPlayerIndex = idx;
        state.round = Number(args.round);
        state.turnsTaken = Number(args.turnsTaken);
        break;
      }
      case "PlayerMoved": {
        const idx = playerIndex(state, args.player);
        if (idx >= 0) state.players[idx].position = Number(args.toPos);
        state.lastDice1 = Number(args.dice1);
        state.lastDice2 = Number(args.dice2);
        state.hasRolled = true;
        break;
      }
      case "SalaryCollected": {
        const idx = playerIndex(state, args.player);
        if (idx >= 0) state.players[idx].cash = Number(args.newCash);
        break;
      }
      case "RentPaid": {
        const payerIdx = playerIndex(state, args.payer);
        const recipIdx = playerIndex(state, args.recipient);
        if (payerIdx >= 0) state.players[payerIdx].cash = Number(args.payerNewCash);
        if (recipIdx >= 0) state.players[recipIdx].cash = Number(args.recipientNewCash);
        break;
      }
      case "RentToTreasury": {
        const idx = playerIndex(state, args.payer);
        if (idx >= 0) state.players[idx].cash = Number(args.payerNewCash);
        state.treasury = Number(args.newTreasuryBalance);
        break;
      }
      case "TaxPaid": {
        const idx = playerIndex(state, args.player);
        if (idx >= 0) state.players[idx].cash = Number(args.newCash);
        state.treasury = Number(args.newTreasuryBalance);
        break;
      }
      case "TreasuryDividend": {
        state.treasury = Number(args.newTreasuryBalance);
        break;
      }
      case "DividendCollected": {
        const idx = playerIndex(state, args.player);
        if (idx >= 0) {
          state.players[idx].cash = Number(args.newCash);
          state.players[idx].dividendsReceived++;
        }
        break;
      }
      case "SentToJail": {
        const idx = playerIndex(state, args.player);
        if (idx >= 0) {
          state.players[idx].inJail = true;
          state.players[idx].position = 10;
          state.players[idx].turnsInJail = 0;
        }
        break;
      }
      case "ReleasedFromJail": {
        const idx = playerIndex(state, args.player);
        if (idx >= 0) {
          state.players[idx].inJail = false;
          state.players[idx].turnsInJail = 0;
          if (args.newCash !== undefined) state.players[idx].cash = Number(args.newCash);
        }
        break;
      }
      case "PropertyBought": {
        const idx = playerIndex(state, args.player);
        const pos = Number(args.position);
        if (idx >= 0) state.players[idx].cash = Number(args.newCash);
        state.properties[pos].owner = args.player;
        break;
      }
      case "PropertyLiquidated": {
        const pos = Number(args.position);
        state.properties[pos].owner = ZERO_ADDRESS;
        state.properties[pos].houses = 0;
        break;
      }
      case "HouseBuilt": {
        const idx = playerIndex(state, args.player);
        const pos = Number(args.position);
        if (idx >= 0) state.players[idx].cash = Number(args.newCash);
        state.properties[pos].houses = Number(args.totalHouses);
        break;
      }
      case "ModeSwitchProposed": { state.modeSwitchProposed = true; break; }
      case "ModeSwitchVote": { break; }
      case "ModeSwitched": {
        state.mode = Number(args.newMode);
        state.modeSwitchProposed = false;
        state.modeSwitchCount++;
        break;
      }
      case "ModeSwitchRejected": { state.modeSwitchProposed = false; break; }
      case "GameWon": { state.gameOver = true; state.winner = args.winner; break; }
      case "TurnEnded": {
        const idx = playerIndex(state, args.player);
        if (idx >= 0) {
          state.players[idx].cash = Number(args.playerCash);
          state.players[idx].position = Number(args.playerPosition);
          state.players[idx].inJail = args.playerInJail;
          state.players[idx].turnsInJail = Number(args.playerTurnsInJail);
        }
        state.currentPlayerIndex = Number(args.nextPlayerIndex);
        state.round = Number(args.round);
        state.hasRolled = false;
        state.gameOver = args.gameOver;
        break;
      }
      case "ContributionMade": {
        const idx = playerIndex(state, args.player);
        if (idx >= 0) state.players[idx].lastContributionRound = Number(args.round);
        break;
      }
      case "LiquidationSettled": {
        const idx = playerIndex(state, args.player);
        if (idx >= 0) state.players[idx].cash = Number(args.newCash);
        break;
      }
    }
  }
}

// ─── State conversion for agents ───

function toAgentState(local: LocalGameState, agentIndex: number, boardSpaces: BoardSpace[]): GameState {
  const players: PlayerState[] = local.players.map(p => ({
    address: p.address, cash: p.cash, position: p.position,
    inJail: p.inJail, turnsInJail: p.turnsInJail,
    lastContributionRound: p.lastContributionRound,
    dividendsReceived: p.dividendsReceived, netWorth: 0,
  }));
  const properties: PropertyState[] = local.properties.map((p, i) => ({
    owner: p.owner, houses: p.houses, position: i, price: boardSpaces[i].price,
  }));
  for (const player of players) {
    player.netWorth = player.cash;
    for (const prop of properties) {
      if (prop.owner.toLowerCase() === player.address.toLowerCase()) {
        player.netWorth += prop.price + prop.houses * 50;
      }
    }
  }
  const myPlayer = players[agentIndex];
  const myPos = myPlayer.position;
  const space = boardSpaces[myPos];
  return {
    gameId: 0, mode: local.mode === 0 ? "Monopolist" : "Prosperity",
    round: local.round, turnsTaken: local.turnsTaken,
    currentPlayerIndex: local.currentPlayerIndex, treasury: local.treasury,
    players, properties, modeSwitchCount: local.modeSwitchCount,
    modeSwitchProposed: local.modeSwitchProposed, votingEnabled: local.votingEnabled,
    lastSignals: local.lastSignals,
    myIndex: agentIndex, myPosition: myPos, myCash: myPlayer.cash,
    myNetWorth: myPlayer.netWorth, spaceType: space.spaceType,
    spacePrice: space.price, spaceName: space.name,
  };
}

// ─── Nonce manager (per-wallet, local tracking) ───

class NonceManager {
  private nonces = new Map<string, number>();

  async init(publicClient: any, address: string): Promise<void> {
    const nonce = Number(await publicClient.getTransactionCount({ address, blockTag: "pending" }));
    this.nonces.set(address.toLowerCase(), nonce);
  }

  current(address: string): number {
    const key = address.toLowerCase();
    const nonce = this.nonces.get(key);
    if (nonce === undefined) throw new Error(`NonceManager: no nonce for ${address}`);
    return nonce;
  }

  advance(address: string): void {
    const key = address.toLowerCase();
    this.nonces.set(key, this.nonces.get(key)! + 1);
  }

  async resync(publicClient: any, address: string): Promise<void> {
    const nonce = Number(await publicClient.getTransactionCount({ address, blockTag: "pending" }));
    this.nonces.set(address.toLowerCase(), nonce);
  }
}

// ─── Contract write ───

async function writeContract(
  publicClient: any,
  wallet: any,
  contractAddress: Address,
  functionName: string,
  args: any[],
  nonceManager: NonceManager,
  orchLog: OrchestratorLog,
): Promise<TransactionReceipt> {
  const address = wallet.account.address;
  const nonce = nonceManager.current(address);
  const t0 = Date.now();
  orchLog.append({ ts: t0, event: "txSent", fn: functionName, agent: address.slice(0, 10), nonce });

  try {
    // Fixed gas limit — estimation is unreliable because dice rolls change between
    // simulation (block N) and execution (block N+1), hitting different code paths.
    // 500K covers worst case (rollAndMove → liquidation loop over 40 positions).
    const hash = await wallet.writeContract({
      address: contractAddress, abi: LANDLORDS_GAME_ABI, functionName, args,
      account: wallet.account, nonce, gas: 500_000n,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    nonceManager.advance(address);
    if (receipt.status === "reverted") {
      orchLog.append({ ts: Date.now(), event: "txReverted", fn: functionName, agent: address.slice(0, 10), durationMs: Date.now() - t0, blockNumber: Number(receipt.blockNumber), txHash: hash });
      throw new Error(`${functionName} tx reverted on-chain (hash=${hash}, block=${receipt.blockNumber})`);
    }
    orchLog.append({ ts: Date.now(), event: "txConfirmed", fn: functionName, agent: address.slice(0, 10), durationMs: Date.now() - t0, blockNumber: Number(receipt.blockNumber), txHash: hash });
    return receipt;
  } catch (e: any) {
    await nonceManager.resync(publicClient, address);
    orchLog.append({ ts: Date.now(), event: "txFailed", fn: functionName, agent: address.slice(0, 10), reason: parseRevertReason(e).slice(0, 80), durationMs: Date.now() - t0 });
    throw e;
  }
}

// ─── Wait one block ───

async function waitOneBlock(publicClient: any): Promise<void> {
  const current = await publicClient.getBlockNumber();
  while (await publicClient.getBlockNumber() <= current) {
    await new Promise(r => setTimeout(r, 1000));
  }
}

// ─── Universal error handler ───

async function handleTxError(
  e: any,
  publicClient: any,
  contractAddress: Address,
  gameId: bigint,
  local: LocalGameState,
  agentName: string,
  fn: string,
  orchLog: OrchestratorLog,
): Promise<void> {
  const reason = parseRevertReason(e);
  console.error(`  [${agentName}] ${fn} failed: ${reason}`);
  console.error(`    local state: currentIdx=${local.currentPlayerIndex}, hasRolled=${local.hasRolled}, gameOver=${local.gameOver}, round=${local.round}, turn=${local.turnsTaken}`);

  await waitOneBlock(publicClient);
  const resynced = await readGameState(publicClient, contractAddress, gameId);
  const before = { idx: local.currentPlayerIndex, hasRolled: local.hasRolled, round: local.round };
  Object.assign(local, initLocalState(resynced));
  const after = { idx: local.currentPlayerIndex, hasRolled: local.hasRolled, round: local.round };
  console.error(`    resync: idx ${before.idx}→${after.idx}, hasRolled ${before.hasRolled}→${after.hasRolled}, round ${before.round}→${after.round}`);
  orchLog.append({ ts: Date.now(), event: "resync", agent: agentName, fn, reason: reason.slice(0, 200), before, after });
}

// ─── Phase 3: Signal collection ───

function collectSignals(
  local: LocalGameState,
  agents: Agent[],
  boardSpaces: BoardSpace[],
  log: GameLog,
): void {
  const signals: boolean[] = [];
  const signalDetails: { agent: string; strategy: string; signal: boolean }[] = [];

  for (let i = 0; i < agents.length; i++) {
    const agentState = toAgentState(local, i, boardSpaces);
    const signal = agents[i].signalIntent(agentState);
    signals.push(signal);
    signalDetails.push({ agent: agents[i].name, strategy: agents[i].strategyName, signal });
  }

  local.lastSignals = signals;

  // Feed majority signal to Conditional agents (they mirror what others signal)
  for (let i = 0; i < agents.length; i++) {
    if (typeof (agents[i] as any).observeSignal === "function") {
      const otherSignals = signals.filter((_, j) => j !== i);
      const majoritySignal = otherSignals.filter(s => s).length > otherSignals.length / 2;
      (agents[i] as any).observeSignal(majoritySignal);
    }
  }

  addTurnLog(log, local.turnsTaken, "ALL", "ALL", "signals", { signals: signalDetails });
}

// ─── Game loop ───

export async function runGameLoop(config: GameLoopConfig): Promise<GameLog> {
  const { publicClient, contractAddress, gameId, agents, agentWallets, logDir } = config;

  const boardSpaces = await getBoardSpaces(publicClient, contractAddress);
  const rawState = await readGameState(publicClient, contractAddress, gameId);
  const local = initLocalState(rawState);

  const nonces = new NonceManager();
  for (const w of agentWallets) {
    await nonces.init(publicClient, w.account.address);
  }

  const orchLog = new OrchestratorLog();
  if (logDir) orchLog.init(logDir, Number(gameId));

  // Use explicit mode from caller if provided — avoids stale-read on Sepolia
  // where getFullState may return the previous game's mode
  const mode: GameMode = config.mode ?? (local.mode === 0 ? "Monopolist" : "Prosperity");
  const log = createGameLog(Number(gameId), mode, agents.map(a => a.address));

  console.log(`\n--- Game ${gameId} (${mode}) ---`);

  let turnCount = 0;
  const MAX_TURNS = 2000;

  while (!local.gameOver && turnCount < MAX_TURNS) {
    const currentIdx = local.currentPlayerIndex;
    const agent = agents[currentIdx];
    const wallet = agentWallets[currentIdx];
    const player = local.players[currentIdx];
    const tn = local.turnsTaken;

    turnCount++;

    try {
      if (player.inJail) {
        // === JAIL TURN ===
        const buyoutCost = local.mode === 0
          ? JAIL_FEE * (MONOPOLIST_JAIL_TURNS - player.turnsInJail) : 0;

        // Try buyout (Monopolist only)
        if (local.mode === 0 && agent.decideJailBuyout(toAgentState(local, currentIdx, boardSpaces), buyoutCost)) {
          try {
            const receipt = await writeContract(publicClient, wallet, contractAddress, "payJailBuyout", [gameId], nonces, orchLog);
            applyReceipt(local, receipt);
            addTurnLog(log, tn, agent.name, agent.strategyName, "jailBuyout", { cost: buyoutCost }, receipt.transactionHash);
          } catch {
            // Buyout failed — fall through to wait
          }
        }

        if (local.players[currentIdx].inJail) {
          // Still in jail — wait (turn ends via _finishTurn in contract)
          const receipt = await writeContract(publicClient, wallet, contractAddress, "waitInJail", [gameId], nonces, orchLog);
          applyReceipt(local, receipt);
          addTurnLog(log, tn, agent.name, agent.strategyName, "jailWait", { turnsServed: local.players[currentIdx].turnsInJail }, receipt.transactionHash);
          continue; // Turn is over — _finishTurn advanced to next player
        }

        // Buyout succeeded — fall through to normal roll/buy/build/endTurn
      }

      // === NORMAL TURN (or freed from jail via buyout) ===

      // 1. Optional mode switch proposal (before roll)
      if (local.votingEnabled && !local.hasRolled && !local.modeSwitchProposed &&
          agent.decidePropose(toAgentState(local, currentIdx, boardSpaces))) {
        const receipt = await writeContract(publicClient, wallet, contractAddress, "proposeModeSwitch", [gameId], nonces, orchLog);
        applyReceipt(local, receipt);
        addTurnLog(log, tn, agent.name, agent.strategyName, "proposeModeSwitch", { currentMode: mode }, receipt.transactionHash);

        for (const a of agents) {
          if (typeof (a as any).observeProposal === "function") (a as any).observeProposal();
        }
      }

      // 1b. Resolve pending vote — handles both fresh proposals and crash recovery
      if (local.modeSwitchProposed) {
        for (let i = 0; i < agents.length; i++) {
          if (i === currentIdx) continue;
          const voterState = toAgentState(local, i, boardSpaces);
          const vote = agents[i].decideVote(voterState);
          const signaled = local.lastSignals.length > i ? local.lastSignals[i] : undefined;
          const keptPromise = signaled !== undefined ? signaled === vote : undefined;
          try {
            const vReceipt = await writeContract(publicClient, agentWallets[i], contractAddress, "voteModeSwitch", [gameId, vote], nonces, orchLog);
            applyReceipt(local, vReceipt);
            addTurnLog(log, tn, agents[i].name, agents[i].strategyName, "vote", { inFavor: vote, signaled, keptPromise }, vReceipt.transactionHash);
          } catch (voteErr: any) {
            // Vote reverted — AlreadyVoted, NoSwitchProposed, or ProposerCannotVote.
            // On-chain reverts lose revert data (receipt has no reason), so we can't
            // string-match the custom error. All possible reverts mean "skip this voter."
            console.log(`  [${agents[i].name}] vote skipped (reverted: ${parseRevertReason(voteErr).slice(0, 60)})`);
            continue;
          }
        }

        // Re-read chain state to pick up vote resolution
        const postVote = await readGameState(publicClient, contractAddress, gameId);
        Object.assign(local, initLocalState(postVote));

        if (local.gameOver) break;
        if (local.currentPlayerIndex !== currentIdx) {
          // Proposal rejected — turn lost (TurnEnded already advanced)
          addTurnLog(log, tn, agent.name, agent.strategyName, "proposalRejected", {});
          continue;
        }
        if (!local.modeSwitchProposed) {
          addTurnLog(log, tn, agent.name, agent.strategyName, "proposalPassed", { newMode: local.mode === 0 ? "Monopolist" : "Prosperity" });
        }
      }

      // 2. Roll and move (skip if already rolled — resuming mid-turn)
      let rollTxHash: string | undefined;
      if (!local.hasRolled) {
        const receipt = await writeContract(publicClient, wallet, contractAddress, "rollAndMove", [gameId], nonces, orchLog);
        applyReceipt(local, receipt);
        rollTxHash = receipt.transactionHash;
      }

      const dice1 = local.lastDice1;
      const dice2 = local.lastDice2;
      addTurnLog(log, tn, agent.name, agent.strategyName, "roll", {
        dice: (dice1 === 0 && dice2 === 0) ? null : [dice1, dice2],
        position: local.players[currentIdx].position,
        spaceName: boardSpaces[local.players[currentIdx].position].name,
        cash: local.players[currentIdx].cash,
      }, rollTxHash);

      if (local.gameOver) break;

      // 3. Buy/build (if not jailed during landing)
      if (!local.players[currentIdx].inJail) {
        const postRollState = toAgentState(local, currentIdx, boardSpaces);
        await tryBuyAndBuild(publicClient, wallet, contractAddress, gameId, agent, postRollState, log, tn, local, nonces, orchLog);
      }

      // 4. End turn
      if (!local.gameOver) {
        // Diagnostic: log state the contract will check
        const expectedNonce = nonces.current(wallet.account.address);
        console.log(`  [${agent.name}] endTurn pre-flight: hasRolled=${local.hasRolled}, gameOver=${local.gameOver}, currentIdx=${local.currentPlayerIndex}, expectedIdx=${currentIdx}, inJail=${local.players[currentIdx].inJail}, nonce=${expectedNonce}`);
        const receipt = await writeContract(publicClient, wallet, contractAddress, "endTurn", [gameId], nonces, orchLog);
        applyReceipt(local, receipt);
        addTurnLog(log, tn, agent.name, agent.strategyName, "endTurn", {}, receipt.transactionHash);
      }

    } catch (e: any) {
      // === UNIVERSAL ERROR HANDLER ===
      // Any tx failure: wait one block, re-read chain state, restart turn.
      // No recovery writes. No cascading errors.
      await handleTxError(e, publicClient, contractAddress, gameId, local, agent.name, "turn", orchLog);
      continue;
    }

    // Round snapshot at the start of each new round
    if (local.currentPlayerIndex === 0) {
      addRoundSnapshotFromLocal(log, local, agents, boardSpaces);
    }

    // Phase 3: Collect signals at end of each turn (not turn 0, before next turn's potential proposal)
    if (local.turnsTaken > 0 && !local.gameOver) {
      collectSignals(local, agents, boardSpaces, log);
    }
  }

  // Phase 3: Final signal poll at game end (data only, no follow-up action)
  if (local.turnsTaken > 0) {
    collectSignals(local, agents, boardSpaces, log);
  }

  // Final state
  const finalBalances = local.players.map(p => p.cash);
  const netWorths = local.players.map((p) => {
    let nw = p.cash;
    for (let pos = 0; pos < 40; pos++) {
      if (local.properties[pos].owner.toLowerCase() === p.address.toLowerCase()) {
        nw += boardSpaces[pos].price + local.properties[pos].houses * 50;
      }
    }
    return nw;
  });
  const giniCoeff = gini(netWorths);

  finalizeGame(log, {
    winner: local.winner ?? ZERO_ADDRESS,
    mode: local.mode === 0 ? "Monopolist" : "Prosperity",
    rounds: local.round,
    turnsTaken: local.turnsTaken,
    giniCoefficient: giniCoeff,
    finalBalances,
    treasuryFinal: local.treasury,
    netWorths,
  });

  console.log(`  Winner: ${local.winner}`);
  console.log(`  Rounds: ${local.round}, Turns: ${local.turnsTaken}`);
  console.log(`  Gini: ${giniCoeff.toFixed(4)}`);
  console.log(`  Final balances: [${finalBalances.join(", ")}]`);

  return log;
}

function addRoundSnapshotFromLocal(log: GameLog, local: LocalGameState, agents: Agent[], boardSpaces: BoardSpace[]) {
  const players = local.players.map((p) => {
    let nw = p.cash;
    for (let pos = 0; pos < 40; pos++) {
      if (local.properties[pos].owner.toLowerCase() === p.address.toLowerCase()) {
        nw += boardSpaces[pos].price + local.properties[pos].houses * 50;
      }
    }
    return { address: p.address, cash: p.cash, position: p.position, inJail: p.inJail, netWorth: nw };
  });
  log.roundSnapshots.push({
    round: local.round, players, treasury: local.treasury,
    mode: local.mode === 0 ? "Monopolist" : "Prosperity",
  });
}

async function tryBuyAndBuild(
  publicClient: any, wallet: any, contractAddress: Address, gameId: bigint,
  agent: Agent, state: GameState, log: GameLog, turnNumber: number,
  local: LocalGameState, nonces: NonceManager, orchLog: OrchestratorLog,
): Promise<void> {
  if (agent.decideBuy(state)) {
    try {
      const receipt = await writeContract(publicClient, wallet, contractAddress, "buyProperty", [gameId], nonces, orchLog);
      applyReceipt(local, receipt);
      addTurnLog(log, turnNumber, agent.name, agent.strategyName, "buy", { position: state.myPosition, price: state.spacePrice }, receipt.transactionHash);
    } catch { /* Can't buy — silent */ }
  }

  const postBuyState = toAgentState(local, state.myIndex, await getBoardSpaces(publicClient, contractAddress));
  const buildPositions = agent.decideBuild(postBuyState);
  for (const pos of buildPositions) {
    try {
      const receipt = await writeContract(publicClient, wallet, contractAddress, "buildHouse", [gameId, BigInt(pos)], nonces, orchLog);
      applyReceipt(local, receipt);
      addTurnLog(log, turnNumber, agent.name, agent.strategyName, "build", { position: pos }, receipt.transactionHash);
    } catch { /* Can't build — silent */ }
  }
}
