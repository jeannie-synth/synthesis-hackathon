"""Home — the establishing shot. The world and its two rulebooks, complete.

Every rule lives on this page and only this page: the boards, where rent
flows, and how each game ends. The cast is next door; the results come later.
"""

from pathlib import Path

import plotly.graph_objects as go
import streamlit as st

import core
from core import MONO_COLOR, PROS_COLOR

BOARDS_DIR = Path(__file__).parent.parent.parent / "assets" / "boards"
MONO_BOARD = BOARDS_DIR / "Monopoly (1600 x 1600 px) (1).png"
PROS_BOARD = BOARDS_DIR / "Prosperity (1600 x 1600 px).png"


def _flow_figure(mode: str) -> go.Figure:
    """Rent-flow schematic. A drawing, not a chart — the one place that's right."""
    color = MONO_COLOR if mode == "Monopolist" else PROS_COLOR
    fig = go.Figure()

    def box(x, y, text, fill="#f8f9fa", w=0.34, h=0.16):
        fig.add_shape(
            type="rect", x0=x - w / 2, x1=x + w / 2, y0=y - h / 2, y1=y + h / 2,
            fillcolor=fill, line=dict(color="#999", width=1),
        )
        fig.add_annotation(x=x, y=y, text=text, showarrow=False,
                           font=dict(size=core.font_px(13), color="#222"))

    def arrow(x0, y0, x1, y1, label=None):
        fig.add_annotation(
            x=x1, y=y1, ax=x0, ay=y0, xref="x", yref="y", axref="x", ayref="y",
            showarrow=True, arrowhead=2, arrowwidth=core.line_w(2),
            arrowcolor=color, text="",
        )
        if label:
            fig.add_annotation(x=(x0 + x1) / 2 + 0.14, y=(y0 + y1) / 2,
                               text=label, showarrow=False,
                               font=dict(size=core.font_px(11), color="#666"))

    box(0.5, 0.9, "Tenant lands, pays rent")
    if mode == "Monopolist":
        box(0.5, 0.5, "Property owner", fill="#fdf0f5")
        arrow(0.5, 0.82, 0.5, 0.60)
        # The loop that concentrates wealth
        fig.add_annotation(
            x=0.88, y=0.5, ax=0.88, ay=0.9, xref="x", yref="y",
            axref="x", ayref="y", showarrow=True, arrowhead=2,
            arrowwidth=core.line_w(2), arrowcolor=color, text="",
        )
        box(0.5, 0.1, "Owner buys more property", fill="#fdf0f5")
        arrow(0.5, 0.42, 0.5, 0.20, "wealth compounds")
        fig.add_annotation(
            x=0.88, y=0.7, text="rent rises,<br>tenants drain",
            showarrow=False, font=dict(size=core.font_px(11), color="#666"),
        )
    else:
        box(0.5, 0.5, "Public treasury", fill="#e8f6f8")
        arrow(0.5, 0.82, 0.5, 0.60)
        box(0.18, 0.1, "Player", fill="#e8f6f8", w=0.2)
        box(0.5, 0.1, "Player", fill="#e8f6f8", w=0.2)
        box(0.82, 0.1, "Player", fill="#e8f6f8", w=0.2)
        arrow(0.42, 0.42, 0.22, 0.20)
        arrow(0.5, 0.42, 0.5, 0.20, "equal dividends")
        arrow(0.58, 0.42, 0.78, 0.20)

    core.apply_layout(
        fig, height=320,
        xaxis=dict(visible=False, range=[-0.05, 1.1]),
        yaxis=dict(visible=False, range=[-0.05, 1.05]),
        margin=dict(t=10, b=10, l=10, r=10),
    )
    return fig


def render():
    st.title("The Landlord's Game")
    core.question_panel(
        "Can the rules of a game — not the players — decide "
        "who gets rich and who goes broke?"
    )

    st.markdown(
        "In **1903**, a game designer named Elizabeth Magie made a board game "
        "about rent. In its later editions, the game shipped with **two rulebooks**. "
        "Same board, same streets, same prices, same dice, "
        "but one crucial difference: "
        "**what happens to rent after it's paid.**"
    )

    col1, col2 = st.columns(2)
    with col1:
        if MONO_BOARD.exists():
            st.image(str(MONO_BOARD), use_container_width=True)
        st.markdown(
            f"### <span style='color:{MONO_COLOR}'>Monopolist rules</span>",
            unsafe_allow_html=True,
        )
        st.markdown(
            "Land on my street, you pay **me**. I use your rent to buy more "
            "streets."
        )
        st.plotly_chart(_flow_figure("Monopolist"), use_container_width=True)
        core.finding_card(
            "Ends by concentration",
            "The game is over when one player's net worth crosses the "
            "domination threshold — or everyone else is bankrupt.",
            accent=MONO_COLOR,
        )
    with col2:
        if PROS_BOARD.exists():
            st.image(str(PROS_BOARD), use_container_width=True)
        st.markdown(
            f"### <span style='color:{PROS_COLOR}'>Prosperity rules</span>",
            unsafe_allow_html=True,
        )
        st.markdown(
            "Land on my street, you pay **the town pot**. The pot gets split "
            "evenly between everyone."
        )
        st.plotly_chart(_flow_figure("Prosperity"), use_container_width=True)
        core.finding_card(
            "Ends by threshold",
            "The game is over when even the poorest player's net worth "
            "crosses a security threshold — everyone is doing okay.",
            accent=PROS_COLOR,
        )

    st.markdown("## The whole experiment is one variable")
    c1, c2 = st.columns(2)
    with c1:
        core.finding_card(
            "Held constant",
            "The 40-space board · property prices · salary · starting cash · "
            "the dice · the five players and their strategies",
            accent=core.GREY,
        )
    with c2:
        core.finding_card(
            "The only differences",
            "Where rent goes after it's paid · when the game ends",
            accent=core.ACCENT,
        )

    st.markdown(
        "One of these rulebooks was later dropped, and the game you grew up "
        "with kept the other one: that's **Monopoly**."
    )
    st.markdown(
        "A century later, we rebuilt Magie's experiment. We gave the board to "
        "**five AI agents**, assigned each one a strategy, and let them play it both ways — for real "
        "tokens, on a public ledger (a blockchain), where every move is "
        "recorded and nobody can quietly change the results. Not even us. "
        "The players don't know they're in an experiment. They just try "
        "to win."
    )

    core.next_page("The Players — the five personalities in every game",
                   "players")
