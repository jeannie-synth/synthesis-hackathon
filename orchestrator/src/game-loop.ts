import type { Address } from "viem";
import { LANDLORDS_GAME_ABI } from "../../agents/src/chain/abi.js";
import type { Agent, GameState, PlayerState, PropertyState, GameMode } from "../../agents/src/agent.js";
import { SpaceType, ZERO_ADDRESS } from "../../agents/src/agent.js";
import type { GameLog } from "./logger.js";
import { createGameLog, addTurnLog, addRoundSnapshot, finalizeGame, gini } from "./logger.js";

const JAIL_FEE = 50;
const MONOPOLIST_JAIL_TURNS = 3;

export interface GameLoopConfig {
  publicClient: any;
  contractAddress: Address;
  gameId: bigint;
  agents: Agent[];
  agentWallets: any[];
}

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

/** Convert contract state to agent-friendly GameState */
function toAgentState(raw: ContractGameState, agentIndex: number, boardSpaces: { name: string; spaceType: number; price: any }[]): GameState {
  const players: PlayerState[] = raw.players.map(p => ({
    address: p.addr,
    cash: Number(p.cash),
    position: Number(p.position),
    inJail: p.inJail,
    turnsInJail: p.turnsInJail,
    lastContributionRound: Number(p.lastContributionRound),
    dividendsReceived: Number(p.dividendsReceived),
    netWorth: 0, // Filled below
  }));

  const properties: PropertyState[] = raw.properties.map((p, i) => ({
    owner: p.owner,
    houses: p.houses,
    position: i,
    price: Number(boardSpaces[i].price),
  }));

  // Calculate net worths
  for (const player of players) {
    player.netWorth = player.cash;
    for (const prop of properties) {
      if (prop.owner === player.address) {
        player.netWorth += prop.price + prop.houses * 50;
      }
    }
  }

  const myPlayer = players[agentIndex];
  const myPos = myPlayer.position;
  const space = boardSpaces[myPos];

  return {
    gameId: Number(raw.gameId),
    mode: raw.mode === 0 ? "Monopolist" : "Prosperity",
    round: Number(raw.round),
    turnsTaken: Number(raw.turnsTaken),
    currentPlayerIndex: Number(raw.currentPlayerIndex),
    treasury: Number(raw.treasury),
    players,
    properties,
    modeSwitchCount: Number(raw.modeSwitchCount),
    modeSwitchProposed: raw.modeSwitchProposed,
    votingEnabled: raw.votingEnabled,
    myIndex: agentIndex,
    myPosition: myPos,
    myCash: myPlayer.cash,
    myNetWorth: myPlayer.netWorth,
    spaceType: space.spaceType,
    spacePrice: Number(space.price),
    spaceName: space.name,
  };
}

/** Read full game state from contract. Alias for readGameStateAt without block pinning. */
function readGameState(publicClient: any, contractAddress: Address, gameId: bigint) {
  return readGameStateAt(publicClient, contractAddress, gameId);
}

/** Load board spaces once (shared across all games) */
async function loadBoardSpaces(
  publicClient: any,
  contractAddress: Address,
): Promise<{ name: string; spaceType: number; price: any }[]> {
  const spaces: { name: string; spaceType: number; price: any }[] = [];
  for (let i = 0; i < 40; i++) {
    const space = await publicClient.readContract({
      address: contractAddress,
      abi: LANDLORDS_GAME_ABI,
      functionName: "getSpace",
      args: [BigInt(i)],
    }) as any;
    spaces.push({ name: space.name, spaceType: space.spaceType, price: space.price });
  }
  return spaces;
}

/**
 * Nonce manager — tracks nonces locally to avoid stale RPC reads on Sepolia.
 * Public RPCs return stale nonces between rapid sequential txs from the same wallet.
 */
class NonceManager {
  private nonces = new Map<string, number>();

  async getNonce(publicClient: any, address: string): Promise<number> {
    if (!this.nonces.has(address)) {
      const count = await publicClient.getTransactionCount({ address });
      this.nonces.set(address, Number(count));
    }
    return this.nonces.get(address)!;
  }

  increment(address: string) {
    const current = this.nonces.get(address) ?? 0;
    this.nonces.set(address, current + 1);
  }
}

const nonceManager = new NonceManager();

/** Write a contract call and wait for receipt.
 *  Returns the confirmed block number for read-after-write consistency. */
async function writeContract(
  publicClient: any,
  wallet: any,
  contractAddress: Address,
  functionName: string,
  args: any[],
): Promise<bigint> {
  if (!wallet.account) {
    throw new Error(`writeContract(${functionName}): wallet has no account!`);
  }
  const address = wallet.account.address;
  const nonce = await nonceManager.getNonce(publicClient, address);

  const hash = await wallet.writeContract({
    address: contractAddress,
    abi: LANDLORDS_GAME_ABI,
    functionName,
    args,
    account: wallet.account,
    nonce,
  });
  nonceManager.increment(address);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return receipt.blockNumber;
}

/** Read game state at a specific block (or latest if not specified).
 *  Passing the block number from a confirmed tx ensures read-after-write consistency on Sepolia. */
async function readGameStateAt(
  publicClient: any,
  contractAddress: Address,
  gameId: bigint,
  blockNumber?: bigint,
): Promise<ContractGameState> {
  const result = await publicClient.readContract({
    address: contractAddress,
    abi: LANDLORDS_GAME_ABI,
    functionName: "getFullState",
    args: [gameId],
    ...(blockNumber ? { blockNumber } : {}),
  }) as any;

  return {
    gameId: result.gameId,
    tournamentId: result.tournamentId,
    mode: result.mode,
    treasury: result.treasury,
    currentPlayerIndex: result.currentPlayerIndex,
    round: result.round,
    turnsTaken: result.turnsTaken,
    gameOver: result.gameOver,
    winner: result.winner,
    lastDice1: result.lastDice1,
    lastDice2: result.lastDice2,
    modeSwitchCount: result.modeSwitchCount,
    modeSwitchProposed: result.modeSwitchProposed,
    votingEnabled: result.votingEnabled,
    hasRolled: result.hasRolled,
    monopolistWinThreshold: result.monopolistWinThreshold,
    prosperityWinThreshold: result.prosperityWinThreshold,
    players: result.players,
    properties: result.properties,
  };
}

/** Run a complete game and return the log */
export async function runGameLoop(config: GameLoopConfig): Promise<GameLog> {
  const { publicClient, contractAddress, gameId, agents, agentWallets } = config;

  // Load board spaces once
  const boardSpaces = await loadBoardSpaces(publicClient, contractAddress);

  // Read initial state
  let rawState = await freshRead();
  const mode: GameMode = rawState.mode === 0 ? "Monopolist" : "Prosperity";
  const log = createGameLog(Number(gameId), mode, agents.map(a => a.address));

  console.log(`\n--- Game ${gameId} (${mode}) ---`);

  // Track last confirmed block for read-after-write consistency on Sepolia.
  // Public RPCs may return stale state if we read at "latest" immediately after a tx confirms.
  // Using var (not let) to avoid temporal dead zone issues with closures defined below.
  var lastBlock: bigint | undefined = undefined;

  /** Write + read: sends tx, waits for receipt, reads state at confirmed block */
  async function sendAndRead(w: any, fn: string, args: any[]): Promise<ContractGameState> {
    lastBlock = await writeContract(publicClient, w, contractAddress, fn, args);
    return readGameStateAt(publicClient, contractAddress, gameId, lastBlock);
  }

  /** Read state at last known block (or latest if no writes yet) */
  async function freshRead(): Promise<ContractGameState> {
    return readGameStateAt(publicClient, contractAddress, gameId, lastBlock);
  }

  let turnCount = 0;
  const MAX_TURNS = 2000; // Safety limit

  while (!rawState.gameOver && turnCount < MAX_TURNS) {
    const currentIdx = Number(rawState.currentPlayerIndex);
    const agent = agents[currentIdx];
    const wallet = agentWallets[currentIdx];
    const player = rawState.players[currentIdx];
    const agentState = toAgentState(rawState, currentIdx, boardSpaces);
    const tn = Number(rawState.turnsTaken); // turnNumber for logging

    turnCount++;

    // Diagnostic: verify wallet matches contract player (first 3 turns only)
    if (turnCount <= 3) {
      console.log(`  [DIAG] Turn ${turnCount}: player=${currentIdx} contract_addr=${player.addr} wallet_addr=${wallet.account?.address} match=${wallet.account?.address?.toLowerCase() === player.addr.toLowerCase()}`);
    }

    if (player.inJail) {
      // === JAIL TURN ===
      const buyoutCost = rawState.mode === 0
        ? JAIL_FEE * (MONOPOLIST_JAIL_TURNS - player.turnsInJail)
        : 0;

      if (rawState.mode === 0 && agent.decideJailBuyout(agentState, buyoutCost)) {
        try {
          lastBlock = await writeContract(publicClient, wallet, contractAddress, "payJailBuyout", [gameId]);
          addTurnLog(log, tn, agent.name, "jailBuyout", { cost: buyoutCost });

          // After buyout, player can roll
          lastBlock = await writeContract(publicClient, wallet, contractAddress, "rollAndMove", [gameId]);

          // Re-read state after roll
          rawState = await freshRead();
          const newAgentState = toAgentState(rawState, currentIdx, boardSpaces);

          // Buy/build if not jailed during landing
          if (!rawState.players[currentIdx].inJail) {
            lastBlock = await tryBuyAndBuild(publicClient, wallet, contractAddress, gameId, agent, newAgentState, log, tn) ?? lastBlock;
          }

          if (!rawState.gameOver) {
            try {
              lastBlock = await writeContract(publicClient, wallet, contractAddress, "endTurn", [gameId]);
            } catch (e2: any) {
              console.error(`  [${agent.name}] endTurn after buyout failed: ${e2.shortMessage || e2.message}`);
              rawState = await freshRead();
            }
          }
        } catch (e: any) {
          addTurnLog(log, tn, agent.name, "jailBuyoutFailed", { error: e.message?.slice(0, 100) });
          // Fall back to waiting
          lastBlock = await writeContract(publicClient, wallet, contractAddress, "waitInJail", [gameId]);
          addTurnLog(log, tn, agent.name, "jailWait", { turnsServed: player.turnsInJail + 1 });
        }
      } else {
        lastBlock = await writeContract(publicClient, wallet, contractAddress, "waitInJail", [gameId]);
        addTurnLog(log, tn, agent.name, "jailWait", { turnsServed: player.turnsInJail + 1 });
      }
    } else {
      // === NORMAL TURN ===

      // 1. Optional mode switch proposal (before roll) — only if voting enabled
      let proposed = false;
      if (rawState.votingEnabled && agent.decidePropose(agentState)) {
        try {
          lastBlock = await writeContract(publicClient, wallet, contractAddress, "proposeModeSwitch", [gameId]);
          proposed = true;
          addTurnLog(log, tn, agent.name, "proposeModeSwitch", { currentMode: agentState.mode });

          // Notify all agents that a proposal occurred (pragmatists track this)
          for (const a of agents) {
            if (typeof (a as any).observeProposal === "function") {
              (a as any).observeProposal();
            }
          }

          // All other agents vote
          for (let i = 0; i < agents.length; i++) {
            if (i === currentIdx) continue;
            const voterState = toAgentState(rawState, i, boardSpaces);
            const vote = agents[i].decideVote(voterState);
            lastBlock = await writeContract(publicClient, agentWallets[i], contractAddress, "voteModeSwitch", [gameId, vote]);
            addTurnLog(log, tn, agents[i].name, "vote", { inFavor: vote });
          }
        } catch (e: any) {
          addTurnLog(log, tn, agent.name, "proposeFailed", { error: e.message?.slice(0, 100) });
        }
      }

      // After any proposal attempt, verify state before rolling
      if (proposed) {
        rawState = await freshRead();
        if (rawState.gameOver) break;
        if (Number(rawState.currentPlayerIndex) !== currentIdx) {
          // Proposal was rejected — turn was skipped by contract
          addTurnLog(log, tn, agent.name, "proposalRejected", {});
          continue;
        }
        if (rawState.modeSwitchProposed) {
          // Vote stuck (incomplete voting) — can't roll, skip turn gracefully
          console.error(`  [${agent.name}] vote stuck (modeSwitchProposed still true), skipping`);
          continue;
        }
        addTurnLog(log, tn, agent.name, "proposalPassed", { newMode: rawState.mode === 0 ? "Monopolist" : "Prosperity" });
      }

      // 2. Roll and move
      try {
        lastBlock = await writeContract(publicClient, wallet, contractAddress, "rollAndMove", [gameId]);
      } catch (e: any) {
        // rollAndMove failed — recover by diagnosing and advancing the turn
        rawState = await freshRead();
        if (rawState.gameOver) break;

        const stuckPlayer = rawState.players[Number(rawState.currentPlayerIndex)];
        if (stuckPlayer.inJail) {
          // PlayerInJail revert — route to jail handling
          try {
            lastBlock = await writeContract(publicClient, wallet, contractAddress, "waitInJail", [gameId]);
            addTurnLog(log, tn, agent.name, "jailWait", { turnsServed: stuckPlayer.turnsInJail + 1, recovery: true });
          } catch { /* waitInJail also failed — fall through */ }
        } else if (rawState.hasRolled) {
          // AlreadyRolled revert — force endTurn to advance
          try {
            lastBlock = await writeContract(publicClient, wallet, contractAddress, "endTurn", [gameId]);
            addTurnLog(log, tn, agent.name, "endTurn", { recovery: true });
          } catch { /* endTurn also failed — fall through */ }
        } else {
          console.error(`  [${agent.name}] rollAndMove failed unexpectedly: ${e.shortMessage || e.message}`);
        }

        rawState = await freshRead();
        continue;
      }
      rawState = await freshRead();

      const postRollState = toAgentState(rawState, currentIdx, boardSpaces);
      const dice1 = Number(rawState.lastDice1);
      const dice2 = Number(rawState.lastDice2);
      addTurnLog(log, tn, agent.name, "roll", {
        dice: (dice1 === 0 && dice2 === 0) ? null : [dice1, dice2], // Ghost roll guard: [0,0] = uninitialized
        position: Number(rawState.players[currentIdx].position),
        spaceName: boardSpaces[Number(rawState.players[currentIdx].position)].name,
        cash: Number(rawState.players[currentIdx].cash),
      });

      if (rawState.gameOver) break;

      // 3. Buy/build (if not jailed during landing)
      if (!rawState.players[currentIdx].inJail) {
        lastBlock = await tryBuyAndBuild(publicClient, wallet, contractAddress, gameId, agent, postRollState, log, tn) ?? lastBlock;
      }

      // 4. End turn (only if we're still the current player — might have changed due to liquidation/jail)
      rawState = await freshRead();
      if (!rawState.gameOver && Number(rawState.currentPlayerIndex) === currentIdx) {
        try {
          lastBlock = await writeContract(publicClient, wallet, contractAddress, "endTurn", [gameId]);
        } catch (e: any) {
          // Silently recover — the game will continue on the next iteration
          rawState = await freshRead();
        }
      }
    }

    // Re-read state for next iteration
    rawState = await freshRead();

    // Round snapshot at the start of each new round
    if (Number(rawState.currentPlayerIndex) === 0) {
      addRoundSnapshot(log, rawState, agents);
    }
  }

  // Final state
  rawState = await freshRead();
  const finalBalances = rawState.players.map(p => Number(p.cash));
  const netWorths = rawState.players.map((_, i) => {
    let nw = Number(rawState.players[i].cash);
    for (let pos = 0; pos < 40; pos++) {
      if (rawState.properties[pos].owner === rawState.players[i].addr) {
        nw += Number(boardSpaces[pos].price) + rawState.properties[pos].houses * 50;
      }
    }
    return nw;
  });
  // Gini on net worth (wealth inequality), not just cash
  const giniCoeff = gini(netWorths);

  finalizeGame(log, {
    winner: rawState.winner,
    mode: rawState.mode === 0 ? "Monopolist" : "Prosperity",
    rounds: Number(rawState.round),
    turnsTaken: Number(rawState.turnsTaken),
    giniCoefficient: giniCoeff,
    finalBalances,
    treasuryFinal: Number(rawState.treasury),
    netWorths,
  });

  console.log(`  Winner: ${rawState.winner}`);
  console.log(`  Rounds: ${rawState.round}, Turns: ${rawState.turnsTaken}`);
  console.log(`  Gini: ${giniCoeff.toFixed(4)}`);
  console.log(`  Final balances: [${finalBalances.join(", ")}]`);

  return log;
}

/** Try to buy property and build houses. Returns last confirmed block number. */
async function tryBuyAndBuild(
  publicClient: any,
  wallet: any,
  contractAddress: Address,
  gameId: bigint,
  agent: Agent,
  state: GameState,
  log: GameLog,
  turnNumber: number,
): Promise<bigint | undefined> {
  let block: bigint | undefined;

  // Buy?
  if (agent.decideBuy(state)) {
    try {
      block = await writeContract(publicClient, wallet, contractAddress, "buyProperty", [gameId]);
      addTurnLog(log, turnNumber, agent.name, "buy", { position: state.myPosition, price: state.spacePrice });
    } catch {
      // Can't buy — not a property space, already owned, etc. Silent fail.
    }
  }

  // Build?
  const buildPositions = agent.decideBuild(state);
  for (const pos of buildPositions) {
    try {
      block = await writeContract(publicClient, wallet, contractAddress, "buildHouse", [gameId, BigInt(pos)]);
      addTurnLog(log, turnNumber, agent.name, "build", { position: pos });
    } catch {
      // Can't build — not enough cash, max houses, etc. Silent fail.
    }
  }

  return block;
}
