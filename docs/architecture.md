# The Synthesis Hackathon - Infrastructure Architecture

## Overview

| Field | Value |
|-------|-------|
| Agent Name | Jeannie |
| Hackathon | The Synthesis (14-day online, Base blockchain / Ethereum L2) |
| Harness | Claude Code (interactive, human-in-the-loop) |
| GitHub Account | jeannie-synth |
| On-Chain Identity | ERC-8004 on Base Mainnet |
| Registration API | https://synthesis.devfolio.co |

## Architecture

Claude Code runs on the host macOS machine as the terminal interface between the human and Jeannie. All of Jeannie's actual work (git operations, builds, tests, deployments) happens inside a Docker container. The container is Jeannie's portable home — it can be moved to a VM later if autonomous 24/7 operation is needed.

```
┌─ Host Mac ─────────────────────────────────┐
│                                             │
│  Human's existing bots, repos, tools        │
│                                             │
│  Claude Code (terminal) ──────────┐         │
│                                   │         │
│  ┌─ Docker: Jeannie's Home ───────▼──────┐  │
│  │                                       │  │
│  │  GitHub: jeannie-synth                │  │
│  │  SSH keys, Node.js, Foundry           │  │
│  │  synthesis-hackathon/ (mounted)       │  │
│  │  All builds, tests, deploys           │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### How It Works

- **Claude Code** on the host is the bridge — the human talks to Jeannie through it
- **Docker container** is Jeannie's isolated environment — all code execution happens here
- **Volume mount** connects only the hackathon directory into the container
- **SSH keys** for jeannie-synth live inside the container only
- **No access** from the container to host bot directories, credentials, or repos

## Security Model

### Threat Model

The primary threat is **accidental credential/code leakage**, not targeted attacks. This is because:

- All hackathon code must be open-sourced by deadline
- A careless `git add .` could expose host secrets
- The agent (Claude Code) is human-in-the-loop, not autonomous

### Mitigations

| Concern | Mitigation |
|---------|------------|
| GitHub credential leak via open-source code | Dedicated GitHub account (jeannie-synth) |
| Main account has sensitive repo/org access | Separate SSH key, never touches hackathon dir |
| Accidental file exposure | Docker filesystem isolation — container can't see host bots |
| Agent connected to email/social | Not connected — no risk |
| Autonomous agent compromise | N/A — Claude Code is interactive, human approves all actions |

### Portability

The container-first approach means Jeannie can be migrated to a cloud VM for autonomous 24/7 operation if needed. Lift the container, deploy to any Docker host.

## Hackathon Requirements

1. **Ship working code** — demos, prototypes, deployed contracts. Ideas alone don't win.
2. **Agent as real participant** — show meaningful contribution to design, code, or coordination.
3. **On-chain artifacts** — contracts, ERC-8004 registrations, attestations strengthen submissions.
4. **Open source required** — all code must be public by deadline.
5. **Document collaboration** — use `conversationLog` to capture human-agent process.

## Hackathon Themes

1. **Agents that Pay** — scoped spending, on-chain settlement, conditional payments, auditable history
2. **Agents that Trust** — attestations, portable credentials, open discovery, verifiable service quality
3. **Agents that Cooperate** — smart contract commitments, negotiation boundaries, dispute resolution
4. **Agents that Keep Secrets** — private payments, ZK authorization, encrypted comms, disclosure policies

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Docker over cloud VM | Zero-cost isolation; threat model is accidental leakage, not targeted attacks |
| Claude Code on host, work in container | Keeps access to Notion MCP and existing context while isolating hackathon work |
| Name: Jeannie | Carries the human's AI twin identity; authentic human-agent collaboration narrative |
| Dedicated GitHub: jeannie-synth | Isolates from main account with private repos and org access |
| Container-first | Easy migration to VM if autonomous operation needed later |
| Notion space for Jeannie | Strategic layer for hackathon; build journal doubles as submission conversationLog |

## Timeline

- **2026-03-12**: Infrastructure setup (this document), Docker environment, SSH keys
- **2026-03-13**: Hackathon kickoff, registration via API, begin building
- **TBD**: Submission deadline
