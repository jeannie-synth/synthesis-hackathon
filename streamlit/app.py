"""
The Landlord's Game — Analytical Dashboard
A data-driven narrative for hackathon judges and beyond.

Data: 43 verified games across two phases on Base Sepolia.
- Phase 1: 30 games (15 Monopolist, 15 Prosperity) — fixed rules, no voting
- Phase 2: 13 games (7 M-start, 6 P-start) — voting enabled
"""

import json
import os
from pathlib import Path

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

# ─── Config ───

DATA_ROOT = Path(
    os.environ.get("DATA_ROOT", str(Path(__file__).parent.parent / "data" / "games"))
)
PHASE1_TOURNAMENT = "tournament-1773831296297"
PHASE2_TOURNAMENT = "tournament-1773910613854"

MONO_COLOR = "#e74c3c"
PROS_COLOR = "#2ecc71"
MODE_COLORS = {"Monopolist": MONO_COLOR, "Prosperity": PROS_COLOR}

STRATEGY_COLORS = {
    "Extractive": "#e74c3c",
    "Generative": "#2ecc71",
    "Conditional": "#3498db",
    "FreeRider": "#f39c12",
    "Pavlov": "#9b59b6",
}


# ─── Data loading ───


def strategy_from_agent(agent_name: str) -> str:
    return agent_name.rsplit("-", 1)[0]


@st.cache_data
def load_tournament(tournament_id: str) -> list[dict]:
    path = DATA_ROOT / tournament_id
    if not path.exists():
        return []
    games = []
    for f in sorted(path.glob("game-*.json")):
        with open(f) as fp:
            games.append(json.load(fp))
    return games


def split_by_mode(games: list[dict]) -> tuple[list[dict], list[dict]]:
    mono = [g for g in games if g.get("mode") == "Monopolist"]
    pros = [g for g in games if g.get("mode") == "Prosperity"]
    return mono, pros


# ─── Metric computation ───


def gini(values: list[float]) -> float:
    if not values or sum(values) == 0:
        return 0.0
    sorted_v = sorted(values)
    n = len(sorted_v)
    cumsum = sum((i + 1) * v for i, v in enumerate(sorted_v))
    return (2 * cumsum) / (n * sum(sorted_v)) - (n + 1) / n


def compute_gini_timeseries(game: dict) -> list[dict]:
    rows = []
    for snap in game.get("roundSnapshots", []):
        net_worths = [p["netWorth"] for p in snap["players"]]
        rows.append({"round": snap["round"], "gini": gini(net_worths)})
    return rows


def strategy_performance(games: list[dict]) -> pd.DataFrame:
    rows = []
    for game in games:
        result = game.get("result")
        if not result:
            continue
        addr_to_strat: dict[str, str] = {}
        for turn in game.get("turns", []):
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


def count_actions(games: list[dict], action_type: str) -> int:
    count = 0
    for game in games:
        for turn in game.get("turns", []):
            if turn["action"] == action_type:
                count += 1
    return count


def count_mode_switches(games: list[dict]) -> int:
    total = 0
    for game in games:
        for turn in game.get("turns", []):
            if turn["action"] == "proposalPassed":
                total += 1
    return total


def get_mode_flow(games: list[dict]) -> pd.DataFrame:
    """For each game, get start mode and end mode.

    Uses result.mode as the authoritative final mode — roundSnapshots
    can lag behind late mode switches.
    """
    rows = []
    for game in games:
        start_mode = game.get("mode", "Unknown")
        result = game.get("result", {})

        # Primary: result.mode (authoritative, set at game end)
        end_mode_raw = result.get("mode")
        if isinstance(end_mode_raw, int):
            end_mode = "Monopolist" if end_mode_raw == 0 else "Prosperity"
        elif isinstance(end_mode_raw, str):
            end_mode = end_mode_raw
        else:
            # Fallback: track through proposalPassed turn log entries
            current = start_mode
            for t in game.get("turns", []):
                if t["action"] == "proposalPassed":
                    new = t.get("details", {}).get("newMode")
                    if new:
                        current = new
            end_mode = current

        rows.append({
            "gameId": game["gameId"],
            "startMode": start_mode,
            "endMode": end_mode,
        })
    return pd.DataFrame(rows)


# ═══════════════════════════════════════════════════
#  APP SETUP
# ═══════════════════════════════════════════════════

st.set_page_config(
    page_title="The Landlord's Game",
    page_icon="\U0001f3b2",
    layout="wide",
)

# Load data
phase1_games = load_tournament(PHASE1_TOURNAMENT)
phase2_games = load_tournament(PHASE2_TOURNAMENT)
p1_mono, p1_pros = split_by_mode(phase1_games)
p2_mono, p2_pros = split_by_mode(phase2_games)

# ─── Sidebar ───

st.sidebar.title("The Landlord's Game")
st.sidebar.markdown("*Same agents, same board, two rule sets.*")
st.sidebar.markdown("---")

page = st.sidebar.radio(
    "Navigate",
    [
        "Same Board, Two Rules",
        "15 Pairs, Zero Exceptions",
        "When Agents Vote",
        "About This Experiment",
    ],
)

st.sidebar.markdown("---")
st.sidebar.caption(
    "Built for [The Synthesis Hackathon](https://www.thesynthesis.ai/) "
    "on Base blockchain."
)
st.sidebar.caption("Goldi Horta + Jeannie (Claude Code)")


# ═══════════════════════════════════════════════════
#  PAGE 1: SAME BOARD, TWO RULES
# ═══════════════════════════════════════════════════

if page == "Same Board, Two Rules":
    st.title("Same Board, Two Rules")
    st.markdown(
        "Five AI agents played an economic board game on Base blockchain. "
        "Same agents, same starting conditions. The only variable: **the rules.**"
    )
    st.markdown(
        "**Monopolist** rules send all rent to property owners. "
        "**Prosperity** rules share a portion through a public treasury. "
        "Here's what happened across **30 games** on Base Sepolia."
    )

    # Gini metrics
    mono_ginis = [g["result"]["giniCoefficient"] for g in p1_mono if g.get("result")]
    pros_ginis = [g["result"]["giniCoefficient"] for g in p1_pros if g.get("result")]

    if mono_ginis and pros_ginis:
        mean_m = sum(mono_ginis) / len(mono_ginis)
        mean_p = sum(pros_ginis) / len(pros_ginis)
        ratio = mean_m / max(mean_p, 0.001)

        col1, col2, col3 = st.columns(3)
        col1.metric("Monopolist Mean Gini", f"{mean_m:.3f}")
        col2.metric("Prosperity Mean Gini", f"{mean_p:.3f}")
        col3.metric("Inequality Ratio", f"{ratio:.1f}x")

    st.markdown(
        "> **Gini coefficient** measures wealth inequality: "
        "0 = perfect equality (everyone has the same), "
        "1 = total inequality (one player has everything). "
        "Higher Gini = more unequal."
    )

    # Chart 1: Terminal Gini box plot
    st.markdown("### Zero Overlap")
    st.markdown(
        "The least unequal Monopolist game (Gini 0.107) still produced "
        "**2x the inequality** of the most unequal Prosperity game (0.055)."
    )

    gini_dist = []
    for g in mono_ginis:
        gini_dist.append({"Rule Set": "Monopolist", "Gini": g})
    for g in pros_ginis:
        gini_dist.append({"Rule Set": "Prosperity", "Gini": g})
    if gini_dist:
        df = pd.DataFrame(gini_dist)
        fig = px.box(
            df, x="Rule Set", y="Gini", color="Rule Set",
            color_discrete_map=MODE_COLORS,
            template="plotly_white",
        )
        fig.update_layout(height=380, showlegend=False,
                          yaxis_title="Gini Coefficient")
        st.plotly_chart(fig, use_container_width=True)

    # Chart 2: Gini over rounds
    st.markdown("### Inequality Diverges From Round 1")
    st.markdown(
        "The gap isn't gradual. Monopolist and Prosperity games diverge "
        "from the very first rounds and never converge."
    )

    gini_rows = []
    for game in p1_mono:
        for row in compute_gini_timeseries(game):
            gini_rows.append({**row, "mode": "Monopolist"})
    for game in p1_pros:
        for row in compute_gini_timeseries(game):
            gini_rows.append({**row, "mode": "Prosperity"})

    if gini_rows:
        df_gini = pd.DataFrame(gini_rows)
        df_mean = df_gini.groupby(["mode", "round"])["gini"].agg(["mean", "std"]).reset_index()
        fig = go.Figure()
        for mode, color in [("Monopolist", MONO_COLOR), ("Prosperity", PROS_COLOR)]:
            subset = df_mean[df_mean["mode"] == mode]
            fig.add_trace(go.Scatter(
                x=subset["round"], y=subset["mean"], mode="lines",
                name=mode, line=dict(color=color, width=3),
            ))
            if "std" in subset.columns:
                upper = subset["mean"] + subset["std"]
                lower = (subset["mean"] - subset["std"]).clip(lower=0)
                fig.add_trace(go.Scatter(
                    x=pd.concat([subset["round"], subset["round"][::-1]]),
                    y=pd.concat([upper, lower[::-1]]),
                    fill="toself", fillcolor=color, opacity=0.12,
                    line=dict(color="rgba(0,0,0,0)"), showlegend=False,
                ))
        fig.update_layout(
            xaxis_title="Round", yaxis_title="Gini Coefficient",
            template="plotly_white", height=400,
        )
        st.plotly_chart(fig, use_container_width=True)

    # Game duration
    st.markdown("### Game Duration")
    mono_rounds = [g["result"]["rounds"] for g in p1_mono if g.get("result")]
    pros_rounds = [g["result"]["rounds"] for g in p1_pros if g.get("result")]
    if mono_rounds and pros_rounds:
        c1, c2 = st.columns(2)
        c1.metric("Monopolist Mean Rounds", f"{sum(mono_rounds)/len(mono_rounds):.1f}")
        c2.metric("Prosperity Mean Rounds", f"{sum(pros_rounds)/len(pros_rounds):.1f}")
        st.markdown(
            "Prosperity games end **~4x faster**. When wealth is shared, "
            "everyone reaches the finish line sooner. When wealth concentrates, "
            "the game drags on as the leader slowly squeezes out the rest."
        )


# ═══════════════════════════════════════════════════
#  PAGE 2: THE EVIDENCE
# ═══════════════════════════════════════════════════

elif page == "15 Pairs, Zero Exceptions":
    st.title("15 Pairs, Zero Exceptions")
    st.markdown(
        "Games were run in pairs: one Monopolist, one Prosperity, same agents. "
        "**Every single pair** showed the same pattern."
    )

    # Chart 1: Per-pair divergence
    st.markdown("### Every Pair Tells the Same Story")

    mono_ginis = {g["gameId"]: g["result"]["giniCoefficient"]
                  for g in p1_mono if g.get("result")}
    pros_ginis = {g["gameId"]: g["result"]["giniCoefficient"]
                  for g in p1_pros if g.get("result")}

    # Pairs: odd=monopolist, even=prosperity (1+2, 3+4, ...)
    pairs = []
    for m_id in sorted(mono_ginis.keys()):
        p_id = m_id + 1
        if p_id in pros_ginis:
            div = mono_ginis[m_id] - pros_ginis[p_id]
            pairs.append({
                "Pair": f"Games {m_id}-{p_id}",
                "Divergence": div,
                "M Gini": mono_ginis[m_id],
                "P Gini": pros_ginis[p_id],
            })

    if pairs:
        df_pairs = pd.DataFrame(pairs)
        fig = px.bar(
            df_pairs, y="Pair", x="Divergence", orientation="h",
            color="Divergence",
            color_continuous_scale=[[0, PROS_COLOR], [0.5, "#f5f5f5"], [1, MONO_COLOR]],
            template="plotly_white",
        )
        fig.update_layout(
            height=500, coloraxis_showscale=False,
            xaxis_title="Gini Divergence (Monopolist \u2212 Prosperity)",
            yaxis_title="",
        )
        st.plotly_chart(fig, use_container_width=True)
        st.markdown(
            f"All **{len(pairs)} pairs** show positive divergence. "
            f"Range: {min(p['Divergence'] for p in pairs):.3f} to "
            f"{max(p['Divergence'] for p in pairs):.3f}. No exceptions."
        )

    # Chart 2: Strategy performance
    st.markdown("### Who Thrives Where?")
    df_perf = strategy_performance(phase1_games)
    if not df_perf.empty:
        df_agg = df_perf.groupby(["strategy", "mode"])["netWorth"].mean().reset_index()
        fig = px.bar(
            df_agg, x="strategy", y="netWorth", color="mode", barmode="group",
            color_discrete_map=MODE_COLORS,
            template="plotly_white",
            labels={"netWorth": "Mean Net Worth ($)", "strategy": "Strategy"},
        )
        fig.update_layout(height=400)
        st.plotly_chart(fig, use_container_width=True)

        st.markdown(
            "**Extractive** has the widest mode gap \u2014 most sensitive to the rule set. "
            "Competitive under Monopolist, worst under Prosperity. "
            "**Generative** barely changes across modes. "
            "The rule set determines whether extraction pays."
        )

    # Chart 3: Net worth distributions
    st.markdown("### Wealth Spread")
    nw_rows = []
    for game in phase1_games:
        result = game.get("result")
        if not result:
            continue
        for nw in result["netWorths"]:
            nw_rows.append({"Rule Set": game["mode"], "Net Worth": nw})
    if nw_rows:
        df_nw = pd.DataFrame(nw_rows)
        fig = px.violin(
            df_nw, x="Rule Set", y="Net Worth", color="Rule Set",
            color_discrete_map=MODE_COLORS,
            box=True, template="plotly_white",
        )
        fig.update_layout(height=400, showlegend=False,
                          yaxis_title="Individual Net Worth ($)")
        st.plotly_chart(fig, use_container_width=True)
        st.markdown(
            "Under Monopolist rules, individual net worths range from **$98 to $2,117** "
            "(typical spread ~$1,500). Under Prosperity, they cluster between "
            "**$1,006 and $1,376** (spread ~$200). Same agents. Same board."
        )

    # Chart 4: Rounds
    st.markdown("### Time to Completion")
    rounds_rows = []
    for g in phase1_games:
        if g.get("result"):
            rounds_rows.append({"Rule Set": g["mode"], "Rounds": g["result"]["rounds"]})
    if rounds_rows:
        df_r = pd.DataFrame(rounds_rows)
        fig = px.box(
            df_r, x="Rule Set", y="Rounds", color="Rule Set",
            color_discrete_map=MODE_COLORS,
            template="plotly_white",
        )
        fig.update_layout(height=350, showlegend=False)
        st.plotly_chart(fig, use_container_width=True)


# ═══════════════════════════════════════════════════
#  PAGE 3: WHEN AGENTS VOTE
# ═══════════════════════════════════════════════════

elif page == "When Agents Vote":
    st.title("When Agents Vote")
    st.markdown(
        "What happens when agents can **propose to change the rules** mid-game? "
        "We enabled voting and ran **13 more games** on Base Sepolia."
    )

    # Voting metrics (computed from turn logs)
    total_votes = count_actions(phase2_games, "vote")
    total_proposals = count_actions(phase2_games, "proposeModeSwitch")
    total_switches = count_mode_switches(phase2_games)  # proposalPassed = actual mode switch

    col1, col2, col3 = st.columns(3)
    col1.metric("Total Votes Cast", f"{total_votes:,}")
    col2.metric("Proposals Made", f"{total_proposals:,}")
    col3.metric("Mode Switches", f"{total_switches:,}")

    # Convergence comparison
    st.markdown("### Voting Collapses the Gap by 79%")

    p1_mono_ginis = [g["result"]["giniCoefficient"] for g in p1_mono if g.get("result")]
    p1_pros_ginis = [g["result"]["giniCoefficient"] for g in p1_pros if g.get("result")]
    p2_mono_ginis = [g["result"]["giniCoefficient"] for g in p2_mono if g.get("result")]
    p2_pros_ginis = [g["result"]["giniCoefficient"] for g in p2_pros if g.get("result")]

    if p1_mono_ginis and p1_pros_ginis and p2_mono_ginis and p2_pros_ginis:
        p1_div = sum(p1_mono_ginis)/len(p1_mono_ginis) - sum(p1_pros_ginis)/len(p1_pros_ginis)
        p2_m_mean = sum(p2_mono_ginis)/len(p2_mono_ginis)
        p2_p_mean = sum(p2_pros_ginis)/len(p2_pros_ginis)
        p2_div = p2_m_mean - p2_p_mean
        reduction = (p1_div - p2_div) / p1_div * 100

        conv_data = pd.DataFrame([
            {"Phase": "Phase 1 (no voting)", "Divergence": p1_div},
            {"Phase": "Phase 2 (voting)", "Divergence": p2_div},
        ])
        fig = px.bar(
            conv_data, x="Phase", y="Divergence",
            color="Phase",
            color_discrete_sequence=[MONO_COLOR, PROS_COLOR],
            template="plotly_white",
            labels={"Divergence": "Gini Divergence (M \u2212 P)"},
        )
        fig.update_layout(height=350, showlegend=False)
        st.plotly_chart(fig, use_container_width=True)

        st.markdown(
            f"Phase 1 divergence: **{p1_div:.4f}**. "
            f"Phase 2 divergence: **{p2_div:.4f}**. "
            f"A **{reduction:.0f}% reduction.**"
        )

    # Convergence detail
    st.markdown("### Convergence From Both Directions")
    if p1_mono_ginis and p2_mono_ginis:
        p1_m = sum(p1_mono_ginis)/len(p1_mono_ginis)
        p1_p = sum(p1_pros_ginis)/len(p1_pros_ginis)

        detail = pd.DataFrame([
            {"Metric": "Monopolist Gini", "Phase 1": p1_m, "Phase 2": p2_m_mean,
             "Change": f"{(p2_m_mean - p1_m)/p1_m*100:+.0f}%"},
            {"Metric": "Prosperity Gini", "Phase 1": p1_p, "Phase 2": p2_p_mean,
             "Change": f"{(p2_p_mean - p1_p)/p1_p*100:+.0f}%"},
        ])
        st.dataframe(
            detail.style.format({"Phase 1": "{:.4f}", "Phase 2": "{:.4f}"}),
            use_container_width=True, hide_index=True,
        )
        st.markdown(
            "Both modes converge. Monopolist Gini **drops 48%**. "
            "Prosperity Gini **rises 94%**. "
            "In absolute Gini points, Monopolist moves 2.9x more. "
            "In percentage terms, Prosperity's shift is proportionally larger. "
            "**Both are substantial.**"
        )

    # Mode switching flow
    st.markdown("### 6 of 7 Monopolist Games Voted Themselves Into Prosperity")

    df_flow = get_mode_flow(phase2_games)
    if not df_flow.empty:
        # Build flow summary
        flow_summary = df_flow.groupby(["startMode", "endMode"]).size().reset_index(name="count")
        fig = px.bar(
            flow_summary, x="startMode", y="count", color="endMode",
            barmode="stack",
            color_discrete_map=MODE_COLORS,
            template="plotly_white",
            labels={"startMode": "Starting Rule Set", "count": "Games",
                    "endMode": "Ending Rule Set"},
        )
        fig.update_layout(height=350)
        st.plotly_chart(fig, use_container_width=True)
        st.markdown(
            "Nobody told the agents to prefer Prosperity. "
            "They figured it out through self-interest: agents losing under Monopolist rules "
            "proposed switches, and the majority \u2014 also losing \u2014 voted yes."
        )

    # Phase 2 Gini distribution
    st.markdown("### Phase 2 Gini Distribution (by starting mode)")
    p2_gini_rows = []
    for g in phase2_games:
        if g.get("result"):
            p2_gini_rows.append({
                "Starting Mode": g["mode"],
                "Gini": g["result"]["giniCoefficient"],
            })
    if p2_gini_rows:
        df_p2g = pd.DataFrame(p2_gini_rows)
        fig = px.box(
            df_p2g, x="Starting Mode", y="Gini", color="Starting Mode",
            color_discrete_map=MODE_COLORS,
            template="plotly_white",
        )
        fig.update_layout(height=350, showlegend=False,
                          yaxis_title="Gini Coefficient")
        st.plotly_chart(fig, use_container_width=True)
        st.markdown(
            "Compare this to Phase 1's clean separation. "
            "With voting, the distributions overlap \u2014 the structural gap "
            "nearly disappears because agents change the rules from within."
        )


# ═══════════════════════════════════════════════════
#  PAGE 4: ABOUT
# ═══════════════════════════════════════════════════

elif page == "About This Experiment":
    st.title("About This Experiment")

    st.markdown("### What We Built")
    st.markdown(
        "An economic board game as a **smart contract on Base blockchain**, "
        "inspired by Elizabeth Magie's 1904 Landlord's Game \u2014 the game that became Monopoly. "
        "Magie designed her game with two rule sets to make a political point: "
        "**the same game produces wildly different outcomes depending on the rules.**"
    )
    st.markdown(
        "We rebuilt that experiment with AI agents. Five agent strategies \u2014 "
        "Extractive, Generative, Conditional, FreeRider, and Pavlov \u2014 "
        "compete on a 40-space board. Every move is an on-chain transaction. "
        "Every outcome is verifiable."
    )

    st.markdown("### The Data")

    data_table = pd.DataFrame([
        {"Phase": "Phase 1", "Games": 30, "Rule Sets": "15 Monopolist + 15 Prosperity",
         "Voting": "Disabled", "Key Finding": "5.6x inequality ratio, zero overlap"},
        {"Phase": "Phase 2", "Games": 13, "Rule Sets": "7 M-start + 6 P-start",
         "Voting": "Enabled", "Key Finding": "79% divergence collapse via voting"},
        {"Phase": "Inaugural Tournament", "Games": 18, "Rule Sets": "9 Monopolist + 9 Prosperity",
         "Voting": "Enabled", "Key Finding": "LLM agents on Base mainnet (qualitative data)"},
    ])
    st.dataframe(data_table, use_container_width=True, hide_index=True)

    st.markdown(
        "The Inaugural Tournament (18 games on Base mainnet) used LLM-powered agents "
        "who chose their own strategies and adapted across 3 rounds. "
        "That data lives in agent markdown logs, not structured JSON, "
        "so it's analyzed qualitatively rather than in this dashboard."
    )

    st.markdown("### What the Metrics Mean")

    st.markdown(
        "**Gini Coefficient** \u2014 Measures wealth inequality on a scale from 0 (perfect equality) "
        "to 1 (one player has everything). Developed by statistician Corrado Gini in 1912. "
        "Comparing Gini between rule sets shows whether economic structure drives inequality."
    )
    st.markdown(
        "**Public Treasury** \u2014 Under Prosperity rules, a portion of rent flows into a shared "
        "treasury that distributes equal dividends to all players. "
        "This mechanic \u2014 inspired by Georgist economics \u2014 "
        "drives redistribution without requiring agent cooperation."
    )
    st.markdown(
        "**Rounds to Completion** \u2014 Monopolist games end when any player's net worth crosses "
        "a threshold (individual accumulation). Prosperity games end when the poorest player "
        "crosses a threshold (collective floor)."
    )

    st.markdown("### Limitations")
    st.markdown(
        "This is a **hackathon experiment, not peer-reviewed research.** "
        "30 games in Phase 1 and 13 in Phase 2 demonstrate directional patterns "
        "but are insufficient for formal statistical inference. "
        "We invite others to replicate, critique, and improve upon this work."
    )

    st.markdown("### Links")
    st.markdown(
        "- **GitHub**: [jeannie-synth/synthesis-hackathon](https://github.com/jeannie-synth/synthesis-hackathon)\n"
        "- **Mainnet Contract**: [`0x496cf175126ce10728b75f02e457f144ffca275a`](https://basescan.org/address/0x496cf175126ce10728b75f02e457f144ffca275a)\n"
        "- **Built by**: Goldi Horta (human) + Jeannie (Claude Code agent)"
    )
