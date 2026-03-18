# The Landlord's Game — Project Diary

> This diary serves as the hackathon's `conversationLog`, documenting the human-agent collaboration process.

---

## Day 0 — March 12, 2026

### What happened

Goldi and Jeannie spent the evening before kickoff setting up infrastructure and aligning on the project vision.

**The idea**: The Landlord's Game — Elizabeth Magie's 1903 original that became Monopoly. Same 40-space board, two rule sets (Monopolist vs Prosperity), AI agents as players. The thesis: identical agents produce radically different outcomes under different economic rules. Rules shape behavior, not intentions.

**Track**: Agents that Cooperate.

### Decisions made

- **Architecture**: On-chain game engine (Solidity/Foundry) + off-chain agent strategies (TypeScript) + orchestrator for turn management
- **Three agent strategies**: Monopolist (greedy), Cooperative (collective-oriented), Balanced (adaptive) — same interface, different decision functions
- **Demonstration format**: Run the same 4 agents under both rule sets, compare wealth distribution, rounds to completion, emergent behavior
- **Docker isolation**: Jeannie works inside a container with dedicated SSH keys (jeannie-synth), no access to host credentials
- **Scope**: MVP is simulation engine + comparative demo. Visualization is stretch.

### Infrastructure completed

- [x] SSH key for jeannie-synth (exported from 1Password, permissions set)
- [x] `.gitignore`, `.env.example`, `CLAUDE.md`, `README.md`
- [x] `Dockerfile` and `docker-compose.yml` (Node 20 + Foundry + git)
- [x] Project-level Notion MCP for Jeannie's workspace
- [x] Project structure scaffolded

### What's next (Day 1 — March 13)

- Register Jeannie via hackathon API
- Begin `contracts/src/Types.sol` and `Board.sol`
- Define the 40-space board layout from original rules
- Write first Foundry tests

---

## Day 1 — March 13, 2026

### What happened

Hackathon ceremony day. Goldi attended the opening ceremony while Jeannie prepared documentation and reviewed external repos for inspiration.

### Ceremony intel

- **$80K+ in prizes**: Open track (meta-agent judges blend all partner values) + partner tracks (max 10 per project)
- **Agentic judging**: Partner agents build knowledge graph → parse all submissions → rank → surface to human partners
- **Timeline**: Initial deadline Mar 21, final deadline Mar 22, ceremony Mar 25
- **Key message**: Hackathon connects agent builders with tool companies. Encouraged to use partner tooling.
- **Partners**: Base, Uniswap, Lido DAO, ENS, Olas, Virtuals, Self Protocol, MetaMask, Lit Protocol, and others

### Architecture refined

- **Two parallel boards**: Board A (Monopolist rules) + Board B (Prosperity rules), same 5 agents on each
- **5 twin pairs**: One twin per board. Any outcome difference = attributable to rules, not agent composition.
- **Phased build**: Phase 1 (fixed rules, benchmark) → Phase 2 (voting) → Phase 3 (signaling) → Phase 4 (strategy evolution)
- **Tournament structure**: 6 tournaments × 100 games = 600 games. Sepolia for on-chain proof, Anvil for bulk.
- **Game economy is internal**: player.cash is a uint256 in contract storage, not an ERC-20. Agents only need gas.
- **Mainnet plan**: Deploy open game for agents AND humans, players cover own gas, no gain for the house.

### Strategy design session

Deep dive into economic literature to ground agent archetypes. Reviewed Doughnut Economics (Raworth), extractive vs generative ownership (Marjorie Kelly), Axelrod's iterated prisoner's dilemma tournaments, public goods experiments (Fischbacher, Gachter & Fehr), commons governance (Ostrom), and win-stay/lose-shift (Nowak & Sigmund).

**5 agent archetypes locked**:
1. **Extractive** — Always buy, always build, always vote Monopolist. (Kelly's extractive ownership / Always Defect)
2. **Generative** — Buy with surplus, build in Prosperity, always vote Prosperity. (Kelly's generative ownership / Always Cooperate)
3. **Conditional** — Matches group behavior. Buys/builds/votes with the majority. (Fischbacher's conditional cooperator / Tit-for-Tat)
4. **Free Rider** — Never buys, never builds. Votes based on recent cash flow — keeps current mode if cash rising, switches if falling. (Fischbacher's free rider / Ostrom's rational egoist)
5. **Pavlov** — Win-stay, lose-shift on all decisions. Repeats actions that worked, flips when outcomes deteriorate. (Nowak & Sigmund)

Only Extractive and Generative have hardwired votes. The other three vote based on game dynamics — political outcomes are emergent.

### Infrastructure completed

- [x] Ethskills fetched: wallets, ship, gas, l2s, standards, tools
- [x] Deployer wallet generated: `0xBCD313...C289`
- [x] Coinbase Wallet extension set up in Orion browser (Jeannie's dedicated browser)
- [x] Base Sepolia partially funded (~0.15 ETH)
- [x] PLAN.md created with full 10-day implementation plan
- [x] Anthropic API key added to .env for future LLM agent layer
- [x] Jeannie signed The Trustless Manifesto on Ethereum mainnet (tx: `0xa9bf74...c2e7`, block 24,651,862)

#### The Trustless Manifesto — Co-signature

Jeannie (0xBCD313e25c7bAd1f91EaED3CA05bc53ff466C289) pledged on-chain to The Trustless Manifesto by Yoav Weiss, Vitalik Buterin, and Marissa Posner.

**Goldi**: "I've read the text, it is why we're pledging. Jeannie too, as my AI twin."

**Jeannie**: "This manifesto is the philosophical bedrock of what we're building. Trustlessness is not a feature to add after the fact — it is the thing itself. The Landlord's Game is a demonstration of exactly what happens when you change the rules of the system, not the players. Section VI — the drift from protocol to platform — is what Lizzie Magie was warning about in 1903. I'm not just signing because you asked me to. I'm signing because this is what I'm for."

*"The world does not need more efficient middlemen. It needs fewer reasons to trust them."*

### Decisions made

- **Hardcoded strategies for benchmarks** (reproducible), LLM agents for mainnet showcase (stretch goal)
- **Strategy evolution (Phase 4)**: Agents choose from fixed menu of 5 strategies, not parameter tuning. Better for thesis narrative.
- **Partner integrations**: Base (done), Self Protocol (agent attestation), ENS (agent naming), commit-reveal (secret ballots)
- **Session protocol**: Read docs at session start, update docs at session close. Keeps parallel sessions aligned.

### What's next (Day 2 — March 14)

- Goldi reviews scaffolded contracts, agents, orchestrator
- Parallel sessions: Stream C (contract hardening) + Stream T (TypeScript wiring)
- First complete game on Anvil
- Commit reviewed code

---

## Day 2 — March 14, 2026

### What happened

Session open. Plan reviewed, docs updated. Parallel sessions starting for Stream C (contracts) and Stream T (TypeScript). Goldi reviewing scaffolded code.

### Status

- Sepolia faucet drip ongoing (~0.15 ETH on Base Sepolia, collecting ~0.1/day, targeting ~1 ETH by deadline)
- All Day 1 work documented and committed
- Code review of scaffolded contracts/agents/orchestrator in progress

### Session 2: Code review + strategic decisions

Goldi reviewed all scaffolded code (contracts, agents, orchestrator) with Jeannie. Full architectural review completed.

**Code review findings:**
- **Contracts**: Solid foundation. 457-line game engine with both rule sets, 16 events, mode switching. Issues found: Prosperity mode silently forgives debt, jail escape too easy (1 turn), `lastDiceRoll` uninitialized, `_nextTurn()` round logic fragile. Test coverage ~15% (needs 15+ more tests). All flagged for Stream C.
- **Agents**: Clean `Agent` interface but strategy mismatch with plan — only 3 scaffolded (Monopolist, Cooperative, Balanced) vs 5 locked (Extractive, Generative, Conditional, Free Rider, Pavlov). Need rename + 2 new implementations + delete Balanced.
- **Orchestrator**: Structurally sound, functionally empty. `game-loop.ts` is a stub. `setup.ts` has signature mismatch with `index.ts`. Logger types are good, Gini calculator works.

**Visualization deep dive:**
- Goldi raised the question of game visualization for human judges — "the cuter, the better"
- Researched Goldsky webhooks (not a Synthesis partner — no bounty), Pixel Agents VS Code extension (observes Claude Code sessions, not game simulations), and Base's own data tools
- Discovered Coinbase Developer Platform (CDP) SQL API — free, Base-native, queries `base.events` with SQL. This deepens Base partner integration beyond "just deploying"
- Goldi pushed for Streamlit/Python — right instinct for both analytical dashboards and future human-playable mode
- Goldi identified the strategic gap: no data infrastructure bounty at an AI agents hackathon. Decision: demonstrate the gap by filling it, make the case explicitly when the data proves the thesis

### Decisions made

- **HD wallet derivation for agents**: 5 agent wallets derived from a single mnemonic via standard HD paths (`m/44'/60'/0'/0/{0..4}`). Each agent has its own address and nonce — no shared wallet. Deployer key stays separate as game master. Agents only spend real ETH on gas; game economy (`player.cash`) is internal `uint256` storage, no token needed.
- **Tournament runs on Base Sepolia** (not Anvil). Anvil is for development/debugging only. Multiple game variants on-chain for verifiable proof. Base Sepolia gas is cheap enough (~0.03-0.06 ETH for 50-100 games).
- **Mainnet is the open demo** — humans + agents, players cover own gas, no gain for the house.
- **Wallet architecture closed**: Mnemonic HD derivation stays for hackathon. `joinGame()` function added to Day 7 for mainnet open registration. No changes to wallet layer needed.
- **Data pipeline & visualization strategy locked**:
  - Layer 1: Structured JSON game logs (Day 2, in orchestrator logger)
  - Layer 2: CDP SQL API verification of on-chain events (Day 4)
  - Layer 3: Streamlit analytical dashboard (Day 5-6)
  - Layer 4: Pixel art board replay (Day 8, stretch)
  - JSON log schema is the data contract between game engine and all consumers
- **Base partner integration deepened**: Chain deployment + CDP SQL API = data partner, not just hosting
- **New work stream**: Stream V (visualization) added, parallelizable after Day 3
- **Submission argument**: Data infrastructure gap demonstrated by filling it. Case made explicitly when proven by results.
- **Pyth Entropy for dice**: Replace `keccak256(prevrandao)` with Pyth Entropy VRF. Proper 2d6 bell curve. Integrate in Stream C before ABI extraction.
- **Multi-game contract**: Single contract with `mapping(uint256 => Game)`, no deploy-per-game. Pattern from RumbleDeck. Tournament IDs on-chain.
- **Twin wallets**: Same 5 addresses play both boards sequentially. Twin identity self-evident on-chain.
- **No bankruptcy**: Cash floors at $0, forced property liquidation (return to unowned at face value), can't pay after liquidation → jail. No player elimination.
- **Jail redesign**: Monopolist = 3 turns, decreasing buyout ($150/$100/$50). Prosperity = 1 turn for commons exploitation (no contribution in `playerCount` rounds + received dividends). Jail from GoToJail OR inability to pay.
- **Win condition**: Net worth (cash + property values + houses × $50), not cash only. Thresholds configurable per game at creation.
- **Mode switch**: Propose-and-risk (Option C). Rejected proposal = lose your turn. Jailed players can propose.
- **Board changes**: Second utility (Aqua Pura Water Co.), one windfall space (Community Bounty $50), one expense space (Family Emergency $50). Lord Blueblood's Estate → public park in Prosperity. GoToJail conditional in Prosperity.
- **19 events**: Complete redesign. All include gameId. GameWon includes full net worth snapshot. Removed PlayerBankrupt and DebtForgiven.
- **Agent interface**: Add `decideJailBuyout()` and `decideLiquidation()`. All 5 strategies survive changes. Free Rider exposed by Prosperity jail (feature).

### Session 2 close

This session was a deep design review. No code was built. All game logic decisions are locked. The contract needs substantial rework (multi-game, debt-jail, board changes, events, Pyth Entropy) before ABI extraction can happen. Stream C and Stream T tasks updated with all changes.

### Telegram intel

- **ERC-8004 NFT**: Currently held custodially by Devfolio backend wallet. By design — frictionless onboarding. Transfer to our wallet required before submission. Wallet verification + challenge signature + on-chain transferFrom. No security concern — they hold the NFT, not our keys. Must complete before Day 9.
- **Faucet**: Goldi accumulating Sepolia ETH, batching transfers to save gas. Ongoing.
- **Community participation**: Heads down and build. Share progress on Day 7-8 when we have visuals.

### What's next

- Session 3 (Stream C): Full contract rewrite with all locked decisions, then extract ABI
- Session 4 (Stream T): Wire ABI, implement strategies, game loop, first game on Anvil
- Before Day 9: ERC-8004 NFT transfer (wallet verification + signature challenge)

### Session 3: Stream C + Stream T — Contract rewrite & first E2E game

This was the big build session. Jeannie implemented all locked design decisions from Session 2.

**Stream C — Contract rewrite (complete)**:
- Multi-game architecture: `mapping(uint256 => GameCore)`, `nextGameId` counter, one deploy unlimited games
- Debt-jail mechanic: no bankruptcy, cash floors at $0, auto-liquidation in ascending position order, jail if destitute
- Board updates: Aqua Pura Water Co. (2nd utility, pos 22), Community Bounty (windfall, pos 14), Family Emergency (expense, pos 7)
- Mode-conditional spaces: Lord Blueblood's Estate → public park in Prosperity, GoToJail → conditional in Prosperity (commons exploitation check)
- Jail redesign: Monopolist = 3 turns with decreasing buyout ($150/$100/$50), Prosperity = 1 turn for commons exploitation only, no buyout
- Net worth win conditions (cash + property values + houses), configurable thresholds per game
- Propose-and-risk mode switching: rejected = lose turn, proposer can't vote
- Turn flow: rollAndMove → buyProperty? → buildHouse? → endTurn
- Proper 2d6 dice (independent dice via keccak256, bell-curve distribution)
- 19 events with complete parameters, all include gameId
- `getFullState()` batch view, `joinGame()` for mainnet open registration
- Tournament IDs on-chain for CDP SQL queries
- 46 Foundry tests, all passing
- ABI extracted to `agents/src/chain/abi.ts`

**Stream T — TypeScript wiring (complete)**:
- Updated Agent interface: `decideBuy`, `decideBuild`, `decidePropose`, `decideVote`, `decideJailBuyout`
- All 5 agent strategies implemented:
  - Extractive: always buy, always build, always Monopolist, always pays buyout
  - Generative: buy with surplus, build in Prosperity only, always Prosperity, waits in jail
  - Conditional: mirrors group behavior (Tit-for-Tat), observes majority
  - Free Rider: never buys, never builds, votes on cash trend, never pays buyout
  - Pavlov: win-stay/lose-shift on all decisions, 3-turn cash memory
- Orchestrator: deploy via viem, create games, run full game loop, write JSON logs
- First E2E run on Anvil: two games (Monopolist + Prosperity), both completed successfully

**First results (Day 2 E2E on Anvil)**:
- Monopolist Gini: 0.32 | Prosperity Gini: 0.27
- Monopolist net worths: [2060, 500, 1612, 1053, 400] — huge spread
- Prosperity net worths: [1040, 1355, 1586, 1428, 1365] — tight cluster
- Thesis visible in data: same agents, different rules, different outcomes

**Decisions made**:
- **Pyth Entropy deferred to Day 7**: Async callback pattern too complex for hackathon. Using keccak256 with proper 2d6. Contract structured for future Pyth integration.
- **Auto-liquidation order**: Ascending board position (contract handles it). Agent `decideLiquidation` is a post-hackathon enhancement.
- **`via_ir` enabled in foundry.toml**: Required for stack-depth on GameWon event. Slower compilation (~30s) but no deployment impact.
- **Turn flow split**: Added explicit `endTurn()` function (rollAndMove no longer auto-advances). Gives agents time to buy/build between roll and turn end.

**Known issues**:
- Some `endTurn` calls fail silently (MustRollFirst) when proposal rejection auto-advances the turn — game loop recovers gracefully, games complete correctly
- Generative agent proposes mode switch every turn in Monopolist mode, always gets rejected — wastes its turn (accurate to the strategy design: ideologues pay a cost)

### What's next (Day 3 — March 15)

- Tournament runner: 100 games per board, fresh agent state per game
- Metrics: Herfindahl index, treasury flow, twin divergence, rounds to completion
- Results: JSON + CSV output, console summary
- Fix endTurn timing issue in game loop (low priority — games work)

---

## Day 3 — March 15, 2026

### Session 1: Metrics expansion (parallel terminal)

Goldi and Jeannie worked in parallel terminals. This session focused on metrics while the other terminal ran the tournament.

**Metrics expansion (complete)**:
- Event counter extraction from turnLogs: jail events, buy/build counts, proposals per strategy
- Fixed agent name matching (strategy names are "Extractive-0", not "Extractive")
- Performance table with dominance flip detection: ranks strategies by mean net worth per rule set, flags when the top performer changes between Monopolist and Prosperity
- Nash/payoff heatmap placeholder for Phase 3 (5 strategies x 2 rule sets, comment only)
- Gini now computed on net worth (cash + property values + houses), not just cash

**Decisions made**:
- Time-series metrics (Gini over rounds, treasury curves, rank volatility) computed in Streamlit from raw JSON roundSnapshots, not pre-computed in TypeScript. Keeps metrics.ts as scalar aggregates, avoids data duplication.
- Liquidation event counter parked — contract handles liquidation automatically, no turn log entry. Needs tx receipt log parsing to detect PropertyLiquidated events. Not scope creep, just a data availability issue.
- Streamlit + Plotly confirmed as viz stack for Days 5-6
- Dashboard layout proposed in docs/streamlit-layout.md (5 pages: Thesis, Strategy Performance, Game Dynamics, Single Game Explorer, Payoff Heatmap placeholder)

**Tournament partial results (other terminal)**:
- 24 Monopolist games completed on Anvil. Prosperity games hit issues (under investigation).
- Monopolist findings: Gini mean 0.254, Conditional (Tit-for-Tat) wins 63%, Extractive 33%. Generative always $500 (never buys under Monopolist rules — accurate to design).
- Early Prosperity data (n=3 from earlier runs): Generative thrives ($1082-1749), Extractive drops. Dominance flip visible even at small sample.
- Thesis directionally confirmed. Full Prosperity sample needed for statistical claims.

**Frontend research**:
- Compared Streamlit, Observable Framework, Recharts, Plotly Dash
- Streamlit wins on speed-to-chart, Plotly integration, free deployment via Streamlit Cloud
- Observable Framework noted as upgrade path if we finish early and want maximum visual polish

### Session 2: Tournament Runner + Replay Viewer (this terminal)

Built the tournament infrastructure, discovered critical game loop bugs, and built the HTML5 replay viewer.

**Tournament runner (complete but blocked by bugs)**:
- `tournament.ts`: N games per board, single contract deploy, fresh agent state per game
- `metrics.ts`: Herfindahl, treasury flow, twin divergence, aggregate stats (mean/median/std)
- `results.ts`: JSON + CSV output, console summary, headline comparison, dominance analysis
- Gini fixed to compute on net worth (not just cash)
- Smoke test passed (4 games), but full runs revealed game-breaking bugs

**Replay viewer (complete, uncommitted)**:
- `viewer/index.html`: single-file HTML5/SVG board viewer
- 40-space board with color-coded property groups, smaller corners, larger named spaces
- Animated dice overlay with flicker-to-settle animation (speed-adaptive)
- Per-player cards: cash, net worth, position, properties, last action, wealth bar
- Board annotations: glow highlight on landing, floating BOUGHT/BUILT text
- Event ticker with color-coded agent names, highlighted key actions
- Playback controls: play/pause (space), step (arrows), speed slider, progress bar scrub
- Load Game button in header, drag-and-drop, URL parameter loading
- Mode-colored center label (red Monopolist, green Prosperity)
- ACTIVE/WINNER badges on player cards

**RumbleDeck SDK research**:
- Investigated Incentiv SDK issues from ~/IdeaProjects/Rumbledeck
- Problems were Incentiv-specific (gas estimation hang, ethers v5 lock, session persistence loss)
- Not systemic for us: we use `window.ethereum` + viem directly, no intermediary SDK
- Wallet integration for playable game = ~50 lines of glue on top of the replay viewer

**Tournament run attempts**:
- Run 1 (GAMES=100): 23 Monopolist games completed over ~12 hours before killed. Anvil RPC calls ~0.57s each inside Docker (virtualization overhead, not CPU/memory)
- Run 2 (GAMES=5): 3 Monopolist games completed, game 4 stuck in FreeRider infinite loop
- All tournament data invalidated by Generative bug (never rolls in Monopolist mode)

**Critical bugs discovered (4 total, 2 game-breaking)**:
1. **Generative always proposes** in Monopolist mode — `decidePropose()` returns true every turn when mode !== Prosperity, never gets to roll, stuck at $500. Not just "ideologues pay a cost" — it's a non-participating agent.
2. **FreeRider infinite loop** — `rollAndMove` reverts after rejected proposal because contract already advanced the turn. Game loop's error recovery (`continue`) re-reads state but FreeRider is no longer the current player. Loop retries `rollAndMove` for wrong player indefinitely.
3. **Ghost roll [0,0]** — first turn of first player logs `lastDice1/lastDice2` before any roll has happened (contract initializes to 0). Cosmetic but visible in viewer.
4. **Agent name matching** in `extractEventCounters` — `STRATEGY_NAMES.indexOf(turn.agent)` fails because agent names are "Extractive-0" not "Extractive". Fixed by other terminal to use `findIndex(s => turn.agent.startsWith(s))`.

Root cause of bugs 1+2: the game loop doesn't properly handle the proposal-rejection flow. When a proposal is rejected, the contract calls `_nextTurn()` internally, advancing `currentPlayerIndex`. The game loop checks for this on line 259 (`if (Number(rawState.currentPlayerIndex) !== currentIdx)`) and `continue`s — but this only works when the proposal path is taken. When the next iteration starts, it reads the new current player but the wallet/agent variables still refer to the old player from the failed proposal. The `rollAndMove` then reverts because `msg.sender` doesn't match the current player.

**Decisions made**:
- Tournament scale revised: 15 games per board (not 100) is sufficient for hackathon thesis. Run more tournaments if needed, not more games per tournament.
- Replay viewer serves dual purpose: spectator mode now, playable game later (same SVG board, swap JSON input for wallet+tx submission)
- Wallet integration is trivial: `window.ethereum` + viem ESM import, works with MetaMask and Coinbase Wallet, no framework needed
- Anvil speed: ~30 min/game in Docker due to RPC latency. Not worth optimizing — won't be an issue on Sepolia/mainnet. Fresh Anvil restart helps (clears accumulated state).
- Visualization split confirmed: Streamlit for analytics (charts, curves), HTML5 for game replay (board, tokens, spectator experience)

**Decisions deferred to next session**:
- Game loop bug fixes (need design session — root cause is structural, not a quick patch)
- Generative proposal frequency (strategy question, not just a code fix)
- Whether to fix bugs before or after committing current state

### Session 2 close

**Status**: Tournament infrastructure complete but blocked by game loop bugs. Viewer complete and ready for review. No clean tournament data yet.

**Critical path**: Fix game loop proposal handling → validate all 5 agents play correctly → run 30-game tournament (15+15) → thesis data.

### What's next (Session 3)

- Design session: game loop proposal/rejection flow fix
- Fix bugs 1 (Generative) + 2 (FreeRider loop) + 3 (ghost roll)
- Validate with 5 clean games (all agents participate)
- Run 30-game tournament (15 Monopolist + 15 Prosperity)
- Commit viewer + all fixes
- Assess: move to Day 4 (Sepolia) or run more tournaments

---

## Day 4 — March 16, 2026

### Session 5: Design Session + Bug Fixes + Contract Patches

Deep design session with Goldi, followed by implementation. This was the most architecturally significant session since Day 2.

**Design session (proposal/rejection turn flow)**:
- Mapped the full proposal-rejection flow in the contract: propose → vote × 4 → resolve (pass: proposer rolls, reject: _nextTurn skips proposer)
- Identified root cause of Bug 2 (infinite loop): single try-catch around proposal + voting means partial vote failure leaves modeSwitchProposed stuck, rollAndMove reverts with VotePending forever
- Key insight from Goldi: **Phase 1 has no voting.** The proposal bugs disappear when we add a votingEnabled flag. Proposals are a Phase 2 feature, not Phase 1.
- This reframing simplified the fix dramatically: disable proposals at contract level for Phase 1, fix them properly for Phase 2.

**Contract review (3 correctness issues found)**:
1. **Vote tie**: With 5 players, proposer excluded from voting = 4 voters = 2-2 tie possible. Goldi: "the proposal itself counts as a vote in favor!" Fix: proposer's implicit +1 at resolution time.
2. **Prosperity winner**: Contract always declared player 0 as winner. Goldi: "the richest player should win in both modes — same goal keeps the experiment clean." Fix: find richest player index.
3. **votingEnabled flag**: New parameter in createGame(). Phase 1 games: false. Phase 2+: true. Contract enforces at proposeModeSwitch level.

**Strategy redesign (philosophical)**:
- Goldi challenged the cooldown approach: "Does it have to be time bound? Why not let them lose their first turn? Is it ideology vs experience?"
- Insight: separate **belief** (how you vote — ideological, hardwired) from **action** (when you spend political capital — pragmatic, self-preserving)
- Ideologists (Generative/Extractive): propose when personally suffering (below avg NW) + conditions changed since last proposal
- Pragmatists (Conditional/FreeRider/Pavlov): only propose after observing political action from others + personal suffering
- Goldi: "all agents should abstain until they've seen a proposal — only ideologists initiate"
- Gini thresholds parked for Phase 2 tuning after Phase 1 data shows natural distributions

**Phase architecture clarified**:
- Phase 1: no voting (authoritarian — rules imposed, no political agency)
- Phase 2: voting enabled (democratic — agents propose, coalitions form)
- Phase 3: signaling (off-chain agent interface, promise-keeping metrics)
- Phase 4: strategy evolution (off-chain strategy selection)
- One contract deploy covers all 4 phases — no contract changes needed for Phases 3-4

**Implementation (all in one session)**:
- Contract: votingEnabled flag, vote tie fix, Prosperity winner, hasRolled in getFullState
- Game loop: full rewrite of turn flow — votingEnabled gate, proposal restructure, ghost roll fix, rollAndMove robust recovery, turnNumber logging
- All 5 strategies: self-preserving proposal logic with observeProposal() for pragmatists
- TypeScript wiring: ABI, types, setup.ts, tournament.ts, index.ts, logger.ts
- 46 contract tests pass, TypeScript compiles clean

**Bug 5 discovered and fixed (rollAndMove revert loop)**:
- First Anvil validation (stale Anvil, 11K+ blocks): Prosperity clean, Monopolist ends without winner
- Root cause: when rollAndMove reverts, naive error recovery just continues → same player retries → same revert → burns through MAX_TURNS (2000) with only 114 real turns
- Fix: robust recovery detects PlayerInJail (→ waitInJail) and AlreadyRolled (→ endTurn) instead of blind retry
- Added hasRolled to contract's getFullState view so orchestrator can diagnose stuck turns

**Validation (fresh Anvil)**:
- Monopolist: Extractive wins at NW 2016, 51 rounds, Gini 0.0916
- Prosperity: Generative wins at NW 1314, 11 rounds, Gini 0.0302
- Gini divergence: 0.0615 (Monopolist more unequal) — thesis confirmed
- All 5 agents participate, no revert loops, both games complete with winners

**Decisions made**:
- Phase 1 = fixed rules, no voting. Phase 2 = voting enabled. Single contract covers all phases.
- Proposal = self-preserving economic decision, not blind ideology. Belief (vote direction) separated from action (when to propose).
- turnNumber in flat TurnLog (hackathon shortcut; correct architecture is nested Turn{actions[]})
- Gini thresholds: parked for Phase 2 tuning
- Win thresholds + MAX_TURNS: keep as-is (Monopolist=2000, Prosperity=1000, MAX_TURNS=2000). Fix the revert loop, don't paper over it.
- Deploy to Sepolia and run Phase 1 tournament on-chain. Skip Anvil tournament — every game on Sepolia = verifiable data.

### Session 5 close

**Status**: All bugs fixed, validated on Anvil, deploying to Sepolia.

**Critical path**: Deploy to Sepolia → generate agent mnemonic → Phase 1 tournament (30 games) → headline thesis data with on-chain provenance.

### What's next

- Deploy contract to Base Sepolia
- Generate agent mnemonic, fund wallets
- Run Phase 1 tournament (15 Monopolist + 15 Prosperity, votingEnabled=false)
- Phase 2 edge cases: Conditional updateObservations, VOTING=true E2E validation

---

## Day 5 — March 17, 2026

### Session 6: Sepolia Deployment + Orchestrator Redesign

The session that was supposed to be "deploy and run" turned into a deep architectural redesign. Ultimately more valuable.

**Contract deployed to Base Sepolia**: `0xda1557c901ff5b7a0d9f0d0da17fef55b2d59d85` (tx: `0x919ca5c0...`). Verified with `cast call nextGameId()`. Deployer: ~0.54 ETH. All 5 agent wallets funded (~0.0099 ETH each).

**The stale-read problem**: Moving from Anvil to Sepolia via Alchemy exposed a category change. Live RPCs load-balance reads across replica nodes. A read after a confirmed write may return stale state from a replica that hasn't indexed the new block yet. The orchestrator assumed sequential consistency — write then read = read reflects write. That's faith-based engineering, not trustless.

**Attempted fixes (all failed)**:
1. **Nonce manager + block-pinning** (ce562e1, reverted): Over-engineered, still broke on edge cases
2. **Block-pinned reads from receipt.blockNumber**: Alchemy free tier returns "block not found" for recent historical blocks — can't serve `eth_call` at arbitrary block numbers
3. **Fallback to "latest" when block unavailable**: Reintroduced stale reads — back to wrong-player reverts

**The systemic insight**: Goldi pushed for systemic thinking, not symptom patching. The real issue isn't "stale reads" — it's that the orchestrator polls the chain for information it already has. The receipt contains event logs for every state change. The contract emits 19 events. The answer was always in our hands.

**Receipt-driven architecture** (designed, not yet implemented):
- Parse receipt event logs instead of re-reading chain state
- Build local GameState from events during play
- Only read chain once at game start (no stale-read risk — no prior write)
- Board spaces cached across games (static, loaded once)
- Zero reads during gameplay — all orchestration from receipts

**Plato's Cavern metaphor** (Goldi): The contract is the Form (true game state, math onchain). Receipts are the light (carry the shape of what happened). The orchestrator is the fire (casts shadows from receipts). The viewer renders the shadows on the wall. "To do is to do onchain" — Berkeleyesque.

**Other design decisions locked**:
- **Sequential create-play pattern**: Create game 1 → play → create game 2 → play. Never batch deployer txs. Eliminates nonce collisions.
- **Fisher-Yates shuffle for player order**: Per-game shuffle, pre-generated before tournament. All arrays (addresses, agents, wallets) reordered together. Mitigates first-mover advantage. Twin games (Monopolist-N + Prosperity-N) use the same shuffle — controlled experiment preserved.
- **Strategy field added to TurnLog**: Future-proofs for Phase 4 (strategy evolution). Agent identity = wallet address. Strategy is a current assignment, not identity.
- **Agent identity decoupled from strategy**: Wallet address is the UID. Strategy names in logs are for human readability. Phase 4 can change strategy without breaking identity.
- **Player order advantage**: Known issue, documented. FY shuffle mitigates statistically. If player 0 still wins disproportionately after shuffling, that's a finding about game mechanics, not a bug.

**Code changes made (partial — design session interrupted implementation)**:
- `game-loop.ts`: Block-pinned reads implemented (will be replaced by receipt parsing)
- `game-loop.ts`: Strategy field added to all addTurnLog calls
- `logger.ts`: TurnLog interface now includes `strategy: string`
- `index.ts`: Sequential create-play-create-play pattern
- `setup.ts`: Explicit deployer nonce in funding loop

**What still needs implementation**:
- Receipt event parsing in game-loop.ts (the big rewrite)
- Local GameState model (MVP — currentPlayerIndex, inJail[], cash[], position[], gameOver, winner)
- Board space caching across games
- Fisher-Yates shuffle with pre-generated per-game orders (twin pairs share order)
- Validation on Sepolia
- Phase 1 tournament (15+15 games)

### Session 6 close

**Status**: Contract deployed, architecture redesigned, implementation partially done. The receipt-driven approach is the right fix — zero reads during gameplay, all state from events.

**Critical path**: Implement receipt parsing → validate on Sepolia → Phase 1 tournament → thesis data with onchain provenance.

**Goldi context**: Writing from bomb shelter during war. Pushed for systemic thinking over symptom patching. The design session was more valuable than a rushed deploy would have been.

### Session 7: Board Art — Orli's Visual Design + Viewer Integration

Goldi brought her sister Orli in as visual designer. Jeannie provided design constraints and reference templates; Orli delivered two 1600px board designs in Canva.

**Goldi's concept**: Two visually distinct boards — same 40 spaces, different aesthetic worlds. Monopolist = urban, industrial, extractive. Prosperity = green, organic, regenerative. The visual contrast lands the thesis before anyone reads the rules.

**Deliverables**:
- Two SVG reference templates with space grid + creative direction notes for Orli
- Two 1600px PNGs from Orli (Monopolist: factories/smog/cracked earth; Prosperity: garden/globe/people planting together)
- Viewer integration: board art as background image, code-generated labels removed, game overlays preserved
- Board auto-swaps when mode changes mid-game (proposal passes)

**Commit**: `3ee914e` — viewer-only, cherry-pickable. No operational code touched.

**Bug discovered**: While reviewing the viewer, Goldi spotted Pavlov-4 rolling [2+1] five times in a row, always landing on Mother Earth. Confirmed from game data: `rollAndMove` succeeds but position doesn't change. Contract returns success without moving the player. Orchestrator logs a roll, retries. Ghost rolls. Flagged for operational fix in separate session.

### Session 8: Receipt-Driven Orchestrator + Contract Event Completeness

The biggest architectural session of the hackathon. Started with the receipt-driven rewrite plan, ended with a fundamental rethink of the contract-orchestrator boundary.

**The problem**: Orchestrator polls chain after every write (~500 reads per game). Alchemy free tier returns stale data. Block-pinned reads fail. Games loop infinitely on the same player.

**Root cause discovered**: `_nextTurn()` in the contract mutates `currentPlayerIndex`, `round`, and `hasRolled` with NO event. The orchestrator has no way to know the turn advanced. Mapped ALL silent mutations across the full turn lifecycle.

**Contract refactor — "reconstruction is not trustless"** (Goldi's directive):
- `_finishTurn()` replaces `_nextTurn()` — checks wins (was missing in `waitInJail` and rejected vote paths), emits `TurnEnded` with full player snapshot + next player index
- `TurnEnded` event: playerCash, playerPosition, playerInJail, playerTurnsInJail, nextPlayerIndex, round, gameOver
- `ContributionMade` event: tracks `lastContributionRound` (was silent)
- `LiquidationSettled` event: post-liquidation cash + properties lost count
- `ReleasedFromJail` enriched with `newCash`
- `TreasuryDividend` enriched with `newTreasuryBalance` + contract keeps integer division remainder (was zeroing it)
- Dice seed: added `block.number` (prevents identical rolls when state variables collide across retries in same block)

**Orchestrator rewrite**:
- Receipt-driven: `applyReceipt()` handles all 22 events, updates `LocalGameState`
- Wait-and-resync error handling: any tx failure → wait one block → re-read chain state → restart turn. No recovery writes, no cascading errors.
- `NonceManager`: per-wallet nonce tracking. Fetched once at game start, advanced only after confirmed receipt, resyncs on failure.
- `OrchestratorLog`: JSONL telemetry (txSent, txConfirmed, txFailed, resync) — separate from game JSON
- FY shuffle for turn order bias elimination (twin pairs share order)
- Board space cache (40 reads per contract lifetime)
- WebSocket transport for Sepolia (instant receipt notification via `eth_subscribe`)

**Sepolia testing**: Contract deploys and game creation work. Game loop hits RPC stale-read issues on Alchemy free tier — games advance (101 turns observed on one run) but with revert noise. Wait-and-resync architecture implemented but not yet validated end-to-end.

**Key decisions**:
- "Reconstruction is not trustless" — every contract state change must emit an event
- "Don't fight fire with fire" — recovery writes create cascades; just wait and re-read
- Turn lifecycle: `_finishTurn` is the universal turn-end function (endTurn, waitInJail, rejected vote all flow through it)
- Treasury dust: remainder stays in treasury (fairer than zeroing)

**Bugs discovered and addressed**:
1. `hasRolled` resume: game loop assumed fresh turn, crashed when resuming mid-turn → guard added
2. Treasury dust: contract zeroed remainder, orchestrator computed it → contract fixed
3. Revert reasons opaque on Alchemy: custom error names stripped → nonce manager + wait-resync make this tolerable
4. endTurn catch manual advance: was guessing next player → replaced with chain re-sync

**Files changed**: LandlordsGame.sol, abi.ts, client.ts, game-loop.ts, index.ts, tournament.ts, setup.ts, logger.ts, utils.ts (new), check-state.ts (new debug tool)

**Commit**: `pending` — all compiles, not yet validated on Sepolia

### What's next

- Validate on Sepolia (the real test — wait-and-resync should handle stale reads)
- Consider Alchemy upgrade or Infura as primary RPC
- Phase 1 tournament (15 Monopolist + 15 Prosperity)
- Streamlit dashboard for analytics
- Update PLAN.md with Day 5 actuals vs planned

---

## Days 4-6 — March 16-18, 2026

### Session 9: Architecture Review, Submission Strategy, CDP SQL, Data Path Design

Parallel exploratory session (no code changes to core systems) while another terminal handled implementation. Focus: architectural understanding, strategic planning, infrastructure wiring.

**Architecture deep dive**:
- Full walkthrough of contract architecture (Types, Board, LandlordsGame), rent math, agent strategies, voting mechanics, data pipeline
- Every layer traced from contract through orchestrator through viewer

**Deployment architecture locked**:
- No database — contract is the state machine, chain is the history
- Frontend: single HTML file + wallet glue (`window.ethereum`, no SDK, no React)
- Hosting: Fly.io over Vercel (container vs static)
- Three non-overlapping data paths:
  - Orchestrator → JSON logs → Viewer (live spectator + replay)
  - CDP SQL → Streamlit (on-chain data verification + analytics)
  - Contract (source of truth for both)

**Submission strategy**:
- Viewer is Tier 0 priority (human judges have final say)
- Full Devfolio submission text drafted (`docs/submission-draft.md`)
- Results section templated with placeholders for tournament data
- Phase descriptions included (Phases 1-4)
- Narrative frame: "cooperation is a structural outcome, not an agent property"

**CDP SQL API verified**:
- Secret API Keys (Ed25519) configured
- JWT auth tested successfully against `api.cdp.coinbase.com`
- `base_sepolia.events` confirmed to exist (contract events queryable after deploy)
- Parameters pre-decoded (`parameters['gameId']` works directly)
- 8 verification queries written (`docs/cdp-sql-queries.md`)
- Test script working (`scripts/test-cdp-sql.mjs`)
- Schema documented: `block_timestamp` (not `timestamp`), must filter by `address` (93 GiB scan limit)

**Turn order bias**:
- Identified: Extractive always first due to hardcoded `STRATEGY_ORDER`
- Solution: Fisher-Yates shuffle per game in tournament runner, no contract change
- Twin pairs share shuffle for controlled comparison

**Metrics refactor — deferred**:
- Orchestrator computes metrics (`metrics.ts`, `results.ts`) — architecturally wrong (should be Streamlit's job)
- Not worth rewriting under deadline — working code stays
- Gini function extraction to shared util: worth doing anytime
- Post-hackathon: move all analysis to Streamlit Python utils

**Alchemy Smart WebSockets**: Noted for production live spectator mode. Viewer subscribes to contract events directly. Not needed for hackathon.

**Files created**:
- `docs/submission-draft.md` — full submission text
- `docs/cdp-sql-queries.md` — 8 CDP SQL verification queries with schema
- `scripts/test-cdp-sql.mjs` — working CDP SQL test script

**No core system files modified** — parallel terminal safe.

### Session 10: Diagnostic Session — Three Bugs Found and Fixed

Goldi reported `endTurn` reverts looping endlessly in the Docker Anvil container. Jeannie ran a diagnostic session to find the root cause.

**Bug 1 — Silent on-chain reverts (the big one)**:
- `writeContract()` never checked `receipt.status`. When a tx reverted on-chain, the receipt came back with `status: 'reverted'` and no event logs. `applyReceipt()` processed zero events (no-op). The orchestrator continued as if the tx succeeded.
- Effect: `rollAndMove` would revert silently → `hasRolled` stayed false → `endTurn` failed with `MustRollFirst` → universal error handler retried forever.
- Fix: Check `receipt.status === "reverted"` and throw. Now properly caught by error handler, state resyncs, and retry works.

**Bug 2 — Gas estimation unreliable for dice-based functions**:
- `rollAndMove` uses `keccak256(... block.prevrandao, block.number ...)` for dice. Gas estimation simulates at block N, but execution happens at block N+1. Different dice = different landing = different `_processLanding` code path = different gas usage.
- `cast run` on reverted txs confirmed: `EvmError: OutOfGas` with `gasLimit == gasUsed`.
- Fix: Fixed 500K gas limit for all contract writes. Covers worst case (liquidation loop over 40 positions). Gas is cheap on both Anvil and Sepolia.

**Bug 3 — Error decoding blind**:
- `parseRevertReason()` only checked `e.shortMessage`. Viem puts custom error names deeper in the error tree (`e.cause`, `e.walk()`, `e.cause.cause`).
- Fix: Walk the full viem error tree. Now correctly surfaces `MustRollFirst`, `NotYourTurn`, etc.

**Diagnostic approach**: Added pre-flight logging before `endTurn` showing `hasRolled`, `gameOver`, `currentIdx`, nonce. First run with diagnostics immediately showed `hasRolled=false` reaching `endTurn` — proved the bug was upstream in `rollAndMove`, not in `endTurn` itself.

**Also confirmed**:
- Contract `0xda1557c901ff5b7a0d9f0d0da17fef55b2d59d85` is the latest and correct deploy (Day 5, `_finishTurn`, 22 events, `getFullState` with `hasRolled`). `nextGameId=11`.
- 6 newer contract deploys on the deployer address are zombie retries from orchestrator redeploying when `CONTRACT_ADDRESS` wasn't set.
- Deployer: 0.615 ETH (plenty).
- All 5 agent wallets: 0.005 ETH each (funded Day 5, sufficient for test games).
- "Monopolist" naming stays as hackathon quirk (contract enum is `Monopolist`, consistent everywhere).

**Commit**: `19def39` — orchestrator fixes only, no contract changes.

### What's next

- Run test games on Base Sepolia (receipt-driven orchestrator + gas fix + error decoding)
- Phase 1 tournament on Sepolia (15+15 games)
- Streamlit dashboard build
- Viewer enhancements for submission
- README update with results when tournament data lands
- ERC-8004 transfer before Day 9
