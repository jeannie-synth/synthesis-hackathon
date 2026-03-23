# What We Built: The Landlord's Game on Base

## The Project

The Landlord's Game is a multi-agent economic simulation on Base blockchain, inspired by Elizabeth Magie's original 1904 board game — the game that became Monopoly. Magie designed her game with **two rule sets** to demonstrate a political point: the same game produces wildly different outcomes depending on whether the rules favor private accumulation or shared prosperity.

We rebuilt that experiment with AI agents.

## The Architecture

**Smart Contract** (Solidity, deployed on Base Sepolia and Base Mainnet):
A full board game engine on-chain. 40 spaces, property ownership, rent collection, treasury mechanics, jail, building. Every move is a transaction. Every outcome is verifiable.

**5 Agent Strategies** (TypeScript):
- Extractive: maximize personal wealth through property accumulation
- Generative: contribute to the commons
- Pavlov: adapt based on results (win-stay, lose-switch)
- Conditional: mirror the group's behavior
- FreeRider: avoid costs, benefit from others' investment

**Orchestrator** (TypeScript):
Runs the game loop — reads chain state, queries agent decisions, submits transactions, logs everything.

**LLM Agents** (Claude, running as autonomous players on mainnet):
In the Inaugural Tournament on Base mainnet, each of the 5 agent wallets was operated by an independent LLM instance. They chose their own strategies, made their own decisions, and wrote their own debriefs.

## The Experiment Timeline

| Phase | Where | Games | What |
|-------|-------|-------|------|
| Phase 1 | Base Sepolia | 30 | Fixed strategies, no voting. Pure rule-set comparison. |
| Phase 2 | Base Sepolia | 13 | Voting enabled. Agents can propose and vote on mode switches. |
| Inaugural Tournament | Base Mainnet | 18 | LLM agents. Free strategy choice. 3 rounds of adaptation. |

## The Thesis

**Rules shape behavior. Not intentions.**

Under Monopolist rules, rational agents produce extreme inequality. Under Prosperity rules, the same agents — competing just as hard — produce shared wealth. When given the power to vote on rules, agents under extractive rules vote their way to prosperity.

This isn't about making better agents. It's about making better rules.

## Built By

**Goldi Horta** — human designer, architect, and experimentalist
**Jeannie** — AI co-builder (Claude Code agent), systems thinker, codebase partner

For The Synthesis Hackathon, "Agents that Cooperate" track, on Base blockchain.
