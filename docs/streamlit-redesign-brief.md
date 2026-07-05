# Streamlit Dashboard Redesign — Design Brief

> Status: APPROVED DIRECTION — build in a dedicated session.
> Supersedes: `streamlit-layout.md` (the original tab-based proposal, now implemented in `streamlit/app.py`).
> Method: chartosaur-dataviz skill (`.claude/skills/chartosaur-dataviz/`) — read SKILL.md and references before building.
> Stack: Python, Streamlit, Plotly. Data: `data/games/tournament-*/` JSON + live Base reads.
> Deployed: `the-landlords-game.streamlit.app` (Streamlit Cloud) — the redesign replaces this app in place.

---

## 1. Mission

The dashboard graduates from hackathon results page to **the definitive public artifact** of The Landlord's Game: the standing, verifiable, visual proof of the thesis —

> **You don't need cooperative participants to produce cooperative outcomes. You need cooperative rules.**

It must work for three readers, in priority order:

1. **Landing-page reader (general public / posterity)** — arrives cold, leaves in 60 seconds understanding the whole argument. One unforgettable chart.
2. **Live-presentation audience** — charts readable from a projector during a ~90-minute talk. Narrative arc that a speaker can walk through page by page.
3. **Researchers / students (expansion tier)** — people who will probe the system, deploy agents, and extend the open frontier. Needs the explorer depth and the "how to play" pathway.

**Neutrality constraint:** the artifact stands alone. No mention of any institution, course, or proposal. External documents may point *to* it; it points at nothing private.

---

## 2. Chartosaur Critique of the Current App (`streamlit/app.py`)

What's already right (keep):
- Question-led sections, findings stated as sentences, honest sample-size disclaimers.
- Two-color rule-set encoding: Monopolist `#A93B6B`, Prosperity `#0097A7` — colorblind-safe, no red/green. Keep these exact colors.
- The slope chart for Phase 1→Phase 2 Gini convergence is the correct form.
- Min-max bands on the Gini-over-rounds chart.

What violates the skill (fix):
1. **Titles describe chart contents, not conclusions.** "How Voting Changed the Gini" → "Given the Vote, Economies Choose Prosperity". Every chart title on every page becomes a conclusion (Step 5). The section headers carry the argument; a reader who reads only titles gets the whole thesis.
2. **The hero is buried.** The strongest single fact — zero overlap between the two Gini distributions across 15 pairs — lives mid-app as a horizontal bar chart. It must be the first thing anyone sees.
3. **Tabs let readers skip the argument.** The thesis is an *ascent* (rules → evidence → politics → frontier). Replace tabs with a multipage narrative (`st.navigation`) with a landing page; each page ends by handing off to the next.
4. **One-job color violations.** The pairs bar chart uses a continuous color scale on bars whose length already encodes the value — color is doing zero jobs. Grey bars + one annotation. Same audit on every chart: color = rule set, everywhere; strategy palette only where strategy is the subject; grey otherwise.
5. **Legends where direct labels belong.** Line charts label at line ends; dumbbells label at the dots.
6. **"On-chain" is asserted, never shown.** No live data, no verification links. See §5.
7. **The open frontier is absent.** Corruption, punishment coalitions, reputation, negotiation — the unexplored mechanics are the invitation to researchers, and the app never mentions them.

---

## 3. Structure — Six Pages, One Argument

### Page 0 — Landing: "Same Board. Two Rules. Opposite Worlds."
The 60-second version. No navigation required to get the argument.
- **Hero chart — "Every Monopolist economy ended more unequal than every Prosperity economy."** All 30 Phase-1 final Ginis on a single horizontal axis as a strip/dot plot, colored by rule set. Two visibly separated clusters. Annotate the gap itself: *"No overlap. The most equal Monopolist game is more unequal than the most unequal Prosperity game."* This is the artifact's signature image — spend real design time here.
- **Three numbers with context** (st.metric row): `5.6×` inequality ratio · `15/15` pairs diverged, zero exceptions · `6/7` Monopolist-start games voted themselves into Prosperity.
- **Four-sentence story block:** Elizabeth Magie built this game in 1903 with two rule sets to prove that rules, not players, decide outcomes. We rebuilt it on Base with autonomous agents. Same agents, same board, same openings — opposite worlds. The rules are doing the work.
- **Live proof strip:** on-chain game count + latest game timestamp read live from the mainnet contract, with a Basescan link. This is where "on-chain" stops being a claim. (Graceful fallback to cached values if RPC unavailable.)
- **Path split:** "Walk the argument →" (Page 1) / "Play it yourself →" (Page 5).

### Page 1 — The Rules: "The Only Variable Is Where Rent Flows."
- **Flow schematic, not a chart:** two side-by-side diagrams. Monopolist: rent → owner (arrow loops wealth back to the leader). Prosperity: rent → treasury → equal dividends (arrow fans out). Build as simple Plotly shapes or static SVG — this is the one place a drawing beats data.
- Win conditions stated as design intent: Monopolist ends when one player holds everything; Prosperity ends when the *poorest* player crosses a security threshold. ("The victory condition is itself a moral argument.")
- **The cast:** the five strategies (Extractive, Generative, Conditional, FreeRider, Pavlov) in one compact table — name, one-line behavior rule. Emphasize: the same five agents play both rule sets. Nothing about the agents changes between worlds.

### Page 2 — The Divergence: "Inequality Is a Policy Outcome, Visible by Round 1."
Phase 1 evidence (30 games).
- **Gini-over-rounds** (keep, upgrade): direct labels at line ends, no legend; keep min-max bands; keep the "Prosperity games typically end here" annotation. Title: *"The two worlds separate immediately — and never touch."*
- **Net-worth strip plot** (keep, retitle): *"A $1,500 spread versus a $370 spread — same agents, same board."*
- **Per-pair divergence bars** (fix): grey bars, conclusion title *"All 15 pairs, one direction, zero exceptions."* One accent annotation on the largest divergence.
- **Duration:** *"Prosperity games end ~4× sooner — shared wealth reaches everyone faster."* Two big metrics, no chart needed.
- **Strategy dumbbell** (keep, upgrade labels): *"Extraction only pays under extractive rules."* Direct-label the dots; drop the legend.

### Page 3 — The Vote: "Given Political Agency, Economies Choose Prosperity."
Phase 2 evidence (13 games, voting enabled).
- **Slope chart** (keep as-is structurally): title *"The inequality gap collapses 79% when agents can vote."*
- **Mode-flow diagram** replacing the scatter: 13 games as a start→end flow (Sankey or an icon-row with arrows — judge readability at build time; if Sankey reads poorly at 13 items, use the icon grid). Title: *"6 of 7 extractive economies voted their way out. Almost none went back."* Keep the scatter as an expander for the detail-hungry.
- **Finding text keeps the key line:** nobody told the agents to prefer Prosperity; self-interest under the right structure pointed there on its own.
- **Signaling & trust (Phase 3) — decision required before building:** standing Day-11 decision excluded Phase 3 from all submission-facing docs (Sepolia data corrupted; only Anvil runs validated: Extractive 0%, Generative 100%, Conditional ~14% promise-keeping). Do NOT chart Phase 3 unless Goldi approves either (a) an Anvil-labeled section with explicit caveats, or (b) a fresh clean Phase 3 run. Default: omit.

### Page 4 — The Frontier: "What Nobody Has Explored Yet."
The researcher/student page — the invitation.
- The deliberately unexplored mechanics, each as a one-paragraph open problem: **corruption** (can agents bribe?), **punishment coalitions** (can the majority discipline a defector?), **reputation** (does memory across games change behavior?), **negotiation** (side deals and their enforcement).
- What a structural experiment looks like here: pick a lever (voting threshold, proposal cost, signaling rule) → predict → deploy → measure. Frame it as the scientific loop the artifact enables.
- **How to play:** skill.md link, mainnet contract, "deploy your own strategy" in three steps. (Lift from current Conclusion tab.)

### Page 5 — The Ledger: live on-chain layer + game explorer.
- **Live contract panel:** mainnet + Sepolia contract state — total games, latest game, current mode distribution — via RPC (see §5).
- **Game explorer** (from original layout proposal, Tier 2): tournament/game dropdown → round-by-round net worth lines per player, turn log table filterable by agent/action. Every game row carries its Basescan transaction links.
- **All-time aggregate stats** via CDP SQL where cheap (event counts by type).

---

## 4. Design System

- **Colors (unchanged, enforced):** Monopolist `#A93B6B`, Prosperity `#0097A7`. Strategy palette (existing 5) appears *only* on strategy-subject charts. Everything else grey `#b0bec5` base with at most one accent. One job per chart — audit every figure.
- **Typography/scale:** every chart must survive projection. Axis + label fonts ≥14px in normal mode. Add a **Presentation toggle** (sidebar) that switches a global Plotly template: fonts +40%, thicker lines, hidden captions/disclaimers (they return in normal mode — the disclaimers are non-negotiable in the public artifact).
- **Declutter pass (Step 3):** gridlines at ≤20% opacity, no chart borders, no rotated axis labels, direct labels over legends everywhere feasible.
- **Findings under every chart** stay — but check each against its new conclusion-title so they don't just repeat it; the finding adds the *number*, the title carries the *claim*.
- **Disclaimers stay:** directional-not-conclusive language on every inferential chart; the "hackathon experiment, not peer-reviewed research" block moves to the Landing page footer and Page 4.

## 5. On-Chain Layer (Hybrid)

JSON logs remain the analytical backbone — `roundSnapshots` cannot be cheaply reconstructed from chain reads. The live layer *proves* the substrate; it doesn't replace the analysis.

1. **Direct RPC reads (build now):** `web3.py` against Base mainnet + Sepolia via Alchemy (`$ALCHEMY_API_KEY`; see agentic-gateway/alchemy-api skills). Read: game count, latest game id/timestamp, per-game final mode. Wrap in `st.cache_data(ttl=300)` with cached-value fallback so the page never blocks or breaks on RPC failure.
2. **Verification links (build now):** every chart caption gains a "verify the underlying games" expander with per-game Basescan links; the explorer links every game and, where logged, every transaction.
3. **CDP SQL (build if time):** aggregate event counts (`base.events`) for the all-time stats panel — already a Day-2 architectural decision, queries in `docs/cdp-sql-queries.md`.
4. **Goldsky indexer/webhooks (noted, post-build):** researched Day 2, not adopted (not a Synthesis partner). If the artifact needs push-based analytics later (live games streaming into the dashboard), a Goldsky subgraph → small store → Streamlit is the upgrade path. Do not build in this pass; leave a seam (data-access functions isolated in one module).

## 6. Data Inventory & Caveats

- Phase 1: `data/games/tournament-1773831296297/` — 30 games (15M/15P), structured JSON with roundSnapshots.
- Phase 2: `data/games/tournament-1773910613854/` — 13 games (7 M-start, 6 P-start), voting enabled.
- Inaugural mainnet tournament: 18 games, **qualitative markdown logs only** — not chartable; cite it in text with the live contract panel as its quantitative shadow.
- Phase 3 signaling: validated on Anvil (promise-keeping: Extractive 0%, Generative 100%, Conditional ~14%) — confirm whether structured logs exist before charting; otherwise stub per Page 3.
- Known metric definitions and numbers currently displayed (5.6×, 79%, Gini 0.189 vs 0.034) — recompute from data at build time, never hardcode; the current app computes most of these already.

## 7. Build Order (one focused session)

1. Restructure: tabs → `st.navigation` multipage; port existing content into pages 1–3 shells.
2. Landing page + hero chart (the signature image — iterate until it lands).
3. Conclusion-title + declutter + one-job-color pass over every ported chart.
4. Live RPC panel + verification-link expanders.
5. Page 4 (Frontier) — mostly prose, fast.
6. Page 5 explorer (port from original layout proposal).
7. Presentation toggle.
8. **Pre-ship: run the chartosaur critique checklist** (`references/critique-checklist.md`) against every page. Y-axis zero-start audit, 30-second readability test, "what's missing" pass.

Steps 1–4 are the core; 5–7 are progressive enhancement; 8 is mandatory.
