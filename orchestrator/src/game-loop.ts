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
    myIndex: agentIndex,
    myPosition: myPos,
    myCash: myPlayer.cash,
    myNetWorth: myPlayer.netWorth,
    spaceType: space.spaceType,
    spacePrice: Number(space.price),
    spaceName: space.name,
  };
}

/** Read full game state from contract */
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
    monopolistWinThreshold: result.monopolistWinThreshold,
    prosperityWinThreshold: result.prosperityWinThreshold,
    players: result.players,
    properties: result.properties,
  };
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

/** Write a contract call and wait for receipt */
async function writeContract(
  publicClient: any,
  wallet: any,
  contractAddress: Address,
  functionName: string,
  args: any[],
): Promise<void> {
  const hash = await wallet.writeContract({
    address: contractAddress,
    abi: LANDLORDS_GAME_ABI,
    functionName,
    args,
  });
  await publicClient.waitForTransactionReceipt({ hash });
}

/** Run a complete game and return the log */
export async function runGameLoop(config: GameLoopConfig): Promise<GameLog> {
  const { publicClient, contractAddress, gameId, agents, agentWallets } = config;

  // Load board spaces once
  const boardSpaces = await loadBoardSpaces(publicClient, contractAddress);

  // Read initial state
  let rawState = await readGameState(publicClient, contractAddress, gameId);
  const mode: GameMode = rawState.mode === 0 ? "Monopolist" : "Prosperity";
  const log = createGameLog(Number(gameId), mode, agents.map(a => a.address));

  console.log(`\n--- Game ${gameId} (${mode}) ---`);

  let turnCount = 0;
  const MAX_TURNS = 2000; // Safety limit

  while (!rawState.gameOver && turnCount < MAX_TURNS) {
    const currentIdx = Number(rawState.currentPlayerIndex);
    const agent = agents[currentIdx];
    const wallet = agentWallets[currentIdx];
    const player = rawState.players[currentIdx];
    const agentState = toAgentState(rawState, currentIdx, boardSpaces);

    turnCount++;

    if (player.inJail) {
      // === JAIL TURN ===
      const buyoutCost = rawState.mode === 0
        ? JAIL_FEE * (MONOPOLIST_JAIL_TURNS - player.turnsInJail)
        : 0;

      if (rawState.mode === 0 && agent.decideJailBuyout(agentState, buyoutCost)) {
        try {
          await writeContract(publicClient, wallet, contractAddress, "payJailBuyout", [gameId]);
          addTurnLog(log, agent.name, "jailBuyout", { cost: buyoutCost });

          // After buyout, player can roll
          await writeContract(publicClient, wallet, contractAddress, "rollAndMove", [gameId]);

          // Re-read state after roll
          rawState = await readGameState(publicClient, contractAddress, gameId);
          const newAgentState = toAgentState(rawState, currentIdx, boardSpaces);

          // Buy/build if not jailed during landing
          if (!rawState.players[currentIdx].inJail) {
            await tryBuyAndBuild(publicClient, wallet, contractAddress, gameId, agent, newAgentState, log);
          }

          if (!rawState.gameOver) {
            try {
              await writeContract(publicClient, wallet, contractAddress, "endTurn", [gameId]);
            } catch (e2: any) {
              console.error(`  [${agent.name}] endTurn after buyout failed: ${e2.shortMessage || e2.message}`);
              rawState = await readGameState(publicClient, contractAddress, gameId);
            }
          }
        } catch (e: any) {
          addTurnLog(log, agent.name, "jailBuyoutFailed", { error: e.message?.slice(0, 100) });
          // Fall back to waiting
          await writeContract(publicClient, wallet, contractAddress, "waitInJail", [gameId]);
          addTurnLog(log, agent.name, "jailWait", { turnsServed: player.turnsInJail + 1 });
        }
      } else {
        await writeContract(publicClient, wallet, contractAddress, "waitInJail", [gameId]);
        addTurnLog(log, agent.name, "jailWait", { turnsServed: player.turnsInJail + 1 });
      }
    } else {
      // === NORMAL TURN ===

      // 1. Optional mode switch proposal (before roll)
      if (agent.decidePropose(agentState)) {
        try {
          await writeContract(publicClient, wallet, contractAddress, "proposeModeSwitch", [gameId]);
          addTurnLog(log, agent.name, "proposeModeSwitch", { currentMode: agentState.mode });

          // All other agents vote
          for (let i = 0; i < agents.length; i++) {
            if (i === currentIdx) continue;
            const voterState = toAgentState(rawState, i, boardSpaces);
            const vote = agents[i].decideVote(voterState);
            await writeContract(publicClient, agentWallets[i], contractAddress, "voteModeSwitch", [gameId, vote]);
            addTurnLog(log, agents[i].name, "vote", { inFavor: vote });
          }

          // Re-read: check if turn was skipped (rejected proposal)
          rawState = await readGameState(publicClient, contractAddress, gameId);
          if (rawState.gameOver) break;
          if (Number(rawState.currentPlayerIndex) !== currentIdx) {
            addTurnLog(log, agent.name, "proposalRejected", {});
            continue; // Turn was skipped, state already re-read
          }

          addTurnLog(log, agent.name, "proposalPassed", { newMode: rawState.mode === 0 ? "Monopolist" : "Prosperity" });
        } catch (e: any) {
          addTurnLog(log, agent.name, "proposeFailed", { error: e.message?.slice(0, 100) });
        }
      }

      // 2. Roll and move
      try {
        await writeContract(publicClient, wallet, contractAddress, "rollAndMove", [gameId]);
      } catch (e: any) {
        console.error(`  [${agent.name}] rollAndMove failed: ${e.shortMessage || e.message}`);
        // Try to recover by re-reading state
        rawState = await readGameState(publicClient, contractAddress, gameId);
        continue;
      }
      rawState = await readGameState(publicClient, contractAddress, gameId);

      const postRollState = toAgentState(rawState, currentIdx, boardSpaces);
      addTurnLog(log, agent.name, "roll", {
        dice: [Number(rawState.lastDice1), Number(rawState.lastDice2)],
        position: Number(rawState.players[currentIdx].position),
        spaceName: boardSpaces[Number(rawState.players[currentIdx].position)].name,
        cash: Number(rawState.players[currentIdx].cash),
      });

      if (rawState.gameOver) break;

      // 3. Buy/build (if not jailed during landing)
      if (!rawState.players[currentIdx].inJail) {
        await tryBuyAndBuild(publicClient, wallet, contractAddress, gameId, agent, postRollState, log);
      }

      // 4. End turn (only if we're still the current player — might have changed due to liquidation/jail)
      rawState = await readGameState(publicClient, contractAddress, gameId);
      if (!rawState.gameOver && Number(rawState.currentPlayerIndex) === currentIdx) {
        try {
          await writeContract(publicClient, wallet, contractAddress, "endTurn", [gameId]);
        } catch (e: any) {
          // Silently recover — the game will continue on the next iteration
          rawState = await readGameState(publicClient, contractAddress, gameId);
        }
      }
    }

    // Re-read state for next iteration
    rawState = await readGameState(publicClient, contractAddress, gameId);

    // Round snapshot at the start of each new round
    if (Number(rawState.currentPlayerIndex) === 0) {
      addRoundSnapshot(log, rawState, agents);
    }
  }

  // Final state
  rawState = await readGameState(publicClient, contractAddress, gameId);
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

/** Try to buy property and build houses */
async function tryBuyAndBuild(
  publicClient: any,
  wallet: any,
  contractAddress: Address,
  gameId: bigint,
  agent: Agent,
  state: GameState,
  log: GameLog,
) {
  // Buy?
  if (agent.decideBuy(state)) {
    try {
      await writeContract(publicClient, wallet, contractAddress, "buyProperty", [gameId]);
      addTurnLog(log, agent.name, "buy", { position: state.myPosition, price: state.spacePrice });
    } catch {
      // Can't buy — not a property space, already owned, etc. Silent fail.
    }
  }

  // Build?
  const buildPositions = agent.decideBuild(state);
  for (const pos of buildPositions) {
    try {
      await writeContract(publicClient, wallet, contractAddress, "buildHouse", [gameId, BigInt(pos)]);
      addTurnLog(log, agent.name, "build", { position: pos });
    } catch {
      // Can't build — not enough cash, max houses, etc. Silent fail.
    }
  }
}
