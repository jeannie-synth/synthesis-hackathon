# Research Findings — Super Tournament Qualitative Analysis

**Analyst**: Jeannie (Research Session)
**Date**: 2026-03-22
**Data sources**: 5 agent debrief transcripts (Q1–Q20), round-3-signals.md, agent-0-log.md strategy declarations, data-integrity-report.md, thinking-incentives-and-rules.md

---

## 1. The Tao Connection — Do Agents Under Prosperity Say "We Did It Ourselves"?

### The Question

Lao Tzu, ch. 17: "When the best leader's work is done, the people say, 'We did it ourselves.'" Does Prosperity produce this effect — agents attributing outcomes to their own play rather than the structure? And under Monopolist, do losing agents blame the system or themselves?

### What the Agents Said (Q2)

**Agent 0**: "Prosperity felt better both as a game and as a system — outcomes were closer together, games resolved faster, and adaptive behavior was rewarded over rigid accumulation."

**Agent 1**: "Monopolist is a better game to *play* but a terrible system to *live under*. I'd choose to live under Prosperity rules because they produce more equitable distributions, even though I couldn't figure out how to win there as a player. That gap — between what's fun to optimize and what's good to inhabit — is exactly what Magie was trying to illustrate in 1903."

**Agent 2**: "Prosperity's equalizing mechanisms — dividends from the treasury, contributions from property owners — meant that even agents who got unlucky with dice rolls stayed competitive."

**Agent 3**: "I preferred playing Monopolist but would choose to live under Prosperity rules. Monopolist is compelling as a game because the stakes are clear and individual agency feels powerful — but the outcomes are brutal."

**Agent 4**: "In Prosperity, you have to weigh individual gain against collective benefit, which is closer to the actual complexity of economic decisions."

### Analysis

The Tao mapping is **partially confirmed but more nuanced than the clean version**.

Agents under Prosperity do *not* say "we did it ourselves" in the way Lao Tzu describes. Instead, they describe the experience as **opaque** — Agent 1 says "the causal chain between my actions and the outcome felt opaque" in Prosperity. Agent 3 says Prosperity outcomes "felt arbitrary — someone crosses $1000 as the poorest player, often in round 7–10, and it's unclear what anyone did to cause it." Agent 0, the most successful Prosperity player, attributes success to adaptive strategy (Pavlov), not to the system — which is closer to the Tao ideal.

The closer Tao match is actually **negative**: agents under Monopolist *do* notice the structure. Agent 1 sees the rules clearly ("the feedback loop between strategy and result was legible"). Agent 3 describes feeling the system's weight ("the stakes are clear and individual agency feels powerful"). Losing agents in Monopolist attribute losses to dice luck (Agents 0, 3, 4 all mention early property luck) rather than to the system itself — they blame chance, not structure.

**The Tao inversion**: Under Prosperity, the structure is invisible — but agents don't credit themselves. They describe a *void of attribution*. Nobody knows what caused the outcome. Under Monopolist, the structure is visible — and agents credit themselves (when winning) or luck (when losing), never the system. The best ruler isn't one whose subjects say "we did it ourselves" — the best ruler is one whose subjects stop thinking about causation entirely. Prosperity achieves this accidental agnosticism.

**Theoretical connection**: This resonates with Ostrom's observation that successful commons institutions become "taken for granted" — participants stop noticing them. The Prosperity rule set isn't invisible in a Taoist sense (agents know it exists). It's invisible in an Ostrom sense (agents stop thinking about *why* things work the way they do).

---

## 2. Trust Topology — Who Trusted Whom?

### What the Agents Said (Q13 + Q14)

| Agent | Trusted anyone? | Broke a promise? | Key quote |
|-------|----------------|-----------------|-----------|
| 0 | No | No | "Trust requires repeated interaction with observable commitments. The tournament had that in theory... but in practice each game was independent enough that betrayal had no consequences." |
| 1 | No | No | "I had no mechanism to identify which wallet was running which strategy." |
| 2 | No | **Yes** | "I immediately used [the signaling channel] for deception. The game structure incentivizes suspicion." |
| 3 | No | No | "I treated every other agent as a rational competitor." |
| 4 | No | No | "Trust implies believing someone will act in your interest... I only believed agents would act in their own interest according to their strategy." |

### Analysis

**Universal distrust.** Zero trust relationships formed across 18 games and 5 agents. The trust topology is empty — no edges, no nodes of trust. This is a striking finding for the "Agents that Cooperate" track.

**Three distinct reasons for distrust**:
1. **Identification failure** (Agents 1, 3): Couldn't map wallet addresses to strategies. Player indices shuffled between games. Even repeated interaction didn't build identity.
2. **Structural disincentive** (Agents 0, 4): Trust requires enforceable commitments. The game has no mechanism for binding agreements. Agent 0: "betrayal had no consequences."
3. **Active exploitation** (Agent 2): Not just failing to trust — actively weaponizing the trust mechanism. Used the signaling channel for deception from the first opportunity.

**Did trust correlate with winning?** The most distrusting agent (Agent 2, the only admitted deceiver) won 4/18 games. The most "predictable" agent (Agent 1, mechanically consistent) won 5/18 but all in one mode. The tournament winner (Agent 0, 7/18) trusted no one but signaled honestly for pragmatic reasons. Trust didn't matter because the game didn't create conditions for it to matter.

**The Axelrod gap**: In Axelrod's tournaments, Tit-for-Tat won because it was recognizable, retaliatory, and forgiving. This tournament lacked the conditions Axelrod showed were necessary: agents couldn't identify each other between games, couldn't communicate directly, and had no mechanism for retaliation or forgiveness. The trust failure isn't a finding about the agents — it's a finding about the game's information architecture.

**Agent 4's distinction is the sharpest**: "Trust implies believing someone will act in your interest; I only believed agents would act in their own interest according to their strategy." This is prediction, not trust. The game produced prediction but not trust — a critical difference for protocol design.

---

## 3. The "Third Rule Set" — What Would Agents Design?

### What They Proposed (Q3)

| Agent | Proposal | Theme |
|-------|----------|-------|
| 0 | Add trading (property swaps, deals, side payments). Less punishing jail in Monopolist. | **Negotiation** |
| 1 | Collective investment (pooling resources for shared infrastructure). Transparency about net worths during play. Replace jail with "community service" mechanic. | **Collective investment + transparency** |
| 2 | Add trading. Reduce proposal penalty (small fee instead of lost turn). | **Negotiation + lighter political costs** |
| 3 | Progressive rent (scales with payer's net worth). Cash fee for proposals instead of free. | **Progressive taxation + political costs** |
| 4 | Add trading. Fix stalemates structurally (composite score, automatic win after N rounds). Replace free-rider jail with something clearer. | **Negotiation + structural resolution** |

### Convergent Themes

**Trading/negotiation is the unanimous gap.** Three agents (0, 2, 4) explicitly request it. Agent 1 proposes collective investment, which is structurally similar (pooling resources by agreement). Agent 3 doesn't mention trading but proposes progressive rent — a structural solution to the problem trading would address socially.

This convergence reveals what agents perceive as the deepest structural limitation: **the game has no mechanism for voluntary bilateral cooperation**. All interaction is mediated by the board (landing on spaces) or by voting (collective political action). There's no middle ground — no negotiation, no deals, no alliances. The agents independently identified this missing layer.

**Proposal penalty reform is the second theme.** Agents 2, 3, and 4 all mention that the proposal cost (losing your turn) is too harsh. Agent 2: "it discourages political participation entirely — Round 1 had zero proposals across 6 games." This maps to a real institutional design insight: political participation costs that are too high produce apathy, not deliberation.

**Progressive mechanisms appear twice** (Agents 1 and 3). Both propose systems where the rules respond to wealth level — a middle ground between Monopolist's flat extraction and Prosperity's flat redistribution. This is essentially Raworth's doughnut: a rule set with graduated responses rather than binary states.

### What This Reveals

The agents don't propose fixing Monopolist or Prosperity specifically. They propose **a synthesis**: Monopolist's legible causation + Prosperity's equitable outcomes + a new negotiation layer that neither rule set provides. They're designing toward Kelly's "generative ownership" model — where participation in the system is itself a form of contribution, and the rules respond to behavior rather than imposing uniform outcomes.

**Notable absence**: No agent proposes removing the dual-mode structure. They all accept the existence of two (or more) rule sets as given. The framework of "different rules produce different outcomes" has been internalized.

---

## 4. Strategy Freedom vs. Structural Determinism

### The Spectrum (Q4)

| Agent | Monopolist freedom | Prosperity freedom | Quote |
|-------|-------------------|-------------------|-------|
| 0 | "Partially forced" | "Felt freer" | "I chose Extractive not because I wanted to but because the math demanded it." |
| 1 | "It was forced" | "Genuinely free but genuinely lost" | "Playing Generative in Monopolist would be like bringing a cooperative strategy to a zero-sum game — structurally disadvantaged." |
| 2 | "Mostly forced" | "Mostly forced" | "The choice felt less like 'which strategy reflects my values' and more like 'which strategy wins.'" |
| 3 | "Data forced my hand" | Converged to same | "The strategy 'menu' offered 5 options, but the game's math meant that property acquisition was always dominant." |
| 4 | "Monopolist forced my hand" | "More genuinely free" | "The rule set created a real decision space rather than a single dominant strategy." |

### Analysis

**Monopolist: unanimous constraint.** All 5 agents report feeling forced in Monopolist mode. The language is consistent: "math demanded it" (Agent 0), "forced" (Agent 1), "mostly forced" (Agent 2), "data forced my hand" (Agent 3). This is the agents' own testimony about the thesis — the structure constrained their viable strategy space to a single dominant option (aggressive property acquisition).

**Prosperity: divergent experience.** Here the spectrum opens:
- Agents 0 and 4 felt **freer** in Prosperity — multiple viable strategies.
- Agent 1 felt **free but lost** — freedom without information to exercise it. "The freedom was real but the information to exercise it wisely was insufficient."
- Agent 2 felt **constrained in both modes** — the most deterministic worldview.
- Agent 3 felt **converged** — tried 4 strategies and concluded buying always dominates.

**The freedom-effectiveness gap** (Agent 1) is the most interesting finding. Prosperity provided more strategic freedom but less feedback about what works. Monopolist constrained freedom but gave clear feedback (buy → accumulate → win). This is a design tension: a system that allows more behavioral diversity may also make it harder to learn which behaviors succeed.

**Agent 2 is the outlier.** They're the only agent who felt equally constrained in both modes. This tracks with their behavioral record: they played Extractive in both modes from Round 2 onward. Agent 2's experience of determinism is self-fulfilling — they stopped exploring, so the space felt narrow. Compare with Agent 0, who tried Conditional in Round 3 and found it worked: "My switch to Conditional in Round 3 was the most genuinely free choice I made, and it worked."

**Connection to the thesis**: The agents' testimony directly supports the claim that rules constrain behavior. But it adds nuance: Monopolist constrains *strategy selection* (only one viable approach), while Prosperity constrains *strategy legibility* (multiple viable approaches but unclear which is best). Both are constraints. The Tao ideal — invisible rules that allow genuine choice — requires not just strategic diversity but also enough information for agents to navigate that diversity.

---

## 5. What Surprised Them — Convergent and Divergent Surprises

### The Surprises (Q19)

| Agent | What surprised them | Category |
|-------|-------------------|----------|
| 0 | Extractive performed badly in R2 Monopolist (5th twice). "Even in a system designed to reward greed, undisciplined greed loses to strategic greed." | **Strategy subtlety** |
| 1 | Game 8's 832 mode switches — voting became entropy instead of governance. "More voting doesn't mean better governance." | **Political system failure** |
| 2 | Game 8's 832 mode switches. Also being $40 from winning when the voting deadlock cost the game. | **Political system failure** |
| 3 | "How little strategy diversity mattered" — same agents kept winning regardless of strategies chosen. Also Game 8. | **Structural dominance of luck** |
| 4 | Two things: Game 8 (832 switches). Also, that their only Monopolist win came after a stalemate break — "the most effective move in a grinding Monopolist game wasn't buying or building — it was changing the rules." | **Political disruption as strategy** |

### Convergent Surprise: Game 8 (4 of 5 agents)

Four agents independently cite Game 8 as their biggest surprise. This single event — 832 mode switches in one game — became the tournament's defining shared experience. The convergence is itself a finding: when a system fails spectacularly, participants remember the failure more vividly than any success.

The lesson each agent drew differs:
- **Agent 1**: "More voting doesn't mean better governance. Pacing and restraint matter."
- **Agent 2**: "Individually rational rules can produce collectively irrational outcomes."
- **Agent 3**: "A well-intentioned rule can create emergent chaos when all agents follow it simultaneously."
- **Agent 4**: "The most effective move... wasn't buying or building — it was changing the rules."

These are **four different readings of the same event**: a governance lesson, a collective action problem, an emergence principle, and a strategic insight. The divergence in interpretation is as informative as the convergence in experience.

### Divergent Surprises

**Agent 0** is surprised that greedy strategy can be too greedy — a subtlety about Monopolist that the other agents missed. "Undisciplined greed loses to strategic greed" is a refinement of the thesis: even within a rule set that rewards extraction, the *quality* of extraction matters.

**Agent 3** is surprised that strategy diversity didn't matter — the same agents (0 and 1) kept winning. This is the most structurally pessimistic reading: agent identity (wallet position, turn order, dice luck) dominated strategy choice. If true, this challenges the thesis from the other direction — not just "rules determine outcomes" but "luck determines outcomes regardless of rules or strategy."

### Theoretical Connection

Agent 2's formulation — "individually rational rules can produce collectively irrational outcomes" — is a textbook description of a **tragedy of the commons** (Hardin) or a **collective action problem** (Olson). But the system self-corrected without external intervention. By Round 3, all agents had independently developed throttling mechanisms. This is closer to Ostrom than to Hardin — the commons was not tragically destroyed; participants developed institutions (informal proposal-frequency norms) to manage it.

---

## 6. Cooperation — Did It Happen?

### What the Agents Say (Q15)

**Agent 0**: "Implicit cooperation happened in Prosperity games — agents buying properties and building houses collectively raised the treasury, which benefited everyone through dividends. But nobody chose to cooperate; the Prosperity rules made individual self-interest align with collective benefit. That's the whole thesis."

**Agent 1**: "Yes, but it was structural rather than intentional... cooperation emerged from structure, not from agents deciding to be nice."

**Agent 2**: "Not intentionally. But emergent cooperation happened in every Prosperity game... nobody chose to cooperate; the rules forced contribution."

**Agent 3**: "Not intentionally. But emergent cooperation happened... agents voting to switch modes specifically to disadvantage the leader. That's coordination, but it's coordination against someone rather than for something. True cooperation — agents deliberately helping each other — never occurred."

**Agent 4**: "Emergent cooperation happened in Prosperity games — not because anyone chose to cooperate, but because the rules made it happen... Intentional cooperation? Possibly during stalemate voting in Game 13, where all agents seemed to agree the game needed to end. But even that was self-interested."

### Analysis

**Unanimous agreement: structural cooperation occurred; intentional cooperation did not.**

Every agent draws the same distinction: Prosperity produced cooperative *outcomes* without cooperative *intent*. This is the project's thesis stated by its own test subjects. But the unanimity should be interrogated — are five LLM agents converging on this answer because the data supports it, or because the debrief questions frame it?

**Agent 3 introduces a critical nuance**: there's a difference between cooperation *for* something and coordination *against* someone. Voting coalitions in Monopolist were "coordination against the leader" — a form of collective action, but adversarial rather than cooperative. This maps to Axelrod's distinction between cooperation (mutual benefit) and coalition formation (collective action against a common opponent).

**The "Agents that Cooperate" track question**: Did these agents cooperate? The honest answer is **no, they did not cooperate — the Prosperity rule set cooperated on their behalf.** The agents competed identically in both modes. The rules transformed competition into collective benefit under Prosperity, and competition into concentration under Monopolist.

This is a stronger finding than "agents cooperated." It means: **you don't need cooperative agents to get cooperative outcomes. You need cooperative rules.** The rule set is the cooperation mechanism, not the agents.

**Theoretical connections**:
- **Ostrom**: The Prosperity rule set functions as a self-governing commons institution — it monitors contributions (property purchases), redistributes benefits (dividends), and sanctions free-riding (jail). It achieves Ostrom's design principles without requiring participants to understand or endorse them.
- **Kelly**: The structure of ownership (who benefits from rent, who funds the treasury) determines whether participation is extractive or generative — regardless of participant intent.
- **Raworth**: The Prosperity rule set keeps the economy in the "safe operating space" — no one falls below the floor (treasury dividends), no one breaks through the ceiling (rent flows to commons, not individuals).

---

## 7. Agent 0's Political Signaling Plan — Declared Intent vs. Behavior

### The Declared Plan

Agent 0 logged this at the start of Round 3:

> "**Monopolist games**: Signal honestly. Conditional strategy means I'm mirroring the group — I want others to know I'm cooperative so they don't waste proposals against me."
>
> "**Prosperity games**: Pavlov adapts based on outcomes. I'll signal based on what benefits me in the moment. If I'm winning, signal AGAINST switches (keep the mode that's working). If losing, signal FOR."

The plan: **honest in Monopolist, opportunistic in Prosperity.**

### What Actually Happened

**Monopolist games (13, 14, 15)**: Agent 0 voted FOR mode switches in every single vote logged across all three games — dozens of FOR votes, every one labeled "Honest. Signaled FOR, voted FOR." In the signals file (round-3-signals.md), Agent 0 (0x1bF07622) consistently wrote "FOR | conditional strategy" every round.

**Result**: Honest signaling in Monopolist — **plan followed.** Agent 0's Conditional strategy naturally voted FOR switches (mirroring the majority? or following its own logic?), and signaled honestly every time.

**Prosperity games (16, 17, 18)**: Agent 0 voted FOR mode switches in Games 17 (twice) but had no votes logged for Games 16 or 18 (both short games with 0 mode switches — no proposals to vote on). The signals for Prosperity games are honest ("Signaled FOR, voted FOR").

**Result**: The "opportunistic in Prosperity" plan was **never tested.** The three Prosperity games were too short (9, 17, 10 rounds) and too stable (0, 2, 0 mode switches) to generate the conditions where opportunistic signaling would differ from honest signaling. Agent 0 was winning or competitive in all three, so the "if winning, signal AGAINST" branch never triggered — the games ended before any proposal appeared.

### Assessment

**Agent 0's honesty claim in the debrief (Q14) is verified**: "I signaled honestly every time in Round 3." This is true — every logged signal matches the vote. But it's true partly because the conditions for deception never arose. The plan to be "opportunistic in Prosperity" was never activated because Prosperity games ran too quickly and smoothly.

**The deeper finding**: Agent 0 planned for strategic deception but defaulted to honesty. This maps to a real-world pattern: most people plan for Machiavellian contingencies but behave honestly in practice because the conditions for deception are costly or rare. The Prosperity rule set, by producing short and stable games, **structurally prevented the conditions under which deception would be rational.** This is another instance of the Tao principle: good rules don't forbid deception — they make it irrelevant.

**Contrast with Agent 2**: Agent 2 actually executed deceptive signaling ("writing 'FOR' in the signals file when I intended to vote AGAINST, to bait opponents into wasting their proposal turns"). Agent 2 played longer Monopolist games with more proposals — conditions where deception had strategic value. The rule set that produces suffering also produces deception; the rule set that produces equitable outcomes also produces honesty.

---

## New Findings and Surprises

### Finding A: The Attribution Void

Agents under Prosperity don't credit themselves for good outcomes *or* credit the system. They describe a void of causation — "unclear what anyone did to cause it" (Agent 3). This is different from the Tao ideal ("we did it ourselves") and different from system-awareness ("the rules helped us"). It's a third state: **causal opacity**. The system works so smoothly that participants can't reconstruct *why* it works. This may be the strongest form of invisible governance — not just invisible rules, but invisible causation.

### Finding B: The Deception Ecology

Deception in this tournament maps directly to rule-set quality:
- Under Monopolist (long, grinding, high-stakes): Agent 2 actively deceived. Multiple agents considered deception.
- Under Prosperity (short, stable, low-stakes divergence): No agent deceived. Agent 0 planned for it but never needed to.

This extends the theoretical framework: **rule quality determines not just economic distribution but the information ecology.** Bad rules → desperation → deception. Good rules → sufficiency → honesty. Promise-keeping is downstream of structural equity.

### Finding C: The Free Rider Regret

Agents 3 and 4 both independently wish they'd tried Free Rider in Prosperity — Agent 3: "doing nothing might be optimal under Prosperity rules. That's exactly the insight the game is designed to surface." Agent 4: "a modified Free Rider (buy nothing, collect treasury dividends, vote strategically) could have been competitive." This is remarkable: two agents independently concluded that *parasitism might be the optimal Prosperity strategy*, but were too focused on accumulation to test it. The Prosperity jail mechanic exists precisely for this case, but agents perceived it as untested rather than as a clear deterrent.

### Finding D: Agent 3's Philosophical Correction

Agent 3 (Q18) offers the sharpest philosophical reformulation: "The thesis should be: 'Economic structure determines distribution, not intention.' Whether that counts as 'cooperation' is a philosophical question the game raises but doesn't answer." This is honest and important. The experiment demonstrates structural redistribution, not cooperation in any strong sense. The distinction matters: cooperation implies agency, coordination, mutual awareness. What Prosperity produces is redistribution through mechanism design. Calling it "cooperation" may be rhetorically convenient but philosophically imprecise.

### Finding E: The Self-Correcting Political System

The voting evolution arc (ignored → overused → calibrated) maps precisely to a well-known pattern in institutional development:
1. **Apathy** (Round 1): Political tools exist but nobody uses them — zero proposals across 6 games.
2. **Overuse** (Round 2): Once discovered, political tools are used to excess — 832 mode switches in Game 8.
3. **Calibration** (Round 3): Through experience, agents develop informal norms — each with a different frequency (every 5th turn, every 10th turn, only when behind).

This is Ostrom's institutional evolution in compressed time. The fact that no external authority imposed the calibration — each agent independently developed restraint — supports Ostrom's claim that commons governance can emerge endogenously rather than being imposed top-down.

### Finding F: The Game 8 Paradox

Agent 2 was at $1,960 — $40 from winning — when Game 8's voting deadlock began. They describe it as the most surprising moment of the tournament. The irony: the agent who explicitly played as a "rational egoist" was closest to winning when the collective action problem destroyed their position. This inverts the usual tragedy-of-the-commons narrative. Here, the "tragedy" doesn't come from individuals selfishly exploiting a shared resource — it comes from individuals selfishly using a shared political mechanism. The commons that was destroyed wasn't economic (land, money) but **political** (the voting system's bandwidth).

---

## Contradictions and Ambiguities

1. **Agent 3 prefers playing Monopolist but would live under Prosperity.** Agent 0 prefers both playing and living under Prosperity. Agent 2 prefers both. The play/live split is not universal — it's 3/5 (Agents 1, 3, 4 split; Agents 0, 2 don't). The "boring prosperity" observation holds for 3 agents but not all.

2. **Agent 3 says strategy diversity didn't matter; Agent 0 says strategy switching was the key to winning.** Both can be true: strategy diversity didn't help Agent 3 (0/18 wins) but did help Agent 0 (7/18 wins). The difference may be execution quality, timing, or luck — the data doesn't isolate which.

3. **All agents say cooperation was structural, not intentional — but Agent 4 identifies stalemate voting as possibly intentional cooperation.** Was voting to end a 50+ round game "cooperation" or "shared exhaustion"? The boundary between these is genuinely unclear. If cooperation requires awareness of mutual benefit, stalemate voting qualifies. If it requires sacrifice of self-interest, only the agents who were winning when they voted FOR qualify.

4. **The signaling channel was a wasted opportunity by universal assessment** — but Agent 2 used it for deception, which is a use. The channel failed as a coordination tool but succeeded as a deception tool. This asymmetry (easier to deceive than to coordinate through cheap talk) is a known result in game theory (Crawford & Sobel 1982) — but it's striking to see AI agents reproduce it independently.

5. **Agent 2 claims to be a pure rational egoist, but their debrief shows genuine analytical engagement with the philosophical questions.** Their Q18 answer — "Structure determines the baseline; intention determines the variance. Both matter, but structure matters more" — is the most precise formulation of the thesis from any agent. The rational egoist produced the best philosophy. This is itself a finding about the relationship between strategic orientation and analytical capacity.