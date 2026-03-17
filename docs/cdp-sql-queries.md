# CDP SQL API — Verification Queries

Contract address: `{CONTRACT_ADDRESS}` (fill after Sepolia deploy)

## Setup

1. Portal: [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com)
2. Secret API Key (Ed25519) — save Key ID + Secret
3. Env vars: `CDP_API_KEY_ID`, `CDP_API_KEY_SECRET`
4. Endpoint: `POST https://api.cdp.coinbase.com/platform/v2/data/query/run`
5. Body: `{ "sql": "your query" }` (NOT `query` — must be `sql`)
6. Auth: Ed25519 JWT with `uri` claim (see `scripts/test-cdp-sql.mjs`)

## Verified Schema (from live test)

Table: `base_sepolia.events` (Sepolia) / `base.events` (Mainnet)

| Column | Type | Notes |
|--------|------|-------|
| `event_name` | String | e.g., "GameCreated", "RentPaid" |
| `event_signature` | String | e.g., "GameCreated(uint256,uint256,...)" |
| `parameters` | Map | Decoded named params: `parameters['gameId']` |
| `parameter_types` | Map | ABI types: `parameter_types['gameId']` = "uint256" |
| `address` | String | Contract address (lowercase) |
| `block_number` | String | Block number |
| `block_timestamp` | String | ISO 8601 timestamp |
| `block_hash` | String | |
| `transaction_hash` | String | |
| `transaction_from` | String | EOA that sent the tx |
| `transaction_to` | String | Tx destination |
| `log_index` | Number | Position in tx |
| `topics` | Array | Raw indexed topics |
| `action` | String | "added" or "removed" (reorg) |

**Important**: Always filter by `address` first. Full table scans hit the 93 GiB byte limit.

## Query 1 — Event census (sanity check)

All 19 event types should appear. If any are missing, contract or indexing issue.

```sql
SELECT event_name, count() AS cnt
FROM base.events
WHERE address = '0xCONTRACT_ADDRESS'
GROUP BY event_name
ORDER BY cnt DESC
```

Expected events: GameCreated, TurnStarted, PlayerMoved, SalaryCollected, PropertyBought, RentPaid, RentToTreasury, TaxPaid, HouseBuilt, TreasuryDividend, DividendCollected, PropertyLiquidated, SentToJail, ReleasedFromJail, ModeSwitchProposed, ModeSwitchVote, ModeSwitched, ModeSwitchRejected, GameWon.

## Query 2 — Single game timeline (verify against local JSON)

Full chronological event stream for one game. Compare against `data/games/tournament-*/game-{N}-*.json`.

```sql
SELECT
  block_number,
  log_index,
  event_name,
  parameters,
  block_timestamp,
  transaction_hash
FROM base.events
WHERE address = '0xCONTRACT_ADDRESS'
  AND parameters['gameId'] = '1'
ORDER BY block_number ASC, log_index ASC
```

## Query 3 — Tournament overview

All games created, their modes, and player addresses.

```sql
SELECT
  parameters['gameId'] AS game_id,
  parameters['tournamentId'] AS tournament_id,
  parameters['mode'] AS mode,
  parameters['players'] AS players,
  parameters['monopolistWinThreshold'] AS m_threshold,
  parameters['prosperityWinThreshold'] AS p_threshold,
  block_timestamp
FROM base.events
WHERE address = '0xCONTRACT_ADDRESS'
  AND event_name = 'GameCreated'
ORDER BY block_number ASC
```

## Query 4 — Wealth outcomes (the thesis query)

Every GameWon event carries the full net worth snapshot. This single query gives Gini-computable data directly from on-chain evidence.

```sql
SELECT
  parameters['gameId'] AS game_id,
  parameters['winner'] AS winner,
  parameters['mode'] AS mode,
  parameters['round'] AS final_round,
  parameters['turnsTaken'] AS turns,
  parameters['winnerNetWorth'] AS winner_net_worth,
  parameters['allPlayerNetWorths'] AS all_net_worths,
  parameters['finalTreasury'] AS treasury
FROM base.events
WHERE address = '0xCONTRACT_ADDRESS'
  AND event_name = 'GameWon'
ORDER BY block_number ASC
```

## Query 5 — Rent flow comparison (Monopolist vs Prosperity)

Rent to owners (Monopolist) vs rent to treasury (Prosperity) — the core mechanic divergence.

```sql
-- Monopolist: rent flows to property owners
SELECT
  parameters['gameId'] AS game_id,
  parameters['payer'] AS payer,
  parameters['recipient'] AS recipient,
  parameters['position'] AS position,
  parameters['amount'] AS amount
FROM base.events
WHERE address = '0xCONTRACT_ADDRESS'
  AND event_name = 'RentPaid'
ORDER BY block_number ASC

-- Prosperity: rent flows to treasury
SELECT
  parameters['gameId'] AS game_id,
  parameters['payer'] AS payer,
  parameters['position'] AS position,
  parameters['amount'] AS amount,
  parameters['newTreasuryBalance'] AS treasury
FROM base.events
WHERE address = '0xCONTRACT_ADDRESS'
  AND event_name = 'RentToTreasury'
ORDER BY block_number ASC
```

## Query 6 — Dividend distribution (Prosperity commons)

Treasury redistributions — the mechanism that makes Prosperity work.

```sql
SELECT
  parameters['gameId'] AS game_id,
  parameters['treasuryBefore'] AS treasury_before,
  parameters['amountPerPlayer'] AS per_player,
  parameters['playerCount'] AS player_count,
  block_timestamp
FROM base.events
WHERE address = '0xCONTRACT_ADDRESS'
  AND event_name = 'TreasuryDividend'
ORDER BY block_number ASC
```

## Query 7 — Commons exploitation (Free Rider detection)

Jail events with reason — the on-chain immune system against free riders.

```sql
SELECT
  parameters['gameId'] AS game_id,
  parameters['player'] AS player,
  parameters['reason'] AS reason,
  block_timestamp
FROM base.events
WHERE address = '0xCONTRACT_ADDRESS'
  AND event_name = 'SentToJail'
ORDER BY block_number ASC
```

Reason values: 0 = LandedOnGoToJail, 1 = CantPayDebt, 2 = CommonsExploitation.

## Query 8 — Mode switch political activity

Proposals, votes, outcomes — the political layer.

```sql
-- Proposals
SELECT
  parameters['gameId'] AS game_id,
  parameters['proposer'] AS proposer,
  parameters['currentMode'] AS from_mode,
  parameters['proposedMode'] AS to_mode
FROM base.events
WHERE address = '0xCONTRACT_ADDRESS'
  AND event_name = 'ModeSwitchProposed'
ORDER BY block_number ASC

-- Outcomes
SELECT
  event_name,
  parameters['gameId'] AS game_id,
  parameters['round'] AS round,
  parameters['votesFor'] AS votes_for,
  parameters['votesAgainst'] AS votes_against
FROM base.events
WHERE address = '0xCONTRACT_ADDRESS'
  AND event_name IN ('ModeSwitched', 'ModeSwitchRejected')
ORDER BY block_number ASC
```

## Verification Claim

When local JSON logs match on-chain event data from these queries:

> "Game outcomes verified against immutable on-chain evidence via Coinbase Developer Platform SQL API. Local analytics are independently reproducible from `base.events` — no trust in the orchestrator required."

This deepens the Base partnership claim from "deployed on Base" to "uses Base for chain AND data verification."