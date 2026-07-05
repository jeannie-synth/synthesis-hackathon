"""Page 3 — Phase 2 evidence. Political agency, and where it points."""

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

import core
from core import MONO_COLOR, PROS_COLOR


def _slope_chart(p1_m, p1_p, p2_m, p2_p) -> go.Figure:
    fig = go.Figure()
    for name, color, vals, pos in [
        ("Monopolist", MONO_COLOR, (p1_m, p2_m), "top center"),
        ("Prosperity", PROS_COLOR, (p1_p, p2_p), "bottom center"),
    ]:
        fig.add_trace(go.Scatter(
            x=["Phase 1<br>(no voting)", "Phase 2<br>(voting)"],
            y=list(vals), mode="lines+markers+text", showlegend=False,
            line=dict(color=color, width=core.line_w(4)),
            marker=dict(size=14), textposition=pos,
            text=[f"{vals[0]:.3f}", f"{vals[1]:.3f}"],
            textfont=dict(size=core.font_px(12), color=color),
            hovertemplate=f"<b>{name}</b>: %{{y:.3f}}<extra></extra>",
        ))
        # Direct label at the right end of each line
        fig.add_annotation(
            x=1, y=vals[1], text=f"<b>{name}-start</b>", showarrow=False,
            xanchor="left", xshift=45,
            font=dict(size=core.font_px(12), color=color),
        )
    for i, (m, p) in enumerate([(p1_m, p1_p), (p2_m, p2_p)]):
        fig.add_annotation(x=i, y=(m + p) / 2, text=f"Gap: {m - p:.3f}",
                           showarrow=False,
                           font=dict(size=core.font_px(11), color="#666"))
    core.apply_layout(
        fig, height=420, yaxis_title="Mean Gini coefficient",
        xaxis=dict(tickfont=dict(size=core.font_px(13))),
        margin=dict(t=30, r=120),
    )
    return fig


def _mode_flow_sankey(phase2_games: list[dict]) -> go.Figure:
    flows: dict[tuple[str, str], int] = {}
    for g in phase2_games:
        key = (g.get("mode", "Unknown"), core.end_mode(g))
        flows[key] = flows.get(key, 0) + 1

    labels = ["Started Monopolist", "Started Prosperity",
              "Ended Monopolist", "Ended Prosperity"]
    node_colors = [MONO_COLOR, PROS_COLOR, MONO_COLOR, PROS_COLOR]
    idx = {"Monopolist": 0, "Prosperity": 1}
    src, tgt, val, link_colors = [], [], [], []
    for (start, end), n in sorted(flows.items()):
        src.append(idx.get(start, 0))
        tgt.append(idx.get(end, 0) + 2)
        val.append(n)
        end_c = MONO_COLOR if end == "Monopolist" else PROS_COLOR
        r, g_, b = int(end_c[1:3], 16), int(end_c[3:5], 16), int(end_c[5:7], 16)
        link_colors.append(f"rgba({r},{g_},{b},0.35)")

    fig = go.Figure(go.Sankey(
        node=dict(label=labels, color=node_colors, pad=30, thickness=16,
                  line=dict(width=0)),
        link=dict(source=src, target=tgt, value=val, color=link_colors,
                  hovertemplate="%{value} game(s)<extra></extra>"),
    ))
    core.apply_layout(fig, height=360, margin=dict(t=20, b=20, l=10, r=10))
    return fig


def render():
    data = core.load_all()
    phase2 = data["phase2"]

    st.title("Given Political Agency, Economies Choose Prosperity")
    core.question_panel(
        "Phase 1 showed that rules determine outcomes. But what if agents can "
        "change the rules? We gave them a voting mechanism and ran 13 more games."
    )

    c1, c2, c3 = st.columns(3)
    c1.metric("Votes cast", f"{core.count_actions(phase2, 'vote'):,}")
    c2.metric("Proposals", f"{core.count_actions(phase2, 'proposeModeSwitch'):,}")
    c3.metric("Rule switches", f"{core.count_actions(phase2, 'proposalPassed'):,}")

    p1_m_ginis = core.final_ginis(data["p1_mono"])
    p1_p_ginis = core.final_ginis(data["p1_pros"])
    p2_m_ginis = core.final_ginis(data["p2_mono"])
    p2_p_ginis = core.final_ginis(data["p2_pros"])

    if all([p1_m_ginis, p1_p_ginis, p2_m_ginis, p2_p_ginis]):
        p1_m, p1_p = core.mean(p1_m_ginis), core.mean(p1_p_ginis)
        p2_m, p2_p = core.mean(p2_m_ginis), core.mean(p2_p_ginis)
        reduction = ((p1_m - p1_p) - (p2_m - p2_p)) / (p1_m - p1_p) * 100

        st.markdown(f"## The inequality gap collapses {reduction:.0f}% "
                    "when agents can vote")
        st.plotly_chart(_slope_chart(p1_m, p1_p, p2_m, p2_p),
                        use_container_width=True)
        core.finding_text(
            f"Monopolist-start Gini falls {abs((p2_m - p1_m) / p1_m * 100):.0f}%; "
            f"Prosperity-start rises {abs((p2_p - p1_p) / p1_p * 100):.0f}%. "
            "The two worlds converge once the rules themselves are on the ballot."
        )
        core.caption(core.PHASE2_DISCLAIMER)
        core.verify_expander(phase2)

    # Mode flow
    m_start = [g for g in phase2 if g.get("mode") == "Monopolist"]
    m_switched = [g for g in m_start if core.end_mode(g) == "Prosperity"]
    p_start = [g for g in phase2 if g.get("mode") == "Prosperity"]
    p_switched = [g for g in p_start if core.end_mode(g) == "Monopolist"]

    st.markdown(f"## {len(m_switched)} of {len(m_start)} extractive economies "
                "voted their way out — almost none went back")
    st.plotly_chart(_mode_flow_sankey(phase2), use_container_width=True)
    core.finding_text(
        f"{len(m_switched)} of {len(m_start)} Monopolist-start games ended under "
        f"Prosperity rules; {len(p_switched)} of {len(p_start)} went the other "
        "way. Nobody told the agents to prefer Prosperity — self-interest, "
        "under this structure, pointed there on its own."
    )
    core.caption(core.PHASE2_DISCLAIMER)

    with st.expander("Detail: where each of the 13 games landed"):
        rows = []
        for g in phase2:
            if g.get("result"):
                em = core.end_mode(g)
                rows.append({
                    "Game": f"Game {g['gameId']}", "Started as": g["mode"],
                    "Ended as": em,
                    "Switched": "Yes" if g["mode"] != em else "No",
                    "Gini": g["result"]["giniCoefficient"],
                    "Rounds": g["result"]["rounds"],
                })
        if rows:
            df = pd.DataFrame(rows)
            fig = px.scatter(
                df, x="Rounds", y="Gini", color="Started as", symbol="Ended as",
                color_discrete_map=core.MODE_COLORS,
                hover_data=["Game", "Switched"],
            )
            fig.update_traces(marker=dict(size=14, line=dict(width=1.5, color="#333")))
            core.apply_layout(fig, height=400, xaxis_title="Rounds played",
                              yaxis_title="Final Gini coefficient")
            st.plotly_chart(fig, use_container_width=True)

    core.next_page("The Frontier — what nobody has explored yet", "frontier")
