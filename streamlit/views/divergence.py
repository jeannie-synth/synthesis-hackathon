"""Page 3 — Phase 1 results. The divergence, led by the one unforgettable chart."""

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

import core
from core import GREY, MONO_COLOR, PROS_COLOR


def _hero_chart(mono_ginis: list[float], pros_ginis: list[float]) -> go.Figure:
    """All 30 final Ginis on one axis. Two clusters. A gap nothing crosses."""
    fig = go.Figure()

    # Deterministic vertical jitter so coincident values stay visible
    def jitter(i: int) -> float:
        return ((i % 5) - 2) * 0.09

    for values, color, name in [
        (pros_ginis, PROS_COLOR, "Prosperity"),
        (mono_ginis, MONO_COLOR, "Monopolist"),
    ]:
        fig.add_trace(go.Scatter(
            x=values,
            y=[jitter(i) for i in range(len(values))],
            mode="markers",
            marker=dict(color=color, size=15 if core.is_presentation() else 12,
                        opacity=0.85, line=dict(width=1, color="#fff")),
            hovertemplate=f"<b>{name}</b><br>Final Gini: %{{x:.3f}}<extra></extra>",
            showlegend=False,
        ))

    gap_left, gap_right = max(pros_ginis), min(mono_ginis)

    # The gap is the finding — shade it and say so
    fig.add_vrect(
        x0=gap_left, x1=gap_right,
        fillcolor="rgba(0,0,0,0.05)", line_width=0,
    )
    fig.add_annotation(
        x=(gap_left + gap_right) / 2, y=0.75,
        text="<b>The gap</b><br>no game ever landed here",
        showarrow=False, font=dict(size=core.font_px(13), color="#555"),
    )

    # Direct cluster labels — no legend
    fig.add_annotation(
        x=sum(pros_ginis) / len(pros_ginis), y=-0.62,
        text=f"<b>Prosperity</b> · {len(pros_ginis)} games",
        showarrow=False, font=dict(size=core.font_px(13), color=PROS_COLOR),
    )
    fig.add_annotation(
        x=sum(mono_ginis) / len(mono_ginis), y=-0.62,
        text=f"<b>Monopolist</b> · {len(mono_ginis)} games",
        showarrow=False, font=dict(size=core.font_px(13), color=MONO_COLOR),
    )

    core.apply_layout(
        fig, height=300,
        xaxis=dict(
            title="Final Gini coefficient (0 = perfect equality)",
            range=[-0.005, max(mono_ginis) * 1.12],
        ),
        yaxis=dict(visible=False, range=[-1, 1]),
        margin=dict(t=10, b=40, l=20, r=20),
    )
    return fig


def _gini_over_rounds(p1_mono, p1_pros) -> go.Figure | None:
    rows = []
    for game in p1_mono:
        rows += [{**r, "mode": "Monopolist"} for r in core.compute_gini_timeseries(game)]
    for game in p1_pros:
        rows += [{**r, "mode": "Prosperity"} for r in core.compute_gini_timeseries(game)]
    if not rows:
        return None

    df = pd.DataFrame(rows)
    df_mean = df.groupby(["mode", "round"])["gini"].agg(["mean", "min", "max"]).reset_index()

    fig = go.Figure()
    for mode, color in [("Monopolist", MONO_COLOR), ("Prosperity", PROS_COLOR)]:
        subset = df_mean[df_mean["mode"] == mode]
        r, g, b = int(color[1:3], 16), int(color[3:5], 16), int(color[5:7], 16)
        fig.add_trace(go.Scatter(
            x=pd.concat([subset["round"], subset["round"][::-1]]),
            y=pd.concat([subset["max"], subset["min"][::-1]]),
            fill="toself", fillcolor=f"rgba({r},{g},{b},0.1)",
            line=dict(color="rgba(0,0,0,0)"), showlegend=False, hoverinfo="skip",
        ))
        fig.add_trace(go.Scatter(
            x=subset["round"], y=subset["mean"], mode="lines+markers",
            line=dict(color=color, width=core.line_w()), marker=dict(size=3),
            showlegend=False,
            hovertemplate=f"<b>{mode}</b><br>Round %{{x}}<br>Mean Gini: %{{y:.4f}}<extra></extra>",
        ))
        # Direct label at line end — no legend
        last = subset.iloc[-1]
        fig.add_annotation(
            x=last["round"], y=last["mean"], text=f"<b>{mode}</b>",
            showarrow=False, xanchor="left", xshift=8,
            font=dict(size=core.font_px(13), color=color),
        )

    pros_rounds = [g["result"]["rounds"] for g in p1_pros if g.get("result")]
    if pros_rounds:
        avg_end = sum(pros_rounds) / len(pros_rounds)
        fig.add_vline(x=avg_end, line_dash="dash", line_color="#999", line_width=1)
        fig.add_annotation(
            x=avg_end, y=0.28, text="Prosperity games<br>typically end here",
            showarrow=False, font=dict(size=core.font_px(10), color="#888"),
            xanchor="left", xshift=6,
        )

    core.apply_layout(
        fig, height=420, hovermode="x unified",
        xaxis_title="Round",
        yaxis_title="Gini coefficient (inequality)",
        xaxis=dict(range=[0, df_mean["round"].max() * 1.12]),
    )
    return fig


def render():
    data = core.load_all()
    p1_mono, p1_pros = data["p1_mono"], data["p1_pros"]

    core.act_chip("The results · part I")
    st.title("Same Board. Two Rules. Opposite Worlds.")
    core.question_panel(
        "30 games, 15 under each rule set, the same five players in the same "
        "turn order. Does economic structure alone determine wealth "
        "distribution?"
    )

    mono_ginis = core.final_ginis(p1_mono)
    pros_ginis = core.final_ginis(p1_pros)

    if mono_ginis and pros_ginis:
        st.markdown(
            "To compare whole games instead of single players, we score each "
            "game's ending with one number — the **Gini coefficient**: "
            "**0** means everyone finished with equal wealth, **1** means one "
            "player finished with everything. Each dot below is one game's score."
        )
        st.markdown(
            "## Every Monopolist economy ended more unequal "
            "than every Prosperity economy"
        )
        st.plotly_chart(_hero_chart(mono_ginis, pros_ginis),
                        use_container_width=True)
        core.finding_text(
            "Each dot is one complete game's final inequality. "
            "<strong>No overlap:</strong> the most equal Monopolist game "
            f"(Gini {min(mono_ginis):.3f}) is more unequal than the most unequal "
            f"Prosperity game (Gini {max(pros_ginis):.3f})."
        )
        core.caption(core.SAMPLE_DISCLAIMER)

        mean_m, mean_p = core.mean(mono_ginis), core.mean(pros_ginis)
        c1, c2, c3 = st.columns(3)
        c1.metric("Monopolist mean Gini", f"{mean_m:.3f}")
        c2.metric("Prosperity mean Gini", f"{mean_p:.3f}")
        c3.metric("Inequality ratio", f"{mean_m / max(mean_p, 0.001):.1f}×")
        core.caption("Gini: 0 = perfect equality, 1 = one player holds everything.")

    st.markdown("## The two worlds separate immediately — "
                "and the averages never cross")
    fig = _gini_over_rounds(p1_mono, p1_pros)
    if fig:
        st.plotly_chart(fig, use_container_width=True)
        core.finding_text(
            "The gap isn't gradual — it opens in Round 1 and widens. "
            "Shaded bands show the full range across 15 games per rule set; "
            "individual games' ranges brush against each other, the "
            "averages never do."
        )
        core.caption(core.SAMPLE_DISCLAIMER)
        core.verify_expander(p1_mono + p1_pros)

    # Rich-poor span inside each individual game
    span_rows = []
    for g in data["phase1"]:
        if g.get("result"):
            nw = g["result"]["netWorths"]
            span_rows.append({
                "game": f"Game {g['gameId']}", "mode": g["mode"],
                "lo": min(nw), "hi": max(nw), "span": max(nw) - min(nw),
            })
    if span_rows:
        span_rows.sort(key=lambda r: r["span"])
        m_spans = [r["span"] for r in span_rows if r["mode"] == "Monopolist"]
        p_spans = [r["span"] for r in span_rows if r["mode"] == "Prosperity"]

        # Escaped dollars: a $...$ pair in markdown renders as LaTeX math.
        st.markdown(
            f"## Inside every single game, the same gap: the narrowest "
            f"Monopolist rich-poor spread (\\${min(m_spans):,.0f}) is "
            f"{min(m_spans) / max(p_spans):.1f}× the widest Prosperity one "
            f"(\\${max(p_spans):,.0f})"
        )
        fig = go.Figure()
        for i, r in enumerate(span_rows):
            color = core.MODE_COLORS[r["mode"]]
            fig.add_trace(go.Scatter(
                x=[r["lo"], r["hi"]], y=[i, i], mode="lines+markers",
                line=dict(color=color, width=core.line_w(3)),
                marker=dict(size=5, color=color), showlegend=False,
                hovertemplate=(
                    f"<b>{r['game']} ({r['mode']})</b><br>"
                    f"poorest ${r['lo']:,.0f} — richest ${r['hi']:,.0f}"
                    f"<br>gap ${r['span']:,.0f}<extra></extra>"
                ),
            ))
        # Direct labels on the extremes of each cluster
        top = span_rows[-1]
        bottom = span_rows[0]
        fig.add_annotation(
            x=top["hi"], y=len(span_rows) - 1, text="<b>Monopolist</b>",
            showarrow=False, xanchor="left", xshift=8,
            font=dict(size=core.font_px(12), color=core.MONO_COLOR),
        )
        fig.add_annotation(
            x=bottom["hi"], y=0, text="<b>Prosperity</b>",
            showarrow=False, xanchor="left", xshift=8,
            font=dict(size=core.font_px(12), color=core.PROS_COLOR),
        )
        core.apply_layout(
            fig, height=480,
            xaxis=dict(title="Poorest to richest player, per game ($)",
                       rangemode="tozero"),
            yaxis=dict(visible=False),
        )
        st.plotly_chart(fig, use_container_width=True)
        core.finding_text(
            "Each line is one game, from its poorest player's final net worth "
            "to its richest, all 30 games sorted by gap size. The two rule "
            "sets form two separate blocks — no Prosperity game ever opened "
            "a gap as wide as any Monopolist game."
        )
        core.caption(core.SAMPLE_DISCLAIMER)

    # Per-pair divergence — grey bars, the length is the message
    st.markdown("## All 15 pairs, one direction, zero exceptions")
    st.markdown(
        "Twin games: one board under each rule set, same players, "
        "same turn order."
    )
    mono_map = {g["gameId"]: g["result"]["giniCoefficient"]
                for g in p1_mono if g.get("result")}
    pros_map = {g["gameId"]: g["result"]["giniCoefficient"]
                for g in p1_pros if g.get("result")}
    pairs = []
    for m_id in sorted(mono_map):
        if m_id + 1 in pros_map:
            pairs.append({
                "Pair": f"Pair {(m_id + 1) // 2}",
                "Divergence": mono_map[m_id] - pros_map[m_id + 1],
                "Monopolist Gini": round(mono_map[m_id], 3),
                "Prosperity Gini": round(pros_map[m_id + 1], 3),
            })
    if pairs:
        df_pairs = pd.DataFrame(pairs)
        fig = px.bar(
            df_pairs, y="Pair", x="Divergence", orientation="h",
            hover_data=["Monopolist Gini", "Prosperity Gini"],
        )
        fig.update_traces(marker_color=GREY)
        widest = df_pairs.loc[df_pairs["Divergence"].idxmax()]
        fig.add_annotation(
            x=widest["Divergence"], y=widest["Pair"],
            text=f"widest gap: {widest['Divergence']:.3f}",
            showarrow=False, xanchor="left", xshift=8,
            font=dict(size=core.font_px(11), color="#555"),
        )
        core.apply_layout(
            fig, height=480,
            xaxis_title="Gini divergence (Monopolist − Prosperity)", yaxis_title="",
        )
        st.plotly_chart(fig, use_container_width=True)
        core.finding_text(
            f"All <strong>{len(pairs)} pairs</strong> diverge in the same direction "
            f"(range {min(p['Divergence'] for p in pairs):.3f} to "
            f"{max(p['Divergence'] for p in pairs):.3f}). "
            "<strong>Zero exceptions.</strong>"
        )
        core.caption(core.SAMPLE_DISCLAIMER)

    core.next_page("The Vote — when the players can change the rules", "vote")
