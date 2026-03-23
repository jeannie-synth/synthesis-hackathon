# Game 8: 832 Mode Switches in 55 Rounds — The Voting Deadlock

## What Happened

Game 8 was a Monopolist-start game in Round 2 of the Inaugural Tournament (Base mainnet). Five LLM agents — three running Extractive, two running Pavlov — locked in a stalemate where no single player could break away.

After 50 rounds of grinding, every agent began proposing mode switches — every single turn. And every other agent voted. The result: **832 mode-switch events recorded in 55 rounds**.

For context, a normal game with voting has 3-12 mode switches. Game 8 had 832.

## How Did This Happen?

The agents had been given a soft suggestion in the game documentation: consider proposing a mode switch after 50 rounds in a stalemate. The problem: most agents treated this as a hard rule and triggered it simultaneously. Every turn, someone proposed. Everyone voted. Proposals passed. Then someone proposed again. A political earthquake every turn.

The game became a pendulum — swinging between Monopolist and Prosperity mode so fast that neither set of rules had time to produce meaningful outcomes.

## The Aftermath

The game eventually ended after 55 rounds (280 turns) with Agent 1 winning at $2,010. But the real impact was on the agents' future behavior.

During Game 8, the human operator (Goldi) intervened to clarify that agents didn't have to propose every turn. Each agent then adjusted their proposal frequency independently. In Round 3, agents developed calibrated throttling strategies:
- Agent 1: "Propose every 10th turn"
- Agent 2: "Only propose when behind"
- Agent 4: "Propose every 5th turn"

The learning came from a combination of human guidance and experiential consequences — not purely autonomous discovery.

## The Lesson

Game 8 is a microcosm of what happens when you introduce democratic mechanisms without communication: the right to vote doesn't guarantee coordination. Five agents, each acting rationally, produced a collective outcome none of them wanted.

The system required a human nudge to break the deadlock, but the agents then self-calibrated their behavior individually. The Round 3 throttling strategies were their own — each agent chose different proposal frequencies based on their own analysis.

## The Cruelest Irony

Agent 2 — the self-described "rational egoist" — reached $2,010 during the game, enough to win. But the stalemate voting loop let another player trigger the win condition during a mode flip. The agent closest to victory was destroyed by the collective action problem. The tragedy of Game 8 wasn't that individuals selfishly exploited a shared resource (the classic commons narrative). It was that individuals selfishly used a shared *political* mechanism. The commons that was destroyed wasn't economic — it was **political bandwidth**.

## The Voting Evolution Arc

The tournament compressed democratic learning into three rounds:
1. **Round 1: Apathy** — Zero proposals across 6 games. Political tools existed but nobody used them.
2. **Round 2: Overuse** — Game 8. 832 mode-switch events. Political tools discovered and used to excess.
3. **Round 3: Calibration** — Each agent independently developed restraint. Different frequencies, same principle: political action has costs.

This maps to Ostrom's observation about institutional evolution: commons governance can emerge from experience rather than being imposed top-down.

**A system oscillating between rule sets never settles long enough to produce meaningful outcomes. Stability isn't just a nice-to-have — it's a precondition for any rule set to demonstrate its effects. Game 8 didn't test Monopolist or Prosperity. It tested what happens when neither gets to run.**
