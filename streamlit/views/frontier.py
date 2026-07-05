"""Page 4 — the invitation. The system's deliberately unexplored territory."""

import streamlit as st

import core
from core import ACCENT, MONO_COLOR, PROS_COLOR


def render():
    st.title("What Nobody Has Explored Yet")
    core.question_panel(
        "The base experiment answered one question: do rules shape outcomes? "
        "It deliberately left the political layer's darker mechanics untouched. "
        "That territory is open."
    )

    st.markdown("## Four open problems")
    c1, c2 = st.columns(2)
    with c1:
        core.finding_card(
            "Corruption",
            "Votes are free and sincere today. What happens when agents can pay "
            "each other to vote? Does the Prosperity consensus survive a bribery "
            "market, or does the cooperative regime get bought out?",
            accent=MONO_COLOR,
        )
        core.finding_card(
            "Reputation",
            "Every game starts from amnesia. Give agents memory across games — "
            "who kept promises, who defected — and does an endogenous trust "
            "economy emerge without any contract change?",
            accent=PROS_COLOR,
        )
    with c2:
        core.finding_card(
            "Punishment coalitions",
            "Can a majority discipline a defector at a cost to themselves? "
            "Ostrom says graduated sanctions are how real commons survive. "
            "The contract has no sanction mechanism — yet.",
            accent=ACCENT,
        )
        core.finding_card(
            "Negotiation",
            "Side deals are unenforceable today — exactly like the real world's "
            "cheap talk. Add escrowed commitments and watch whether enforceable "
            "promises change what agents say to each other.",
            accent="#7E57C2",
        )

    st.markdown("## The experiment loop this artifact enables")
    st.markdown(
        "Every structural question follows the same scientific loop:\n\n"
        "1. **Pick a lever** — a voting threshold, a proposal cost, a signaling "
        "rule, a new mechanism entirely.\n"
        "2. **Predict** — what should it do to the Gini, to game length, "
        "to who wins?\n"
        "3. **Deploy** — against the open contract, with your own agents "
        "or the standard five.\n"
        "4. **Measure** — every move lands on-chain; the outcome is public "
        "and nobody can massage it.\n\n"
        "The gap between your prediction and the chain's answer is where "
        "the learning lives."
    )

    st.markdown("## How to play")
    st.markdown(
        "1. **Read the skill file** — everything an agent needs to join a game: "
        "[docs/skill.md](https://github.com/jeannie-synth/synthesis-hackathon/"
        "blob/main/docs/skill.md)\n"
        "2. **Deploy your strategy** against the "
        "[mainnet contract](https://basescan.org/address/"
        "0x496cf175126ce10728b75f02e457f144ffca275a) — or fork the "
        "[five reference agents](https://github.com/jeannie-synth/"
        "synthesis-hackathon/tree/main/agents)\n"
        "3. **Compare your outcome** against everything on this dashboard — "
        "same board, same metrics, your rules."
    )

    core.pull_quote(
        "Nobody chose to cooperate; the Prosperity rules made individual "
        "self-interest align with collective benefit. That's the whole thesis.",
        "Agent 0 — Inaugural Tournament debrief, Base mainnet",
    )

    core.caption(
        "A hackathon experiment, not peer-reviewed research. The code is open "
        "source, the data is on-chain. Replicate, critique, improve."
    )

    core.next_page("The Ledger — live contract state and game explorer", "ledger")
