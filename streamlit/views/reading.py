"""Page 5 — the interpretation. Mechanism, not morality.

Reads the results in mechanism-design terms: how the two rule sets place
self-interest relative to collective outcome, and what the game clock
measures. The value judgments belong to the players — next page.
"""

import plotly.graph_objects as go
import streamlit as st

import core
from core import MONO_COLOR, PROS_COLOR


def _clock_chart(mono_rounds: list[int], pros_rounds: list[int]) -> go.Figure:
    """Every game's duration on one axis — the strip plot of the clock."""
    fig = go.Figure()
    for values, color, name, y0 in [
        (pros_rounds, PROS_COLOR, "Prosperity", 0),
        (mono_rounds, MONO_COLOR, "Monopolist", 1),
    ]:
        fig.add_trace(go.Scatter(
            x=values,
            y=[y0 + ((i % 5) - 2) * 0.07 for i in range(len(values))],
            mode="markers",
            marker=dict(color=color, size=15 if core.is_presentation() else 12,
                        opacity=0.85, line=dict(width=1, color="#fff")),
            hovertemplate=f"<b>{name}</b><br>%{{x}} rounds<extra></extra>",
            showlegend=False,
        ))
        mean_v = core.mean(values)
        fig.add_shape(
            type="line", x0=mean_v, x1=mean_v, y0=y0 - 0.28, y1=y0 + 0.28,
            line=dict(color=color, width=2, dash="dot"),
        )
        fig.add_annotation(
            x=mean_v, y=y0 + 0.45,
            text=f"<b>{name}</b> · mean {mean_v:.0f} rounds",
            showarrow=False, font=dict(size=core.font_px(13), color=color),
        )
    core.apply_layout(
        fig, height=320,
        xaxis=dict(title="Rounds until the game ended", rangemode="tozero"),
        yaxis=dict(visible=False, range=[-0.6, 1.8]),
        margin=dict(t=10, b=40, l=20, r=20),
    )
    return fig


def _strategy_dumbbell(df_pivot) -> go.Figure:
    fig = go.Figure()
    for _, row in df_pivot.iterrows():
        fig.add_trace(go.Scatter(
            x=[row["Prosperity"], row["Monopolist"]],
            y=[row["Strategy"], row["Strategy"]],
            mode="lines", line=dict(color="#ccc", width=core.line_w()),
            showlegend=False, hoverinfo="skip",
        ))
    for mode, color in [("Prosperity", PROS_COLOR), ("Monopolist", MONO_COLOR)]:
        fig.add_trace(go.Scatter(
            x=df_pivot[mode], y=df_pivot["Strategy"],
            mode="markers", showlegend=False,
            marker=dict(color=color, size=14, line=dict(width=1, color="#fff")),
            hovertemplate=f"<b>%{{y}}</b> under {mode}"
            "<br>Mean net worth: $%{x:,.0f}<extra></extra>",
        ))
    # Direct labels on the top row's dots — no legend
    top = df_pivot.iloc[-1]
    for mode, color, anchor in [("Prosperity", PROS_COLOR, "right"),
                                ("Monopolist", MONO_COLOR, "left")]:
        fig.add_annotation(
            x=top[mode], y=top["Strategy"], text=f"<b>{mode}</b>",
            showarrow=False, xanchor=anchor,
            xshift=-12 if anchor == "right" else 12,
            font=dict(size=core.font_px(12), color=color),
        )
    core.apply_layout(fig, height=350, yaxis_title="",
                      xaxis=dict(title="Mean net worth ($)",
                                 rangemode="tozero"))
    return fig


def render():
    data = core.load_all()
    p1_mono, p1_pros = data["p1_mono"], data["p1_pros"]

    core.act_chip("The interpretation")
    st.title("Two Geometries of Self-Interest")
    core.question_panel(
        "Every player in every game was trying to win. The rules never asked "
        "anyone to be good — they changed what winning required. This page "
        "reads the results in mechanism-design terms; the moral reading is "
        "left to the reader."
    )

    st.markdown("## The same appetite, two different paths")
    c1, c2 = st.columns(2)
    with c1:
        core.finding_card(
            "Monopolist: self-interest against the others",
            "Rent is a private transfer — every dollar leaves one balance "
            "sheet and lands on another, and compounding makes each advance "
            "easier to repeat. Under these rules, the only way to satisfy "
            "self-interest runs through another player's loss.",
            accent=MONO_COLOR,
        )
    with c2:
        core.finding_card(
            "Prosperity: self-interest through the others",
            "The same acquisitive move — buy, develop, collect — routes rent "
            "through a treasury that pays equal dividends. Advancing your own "
            "position feeds every balance sheet, including the poorest one, "
            "which is the one that ends the game.",
            accent=PROS_COLOR,
        )
    st.markdown(
        "In mechanism-design language: one rule set **aligns** individual "
        "incentives with the collective outcome; the other sets them in "
        "**opposition**. Nothing about the players changes — the payoff "
        "geometry does. The two results pages are what that difference "
        "looks like when it runs 43 times."
    )
    core.caption(
        "Framework: Henry George, *Progress and Poverty* (1879) — Magie's "
        "own source · Leonid Hurwicz, incentive compatibility (Nobel 2007) "
        "· Elinor Ostrom, *Governing the Commons* (1990) · Marjorie Kelly, "
        "*Owning Our Future* (2012)."
    )

    # ── Evidence recap ──
    st.markdown("## Three results, one reading")
    c1, c2, c3 = st.columns(3)
    with c1:
        core.finding_card(
            "Distribution tracked the rules, not the players",
            "30 of 30 fixed-rule games, no overlap in final inequality. If "
            "outcomes were driven by player character, the two worlds would "
            "blur — they never touched. (The Divergence)",
            accent=MONO_COLOR,
        )
    with c2:
        core.finding_card(
            "Self-interested voting found the aligned rules",
            "Given a ballot, most Monopolist economies voted their way out, "
            "and almost none went back. No player was instructed to prefer "
            "either rule set. (The Vote)",
            accent=PROS_COLOR,
        )
    with c3:
        core.finding_card(
            "When incentives align, strategy stops mattering",
            "Under Prosperity, five very different strategies land close "
            "together; under Monopolist, strategy decides everything. "
            "Structure explains most of the variance — chart below.",
            accent="#3498db",
        )

    # ── Strategy sensitivity ──
    df_nw_all = core.net_worth_rows(data["phase1"])
    if not df_nw_all.empty:
        df_agg = (df_nw_all.groupby(["Strategy", "Rule Set"])["Net Worth ($)"]
                  .mean().reset_index())
        df_pivot = df_agg.pivot(index="Strategy", columns="Rule Set",
                                values="Net Worth ($)").reset_index()
        if {"Monopolist", "Prosperity"} <= set(df_pivot.columns):
            df_pivot["Gap"] = df_pivot["Monopolist"] - df_pivot["Prosperity"]
            df_pivot = df_pivot.sort_values("Gap")
            m_span = df_pivot["Monopolist"].max() - df_pivot["Monopolist"].min()
            p_span = df_pivot["Prosperity"].max() - df_pivot["Prosperity"].min()

            st.markdown(
                "## Under aligned incentives, who you are barely changes "
                "where you land"
            )
            st.plotly_chart(_strategy_dumbbell(df_pivot),
                            use_container_width=True)
            widest = df_pivot.iloc[-1]
            core.finding_text(
                f"Across the five strategies, Prosperity outcomes span just "
                f"<strong>${p_span:,.0f}</strong>; Monopolist outcomes span "
                f"<strong>${m_span:,.0f}</strong>. "
                f"<strong>{widest['Strategy']}</strong> is the most sensitive "
                f"to the rule set (+${widest['Gap']:,.0f} under Monopolist). "
                "Consistent with Ostrom's claim that institutions select "
                "which behavioral types dominate."
            )
            core.caption(
                core.SAMPLE_DISCLAIMER + " Monopolist averages run higher "
                "overall because those games last ~4× longer (more salary "
                "rounds) — the signal is the spread, not the level."
            )

    # ── The clock ──
    mono_rounds = [g["result"]["rounds"] for g in p1_mono if g.get("result")]
    pros_rounds = [g["result"]["rounds"] for g in p1_pros if g.get("result")]
    if mono_rounds and pros_rounds:
        speed = core.mean(mono_rounds) / max(core.mean(pros_rounds), 0.1)
        st.markdown(
            "## The clock is a finding: the rule set decides how long "
            "money stays the point"
        )
        st.plotly_chart(_clock_chart(mono_rounds, pros_rounds),
                        use_container_width=True)
        core.finding_text(
            f"Each dot is one game's length. Monopolist games ran "
            f"<strong>{speed:.0f}× longer</strong> on average — and every "
            "extra round is another round in which acquisition is the only "
            "rational activity."
        )
        st.markdown(
            "**Monopolist ends by domination.** Competition postpones the "
            "end: the more evenly matched the players, the longer the game "
            "grinds on. Under these rules, monetary competition expands to "
            "fill the entire horizon of play — it *is* the game, for as long "
            "as the game lasts.\n\n"
            "**Prosperity ends when the poorest player is secure.** "
            "Acquisition is a bounded phase: the economy reaches its target "
            "and the game is over. The rising floor turns out to be the "
            "faster finish line.\n\n"
            "Read as a model, the termination condition is a statement about "
            "**time**: it fixes what fraction of play is spent competing "
            "over money. In one world that fraction is everything, and it "
            "grows as the players get better. In the other it is a phase "
            "that completes. The players never chose this allocation — it "
            "was set before the first die was rolled."
        )
        core.caption(core.SAMPLE_DISCLAIMER)

    # ── Scope ──
    st.markdown("## What this shows — and what it doesn't")
    st.markdown(
        "The claim is structural and comparative, not ethical: the two rule "
        "sets produce measurably different economies — in distribution, in "
        "the value of strategy, and in how long monetary competition "
        "dominates play — and when the participants were handed a ballot, "
        "their self-interested votes converged on the rule set whose "
        "incentives align. Whether that makes one rule set *better* is a "
        "judgment the data cannot make. The players made it anyway — "
        "next page."
    )
    core.caption(
        "Limits: 30 + 13 games is directional, not statistically conclusive. "
        "Phases 1–2 use scripted strategies; the LLM-driven mainnet "
        "tournament is qualitative. One board, one parameterization. "
        "A hackathon experiment, not peer-reviewed research — replicate, "
        "critique, improve."
    )

    core.next_page("The Interviews — what the players said afterwards",
                   "debrief")
