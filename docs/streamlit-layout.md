# Streamlit Dashboard — Layout Proposal

> Status: PROPOSAL — not yet approved. Discuss before implementing.
> Stack: Python, Streamlit, Plotly
> Data source: `data/games/tournament-*/` JSON logs
> Target: Days 5-6 (Stream V)

---

## Page 1: Thesis

The hero page. One image that proves the argument.

- **Gini curves over rounds** — two lines (Monopolist vs Prosperity) diverging from the same starting point. Computed from `roundSnapshots` in each game log. Show mean curve with confidence band across all games.
- **Terminal Gini distribution** — histogram or box plot comparing final Gini values across M and P games.
- **Thesis verdict** — auto-generated one-sentence summary from data (e.g., "Monopolist rules produce 2.1x greater wealth inequality across 100 games").

## Page 2: Strategy Performance

How each strategy fares under each rule set.

- **Dominance analysis table** — from `performanceTable` in tournament results. Strategy, rank under M, rank under P, dominance flag.
- **Net worth by strategy** — grouped bar chart, M vs P side by side. Error bars from std.
- **Win rate by strategy** — stacked bar chart (strategy x mode).
- **Twin divergence** — horizontal divergence bars (one per strategy, length = prosperity net worth minus monopolist net worth).

## Page 3: Game Dynamics

What happens during games, not just final outcomes.

- **Jail events by strategy by mode** — bar chart. The Free Rider signal: does Prosperity jail expose free riders?
- **Treasury curve over rounds** — area chart (Prosperity only; Monopolist treasury is always 0).
- **Proposal counts and pass rates** — per-mode comparison.
- **Buy/build activity by strategy** — grouped bars showing purchasing and building behavior differences.

## Page 4: Single Game Explorer

For judges who want to drill into individual games.

- **Game selector** — dropdown (tournament + game ID).
- **Round-by-round player state** — table or line chart of cash, position, net worth per player per round.
- **Turn log table** — filterable by agent name and action type.

## Page 5: Payoff Heatmap (Phase 3 placeholder)

- **5 strategies x 2 rule sets** — heatmap with diverging colormap.
- Empty until Phase 3 voting/signaling data exists.
- With Phase 3 data: extends to include political payoffs (proposal success rate, vote alignment reward).

---

## Data Architecture

- Streamlit reads JSON logs directly from `data/games/tournament-*/` directories.
- Directory picker or dropdown to switch between data sources (anvil, sepolia, mainnet).
- Time-series metrics (Gini over rounds, treasury over rounds, rank history) are computed in Streamlit from `roundSnapshots`, not pre-computed in TypeScript.
- Aggregate metrics (performance table, twin divergence, event counters) come from `tournament-results.json`.
- Same dashboard serves testnet and mainnet data — different directories, same schema.