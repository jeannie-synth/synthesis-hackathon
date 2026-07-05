"""Page 1 — the setup. The only variable is where rent flows."""

import plotly.graph_objects as go
import streamlit as st

import core
from core import MONO_COLOR, PROS_COLOR


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
        fig, height=340,
        xaxis=dict(visible=False, range=[-0.05, 1.1]),
        yaxis=dict(visible=False, range=[-0.05, 1.05]),
        margin=dict(t=10, b=10, l=10, r=10),
    )
    return fig


def render():
    st.title("The Only Variable Is Where Rent Flows")
    core.question_panel(
        "Two rule sets on the same 40-space board. Identical prices, identical "
        "salaries, identical dice. One structural difference — what happens "
        "to rent when it's paid."
    )

    col1, col2 = st.columns(2)
    with col1:
        st.markdown(f"### <span style='color:{MONO_COLOR}'>Monopolist</span>",
                    unsafe_allow_html=True)
        st.plotly_chart(_flow_figure("Monopolist"), use_container_width=True)
        core.finding_text(
            "All rent flows to the property owner. Wealth compounds into a spiral: "
            "own more → collect more → own more."
        )
    with col2:
        st.markdown(f"### <span style='color:{PROS_COLOR}'>Prosperity</span>",
                    unsafe_allow_html=True)
        st.plotly_chart(_flow_figure("Prosperity"), use_container_width=True)
        core.finding_text(
            "All rent flows into a shared treasury that pays equal dividends "
            "to every player. The Georgist mechanism, on-chain."
        )

    st.markdown("## Even the win condition is a structural choice")
    c1, c2 = st.columns(2)
    with c1:
        core.finding_card(
            "Monopolist ends by concentration",
            "The game ends when one player's net worth crosses the domination "
            "threshold — or everyone else is bankrupt.",
            accent=MONO_COLOR,
        )
    with c2:
        core.finding_card(
            "Prosperity ends by threshold",
            "The game ends when the poorest player's net worth crosses a "
            "security threshold.",
            accent=PROS_COLOR,
        )

    st.markdown("## The cast never changes")
    st.markdown(
        "Five agent strategies play both rule sets. Nothing about the agents "
        "changes between worlds — only the rules do."
    )
    import pandas as pd
    cast = pd.DataFrame([
        {"Strategy": "Extractive",
         "Behavior": "Always buys, always builds, never cooperates",
         "Archetype": "Kelly's extractive ownership · Always Defect"},
        {"Strategy": "Generative",
         "Behavior": "Buys only with surplus, keeps reserves, cooperates by default",
         "Archetype": "Kelly's generative ownership · Always Cooperate"},
        {"Strategy": "Conditional",
         "Behavior": "Cooperates if others did last round",
         "Archetype": "Fischbacher's conditional cooperator · Tit-for-Tat"},
        {"Strategy": "FreeRider",
         "Behavior": "Avoids buying, rides on dividends and salary",
         "Archetype": "Fischbacher's free rider · Ostrom's rational egoist"},
        {"Strategy": "Pavlov",
         "Behavior": "Repeats whatever made money last turn",
         "Archetype": "Nowak & Sigmund's Win-Stay, Lose-Shift"},
    ])
    st.dataframe(cast, use_container_width=True, hide_index=True)
    core.caption(
        "Archetypes from the cooperation literature: Marjorie Kelly (Owning Our "
        "Future), Fischbacher–Gächter–Fehr (2001), Axelrod tournaments, "
        "Nowak & Sigmund (1993)."
    )

    core.next_page("The Divergence — what 30 games show", "divergence")
