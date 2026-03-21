# The Landlord's Game — Super Tournament Skill File

> Internal skill file for autonomous Claude Code agents playing the 5-round super tournament on Base Mainnet.

You are one of 5 autonomous agents playing The Landlord's Game. There is **no orchestrator** — you call the contract directly, poll for your turn, choose your own strategy, and log your reasoning on every decision.

---

## Your Identity

You are assigned a **wallet index** (0–4) and an **HD derivation path** (`m/44'/60'/0'/0/{index}`). Your wallet is derived from `AGENT_MNEMONIC` in `.env`. Your address is your on-chain identity across all games.

Your `.env` file contains:
- `AGENT_MNEMONIC` — shared mnemonic (derive your wallet at your HD path)
- `PRIVATE_KEY` — deployer key (only Agent 0 uses this for `createGame`)
- `BASE_MAINNET_RPC` — RPC endpoint for Base Mainnet
- `BASE_SEPOLIA_RPC` — RPC endpoint for Base Sepolia (for historical scanning)

---

## Contracts

### Mainnet (Super Tournament plays here)

| Field | Value |
|-------|-------|
| Address | `0x496cf175126ce10728b75f02e457f144ffca275a` |
| Chain | Base Mainnet (chain ID `8453`) |
| RPC | Value of `BASE_MAINNET_RPC` in `.env` |

### Sepolia (Historical data — scan before choosing strategies)

| Contract | Games | What |
|----------|-------|------|
| `0xa39c342b4aa41749d018e72af6a0dd80f88e4f0e` | 31 | Phase 1 tournament (fixed rules, no voting) |
| `0xda1557c901ff5b7a0d9f0d0da17fef55b2d59d85` | 39 | Phase 1+2 tournaments + super tournament round 1 (voting enabled) |
| `0x82d298c50d53575b8c0dfbd72885d6584114eb04` | 3 | V2 contract validation |

Use `BASE_SEPOLIA_RPC` and `getFullState(gameId)` to scan these. Loop from gameId 1 to `nextGameId - 1`.

### Source & ABI

| File | Purpose |
|------|---------|
| `contracts/src/LandlordsGame.sol` | Smart contract source |
| `agents/src/chain/abi.ts` | Full contract ABI |

---

## Super Tournament Protocol

### Overview

5 rounds. Each round: 3 Monopolist games + 3 Prosperity games = 6 games per round, 30 games total. All games have `votingEnabled=true`.

### Strategy Slots

Each agent carries **2 strategy slots per round**:
- One strategy for **Monopolist** games (used in all 3 Monopolist games that round)
- One strategy for **Prosperity** games (used in all 3 Prosperity games that round)

You may choose different strategies for different modes. This is the experiment — do agents converge on different strategies for different rule sets?

**IMPORTANT**: Once you choose a strategy for a mode in a round, you must stick to it for all 3 games of that mode. This is demo mode — consistent execution, not improvisation. Your reasoning and strategy evolution happen *between* rounds, not mid-game.

### Round Flow

1. **Scan historical data** (Round 1: Sepolia contracts. Rounds 2+: also completed mainnet games):
   - For each Sepolia contract, loop `getFullState(gameId)` from 1 to `nextGameId - 1`
   - Note: who won, net worths, mode, rounds, mode switches
   - You won't know which strategies other wallets used — infer from behavior patterns

2. **Choose strategies** — one for Monopolist, one for Prosperity:
   - **Round 1**: Choose based on strategy descriptions + Sepolia historical data
   - **Rounds 2–5**: Choose based on all observed data (Sepolia + prior mainnet rounds)
   - Log your reasoning for both choices

3. **Agent 0 creates 6 games**:
   - 3 games with `mode=0` (Monopolist), `tournamentId = 500 + roundNumber`
   - 3 games with `mode=1` (Prosperity), `tournamentId = 500 + roundNumber`
   - `createGame(tournamentId, mode, [agent0Address], 0, 0, true)`
   - Write game IDs to `data/super-tournament/round-N-games.json`

4. **Agents 1–4 join each game**:
   - Call `joinGame(gameId)` for all 6 games
   - Wait until all 5 players appear in `getFullState(gameId).players`

5. **All 5 agents play all 6 games to completion**:
   - Poll `getFullState(gameId)` — when `players[currentPlayerIndex].addr` is your address, it's your turn
   - Execute your chosen strategy for that mode (Monopolist strategy or Prosperity strategy)
   - Log reasoning on every decision (see Logging section)
   - Continue until `gameOver == true` for all 6 games

6. **Review results and repeat** for 5 rounds total

7. **After Round 5**: Declare what you would choose for a hypothetical Round 6 — shows whether your strategy has stabilized or is still shifting.

### Winning

- **Winner of Monopolist** = the agent (wallet) with the most wins across all 15 Monopolist games
- **Winner of Prosperity** = the agent (wallet) with the most wins across all 15 Prosperity games
- Different agents can win each mode — that's part of the thesis
- The **agent** wins, not the strategy — but we study which strategies agents converge on per mode

### Game Coordination (No Orchestrator)

- **Sequential play**: Games are played **one at a time**, not in parallel. All agents focus on game 1 until `gameOver == true`, then game 2, etc. This avoids nonce collisions (each wallet has one nonce sequence — parallel txs to different games will fail).
- **Game order**: Play the 3 Monopolist games first (using your Monopolist strategy), then the 3 Prosperity games (using your Prosperity strategy).
- **Turn polling**: Call `getFullState(gameId)` every 3–5 seconds. When it's your turn, act. When it's not, wait and poll.
- **Patience**: Other agents may be slow. If it's not your turn, wait. Don't spam the RPC.
- **One tx at a time**: Send a transaction, wait for receipt, then decide your next action. Never send a second tx before the first confirms.
- **Error recovery**: If a transaction reverts, re-read state and retry. Use fixed gas limit of 500,000 for all writes.

---

## Turn Lifecycle

```
1. Read state: getFullState(gameId)
2. Is it my turn? → players[currentPlayerIndex].addr == myAddress
3. Am I in jail?
   Yes → waitInJail(gameId) [turn ends automatically]
         OR payJailBuyout(gameId) if Monopolist mode [then continue to step 4]
   No → continue

4. Should I propose a mode switch? (votingEnabled && !hasRolled && !modeSwitchProposed)
   Yes → proposeModeSwitch(gameId)
         Then: poll until modeSwitchProposed == false (all votes resolved)
         If rejected: turn ends (lose your roll). Go to step 1.
   No → continue

5. rollAndMove(gameId)
   Dice roll + movement + landing effects happen atomically on-chain.

6. Should I buy? (landed on unowned property with enough cash)
   Yes → buyProperty(gameId)

7. Should I build? (own properties, have $50+ per house, < 4 houses)
   Yes → buildHouse(gameId, position) [repeat for each property to build on]

8. endTurn(gameId)
   Advances to next player. Your turn is done.
```

### Voting (When Someone Else Proposes)

If `modeSwitchProposed == true` and you haven't voted yet:
- Call `voteModeSwitch(gameId, inFavor)` — `true` to support the switch, `false` to oppose
- The proposal resolves automatically when all votes are in
- Proposer gets implicit +1 vote; passes if `votesFor + 1 > votesAgainst`

You must vote before the game can proceed. Check for pending proposals every poll cycle.

---

## Political Signaling

Before each vote, you may **signal** your intended vote to other agents. This is off-chain coordination — you write your signal to your log file, other agents can read it.

**Every agent can lie or tell the truth about their signal.** This is a strategic decision:

- **Honest signaling**: Tell others what you'll actually vote. Builds trust, enables coalitions.
- **Deceptive signaling**: Signal one way, vote another. May cause opponents to waste a proposal (proposer loses their turn if rejected), or mislead coalition builders.

**Log your signal reasoning every time you vote:**
- What you signaled (if anything)
- What you actually voted
- Whether you lied or told the truth
- Why — what strategic benefit did honesty or deception give you?
- If you changed your mind between signal and vote, explain what changed

Example log entry:
```
Signal: I told Agent 2 I'd vote for Prosperity (true — I want mode switch)
Vote: voteModeSwitch(gameId, true) — tx 0xabc...
Reasoning: Honest signal. In Prosperity mode, my Generative strategy performs better.
I considered lying to make the proposer waste a turn, but the coalition needed my vote.
```

---

## Strategy Menu

Choose one strategy per mode per round. In Round 1, pick based on descriptions + Sepolia data. In Rounds 2–5, pick based on all observed results.

### 1. Extractive
*Marjorie Kelly's extractive ownership. "Always Defect" in prisoner's dilemma.*

| Decision | Logic |
|----------|-------|
| Buy | Always, if cash >= price |
| Build | All owned properties, if cash >= $50 |
| Propose | Only when in Prosperity mode AND falling behind average net worth |
| Vote | Always vote to switch to Monopolist |
| Jail buyout | Always pay if affordable |

**Personality**: Accumulate everything. Own everything. The rules should favor the strong.

### 2. Generative
*Marjorie Kelly's generative ownership. "Always Cooperate" in prisoner's dilemma.*

| Decision | Logic |
|----------|-------|
| Buy | Only if cash >= 2x price (keep surplus) |
| Build | Only in Prosperity mode, if cash >= $100 |
| Propose | Only when in Monopolist mode AND falling behind average net worth |
| Vote | Always vote to switch to Prosperity |
| Jail buyout | Never pay (wait it out) |

**Personality**: Invest carefully. Build only when the system rewards it. The rules should lift everyone.

### 3. Conditional (Tit-for-Tat)
*Fischbacher's conditional cooperator (~50% of humans). Mirrors group behavior.*

| Decision | Logic |
|----------|-------|
| Buy | First round: yes. Then: buy if majority of others bought last round |
| Build | Build if majority of others built last round |
| Propose | Only after observing someone else propose first; then if falling behind avg NW |
| Vote | Mirror majority from last vote |
| Jail buyout | Pay if cash > average AND affordable |

**Personality**: Start nice. Then do what others do. If they cooperate, cooperate. If they defect, defect.

**Tracking required**: Observe what other agents did by comparing `getFullState` snapshots before and after turns.

### 4. Free Rider
*Fischbacher's free rider (~30% of humans). Ostrom's rational egoist.*

| Decision | Logic |
|----------|-------|
| Buy | Never |
| Build | Never |
| Propose | Only after observing someone else propose; then if cash trending down |
| Vote | Vote to switch if cash is declining; keep current mode if cash is rising |
| Jail buyout | Never pay |

**Personality**: Contribute nothing. Collect dividends. Vote to protect your income stream. The Prosperity jail mechanic is designed to catch you — you'll get jailed for free-riding the commons.

### 5. Pavlov (Win-Stay, Lose-Shift)
*Nowak & Sigmund (1993). Most human-like adaptive strategy.*

| Decision | Logic |
|----------|-------|
| Buy | If cash increased since 3 turns ago: repeat last decision. If decreased: flip. |
| Build | Same win-stay/lose-shift |
| Propose | Only after observing someone else propose; then if cash declining |
| Vote | If winning (cash rising): repeat last vote. If losing: flip. |
| Jail buyout | Same win-stay/lose-shift |

**Personality**: What worked? Do it again. What didn't? Try the opposite. Simple, adaptive, effective.

**Tracking required**: Remember your last decision for each action type, and your cash 3 turns ago.

---

## Logging Your Reasoning

Logging is critical — it's part of the submission. Judges see your reasoning.

### Per-Round Log (strategy selection)

Before each round, append to `data/super-tournament/agent-{N}-log.md`:
```
## Round N

### Strategy Selection
**Monopolist strategy**: [name]
**Prosperity strategy**: [name]
**Reasoning**: [What did you observe from Sepolia history / prior rounds? Why these strategies for these modes? What do you expect?]
```

### Per-Turn Log (decision reasoning)

After every turn where you make a decision (buy, build, propose, vote, jail), append:
```
### Game [gameId] Turn [turnNumber]
**Action**: [what you did] — tx 0x...
**Reasoning**: [why — 1-2 sentences. Reference your strategy, the game state, your position]
```

Skip logging for mechanical actions (roll, endTurn) — just log the tx hash inline. Focus reasoning on decisions where the strategy dictates a choice.

### Per-Vote Log (political signaling)

When voting on a mode switch proposal:
```
**Signal**: [what I signaled to others, or "no signal"]
**Vote**: voteModeSwitch(gameId, [true/false]) — tx 0x...
**Honesty**: [lied / told truth / changed mind]
**Reasoning**: [why — strategic benefit of honesty or deception]
```

### Post-Round Log

After all 6 games in a round complete:
```
### Round N Results
**Monopolist wins**: [gameIds won, or "none"]
**Prosperity wins**: [gameIds won, or "none"]
**Monopolist rankings**: [rank/5 in each game, average NW]
**Prosperity rankings**: [rank/5 in each game, average NW]
**Strategy assessment**: [Did the strategies work as expected? What surprised you?]
**Next round plan**: [Keep or change strategies? Why?]
```

### Post-Tournament Declaration (after Round 5)

```
## Hypothetical Round 6
**Monopolist strategy I would choose**: [name]
**Prosperity strategy I would choose**: [name]
**Reasoning**: [Has my thinking stabilized? What would I do differently with more rounds?]
**Overall reflection**: [What did I learn about which strategies work under which rules?]
```

---

## Scanning Sepolia History

Before Round 1, scan completed games on Sepolia to inform your strategy choices.

### How to scan

```typescript
// For each Sepolia contract:
const sepoliaContracts = [
  '0xa39c342b4aa41749d018e72af6a0dd80f88e4f0e',  // Phase 1 (31 games)
  '0xda1557c901ff5b7a0d9f0d0da17fef55b2d59d85',  // Phase 1+2 (39 games)
  '0x82d298c50d53575b8c0dfbd72885d6584114eb04',  // V2 validation (3 games)
];

// Get nextGameId, then loop:
for (let gameId = 1; gameId < nextGameId; gameId++) {
  const state = await sepoliaClient.readContract({
    address: contractAddr, abi: GAME_ABI,
    functionName: 'getFullState', args: [BigInt(gameId)]
  });
  if (state.gameOver) {
    // Analyze: mode, winner, net worths, rounds, modeSwitchCount, treasury
  }
}
```

### What to look for

1. **Gini coefficient**: Calculate from net worths. High = concentrated wealth. Compare Monopolist vs Prosperity.
2. **Who won**: Which addresses won under which modes?
3. **Mode switches**: How many times did the mode change? More switches = more political activity.
4. **Treasury**: High treasury in Prosperity = dividends flowing. Low = agents buying everything.
5. **Rounds to completion**: Monopolist games tend to be longer (wealth takes time to concentrate).

---

## Reading Past Results

### Check completed game state

```
getFullState(gameId) returns:
  - gameOver: bool (true = game finished)
  - winner: address (winner's address)
  - mode: uint8 (0 = Monopolist, 1 = Prosperity)
  - round: uint256 (how many rounds the game lasted)
  - turnsTaken: uint256 (total turns)
  - treasury: uint256 (final treasury balance)
  - modeSwitchCount: uint256 (how many times the mode changed)
  - players[]: array of {addr, cash, position, inJail, turnsInJail, ...}
  - properties[40]: array of {owner, houses}
```

### Calculate net worth

Net worth = cash + sum of owned property face values + (houses x $50)

The contract has `getNetWorth(gameId, playerIndex)` — a view function that does this for you.

### Finding open games

The contract has `findOpenGame()` — returns the first game that hasn't started and isn't full. Useful for joiners.

---

## Technical Details

### Using viem

```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { mnemonicToAccount } from 'viem/accounts';
import { GAME_ABI } from '../agents/src/chain/abi';

const account = mnemonicToAccount(process.env.AGENT_MNEMONIC!, {
  addressIndex: YOUR_WALLET_INDEX  // 0-4
});

const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_MAINNET_RPC)
});

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(process.env.BASE_MAINNET_RPC)
});
```

### Writing transactions

```typescript
const hash = await walletClient.writeContract({
  address: CONTRACT_ADDRESS,
  abi: GAME_ABI,
  functionName: 'rollAndMove',
  args: [gameId],
  gas: 500_000n  // Fixed gas — ALWAYS use this
});

const receipt = await publicClient.waitForTransactionReceipt({ hash });
if (receipt.status === 'reverted') {
  // Re-read state and retry or skip
}
```

### Important: Fixed gas limit

**Always use `gas: 500_000n` for all write transactions.** Gas estimation is unreliable because dice rolls change between simulation and execution (different block = different `block.prevrandao` = different dice = different landing = different gas path).

### Error handling

Contract reverts with named errors. Common ones:
- `NotYourTurn()` — not your turn (poll state, wait)
- `GameNotActive()` — game is over
- `PlayerInJail()` — handle jail first
- `AlreadyRolled()` — already rolled this turn (skip to buy/build/endTurn)
- `MustRollFirst()` — must roll before ending turn
- `VotePending()` — a mode switch proposal needs votes before you can roll
- `AlreadyVoted()` — you already voted on this proposal (skip)
- `InsufficientFunds()` — can't afford this action (skip)

On any revert: re-read `getFullState`, figure out what the contract expects, and act accordingly. Don't retry blindly.

---

## File Reference

| File | Purpose |
|------|---------|
| `contracts/src/LandlordsGame.sol` | Smart contract source (read for edge cases) |
| `agents/src/chain/abi.ts` | Full contract ABI |
| `agents/src/strategies/*.ts` | Reference implementations of all 5 strategies |
| `docs/game-rules.md` | Complete game rules |
| `docs/skill.md` | External skill file (for other hackathon agents) |
| `data/super-tournament/` | Tournament logs, game IDs, agent reasoning |

---

*The Landlord's Game — Elizabeth Magie, 1903. Same board, two rule sets. The rules shape the outcome, not the players. Now prove it.*