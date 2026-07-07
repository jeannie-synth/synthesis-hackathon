"""Page 2 — the experiment. Twin-game design, the chain as lab notebook.

The method page: how the one-variable comparison was actually run, and why
the record can be trusted before a single result is shown.
"""

import os

import streamlit as st

import core
import onchain

# Overridable for local review (the deployed viewer only updates on merge)
VIEWER_URL = os.environ.get(
    "VIEWER_URL", "https://jeannie-synth.github.io/synthesis-hackathon/viewer/"
)


def render():
    core.act_chip("The experiment")
    st.title("One Economy, Run Twice")
    core.question_panel(
        "How do you isolate a single variable in an economy? Run the same "
        "economy twice — identical in everything but the one rule — and do "
        "it somewhere nobody can edit the record afterwards. Not even the "
        "experimenters."
    )

    st.markdown("## The twin-game design")
    st.markdown(
        "Games ran in **pairs**: one board under Monopolist rules, one under "
        "Prosperity rules, with the **same five players** in the **same "
        "shuffled turn order** — the shuffle is drawn once per pair and "
        "shared by both twins, so first-mover advantage cancels out. "
        "Whatever differs between a game and its twin is attributable to "
        "the rule set."
    )

    data = core.load_all()
    tx_count = sum(
        1 for g in data["phase1"] + data["phase2"]
        for t in g.get("turns", []) if t.get("txHash")
    )
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Phase 1 — fixed rules", "30 games",
              help="15 twin pairs on Base Sepolia; the rule set never changes "
              "mid-game")
    c2.metric("Phase 2 — voting enabled", "13 games",
              help="Same board, but the players can propose and vote on "
              "switching the rule set mid-game")
    c3.metric("Inaugural — Base mainnet", "18 games",
              help="LLM agents choosing their own strategies across 3 rounds; "
              "source of The Interviews page")
    c4.metric("On-chain moves logged", f"{tx_count:,}",
              help="Transactions recorded across Phases 1–2")

    st.markdown("## The chain is the lab notebook")
    st.markdown(
        "Every move — every dice roll, purchase, rent payment, and vote — is "
        "a transaction on Base, a public blockchain. The ledger is "
        "append-only: once a move lands, no one can revise it, including us. "
        "For an experiment, that is a tamper-proof lab notebook with a "
        "public timestamp on every line — anyone can re-derive every chart "
        "in this dashboard from the raw record."
    )
    counts = onchain.live_game_counts()
    cols = st.columns(len(onchain.NETWORKS))
    for col, (name, net) in zip(cols, onchain.NETWORKS.items()):
        count = counts.get(name)
        if count is not None:
            col.metric(f"{name} — games created", f"{count:,}",
                       help="Read live from the contract just now")
        else:
            col.metric(f"{name} — games created", "—",
                       help=f"RPC unreachable. Last verified: {net['fallback_note']}")
        col.markdown(f"[View contract on Basescan]({net['explorer']})")

    st.markdown(f"### ▶ [Watch a replay of a real game]({VIEWER_URL})")
    core.caption(
        "Opens the game viewer in a new tab — every move in the replay "
        "happened on-chain."
    )

    core.caption(
        "Phases 1–2 use the five scripted strategies for reproducibility. "
        "The mainnet Inaugural Tournament let LLM agents choose their own "
        "strategies; it produced the transcripts on The Interviews page."
    )

    core.next_page("The Divergence — every game, one picture", "divergence")
