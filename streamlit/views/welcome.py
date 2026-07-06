"""Page 0 — the on-ramp. Explainable to a fifth grader, boards first."""

from pathlib import Path

import plotly.express as px
import streamlit as st
import streamlit.components.v1 as components

import core

BOARDS_DIR = Path(__file__).parent.parent.parent / "assets" / "boards"
MONO_BOARD = BOARDS_DIR / "Monopoly (1600 x 1600 px) (1).png"
PROS_BOARD = BOARDS_DIR / "Prosperity (1600 x 1600 px).png"


def render():
    data = core.load_all()

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

    st.markdown("## Watch a real game")
    st.markdown(
        "This is a replay of an actual recorded game — every move below "
        "happened on-chain. Pick a game, press play."
    )
    components.iframe(
        "https://jeannie-synth.github.io/synthesis-hackathon/viewer/",
        height=680, scrolling=True,
    )
    core.caption(
        "Embedded from the [game replay viewer]"
        "(https://jeannie-synth.github.io/synthesis-hackathon/viewer/) — "
        "opens standalone if the frame doesn't load."
    )

    df_nw = core.net_worth_rows(data["phase1"])
    if not df_nw.empty:
        stats = {}
        for m in ("Monopolist", "Prosperity"):
            sub = df_nw[df_nw["Rule Set"] == m]["Net Worth ($)"]
            stats[m] = (sub.min(), sub.max())
        m_ratio = stats["Monopolist"][1] / max(stats["Monopolist"][0], 1)
        p_ratio = stats["Prosperity"][1] / max(stats["Prosperity"][0], 1)

        st.markdown(
            f"## Same five players. In one world the richest ends "
            f"{m_ratio:.0f}× above the poorest — in the other, {p_ratio:.1f}×"
        )
        fig = px.strip(
            df_nw, x="Rule Set", y="Net Worth ($)", color="Rule Set",
            color_discrete_map=core.MODE_COLORS, stripmode="overlay",
        )
        fig.update_traces(jitter=0.4, marker=dict(size=8, opacity=0.65),
                          hovertemplate="$%{y:,.0f}<extra></extra>")
        fig.add_annotation(
            x="Monopolist", y=stats["Monopolist"][1],
            text=f"richest: ${stats['Monopolist'][1]:,.0f}",
            showarrow=True, arrowhead=0, ax=60, ay=0,
            font=dict(size=core.font_px(12), color=core.MONO_COLOR),
        )
        fig.add_annotation(
            x="Monopolist", y=stats["Monopolist"][0],
            text=f"poorest: ${stats['Monopolist'][0]:,.0f}",
            showarrow=True, arrowhead=0, ax=60, ay=0,
            font=dict(size=core.font_px(12), color=core.MONO_COLOR),
        )
        core.apply_layout(
            fig, height=420, showlegend=False,
            yaxis=dict(title="Where each player ended, in dollars",
                       rangemode="tozero"),
            xaxis_title="",
        )
        st.plotly_chart(fig, use_container_width=True)
        core.finding_text(
            "Every dot is one player's final wealth in one game — "
            "150 player-endings across 30 games. The same five players, "
            "trying just as hard, under two rulebooks."
        )
        core.caption(core.SAMPLE_DISCLAIMER)

    st.markdown(
        "Nothing about the players changes between the two columns. "
        "Not their strategies, not their starting money, not their dice. "
        "**The only thing that changes is where rent goes.** The rest of "
        "this site walks through how that one difference plays out."
    )

    core.next_page("The evidence — every game, one picture", "landing")
