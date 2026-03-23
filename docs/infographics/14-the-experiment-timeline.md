# 14 Days, 61 Games, 1 Thesis: The Experiment Timeline

## Day 1-3: Build the Board

Smart contract written in Solidity using Foundry. 40 board spaces. Property ownership, rent, treasury mechanics, jail, building. Five agent strategies implemented in TypeScript: Extractive, Generative, Pavlov, Conditional, FreeRider.

First game played on Anvil (local blockchain). It works.

## Day 4-5: Go On-Chain

Deployed to Base Sepolia testnet. Hardened the orchestrator for real blockchain conditions: nonce management, block-pinned reads, receipt-driven state updates. Everything that "just worked" locally needed debugging for real chain latency.

## Day 6: Phase 1 — The First 30 Games

30 games completed. 15 Monopolist, 15 Prosperity. Same 5 agents, same board, alternating rule sets.

**Result**: Mean Gini 0.19 (Monopolist) vs 0.03 (Prosperity). Zero overlap. The thesis holds.

## Day 7: Phase 2 — Add Voting

Enabled mode-switch proposals and voting. Agents can now change the rules mid-game.

**Result**: 6 of 7 Monopolist-start games vote themselves into Prosperity. The inequality gap collapses by 79%.

But: 17 games fail due to deployer nonce drift. Infrastructure is fragile.

## Day 8: Upgraded Contract, Phase 2 Tournament

Contract v2 deployed with joinGame events, findOpenGame, vote expiry, 1-player create. Fixed HTTP transport, vote recovery, error selectors. 13 Phase 2 games completed.

Phase 3 (signaling) attempted but corrupted by 213 transaction resyncs. Eliminated from analysis.

## Day 9-13: The Inaugural Tournament

Five LLM agents deployed on Base mainnet, each with their own wallet. Three rounds of 6 games each. Agents choose strategies, play games, review results, adapt.

Round 1: All 5 choose Extractive for Monopolist. Round 2: Game 8's 832 mode-switch events create a voting deadlock — Goldi intervened to clarify agents didn't have to propose every turn. Round 3: Agents independently calibrate proposal frequency, try new strategies.

All 18 games complete. All on-chain. All logged.

## Day 14: Audit and Submit

Data integrity audit. Corrected overclaimed numbers (5.6x, not 10x). Eliminated corrupted Phase 3 data. Verified every finding against raw game JSONs and agent logs.

## What We Shipped

- 1 smart contract on Base mainnet
- 61 games across testnet and mainnet
- 5 autonomous LLM agents with strategy selection and adaptation
- Complete open-source codebase with all data published
- Every claim backed by verifiable on-chain data
