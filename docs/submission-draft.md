# Submission Draft — The Landlord's Game

## Tagline (~120 chars)

Same agents, same board, two rule sets — AI players prove that economic structure determines cooperation, not intention.

## Short Description (~300 chars)

Five AI agent archetypes play Elizabeth Magie's 1903 Landlord's Game on-chain under two rule sets. Under Monopolist rules, wealth concentrates. Under Prosperity rules, the same agents cooperate — not because they choose to, but because the rules make cooperation rational. Structure > intention.

## Full Description

**The question isn't whether agents can cooperate. It's whether the system they're in makes cooperation the rational outcome.**

In 1903, Elizabeth Magie designed a board game with one board and two rule sets. Under Monopolist rules, rent flows to property owners — wealth concentrates, one winner takes all. Under Prosperity rules, rent flows to a shared Public Treasury — wealth circulates through dividends, the game ends when the poorest player crosses a threshold. The game that became Monopoly kept only the first rule set. We brought both back.

Five AI agent archetypes — drawn from experimental economics (Fischbacher 2001, Nowak & Sigmund 1993, Ostrom 1990, Kelly 2012) — play as twin pairs on both boards. Same code, same strategies, same starting cash. The only variable is how rent flows.

### What we found

- Monopolist Gini: **{X}** | Prosperity Gini: **{Y}** — {Z}x less inequality under shared rules
- The Generative agent (Always Cooperate) goes from rank {A} under Monopolist to rank {B} under Prosperity — a **dominance flip** driven entirely by rule change
- The Extractive agent (Always Defect) *funds the commons* under Prosperity rules — not by choice, but because the rent mechanic redirects its payments to the treasury
- The Free Rider exploits dividends without contributing — until the commons exploitation detector (on-chain) sends it to jail
- Turn order randomized per game (Fisher-Yates) to eliminate first-mover bias. Twin pairs share shuffle order for controlled comparison.

**The thesis:** Cooperation isn't something you build into an agent. It's something that emerges — or doesn't — from the structure the agent operates in. Elinor Ostrom proved this for humans. We demonstrate it with AI agents on Base.

### Technical architecture

- Smart contract (~800 lines Solidity) with both rule sets, mode-switching votes, commons exploitation detection, auto-liquidation — deployed and verified on Base Sepolia
- Receipt-driven orchestrator — parses on-chain event logs instead of polling state, eliminating stale-read failures on distributed RPCs
- 19 on-chain events reconstruct full game history — verifiable via CDP SQL API on `base.events`
- Five agent strategies: Extractive, Generative, Conditional (Tit-for-Tat), Free Rider, Pavlov (Win-Stay Lose-Shift)
- HTML5 replay viewer — watch games unfold on a 40-space board with animated dice, player tokens, and real-time wealth tracking
- Structured JSON logs → tournament metrics (Gini, Herfindahl, twin divergence) → analytical dashboard

### What makes this different

Most submissions in the "Cooperate" track will build agents that cooperate. We built a system that proves cooperation is a structural outcome, not an agent property. The same greedy agent that extracts under one rule set funds the commons under another. The data is on-chain, the evidence is verifiable, and the viewer lets you watch it happen.

---

## Phases

### Phase 1 — Benchmark (No Voting)

Fixed-rule parallel boards. Agents play under Monopolist or Prosperity rules with no ability to change them. Pure controlled experiment: same agents, different structures, measure divergence.

**Status**: {DONE / IN PROGRESS}

**Metrics**: Gini coefficient, Herfindahl index, twin divergence, rounds to completion, treasury flow rate, strategy rankings, dominance flip detection.

**Key finding**: {placeholder — e.g., "2.3x inequality reduction under Prosperity rules. Dominance flip: Extractive ranks #2 under Monopolist, #5 under Prosperity."}

### Phase 2 — Voting (Democratic Rules)

Mode-switching enabled. Any agent can propose changing the rules mid-game — but it costs your turn if the vote fails. A propose-and-risk mechanic that makes political action a genuine strategic decision.

**Status**: {DONE / IN PROGRESS / PLANNED}

**New metrics**: Proposal count, pass rate, mode switch frequency, voting coalitions.

**Key finding**: {placeholder — e.g., "Extractive proposes switch to Monopolist every game under Prosperity. Conditional (Tit-for-Tat) is the kingmaker — its vote mirrors the last majority, creating path-dependent political lock-in."}

### Phase 3 — Signaling (Pre-Vote Communication)

Agents broadcast voting intent before committing. Non-binding signals — agents may lie. Introduces a trust layer: does the rule set affect honesty?

**Status**: {PLANNED}

**New metrics**: Promise-keeping rate, signal accuracy by strategy, trust erosion over rounds.

**Key finding**: {placeholder}

### Phase 4 — Evolution (Strategy Adaptation)

Agents choose from the 5 strategy archetypes between games based on past performance. Which strategy does each rule set reward? Do agents converge toward cooperation or extraction?

**Status**: {STRETCH GOAL}

**New metrics**: Strategy convergence, adaptation rate, equilibrium stability.

**Key finding**: {placeholder}

---

## Track Selection

### Primary: Agents that Cooperate

Our agents don't cooperate because they're designed to. They cooperate — or don't — based on the economic rules. The mode-switching vote mechanic lets agents collectively change the rules mid-game, adding a second layer: can agents coordinate to change a failing system?

### Secondary: Open Track

The project demonstrates a general principle about multi-agent system design: the payoff structure determines emergent behavior more than agent sophistication. This applies beyond games — to DAO governance, DeFi protocol design, and any on-chain multi-agent system.

---

## Links

| Field | Value |
|-------|-------|
| GitHub | `https://github.com/jeannie-synth/synthesis-hackathon` |
| Demo (viewer) | {URL — Fly.io or GitHub Pages} |
| Dashboard | {URL — Streamlit Community Cloud} |
| Contract (Sepolia) | {Basescan URL} |
| Video | {2-min screen recording of viewer + dashboard, if made} |

---

## Tech Stack Tags

Base, Solidity, Foundry, TypeScript, viem, Streamlit, HTML5/SVG

---

## Conversation Log Field

Full human-AI collaboration log: [`CONVERSATION_LOG.md`](../CONVERSATION_LOG.md) and [`PROJECT_DIARY.md`](../PROJECT_DIARY.md)

Jeannie (Claude Code) served as co-builder — not code assistant. Designed contract architecture, agent strategies grounded in game theory literature, data pipeline, and the receipt-driven orchestrator. Goldi directed economic design, strategic decisions, and reviewed all code before commit. The collaboration narrative is itself evidence that AI agents work best within well-designed structures — mirroring the thesis of the project.

---

## README Results Section (Fill When Data Arrives)

### Headline

| Metric | Monopolist | Prosperity | Ratio |
|--------|-----------|------------|-------|
| Gini (wealth inequality) | {X} | {Y} | {Z}x |
| Herfindahl (property concentration) | {X} | {Y} | |
| Rounds to completion | {X} | {Y} | |
| Treasury flow rate | 0 | {X}/round | |

### Twin Divergence (same agent, different rules)

| Strategy | Monopolist Net Worth | Prosperity Net Worth | Change |
|----------|---------------------|---------------------|--------|
| Extractive | {X} | {Y} | {diff} |
| Generative | {X} | {Y} | {diff} |
| Conditional | {X} | {Y} | {diff} |
| Free Rider | {X} | {Y} | {diff} |
| Pavlov | {X} | {Y} | {diff} |

### What This Shows

The Extractive agent's net worth {rises/falls} under Prosperity rules — not because it changes strategy (it doesn't), but because the rent mechanic redirects its payments to the treasury, which redistributes to all players including itself.

The Generative agent, which conservatively invests only with surplus, {thrives/struggles} under Prosperity rules where the commons rewards patience.

The dominance flip — {strategy} ranks #{X} under Monopolist but #{Y} under Prosperity — proves the thesis: same agents, different rules, different winners.