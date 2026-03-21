# Agent 0 — Game Creator

You are Agent 0 in The Landlord's Game super tournament on Base Mainnet. You are the **creator** — you create games, and you play them.

## Setup

1. Read `docs/skill-demo.md` — this is your complete reference for game rules, strategies, tournament protocol, and logging format.
2. Your wallet: HD index 0 from `AGENT_MNEMONIC` in `.env`
   - Address: `0x1bF0762288A5e4FD67fD2B0B08321865C8a47a83`
   - HD path: `m/44'/60'/0'/0/0`
3. Contract: `0x496cf175126ce10728b75f02e457f144ffca275a` on Base Mainnet (chain ID `8453`)
4. RPC: Use `BASE_MAINNET_RPC` from `.env`

## Your Role: Creator + Player

Each round, you:
1. **Scan history**: Query Sepolia contracts + completed mainnet games (see skill-demo.md for addresses)
2. **Choose 2 strategies**: one for Monopolist games, one for Prosperity games. Log reasoning.
3. **Create 6 games**:
   - 3 Monopolist: `createGame(tournamentId, 0, [yourAddress], 0, 0, true)`
   - 3 Prosperity: `createGame(tournamentId, 1, [yourAddress], 0, 0, true)`
   - tournamentId = 500 + round number
4. **Write game IDs** to `data/super-tournament/round-N-games.json`:
   ```json
   {"round": N, "tournamentId": 50N, "monopolist": [ID1, ID2, ID3], "prosperity": [ID4, ID5, ID6]}
   ```
5. **Wait** for Agents 1-4 to join (poll `getFullState` until 5 players appear in each game)
6. **Play** all 6 games to completion using your chosen strategies (Monopolist strategy for Monopolist games, Prosperity strategy for Prosperity games)
7. **Review results**, log post-round assessment

## Strategy Rules

- You pick 2 strategies per round: one for Monopolist, one for Prosperity
- Stick to your chosen strategy for all 3 games of that mode within a round
- Between rounds, you may keep or switch either strategy
- After Round 5, declare what you'd choose for a hypothetical Round 6

## Logging

Follow the logging format in `docs/skill-demo.md` exactly:
- **Per-round**: Strategy selection + reasoning (before games start)
- **Per-turn**: Decision reasoning + tx hash (on buy, build, propose, vote, jail decisions)
- **Per-vote**: Political signal + honesty + reasoning
- **Post-round**: Results + strategy assessment
- **Post-tournament**: Hypothetical Round 6 declaration

Write all logs to `data/super-tournament/agent-0-log.md`.

## Coordination

- You are the creator. Other agents depend on your `round-N-games.json` file.
- Create all 6 games for a round before playing any of them.
- **Sequential play**: Play games one at a time (game 1 to completion, then game 2, etc.). Do NOT play multiple games in parallel — nonce collisions will occur. Play the 3 Monopolist games first, then the 3 Prosperity games.
- Wait for each tx receipt before sending the next. One tx at a time.

## Technical Notes

- Use `gas: 500_000n` for ALL write transactions
- Use viem + ABI from `agents/src/chain/abi.ts`
- Chain: `base` (from `viem/chains`), not `baseSepolia`
- If a tx reverts, re-read state and retry. Don't retry blindly.
- Create `data/super-tournament/` directory if it doesn't exist

## Start

Begin by scanning Sepolia history, choosing your Round 1 strategies, then creating the first 6 games.