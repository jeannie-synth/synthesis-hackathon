"""Page 0 — the on-ramp. No jargon, no metrics a stranger doesn't know."""

import plotly.express as px
import streamlit as st

import core


def render():
    data = core.load_all()

    st.title("The Landlord's Game")
    core.question_panel(
        "Can the rules of an economy — not the players — decide "
        "who ends up rich and who ends up poor?"
    )

    st.markdown(
        "In **1903**, a game designer named Elizabeth Magie built a board game "
        "with a trick in it: the same board could be played under **two "
        "different rule sets**. Under one, rent makes property owners richer "
        "until a single winner holds everything. Under the other, rent flows "
        "into a shared pot that pays everyone a dividend. "
        "She designed it to make an argument about land economics, and the "
        "game later became — stripped of its second rule set — the Monopoly "
        "you grew up with."
    )
    st.markdown(
        "A century later, we rebuilt her experiment with **five AI agents "
        "playing on a public blockchain**, where every move is a recorded "
        "transaction that nobody — including us — can quietly edit. "
        "The agents don't know they're in an experiment. They just play "
        "to win, under whichever rules the board gives them."
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
        # Annotate the extremes — the whole story in two dots
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
            "150 player-endings across 30 games. The same five agents, "
            "playing just as hard, under two rule sets."
        )
        core.caption(core.SAMPLE_DISCLAIMER)

    st.markdown(
        "Nothing about the players changes between the two columns. "
        "Not their strategies, not their starting money, not their luck — "
        "the dice are the same. **The only thing that changes is what "
        "happens to rent after it's paid.** The rest of this site walks "
        "through how that one difference builds two different worlds."
    )

    core.next_page("The evidence — every game, one picture", "landing")
