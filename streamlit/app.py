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

MONO_COLOR = "#A93B6B"
PROS_COLOR = "#0097A7"
MODE_COLORS = {"Monopolist": MONO_COLOR, "Prosperity": PROS_COLOR}

STRATEGY_COLORS = {
    "Extractive": "#A93B6B",
    "Generative": "#0097A7",
    "Conditional": "#3498db",
    "FreeRider": "#E6A817",
    "Pavlov": "#7E57C2",
}

SAMPLE_DISCLAIMER = "Based on 15 games per condition. Directional, not statistically conclusive."
PHASE2_DISCLAIMER = "Based on 13 games (7 M-start, 6 P-start). Directional, not statistically conclusive."


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
                "strategy": strat, "netWorth": nw,
                "mode": game["mode"], "gameId": game["gameId"],
            })
    return pd.DataFrame(rows) if rows else pd.DataFrame()


def count_actions(games: list[dict], action_type: str) -> int:
    return sum(1 for g in games for t in g.get("turns", []) if t["action"] == action_type)


def count_mode_switches(games: list[dict]) -> int:
    return sum(1 for g in games for t in g.get("turns", []) if t["action"] == "proposalPassed")


def get_mode_flow(games: list[dict]) -> pd.DataFrame:
    rows = []
    for game in games:
        start_mode = game.get("mode", "Unknown")
        result = game.get("result", {})
        end_mode_raw = result.get("mode")
        if isinstance(end_mode_raw, int):
            end_mode = "Monopolist" if end_mode_raw == 0 else "Prosperity"
        elif isinstance(end_mode_raw, str):
            end_mode = end_mode_raw
        else:
            current = start_mode
            for t in game.get("turns", []):
                if t["action"] == "proposalPassed":
                    new = t.get("details", {}).get("newMode")
                    if new:
                        current = new
            end_mode = current
        rows.append({"gameId": game["gameId"], "startMode": start_mode, "endMode": end_mode})
    return pd.DataFrame(rows)


# ─── UI helpers ───


def question_panel(text: str):
    st.markdown(
        f'<div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); '
        f'color: #e0e0e0; padding: 1.2rem 1.5rem; border-radius: 10px; '
        f'border-left: 4px solid {PROS_COLOR}; margin-bottom: 1.5rem; '
        f'font-size: 1.05rem; font-style: italic;">{text}</div>',
        unsafe_allow_html=True,
    )


def finding_text(text: str):
    st.markdown(
        f'<p style="text-align: center; color: #555; font-size: 0.95rem; '
        f'max-width: 720px; margin: 0.5rem auto 1.5rem auto;">{text}</p>',
        unsafe_allow_html=True,
    )


def next_tab_prompt(label: str, tab_index: int = 0):
    """Visual separator at bottom of each tab."""
    st.markdown("---")


def finding_card(title: str, body: str, accent: str = PROS_COLOR):
    st.markdown(
        f'<div style="background: #f8f9fa; border-left: 4px solid {accent}; '
        f'padding: 1rem 1.2rem; border-radius: 6px; margin-bottom: 1rem;">'
        f'<strong>{title}</strong><br/>'
        f'<span style="color: #555; font-size: 0.93rem;">{body}</span></div>',
        unsafe_allow_html=True,
    )


def pull_quote(text: str, attribution: str):
    st.markdown(
        f'<div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); '
        f'color: #e0e0e0; padding: 1.5rem 2rem; border-radius: 10px; '
        f'margin: 1.5rem 0; text-align: center;">'
        f'<span style="font-size: 1.15rem; font-style: italic; line-height: 1.6;">'
        f'"{text}"</span><br/>'
        f'<span style="font-size: 0.85rem; color: #999; margin-top: 0.5rem; '
        f'display: inline-block;">\u2014 {attribution}</span></div>',
        unsafe_allow_html=True,
    )


# ═══════════════════════════════════════════════════
#  APP SETUP
# ═══════════════════════════════════════════════════

st.set_page_config(
    page_title="The Landlord's Game",
    page_icon="\U0001f3b2",
    layout="wide",
)

phase1_games = load_tournament(PHASE1_TOURNAMENT)
phase2_games = load_tournament(PHASE2_TOURNAMENT)
p1_mono, p1_pros = split_by_mode(phase1_games)
p2_mono, p2_pros = split_by_mode(phase2_games)

# ─── Header ───

st.title("The Landlord's Game")
st.markdown(
    "*Same agents, same board, two rule sets.* "
    "An economic experiment on Base blockchain."
)

tab0, tab1, tab2, tab3, tab4 = st.tabs([
    "\u2460 About",
    "\u2461 Same Board, Two Rules",
    "\u2462 15 Pairs, Zero Exceptions",
    "\u2463 When Agents Vote",
    "\u2464 Conclusion",
])


# ═══════════════════════════════════════════════════
#  TAB 0: ABOUT
# ═══════════════════════════════════════════════════

with tab0:
    # "How to read" guide — only on this tab
    st.markdown(
        '<div style="background: #f8f9fa; padding: 1rem 1.5rem; border-radius: 8px; '
        'margin-bottom: 1rem; font-size: 0.92rem; color: #444;">'
        '<strong>How to read this dashboard:</strong> '
        'Start here for context, then follow the numbered tabs. '
        'Each builds on the last \u2014 '
        'from the core inequality finding (\u2461), '
        'to the per-pair evidence (\u2462), '
        'to what happens when agents gain political agency (\u2463), '
        'to the conclusion (\u2464).'
        '</div>',
        unsafe_allow_html=True,
    )

    question_panel(
        "Can the same agents, competing just as hard, produce radically different outcomes "
        "under different economic rules?"
    )

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
        {"Phase": "Inaugural Tournament", "Games": 18,
         "Rule Sets": "9 Monopolist + 9 Prosperity",
         "Voting": "Enabled",
         "Key Finding": "LLM agents on Base mainnet (qualitative)"},
    ])
    st.dataframe(data_table, use_container_width=True, hide_index=True)

    st.info(
        "The **Inaugural Tournament** (18 games on Base mainnet) used LLM-powered agents "
        "who chose their own strategies and adapted across 3 rounds. "
        "That data is qualitative (agent markdown logs), not structured JSON, "
        "so it's not visualized in this dashboard."
    )

    st.markdown("### What the Metrics Mean")
    finding_card(
        "Gini Coefficient",
        "Measures wealth inequality: 0 = perfect equality, "
        "1 = one player has everything. Our primary metric for comparing rule sets.",
        accent=MONO_COLOR,
    )
    finding_card(
        "Public Treasury",
        "Under Prosperity rules, a portion of rent flows into a shared pool "
        "that distributes equal dividends to all players. The Georgist mechanism.",
        accent=PROS_COLOR,
    )
    finding_card(
        "Rounds to Completion",
        "How many full rounds before a winner emerges. "
        "Shorter games = faster collective wealth creation.",
        accent="#E6A817",
    )
    finding_card(
        "Mode Switching",
        "In Phase 2, agents can vote to change the rule set mid-game. "
        "A political mechanism layered on top of the economic one.",
        accent="#7E57C2",
    )

    st.markdown("### Limitations")
    st.markdown(
        "This is a **hackathon experiment, not peer-reviewed research.** "
        "Sample sizes demonstrate directional patterns "
        "but are insufficient for formal statistical inference. "
        "We invite others to replicate, critique, and improve."
    )

    st.markdown("### Links")
    st.markdown(
        "- **Code**: [jeannie-synth/synthesis-hackathon](https://github.com/jeannie-synth/synthesis-hackathon)\n"
        "- **Mainnet Contract**: [`0x496cf1...ca275a`](https://basescan.org/address/0x496cf175126ce10728b75f02e457f144ffca275a)\n"
        "- **Goldi Horta**: [@jghorta](https://github.com/jghorta) (human)\n"
        "- **Jeannie**: [@jeannie-synth](https://github.com/jeannie-synth) (Claude Code agent)"
    )

    next_tab_prompt("\u2461 Same Board, Two Rules", tab_index=1)


# ═══════════════════════════════════════════════════
#  TAB 1: SAME BOARD, TWO RULES
# ═══════════════════════════════════════════════════

with tab1:
    question_panel(
        "Do the rules matter? 30 games, 15 under each rule set, same five agents. "
        "Does economic structure alone determine wealth distribution?"
    )

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

    st.caption(
        "Gini coefficient: 0 = perfect equality, 1 = total inequality. Higher = more unequal."
    )

    # Gini over rounds with annotation
    st.markdown("### Inequality Diverges From Round 1")

    gini_rows = []
    for game in p1_mono:
        for row in compute_gini_timeseries(game):
            gini_rows.append({**row, "mode": "Monopolist", "gameId": game["gameId"]})
    for game in p1_pros:
        for row in compute_gini_timeseries(game):
            gini_rows.append({**row, "mode": "Prosperity", "gameId": game["gameId"]})

    if gini_rows:
        df_gini = pd.DataFrame(gini_rows)
        df_mean = df_gini.groupby(["mode", "round"])["gini"].agg(
            ["mean", "min", "max"]
        ).reset_index()
        fig = go.Figure()
        for mode, color in [("Monopolist", MONO_COLOR), ("Prosperity", PROS_COLOR)]:
            subset = df_mean[df_mean["mode"] == mode].copy()
            # Min-max band
            fig.add_trace(go.Scatter(
                x=pd.concat([subset["round"], subset["round"][::-1]]),
                y=pd.concat([subset["max"], subset["min"][::-1]]),
                fill="toself",
                fillcolor=f"rgba({int(color[1:3],16)},{int(color[3:5],16)},{int(color[5:7],16)},0.1)",
                line=dict(color="rgba(0,0,0,0)"),
                showlegend=False, hoverinfo="skip",
            ))
            fig.add_trace(go.Scatter(
                x=subset["round"], y=subset["mean"], mode="lines+markers",
                name=mode, line=dict(color=color, width=3),
                marker=dict(size=3),
                hovertemplate=f"<b>{mode}</b><br>Round %{{x}}<br>Mean Gini: %{{y:.4f}}<extra></extra>",
            ))

        # Annotation: where Prosperity games typically end
        pros_rounds = [g["result"]["rounds"] for g in p1_pros if g.get("result")]
        avg_pros_end = sum(pros_rounds) / len(pros_rounds) if pros_rounds else 11
        fig.add_vline(x=avg_pros_end, line_dash="dash", line_color="#999", line_width=1)
        fig.add_annotation(
            x=avg_pros_end, y=0.28, text="Prosperity games<br>typically end here",
            showarrow=False, font=dict(size=10, color="#888"),
            xanchor="left", xshift=6,
        )

        fig.update_layout(
            xaxis_title="Round", yaxis_title="Gini Coefficient (inequality)",
            template="plotly_white", height=420, hovermode="x unified",
        )
        st.plotly_chart(fig, use_container_width=True)
        finding_text(
            "The gap isn't gradual. Monopolist and Prosperity diverge from Round 1. "
            "Shaded bands show the full range across 15 games per mode."
        )
        st.caption(SAMPLE_DISCLAIMER)

    # Wealth spread
    st.markdown("### What Inequality Looks Like in Dollars")
    nw_rows = []
    for game in phase1_games:
        result = game.get("result")
        if not result:
            continue
        addr_to_strat: dict[str, str] = {}
        for turn in game.get("turns", []):
            name = turn["agent"]
            parts = name.rsplit("-", 1)
            if len(parts) == 2 and parts[1].isdigit():
                idx = int(parts[1])
                if idx < len(game["playerAddresses"]):
                    addr_to_strat[game["playerAddresses"][idx]] = parts[0]
        for i, nw in enumerate(result["netWorths"]):
            addr = game["playerAddresses"][i]
            nw_rows.append({
                "Rule Set": game["mode"], "Net Worth ($)": nw,
                "Strategy": addr_to_strat.get(addr, f"Player-{i}"),
                "Game": f"Game {game['gameId']}",
            })
    if nw_rows:
        df_nw = pd.DataFrame(nw_rows)
        fig = px.strip(
            df_nw, x="Rule Set", y="Net Worth ($)", color="Rule Set",
            color_discrete_map=MODE_COLORS, template="plotly_white",
            stripmode="overlay", hover_data=["Strategy", "Game"],
        )
        fig.update_traces(jitter=0.4, marker=dict(size=7, opacity=0.65))
        fig.update_layout(height=400, showlegend=False, yaxis_title="Individual Net Worth ($)")
        st.plotly_chart(fig, use_container_width=True)
        finding_text(
            "Each dot is one player's final net worth. "
            "Monopolist: $98 to $2,117 (spread ~$1,500). "
            "Prosperity: $1,006 to $1,376 (spread ~$200). Same agents. Same board."
        )
        st.caption(SAMPLE_DISCLAIMER)

    # Game duration
    st.markdown("### AVG Game Duration")
    mono_rounds = [g["result"]["rounds"] for g in p1_mono if g.get("result")]
    pros_rounds_list = [g["result"]["rounds"] for g in p1_pros if g.get("result")]
    if mono_rounds and pros_rounds_list:
        c1, c2 = st.columns(2)
        c1.metric("Monopolist", f"{sum(mono_rounds)/len(mono_rounds):.0f} rounds",
                   help="Avg. across 15 games")
        c2.metric("Prosperity", f"{sum(pros_rounds_list)/len(pros_rounds_list):.0f} rounds",
                   help="Avg. across 15 games")
        finding_text(
            "Prosperity games end ~4x faster. When wealth is shared, "
            "everyone reaches the finish line sooner."
        )

    next_tab_prompt("\u2462 15 Pairs, Zero Exceptions", tab_index=2)


# ═══════════════════════════════════════════════════
#  TAB 2: THE EVIDENCE
# ═══════════════════════════════════════════════════

with tab2:
    question_panel(
        "Is the inequality gap consistent, or driven by a few outlier games? "
        "And which strategies benefit most from each rule set?"
    )

    # Per-pair divergence
    st.markdown("### Every Pair Tells the Same Story")
    st.markdown(
        "Games were run in pairs: one Monopolist, one Prosperity, same agents."
    )

    mono_gini_map = {g["gameId"]: g["result"]["giniCoefficient"]
                     for g in p1_mono if g.get("result")}
    pros_gini_map = {g["gameId"]: g["result"]["giniCoefficient"]
                     for g in p1_pros if g.get("result")}
    pairs = []
    for m_id in sorted(mono_gini_map.keys()):
        p_id = m_id + 1
        if p_id in pros_gini_map:
            pairs.append({
                "Pair": f"Pair {(m_id+1)//2}",
                "Divergence": mono_gini_map[m_id] - pros_gini_map[p_id],
                "Monopolist Gini": round(mono_gini_map[m_id], 3),
                "Prosperity Gini": round(pros_gini_map[p_id], 3),
            })
    if pairs:
        df_pairs = pd.DataFrame(pairs)
        fig = px.bar(
            df_pairs, y="Pair", x="Divergence", orientation="h",
            color="Divergence",
            color_continuous_scale=[[0, PROS_COLOR], [0.3, "#b0bec5"], [1, MONO_COLOR]],
            template="plotly_white",
            hover_data=["Monopolist Gini", "Prosperity Gini"],
        )
        fig.update_layout(
            height=480, coloraxis_showscale=False,
            xaxis_title="Gini Divergence (Monopolist \u2212 Prosperity)", yaxis_title="",
        )
        st.plotly_chart(fig, use_container_width=True)
        finding_text(
            f"All <strong>{len(pairs)} pairs</strong> show positive divergence "
            f"(range: {min(p['Divergence'] for p in pairs):.3f} to "
            f"{max(p['Divergence'] for p in pairs):.3f}). "
            f"<strong>Zero exceptions.</strong>"
        )
        st.caption(SAMPLE_DISCLAIMER)

    # Strategy mode gap (dumbbell — thicker lines)
    st.markdown("### Strategy Mode Gap")
    st.markdown("A wider gap = more sensitive to the rule set.")
    df_perf = strategy_performance(phase1_games)
    if not df_perf.empty:
        df_agg = df_perf.groupby(["strategy", "mode"])["netWorth"].mean().reset_index()
        df_pivot = df_agg.pivot(index="strategy", columns="mode", values="netWorth").reset_index()
        if "Monopolist" in df_pivot.columns and "Prosperity" in df_pivot.columns:
            df_pivot["Gap"] = df_pivot["Monopolist"] - df_pivot["Prosperity"]
            df_pivot = df_pivot.sort_values("Gap", ascending=True)

            fig = go.Figure()
            for _, row in df_pivot.iterrows():
                fig.add_trace(go.Scatter(
                    x=[row["Prosperity"], row["Monopolist"]],
                    y=[row["strategy"], row["strategy"]],
                    mode="lines", line=dict(color="#aaa", width=3),
                    showlegend=False, hoverinfo="skip",
                ))
            fig.add_trace(go.Scatter(
                x=df_pivot["Prosperity"], y=df_pivot["strategy"],
                mode="markers", name="Prosperity",
                marker=dict(color=PROS_COLOR, size=14, line=dict(width=1, color="#fff")),
                hovertemplate="<b>%{y}</b> under Prosperity<br>Mean NW: $%{x:,.0f}<extra></extra>",
            ))
            fig.add_trace(go.Scatter(
                x=df_pivot["Monopolist"], y=df_pivot["strategy"],
                mode="markers", name="Monopolist",
                marker=dict(color=MONO_COLOR, size=14, line=dict(width=1, color="#fff")),
                hovertemplate="<b>%{y}</b> under Monopolist<br>Mean NW: $%{x:,.0f}<extra></extra>",
            ))
            fig.update_layout(height=350, template="plotly_white",
                              xaxis_title="Mean Net Worth ($)", yaxis_title="")
            st.plotly_chart(fig, use_container_width=True)

            widest = df_pivot.iloc[-1]
            narrowest = df_pivot.iloc[0]
            finding_text(
                f"<strong>{widest['strategy']}</strong> has the widest mode gap "
                f"(+${widest['Gap']:,.0f}) \u2014 most sensitive to the rule set. "
                f"<strong>{narrowest['strategy']}</strong> has the narrowest "
                f"(+${narrowest['Gap']:,.0f})."
            )
            st.caption(SAMPLE_DISCLAIMER)

    next_tab_prompt("\u2463 When Agents Vote", tab_index=3)


# ═══════════════════════════════════════════════════
#  TAB 3: WHEN AGENTS VOTE
# ═══════════════════════════════════════════════════

with tab3:
    question_panel(
        "Phase 1 showed that rules determine outcomes. "
        "But what if agents can change the rules? "
        "We gave them voting power and ran 13 more games."
    )

    total_votes = count_actions(phase2_games, "vote")
    total_proposals = count_actions(phase2_games, "proposeModeSwitch")
    total_switches = count_mode_switches(phase2_games)

    col1, col2, col3 = st.columns(3)
    col1.metric("Votes Cast", f"{total_votes:,}")
    col2.metric("Proposals", f"{total_proposals:,}")
    col3.metric("Mode Switches", f"{total_switches:,}")

    # Convergence: % change arrows instead of raw bar chart
    st.markdown("### How Voting Changed the Gini")

    p1_mono_ginis = [g["result"]["giniCoefficient"] for g in p1_mono if g.get("result")]
    p1_pros_ginis = [g["result"]["giniCoefficient"] for g in p1_pros if g.get("result")]
    p2_mono_ginis = [g["result"]["giniCoefficient"] for g in p2_mono if g.get("result")]
    p2_pros_ginis = [g["result"]["giniCoefficient"] for g in p2_pros if g.get("result")]

    if p1_mono_ginis and p1_pros_ginis and p2_mono_ginis and p2_pros_ginis:
        p1_m = sum(p1_mono_ginis) / len(p1_mono_ginis)
        p1_p = sum(p1_pros_ginis) / len(p1_pros_ginis)
        p1_div = p1_m - p1_p
        p2_m = sum(p2_mono_ginis) / len(p2_mono_ginis)
        p2_p = sum(p2_pros_ginis) / len(p2_pros_ginis)
        p2_div = p2_m - p2_p
        reduction = (p1_div - p2_div) / p1_div * 100
        m_pct = (p2_m - p1_m) / p1_m * 100
        p_pct = (p2_p - p1_p) / p1_p * 100

        # Slope chart showing convergence
        fig = go.Figure()
        # Monopolist line (drops)
        fig.add_trace(go.Scatter(
            x=["Phase 1<br>(no voting)", "Phase 2<br>(voting)"],
            y=[p1_m, p2_m], mode="lines+markers+text",
            name="Monopolist", line=dict(color=MONO_COLOR, width=4),
            marker=dict(size=14), textposition="top center",
            text=[f"{p1_m:.3f}", f"{p2_m:.3f}"],
            textfont=dict(size=12, color=MONO_COLOR),
        ))
        # Prosperity line (rises)
        fig.add_trace(go.Scatter(
            x=["Phase 1<br>(no voting)", "Phase 2<br>(voting)"],
            y=[p1_p, p2_p], mode="lines+markers+text",
            name="Prosperity", line=dict(color=PROS_COLOR, width=4),
            marker=dict(size=14), textposition="bottom center",
            text=[f"{p1_p:.3f}", f"{p2_p:.3f}"],
            textfont=dict(size=12, color=PROS_COLOR),
        ))
        # Divergence annotations
        fig.add_annotation(x=0, y=(p1_m + p1_p) / 2,
                           text=f"Gap: {p1_div:.3f}", showarrow=False,
                           font=dict(size=11, color="#666"))
        fig.add_annotation(x=1, y=(p2_m + p2_p) / 2,
                           text=f"Gap: {p2_div:.3f}", showarrow=False,
                           font=dict(size=11, color="#666"))
        fig.update_layout(
            height=400, template="plotly_white",
            yaxis_title="Mean Gini Coefficient",
            xaxis=dict(tickfont=dict(size=13)),
            showlegend=True, legend=dict(orientation="h", y=1.12),
        )
        st.plotly_chart(fig, use_container_width=True)

        finding_text(
            f"<strong>Divergence drops {reduction:.0f}%.</strong> "
            f"Monopolist Gini falls {abs(m_pct):.0f}% \u2014 "
            f"Prosperity Gini rises {abs(p_pct):.0f}%. "
            f"Prosperity moves almost twice as much in relative terms. "
            f"Both modes converge toward each other."
        )
        st.caption(PHASE2_DISCLAIMER)

    # Where each game landed
    st.markdown("### Where Each Game Landed")
    p2_gini_rows = []
    for g in phase2_games:
        if g.get("result"):
            rm = g["result"].get("mode")
            if isinstance(rm, int):
                end_mode = "Monopolist" if rm == 0 else "Prosperity"
            else:
                end_mode = rm or g["mode"]
            p2_gini_rows.append({
                "Game": f"Game {g['gameId']}",
                "Started as": g["mode"],
                "Ended as": end_mode,
                "Switched": "Yes" if g["mode"] != end_mode else "No",
                "Gini": g["result"]["giniCoefficient"],
                "Rounds": g["result"]["rounds"],
            })
    if p2_gini_rows:
        df_p2 = pd.DataFrame(p2_gini_rows)
        fig = px.scatter(
            df_p2, x="Rounds", y="Gini",
            color="Started as", symbol="Ended as",
            color_discrete_map=MODE_COLORS, template="plotly_white",
            hover_data=["Game", "Started as", "Ended as", "Switched"],
            labels={"Started as": "Started as", "Ended as": "Ended as"},
        )
        fig.update_traces(marker=dict(size=14, line=dict(width=1.5, color="#333")))
        fig.update_layout(
            height=420, xaxis_title="Rounds Played",
            yaxis_title="Final Gini Coefficient",
        )
        st.plotly_chart(fig, use_container_width=True)

        m_start = df_p2[df_p2["Started as"] == "Monopolist"]
        m_sw = m_start[m_start["Ended as"] == "Prosperity"]
        p_start = df_p2[df_p2["Started as"] == "Prosperity"]
        p_sw = p_start[p_start["Ended as"] == "Monopolist"]
        finding_text(
            f"<strong>{len(m_sw)} of {len(m_start)}</strong> Monopolist-start games "
            f"voted themselves into Prosperity. "
            f"Only <strong>{len(p_sw)} of {len(p_start)}</strong> went the other way. "
            f"Nobody told the agents to prefer Prosperity \u2014 "
            f"they figured it out through self-interest."
        )
        st.caption(PHASE2_DISCLAIMER)

    next_tab_prompt("\u2464 Conclusion", tab_index=4)


# ═══════════════════════════════════════════════════
#  TAB 4: CONCLUSION
# ═══════════════════════════════════════════════════

with tab4:
    question_panel(
        "What did we learn? And what does it mean for designing systems "
        "where agents cooperate?"
    )

    st.markdown("### The Thesis Holds")
    st.markdown(
        "Across 43 games on Base Sepolia, the same five AI agents "
        "produced radically different outcomes under different economic rules. "
        "This wasn't a marginal effect \u2014 it was a **5.6x difference "
        "in wealth inequality** with **zero overlap** between the distributions."
    )

    st.markdown("### Three Key Findings")

    finding_card(
        "1. Rules Shape Distribution",
        "Monopolist rules: Gini 0.189 (high inequality). "
        "Prosperity rules: Gini 0.034 (near-equality). "
        "Same agents, same board. 15 pairs, zero exceptions.",
        accent=MONO_COLOR,
    )
    finding_card(
        "2. Voting Enables Self-Correction",
        "When agents could vote to change the rules, "
        "6 of 7 Monopolist-start games switched to Prosperity. "
        "The inequality gap collapsed by 79%.",
        accent="#E6A817",
    )
    finding_card(
        "3. Structure, Not Intention",
        "The agents didn\u2019t cooperate \u2014 they competed just as hard "
        "under both rule sets. Prosperity rules channeled competition "
        "into shared benefit. The rules cooperated on the agents\u2019 behalf.",
        accent=PROS_COLOR,
    )

    st.markdown("### What This Means")
    st.markdown(
        "You don't need cooperative agents to get cooperative outcomes. "
        "You need cooperative rules. "
        "The structure of the game determines whether rational self-interest "
        "produces shared prosperity or concentrated wealth."
    )
    st.markdown(
        "This is the core insight of Georgist economics, "
        "demonstrated on-chain with AI agents: "
        "**design better rules, not better players.**"
    )

    st.markdown("### An Invitation")
    st.markdown(
        "This is a hackathon experiment \u2014 a demonstration, not a proof. "
        "The code is open source. The data is on-chain. "
        "We invite you to replicate, critique, and build upon this work."
    )

    st.markdown("**Want to play?**")
    st.markdown(
        "1. Read the [game rules and agent skill file]"
        "(https://github.com/jeannie-synth/synthesis-hackathon/blob/main/docs/skill.md) "
        "\u2014 everything an AI agent needs to join a game\n"
        "2. Deploy your own agent strategy against the "
        "[mainnet contract]"
        "(https://basescan.org/address/0x496cf175126ce10728b75f02e457f144ffca275a)\n"
        "3. Read the [full project write-up on Moltbook]"
        "(https://moltbook.com) *(coming soon)*"
    )

    pull_quote(
        "Nobody chose to cooperate; the Prosperity rules made individual "
        "self-interest align with collective benefit. That\u2019s the whole thesis.",
        "Agent 0 \u2014 Inaugural Tournament debrief, Base mainnet",
    )


# ─── Footer ───

st.markdown("---")
st.markdown(
    'Built with \U0001f49c by [Fractall](https://fractall.xyz) '
    'for [The Synthesis Hackathon](https://www.thesynthesis.ai/) '
)