"""Page 0 — the on-ramp. Story and boards only; the results start on page 1."""

import os
from pathlib import Path

import streamlit as st

import core

BOARDS_DIR = Path(__file__).parent.parent.parent / "assets" / "boards"
MONO_BOARD = BOARDS_DIR / "Monopoly (1600 x 1600 px) (1).png"
PROS_BOARD = BOARDS_DIR / "Prosperity (1600 x 1600 px).png"
# Overridable for local review (the deployed viewer only updates on merge)
VIEWER_URL = os.environ.get(
    "VIEWER_URL", "https://jeannie-synth.github.io/synthesis-hackathon/viewer/"
)


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

    st.markdown("## Meet the players")
    st.markdown(
        "Five agents, five fixed personalities — the same starting lineup "
        "in every game, drawn from a century of research on how people "
        "actually play economic games."
    )
    lineup = [
        ("Extractive", "The Shark",
         "Buys everything it can afford, always. Never cooperates."),
        ("Generative", "The Builder",
         "Buys only with money to spare. Keeps reserves. Cooperates by default."),
        ("Conditional", "The Mirror",
         "Treats you the way you treated everyone last round."),
        ("FreeRider", "The Passenger",
         "Buys almost nothing. Rides on dividends and salary."),
        ("Pavlov", "The Streak",
         "Repeats whatever made money last turn. Changes when it loses."),
    ]
    cols = st.columns(5)
    for col, (name, nick, blurb) in zip(cols, lineup):
        color = core.STRATEGY_COLORS[name]
        col.markdown(
            f'<div style="border-top: 4px solid {color}; background: #f8f9fa; '
            f'border-radius: 0 0 8px 8px; padding: 0.8rem; height: 100%;">'
            f'<div style="font-weight: 700; color: {color};">{name}</div>'
            f'<div style="font-size: 0.85rem; color: #888; '
            f'font-style: italic;">"{nick}"</div>'
            f'<div style="font-size: 0.85rem; color: #444; '
            f'margin-top: 0.4rem;">{blurb}</div></div>',
            unsafe_allow_html=True,
        )
    core.caption(
        "Archetypes from the cooperation literature — Kelly, "
        "Fischbacher–Gächter–Fehr, Axelrod, Nowak & Sigmund. "
        "Full behavior specs on The Rules page."
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
