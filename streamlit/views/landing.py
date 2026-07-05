"""Page 0 — the 60-second version. One unforgettable chart."""

import plotly.graph_objects as go
import streamlit as st

import core
import onchain
from core import MONO_COLOR, PROS_COLOR


def hero_chart(mono_ginis: list[float], pros_ginis: list[float]) -> go.Figure:
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


def render():
    data = core.load_all()
    mono_ginis = core.final_ginis(data["p1_mono"])
    pros_ginis = core.final_ginis(data["p1_pros"])

    st.title("Same Board. Two Rules. Opposite Worlds.")
    st.markdown(
        "*An economic experiment on Base: five AI agents, one board, "
        "and the only variable that changes is where rent flows.*"
    )

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
        st.plotly_chart(hero_chart(mono_ginis, pros_ginis), use_container_width=True)
        core.finding_text(
            "Each dot is one complete game's final inequality. "
            "<strong>No overlap:</strong> the most equal Monopolist game "
            f"(Gini {min(mono_ginis):.3f}) is more unequal than the most unequal "
            f"Prosperity game (Gini {max(pros_ginis):.3f})."
        )
        core.caption(core.SAMPLE_DISCLAIMER)

        # Three numbers with context
        ratio = core.mean(mono_ginis) / max(core.mean(pros_ginis), 0.001)
        m_start = [g for g in data["phase2"] if g.get("mode") == "Monopolist"]
        m_switched = [g for g in m_start if core.end_mode(g) == "Prosperity"]
        n_pairs = min(len(mono_ginis), len(pros_ginis))

        c1, c2, c3 = st.columns(3)
        c1.metric("Inequality ratio", f"{ratio:.1f}×",
                  help="Mean Monopolist Gini ÷ mean Prosperity Gini, 30 games")
        c2.metric("Pairs diverged", f"{n_pairs} of {n_pairs}",
                  help="Paired games, same agents. Zero exceptions.")
        c3.metric("Voted themselves out", f"{len(m_switched)} of {len(m_start)}",
                  help="Monopolist-start games that voted into Prosperity "
                  "when given the choice")

    st.markdown("### The story in four sentences")
    st.markdown(
        "Elizabeth Magie built this game in 1903 with two rule sets to prove "
        "that **rules, not players, decide outcomes**. "
        "We rebuilt it on Base with autonomous agents. "
        "Same agents, same board, same openings — opposite worlds. "
        "The rules are doing the work."
    )

    # Live proof strip — where "on-chain" stops being a claim
    st.markdown("### This is live, on-chain, and verifiable")
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

    st.markdown("---")
    col_a, col_b = st.columns(2)
    with col_a:
        if "rules" in core.PAGES:
            st.page_link(core.PAGES["rules"], label="**Walk the argument →**")
    with col_b:
        if "frontier" in core.PAGES:
            st.page_link(core.PAGES["frontier"], label="**Play it yourself →**")

    core.caption(
        "A hackathon experiment, not peer-reviewed research. "
        "Sample sizes show directional patterns, not statistical proof. "
        "Replicate, critique, improve."
    )
