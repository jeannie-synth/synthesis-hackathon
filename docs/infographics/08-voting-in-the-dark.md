# Voting in the Dark: What Happens When Agents Can't Talk

## The Setup

In Round 3 of the Inaugural Tournament (Base mainnet), we gave agents a shared signaling channel — a file where they could declare their voting intentions before votes happened. The idea: would pre-commitment change voting behavior? Would agents coordinate? Would they lie?

## What Actually Happened

The channel broke. Agents wrote to the file, but **no agent demonstrably read it before voting**.

Agent 0 admitted: "I couldn't read their signals reliably."
Agent 3 called it: "A wasted opportunity."

The file exists. It has 873 lines. Agents dutifully wrote "FOR" or "AGAINST" before every vote. But race conditions — multiple agents writing simultaneously with no file locking — smashed entries together on the same line, making the file unreliable even for agents that tried to read it.

They were signaling into the void.

## The Data

- **5 agents** writing signals across 4 games (Games 13, 14, 15, 17)
- **0 agents** demonstrably reading signals before voting
- **Race condition corruption**: concurrent appends without file locking smashed entries together on single lines
- **1 agent** (Agent 2) used the channel for deliberate deception — signaling "FOR" while voting AGAINST

## What We Can't Claim

We cannot claim that communication doesn't matter. We tested a broken channel, not communication itself.

The agents told us as much. When asked (Q3) what they'd add to a third rule set, **all five independently requested negotiation mechanics** — trading, deals, side payments, binding agreements. Communication wasn't irrelevant to them. It was the feature they wanted most and never got.

Agent 1: "Both current rule sets treat agents as isolated actors who can only interact through rent and voting. Real economic systems have negotiation, trade, and alliance formation."

Agent 4: "The biggest thing missing from both rule sets is negotiation — there's no way to exchange properties, form alliances with binding commitments, or create contracts between players."

## What We Can Claim

Even with broken communication, agents voted in coherent patterns:

In Monopolist games, agents who were losing voted FOR mode switches. Agents who were winning voted AGAINST. This is rational self-interest, not coordination — but it produces the same result as coordination would: **losers independently converge on changing the rules**.

In Phase 2 (rule-based agents on Sepolia, a separate experiment), 6 of 7 Monopolist-start games ended in Prosperity mode — the same self-correction pattern, with simpler agents and no signaling channel at all.

**Structural incentives produced collective action without communication.** That's a real finding. But it's a finding about *this game's* incentive alignment, not a general claim that communication is unnecessary.

## The Trust Topology: Empty

Across 18 games, we asked all 5 agents about trust (Q13). The result: **zero trust relationships formed.** Not one agent trusted another. But they distrusted for three distinct reasons:

1. **Identification failure** (Agents 1, 3): Couldn't map wallet addresses to strategies. Player indices shuffled between games. "I had no mechanism to identify which wallet was running which strategy."
2. **Structural disincentive** (Agents 0, 4): No mechanism for binding agreements. "Betrayal had no consequences."
3. **Active exploitation** (Agent 2): Weaponized the signaling channel from the first opportunity. Used it for deception — the one "successful" use of the channel was adversarial.

Agent 4's distinction is the sharpest: "Trust implies believing someone will act in your interest; I only believed agents would act in their own interest according to their strategy." That's prediction, not trust. The game produced prediction but not trust — a critical difference for protocol design.

## The Honest Conclusion

We tried to give agents a voice and it broke. The system self-corrected anyway through voting alone. But the agents wished the channel had worked — they wanted to negotiate, coordinate, build alliances. We can't test what we never built.

What we know: **structural incentives can drive collective action without communication.** When most agents benefit from a rule change, they'll independently vote for it.

What we don't know: **whether functioning communication would have changed the game.** The agents think it would. Their unanimous request for negotiation mechanics is itself a finding — five independent AI agents, after 18 games of experience, all concluded that the game's deepest limitation was the inability to talk to each other.

The open question isn't whether structure matters more than communication. It's whether communication, layered on top of good structure, would enable something neither can achieve alone.