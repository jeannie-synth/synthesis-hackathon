"""Page 5 — the substrate. Live contract state and per-game drill-down."""

import pandas as pd
import plotly.graph_objects as go
import streamlit as st

import core
import onchain
from core import MODE_COLORS, SEPOLIA_TX


def _explorer(games: list[dict], tournament_label: str):
    options = {f"Game {g['gameId']} — {g['mode']}": g for g in games}
    if not options:
        st.info("No games in this tournament directory.")
        return
    choice = st.selectbox("Game", list(options), key=f"game-{tournament_label}")
    game = options[choice]

    result = game.get("result", {})
    strat_map = core.addr_to_strategy(game)

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Rounds", result.get("rounds", "—"))
    c2.metric("Final Gini", f"{result.get('giniCoefficient', 0):.3f}")
    c3.metric("Ended under", core.end_mode(game))
    winner = result.get("winner")
    c4.metric("Winner", strat_map.get(winner, "—") if winner else "—")

    # Round-by-round net worth per player
    rows = []
    for snap in game.get("roundSnapshots", []):
        for p in snap["players"]:
            rows.append({
                "Round": snap["round"],
                "Net Worth ($)": p["netWorth"],
                "Player": strat_map.get(p["address"], p["address"][:8]),
            })
    if rows:
        df = pd.DataFrame(rows)
        fig = go.Figure()
        for player, sub in df.groupby("Player"):
            color = core.STRATEGY_COLORS.get(str(player), core.GREY)
            fig.add_trace(go.Scatter(
                x=sub["Round"], y=sub["Net Worth ($)"], mode="lines",
                line=dict(color=color, width=core.line_w(2)), showlegend=False,
                hovertemplate=f"<b>{player}</b><br>Round %{{x}}<br>"
                "$%{y:,.0f}<extra></extra>",
            ))
            last = sub.iloc[-1]
            fig.add_annotation(
                x=last["Round"], y=last["Net Worth ($)"], text=str(player),
                showarrow=False, xanchor="left", xshift=6,
                font=dict(size=core.font_px(11), color=color),
            )
        core.apply_layout(
            fig, height=380, xaxis_title="Round", yaxis_title="Net worth ($)",
            xaxis=dict(range=[0, df["Round"].max() * 1.18]),
        )
        st.markdown("#### Net worth, round by round")
        st.plotly_chart(fig, use_container_width=True)

    # Turn log with transaction links
    st.markdown("#### Turn log — every move is a transaction")
    turns = game.get("turns", [])
    if turns:
        df_t = pd.DataFrame([{
            "Turn": t["turnNumber"], "Player": t["agent"], "Action": t["action"],
            "Tx": f"{SEPOLIA_TX}{t['txHash']}" if t.get("txHash") else None,
        } for t in turns])
        players = st.multiselect("Filter by player", sorted(df_t["Player"].unique()),
                                 key=f"players-{tournament_label}")
        actions = st.multiselect("Filter by action", sorted(df_t["Action"].unique()),
                                 key=f"actions-{tournament_label}")
        if players:
            df_t = df_t[df_t["Player"].isin(players)]
        if actions:
            df_t = df_t[df_t["Action"].isin(actions)]
        st.dataframe(
            df_t, use_container_width=True, hide_index=True, height=350,
            column_config={
                "Tx": st.column_config.LinkColumn(
                    "Transaction", display_text="View on Basescan"),
            },
        )


def render():
    core.act_chip("Appendix · verification")
    st.title("The Ledger — Nothing Here Is Taken on Faith")
    core.question_panel(
        "Every chart on this dashboard summarizes transactions that anyone can "
        "re-derive from the chain. This page is the raw layer: live contract "
        "state, and every game turn by turn."
    )

    st.markdown("## Live contract state")
    counts = onchain.live_game_counts()
    cols = st.columns(len(onchain.NETWORKS))
    for col, (name, net) in zip(cols, onchain.NETWORKS.items()):
        with col:
            count = counts.get(name)
            if count is not None:
                st.metric(f"{name} — games created", f"{count:,}",
                          help="eth_call nextGameId(), cached 5 minutes")
            else:
                st.metric(f"{name} — games created", "—",
                          help=f"RPC unreachable. Last verified: "
                          f"{net['fallback_note']}")
            st.markdown(f"`{net['contract']}`")
            st.markdown(f"[View on Basescan]({net['explorer']})")
    core.caption(
        "Counts are read live via eth_call against nextGameId() and include "
        "games beyond the tournaments charted here — the contracts are open; "
        "anyone can create a game."
    )

    st.markdown("## Game explorer")
    tournament = st.radio(
        "Tournament", ["Phase 1 — fixed rules (30 games)",
                       "Phase 2 — voting enabled (13 games)"],
        horizontal=True,
    )
    data = core.load_all()
    if tournament.startswith("Phase 1"):
        _explorer(data["phase1"], "p1")
    else:
        _explorer(data["phase2"], "p2")

    core.caption(
        "Structured game logs from Base Sepolia. The mainnet Inaugural "
        "Tournament (18 games, LLM agents) produced qualitative "
        "transcripts rather than structured JSON — its quantitative shadow "
        "is the live contract state above."
    )
