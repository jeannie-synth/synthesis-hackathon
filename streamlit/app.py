"""
The Landlord's Game — Analytical Dashboard
Reads JSON game logs from data/games/tournament-*/ directories.
"""

import json
import os
from pathlib import Path

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

# ─── Config ───

DATA_ROOT = Path("/data/games")
STRATEGY_COLORS = {
    "Extractive": "#e74c3c",
    "Generative": "#2ecc71",
    "Conditional": "#3498db",
    "FreeRider": "#f39c12",
    "Pavlov": "#9b59b6",
}

# ─── Metric explanations ───

METRIC_EXPLANATIONS = {
    "gini": (
        "Gini Coefficient",
        "Measures wealth inequality on a scale from 0 (perfect equality — everyone has the same) "
        "to 1 (perfect inequality — one player has everything). Developed by statistician Corrado Gini in 1912. "
        "In our experiment, comparing Gini between Monopolist and Prosperity rule sets shows whether "
        "the economic structure itself drives inequality, independent of agent behavior."
    ),
    "herfindahl": (
        "Herfindahl-Hirschman Index (HHI)",
        "Measures property concentration — how evenly properties are distributed among players. "
        "Ranges from 1/N (perfectly spread) to 1.0 (one player owns everything). "
        "Used in antitrust economics to measure market concentration. "
        "High HHI under Monopolist rules suggests the rent mechanic creates property monopolies; "
        "lower HHI under Prosperity suggests shared treasury redistributes purchasing power."
    ),
    "twin_divergence": (
        "Twin Divergence",
        "The difference in net worth for the *same* agent strategy playing under different rule sets. "
        "Because twin pairs use identical code and the same shuffled player order, any divergence "
        "is attributable to the rules alone — not to agent design or starting position. "
        "This is the core of the controlled experiment."
    ),
    "treasury": (
        "Public Treasury",
        "Under Prosperity rules, rent on unowned properties flows to a shared treasury instead of "
        "disappearing. When the treasury accumulates enough, it distributes equal dividends to all players. "
        "This mechanic — inspired by Elizabeth Magie's original 1903 Prosperity rules and Georgist economics — "
        "is the structural mechanism that drives wealth redistribution without requiring agent cooperation."
    ),
    "dominance_flip": (
        "Dominance Flip",
        "When a strategy that ranks high under one rule set drops in rank under the other. "
        "For example, if Extractive (Always Defect) ranks #1 under Monopolist rules but #5 under Prosperity, "
        "that flip proves the thesis: the same greedy behavior produces different outcomes depending on "
        "how rent flows. The agent didn't change — the system did."
    ),
    "rounds": (
        "Rounds to Completion",
        "How many rounds (full cycles through all 5 players) before a winner is declared. "
        "Monopolist games end when any player's net worth crosses a threshold (individual accumulation). "
        "Prosperity games end when the *poorest* player crosses a threshold (collective floor). "
        "Comparing game length reveals whether cooperative or extractive structures resolve faster."
    ),
}


def strategy_from_agent(agent_name: str) -> str:
    """Extract strategy from agent name like 'Extractive-0'."""
    return agent_name.rsplit("-", 1)[0]


# ─── Data loading ───


@st.cache_data
def list_tournaments() -> list[str]:
    if not DATA_ROOT.exists():
        return []
    dirs = sorted(
        [d.name for d in DATA_ROOT.iterdir() if d.is_dir()],
        reverse=True,
    )
    return dirs


@st.cache_data
def load_tournament(tournament_dir: str) -> list[dict]:
    path = DATA_ROOT / tournament_dir
    games = []
    for f in sorted(path.glob("game-*.json")):
        with open(f) as fp:
            games.append(json.load(fp))
    return games


def games_by_mode(games: list[dict]) -> tuple[list[dict], list[dict]]:
    mono = [g for g in games if g.get("mode") == "Monopolist"]
    pros = [g for g in games if g.get("mode") == "Prosperity"]
    return mono, pros


# ─── Metric computation from roundSnapshots ───


def gini(values: list[float]) -> float:
    if not values or sum(values) == 0:
        return 0.0
    sorted_v = sorted(values)
    n = len(sorted_v)
    cumsum = sum((i + 1) * v for i, v in enumerate(sorted_v))
    return (2 * cumsum) / (n * sum(sorted_v)) - (n + 1) / n


def compute_gini_timeseries(game: dict) -> list[dict]:
    """Compute Gini per round from roundSnapshots."""
    rows = []
    for snap in game.get("roundSnapshots", []):
        net_worths = [p["netWorth"] for p in snap["players"]]
        rows.append({"round": snap["round"], "gini": gini(net_worths)})
    return rows


def compute_treasury_timeseries(game: dict) -> list[dict]:
    rows = []
    for snap in game.get("roundSnapshots", []):
        rows.append({"round": snap["round"], "treasury": snap["treasury"]})
    return rows


def compute_wealth_timeseries(game: dict) -> pd.DataFrame:
    """Per-player net worth over rounds."""
    rows = []
    for snap in game.get("roundSnapshots", []):
        for i, p in enumerate(snap["players"]):
            rows.append({
                "round": snap["round"],
                "player": f"Player {i}",
                "address": p["address"][:10],
                "netWorth": p["netWorth"],
                "cash": p["cash"],
            })
    return pd.DataFrame(rows)


# ─── Turn log analysis ───


def extract_event_counts(games: list[dict]) -> pd.DataFrame:
    """Count actions per strategy across games."""
    counts: dict[str, dict[str, int]] = {}
    for game in games:
        for turn in game.get("turns", []):
            strat = strategy_from_agent(turn["agent"])
            action = turn["action"]
            if strat not in counts:
                counts[strat] = {}
            counts[strat][action] = counts[strat].get(action, 0) + 1
    rows = []
    for strat, actions in counts.items():
        for action, count in actions.items():
            rows.append({"strategy": strat, "action": action, "count": count})
    return pd.DataFrame(rows) if rows else pd.DataFrame(columns=["strategy", "action", "count"])


# ─── Strategy performance ───


def strategy_performance(games: list[dict]) -> pd.DataFrame:
    """Mean net worth per strategy across games."""
    # Map addresses to strategy names from turn logs
    rows = []
    for game in games:
        result = game.get("result")
        if not result:
            continue
        # Build address→strategy map from turns
        addr_to_strat: dict[str, str] = {}
        for turn in game.get("turns", []):
            addr = None
            # Find address by agent index
            agent_name = turn["agent"]
            idx_str = agent_name.rsplit("-", 1)[-1]
            if idx_str.isdigit():
                idx = int(idx_str)
                if idx < len(game["playerAddresses"]):
                    addr = game["playerAddresses"][idx]
                    addr_to_strat[addr] = strategy_from_agent(agent_name)

        for i, nw in enumerate(result["netWorths"]):
            addr = game["playerAddresses"][i]
            strat = addr_to_strat.get(addr, f"Player-{i}")
            rows.append({
                "strategy": strat,
                "netWorth": nw,
                "mode": game["mode"],
                "gameId": game["gameId"],
            })
    return pd.DataFrame(rows) if rows else pd.DataFrame()


# ═══════════════════════════════════════════════════
#  PAGES
# ═══════════════════════════════════════════════════

st.set_page_config(page_title="The Landlord's Game", page_icon="🎲", layout="wide")

# ─── Sidebar ───

st.sidebar.title("The Landlord's Game")
st.sidebar.markdown("*Same agents, same board, two rule sets.*")

tournaments = list_tournaments()
if not tournaments:
    st.error("No tournament data found. Run a tournament first, then reload.")
    st.stop()

selected_tournament = st.sidebar.selectbox("Tournament", tournaments)
games = load_tournament(selected_tournament)
mono_games, pros_games = games_by_mode(games)

st.sidebar.markdown(f"**Games loaded:** {len(games)} ({len(mono_games)} M / {len(pros_games)} P)")

page = st.sidebar.radio(
    "Page",
    ["Thesis", "Strategy Performance", "Game Dynamics", "Single Game Explorer"],
)

# ═══════════════════════════════════════════════════
#  PAGE 1: THESIS
# ═══════════════════════════════════════════════════

if page == "Thesis":
    st.title("The Thesis")
    st.markdown(
        "> **Same agents, different rules, different outcomes.** "
        "Economic structure determines whether agents cooperate — not intention."
    )

    with st.expander("What is the Gini coefficient?"):
        st.markdown(METRIC_EXPLANATIONS["gini"][1])

    # Terminal Gini comparison
    mono_ginis = [g["result"]["giniCoefficient"] for g in mono_games if g.get("result")]
    pros_ginis = [g["result"]["giniCoefficient"] for g in pros_games if g.get("result")]

    if mono_ginis and pros_ginis:
        col1, col2, col3 = st.columns(3)
        col1.metric("Monopolist Gini (mean)", f"{sum(mono_ginis)/len(mono_ginis):.4f}")
        col2.metric("Prosperity Gini (mean)", f"{sum(pros_ginis)/len(pros_ginis):.4f}")
        ratio = (sum(mono_ginis)/len(mono_ginis)) / max(sum(pros_ginis)/len(pros_ginis), 0.001)
        col3.metric("Inequality Ratio", f"{ratio:.1f}x", delta=f"Monopolist {ratio:.1f}x more unequal")

    # Gini curves over rounds (mean across games)
    st.subheader("Gini Coefficient Over Rounds")

    gini_rows = []
    for game in mono_games:
        for row in compute_gini_timeseries(game):
            gini_rows.append({**row, "mode": "Monopolist", "gameId": game["gameId"]})
    for game in pros_games:
        for row in compute_gini_timeseries(game):
            gini_rows.append({**row, "mode": "Prosperity", "gameId": game["gameId"]})

    if gini_rows:
        df_gini = pd.DataFrame(gini_rows)
        # Mean Gini per round per mode
        df_mean = df_gini.groupby(["mode", "round"])["gini"].agg(["mean", "std"]).reset_index()
        fig = go.Figure()
        for mode, color in [("Monopolist", "#e74c3c"), ("Prosperity", "#2ecc71")]:
            subset = df_mean[df_mean["mode"] == mode]
            fig.add_trace(go.Scatter(
                x=subset["round"], y=subset["mean"], mode="lines",
                name=mode, line=dict(color=color, width=2),
            ))
            # Confidence band
            if "std" in subset.columns:
                fig.add_trace(go.Scatter(
                    x=pd.concat([subset["round"], subset["round"][::-1]]),
                    y=pd.concat([subset["mean"] + subset["std"], (subset["mean"] - subset["std"])[::-1]]),
                    fill="toself", fillcolor=color, opacity=0.15,
                    line=dict(color="rgba(0,0,0,0)"), showlegend=False,
                ))
        fig.update_layout(
            xaxis_title="Round", yaxis_title="Gini Coefficient",
            template="plotly_white", height=400,
        )
        st.plotly_chart(fig, use_container_width=True)

    # Terminal Gini distribution
    st.subheader("Terminal Gini Distribution")
    gini_dist_rows = []
    for g_val in mono_ginis:
        gini_dist_rows.append({"mode": "Monopolist", "gini": g_val})
    for g_val in pros_ginis:
        gini_dist_rows.append({"mode": "Prosperity", "gini": g_val})

    if gini_dist_rows:
        df_dist = pd.DataFrame(gini_dist_rows)
        fig = px.box(df_dist, x="mode", y="gini", color="mode",
                     color_discrete_map={"Monopolist": "#e74c3c", "Prosperity": "#2ecc71"},
                     template="plotly_white")
        fig.update_layout(height=350, showlegend=False)
        st.plotly_chart(fig, use_container_width=True)


# ═══════════════════════════════════════════════════
#  PAGE 2: STRATEGY PERFORMANCE
# ═══════════════════════════════════════════════════

elif page == "Strategy Performance":
    st.title("Strategy Performance")

    df_perf = strategy_performance(games)
    if df_perf.empty:
        st.warning("No result data available.")
        st.stop()

    # Net worth by strategy (grouped bars)
    st.subheader("Mean Net Worth by Strategy")
    df_agg = df_perf.groupby(["strategy", "mode"])["netWorth"].mean().reset_index()
    fig = px.bar(df_agg, x="strategy", y="netWorth", color="mode", barmode="group",
                 color_discrete_map={"Monopolist": "#e74c3c", "Prosperity": "#2ecc71"},
                 template="plotly_white")
    fig.update_layout(height=400)
    st.plotly_chart(fig, use_container_width=True)

    # Twin divergence (horizontal bars)
    st.subheader("Twin Divergence (Prosperity - Monopolist Net Worth)")
    with st.expander("What is twin divergence?"):
        st.markdown(METRIC_EXPLANATIONS["twin_divergence"][1])
    mono_means = df_perf[df_perf["mode"] == "Monopolist"].groupby("strategy")["netWorth"].mean()
    pros_means = df_perf[df_perf["mode"] == "Prosperity"].groupby("strategy")["netWorth"].mean()
    all_strats = sorted(set(mono_means.index) | set(pros_means.index))
    divergence = []
    for s in all_strats:
        m = mono_means.get(s, 0)
        p = pros_means.get(s, 0)
        divergence.append({"strategy": s, "divergence": p - m})
    df_div = pd.DataFrame(divergence).sort_values("divergence")
    fig = px.bar(df_div, y="strategy", x="divergence", orientation="h",
                 color="divergence", color_continuous_scale=["#e74c3c", "#f0f0f0", "#2ecc71"],
                 color_continuous_midpoint=0, template="plotly_white")
    fig.update_layout(height=350, coloraxis_showscale=False)
    st.plotly_chart(fig, use_container_width=True)

    # Rankings table
    st.subheader("Strategy Rankings")
    rank_data = []
    for mode_name, group in df_perf.groupby("mode"):
        means = group.groupby("strategy")["netWorth"].mean().sort_values(ascending=False)
        for rank, (strat, nw) in enumerate(means.items(), 1):
            rank_data.append({"Mode": mode_name, "Rank": rank, "Strategy": strat, "Mean NW": f"${nw:.0f}"})
    st.dataframe(pd.DataFrame(rank_data), use_container_width=True, hide_index=True)


# ═══════════════════════════════════════════════════
#  PAGE 3: GAME DYNAMICS
# ═══════════════════════════════════════════════════

elif page == "Game Dynamics":
    st.title("Game Dynamics")

    # Event counts
    st.subheader("Action Counts by Strategy")
    col1, col2 = st.columns(2)
    for col, mode_games, mode_name in [(col1, mono_games, "Monopolist"), (col2, pros_games, "Prosperity")]:
        with col:
            st.markdown(f"**{mode_name}**")
            df_events = extract_event_counts(mode_games)
            if not df_events.empty:
                key_actions = ["buy", "build", "jailWait", "jailBuyout", "proposeModeSwitch"]
                df_key = df_events[df_events["action"].isin(key_actions)]
                if not df_key.empty:
                    fig = px.bar(df_key, x="strategy", y="count", color="action", barmode="group",
                                 template="plotly_white", height=350)
                    st.plotly_chart(fig, use_container_width=True)

    # Treasury curve (Prosperity only)
    st.subheader("Treasury Over Rounds (Prosperity)")
    with st.expander("What is the Public Treasury?"):
        st.markdown(METRIC_EXPLANATIONS["treasury"][1])
    treasury_rows = []
    for game in pros_games:
        for row in compute_treasury_timeseries(game):
            treasury_rows.append({**row, "gameId": game["gameId"]})
    if treasury_rows:
        df_treas = pd.DataFrame(treasury_rows)
        df_treas_mean = df_treas.groupby("round")["treasury"].mean().reset_index()
        fig = px.area(df_treas_mean, x="round", y="treasury", template="plotly_white",
                      color_discrete_sequence=["#2ecc71"])
        fig.update_layout(height=350)
        st.plotly_chart(fig, use_container_width=True)

    # Rounds to completion
    st.subheader("Rounds to Completion")
    with st.expander("What does rounds to completion measure?"):
        st.markdown(METRIC_EXPLANATIONS["rounds"][1])
    rounds_rows = []
    for g in games:
        if g.get("result"):
            rounds_rows.append({"mode": g["mode"], "rounds": g["result"]["rounds"]})
    if rounds_rows:
        df_rounds = pd.DataFrame(rounds_rows)
        fig = px.box(df_rounds, x="mode", y="rounds", color="mode",
                     color_discrete_map={"Monopolist": "#e74c3c", "Prosperity": "#2ecc71"},
                     template="plotly_white")
        fig.update_layout(height=350, showlegend=False)
        st.plotly_chart(fig, use_container_width=True)


# ═══════════════════════════════════════════════════
#  PAGE 4: SINGLE GAME EXPLORER
# ═══════════════════════════════════════════════════

elif page == "Single Game Explorer":
    st.title("Single Game Explorer")

    game_options = {f"Game {g['gameId']} ({g['mode']})": g for g in games}
    selected_label = st.selectbox("Select Game", list(game_options.keys()))
    game = game_options[selected_label]

    result = game.get("result", {})
    if result:
        cols = st.columns(4)
        cols[0].metric("Mode", game["mode"])
        cols[1].metric("Rounds", result.get("rounds", "?"))
        cols[2].metric("Gini", f"{result.get('giniCoefficient', 0):.4f}")
        cols[3].metric("Treasury", f"${result.get('treasuryFinal', 0)}")

    # Wealth over time
    st.subheader("Net Worth Over Rounds")
    df_wealth = compute_wealth_timeseries(game)
    if not df_wealth.empty:
        fig = px.line(df_wealth, x="round", y="netWorth", color="player",
                      template="plotly_white", height=400)
        st.plotly_chart(fig, use_container_width=True)

    # Final standings
    st.subheader("Final Net Worths")
    if result and "netWorths" in result:
        final_data = []
        for i, nw in enumerate(result["netWorths"]):
            addr = game["playerAddresses"][i][:10] if i < len(game["playerAddresses"]) else f"P{i}"
            final_data.append({"Player": f"Player {i} ({addr})", "Net Worth": nw})
        df_final = pd.DataFrame(final_data).sort_values("Net Worth", ascending=False)
        st.dataframe(df_final, use_container_width=True, hide_index=True)

    # Turn log
    st.subheader("Turn Log")
    turns = game.get("turns", [])
    if turns:
        df_turns = pd.DataFrame([
            {"agent": t["agent"], "action": t["action"],
             "details": json.dumps(t.get("details", {}), default=str)[:120]}
            for t in turns
        ])
        # Filters
        agents = ["All"] + sorted(df_turns["agent"].unique().tolist())
        actions = ["All"] + sorted(df_turns["action"].unique().tolist())
        fc1, fc2 = st.columns(2)
        sel_agent = fc1.selectbox("Filter Agent", agents)
        sel_action = fc2.selectbox("Filter Action", actions)
        if sel_agent != "All":
            df_turns = df_turns[df_turns["agent"] == sel_agent]
        if sel_action != "All":
            df_turns = df_turns[df_turns["action"] == sel_action]
        st.dataframe(df_turns, use_container_width=True, hide_index=True, height=400)