"""Page 0 — the on-ramp. Story and boards only; the results start on page 1."""

from pathlib import Path

import streamlit as st

import core

BOARDS_DIR = Path(__file__).parent.parent.parent / "assets" / "boards"
MONO_BOARD = BOARDS_DIR / "Monopoly (1600 x 1600 px) (1).png"
PROS_BOARD = BOARDS_DIR / "Prosperity (1600 x 1600 px).png"
VIEWER_URL = "https://jeannie-synth.github.io/synthesis-hackathon/viewer/"


def render():
    st.title("The Landlord's Game")
    core.question_panel(
        "Can the rules of a game — not the players — decide "
        "who gets rich and who goes broke?"
    )

    st.markdown(
        "In **1903**, a game designer named Elizabeth Magie made a board game "
        "with a secret: it came with **two rulebooks**. "
        "Same board, same streets, same prices, same dice — "
        "but the two rulebooks disagree about one thing: "
        "**what happens to rent after it's paid.**"
    )

    col1, col2 = st.columns(2)
    with col1:
        if MONO_BOARD.exists():
            st.image(str(MONO_BOARD), use_container_width=True)
        st.markdown(
            f"### <span style='color:{core.MONO_COLOR}'>Monopolist rules</span>",
            unsafe_allow_html=True,
        )
        st.markdown(
            "Land on my street, you pay **me**. I use your rent to buy more "
            "streets. The game ends when one player has everything."
        )
    with col2:
        if PROS_BOARD.exists():
            st.image(str(PROS_BOARD), use_container_width=True)
        st.markdown(
            f"### <span style='color:{core.PROS_COLOR}'>Prosperity rules</span>",
            unsafe_allow_html=True,
        )
        st.markdown(
            "Land on my street, you pay **the town pot**. The pot gets split "
            "evenly between everyone. The game ends when even the poorest "
            "player is doing okay."
        )

    st.markdown(
        "One of these rulebooks was later dropped, and the game you grew up "
        "with kept the other one: that's **Monopoly**."
    )
    st.markdown(
        "A century later, we rebuilt her experiment. We gave the board to "
        "**five computer players** and let them play it both ways — for real "
        "tokens, on a public ledger (a blockchain), where every move is "
        "recorded and nobody can quietly change the results. Not even us. "
        "The players don't know they're in an experiment. They just try "
        "to win."
    )

    st.markdown(f"### ▶ [Watch a replay of a real game]({VIEWER_URL})")
    core.caption(
        "Opens the game viewer in a new tab — every move in the replay "
        "happened on-chain."
    )

    st.markdown(
        "What happened when the same five players tried both rulebooks? "
        "**The only difference between the two worlds is where rent goes** — "
        "the next page shows what that one difference did."
    )

    core.next_page("The evidence — every game, one picture", "landing")
