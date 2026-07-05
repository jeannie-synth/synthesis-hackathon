"""
Shared foundation for The Landlord's Game dashboard.

Data loading, metric computation, the design system (colors, chart theme,
presentation mode), and UI helpers. Views import from here; nothing here
imports from views.
"""

import json
import os
from pathlib import Path

import pandas as pd
import streamlit as st

# ─── Data sources ───

DATA_ROOT = Path(
    os.environ.get("DATA_ROOT", str(Path(__file__).parent.parent / "data" / "games"))
)
PHASE1_TOURNAMENT = "tournament-1773831296297"
PHASE2_TOURNAMENT = "tournament-1773910613854"

SEPOLIA_TX = "https://sepolia.basescan.org/tx/"

SAMPLE_DISCLAIMER = "Based on 15 games per condition. Directional, not statistically conclusive."
PHASE2_DISCLAIMER = "Based on 13 games (7 M-start, 6 P-start). Directional, not statistically conclusive."

# ─── Design system ───
# One job per chart: color encodes the rule set, everywhere.
# The strategy palette appears only where strategy is the subject.

MONO_COLOR = "#A93B6B"
PROS_COLOR = "#0097A7"
MODE_COLORS = {"Monopolist": MONO_COLOR, "Prosperity": PROS_COLOR}
GREY = "#b0bec5"
ACCENT = "#E6A817"

STRATEGY_COLORS = {
    "Extractive": "#A93B6B",
    "Generative": "#0097A7",
    "Conditional": "#3498db",
    "FreeRider": "#E6A817",
    "Pavlov": "#7E57C2",
}


def is_presentation() -> bool:
    return st.session_state.get("presentation", False)


def font_px(base: int = 14) -> int:
    """Font size scaled for projector readability in presentation mode."""
    return int(base * 1.4) if is_presentation() else base


def line_w(base: int = 3) -> int:
    return base + 2 if is_presentation() else base


def apply_layout(fig, height: int = 420, **overrides):
    """The single styling gate every figure passes through.

    Enforces the declutter rules: white template, faint gridlines,
    no borders, scaled fonts. Views add chart-specific layout via overrides.
    """
    fig.update_layout(
        template="plotly_white",
        height=int(height * 1.15) if is_presentation() else height,
        font=dict(size=font_px(14)),
        title=None,  # titles live in markdown headers, not in the figure
        margin=dict(t=30, r=20),
        **overrides,
    )
    fig.update_xaxes(gridcolor="rgba(0,0,0,0.08)", zerolinecolor="rgba(0,0,0,0.15)")
    fig.update_yaxes(gridcolor="rgba(0,0,0,0.08)", zerolinecolor="rgba(0,0,0,0.15)")
    return fig


# ─── Data loading ───


@st.cache_data
def load_tournament(tournament_id: str) -> list[dict]:
    path = DATA_ROOT / tournament_id
    if not path.exists():
        return []
    games = []
    for f in sorted(path.glob("game-*.json")):
        with open(f) as fp:
            games.append(json.load(fp))
    games.sort(key=lambda g: g.get("gameId", 0))
    return games


def split_by_mode(games: list[dict]) -> tuple[list[dict], list[dict]]:
    mono = [g for g in games if g.get("mode") == "Monopolist"]
    pros = [g for g in games if g.get("mode") == "Prosperity"]
    return mono, pros


def load_all() -> dict:
    """Everything the pages need, loaded once."""
    phase1 = load_tournament(PHASE1_TOURNAMENT)
    phase2 = load_tournament(PHASE2_TOURNAMENT)
    p1_mono, p1_pros = split_by_mode(phase1)
    p2_mono, p2_pros = split_by_mode(phase2)
    return {
        "phase1": phase1, "phase2": phase2,
        "p1_mono": p1_mono, "p1_pros": p1_pros,
        "p2_mono": p2_mono, "p2_pros": p2_pros,
    }


# ─── Metrics ───


def gini(values: list[float]) -> float:
    if not values or sum(values) == 0:
        return 0.0
    sorted_v = sorted(values)
    n = len(sorted_v)
    cumsum = sum((i + 1) * v for i, v in enumerate(sorted_v))
    return (2 * cumsum) / (n * sum(sorted_v)) - (n + 1) / n


def final_ginis(games: list[dict]) -> list[float]:
    return [g["result"]["giniCoefficient"] for g in games if g.get("result")]


def mean(values: list[float]) -> float:
    return sum(values) / len(values) if values else 0.0


def compute_gini_timeseries(game: dict) -> list[dict]:
    rows = []
    for snap in game.get("roundSnapshots", []):
        net_worths = [p["netWorth"] for p in snap["players"]]
        rows.append({"round": snap["round"], "gini": gini(net_worths)})
    return rows


def addr_to_strategy(game: dict) -> dict[str, str]:
    """Map player address → strategy name, from the turn log."""
    mapping: dict[str, str] = {}
    for turn in game.get("turns", []):
        strat = turn.get("strategy")
        agent = turn.get("agent", "")
        idx_str = agent.rsplit("-", 1)[-1]
        if idx_str.isdigit():
            idx = int(idx_str)
            if idx < len(game.get("playerAddresses", [])):
                addr = game["playerAddresses"][idx]
                mapping[addr] = strat or agent.rsplit("-", 1)[0]
    return mapping


def net_worth_rows(games: list[dict]) -> pd.DataFrame:
    """One row per player per game: final net worth, strategy, rule set."""
    rows = []
    for game in games:
        result = game.get("result")
        if not result:
            continue
        strat_map = addr_to_strategy(game)
        for i, nw in enumerate(result["netWorths"]):
            addr = game["playerAddresses"][i]
            rows.append({
                "Rule Set": game["mode"], "Net Worth ($)": nw,
                "Strategy": strat_map.get(addr, f"Player-{i}"),
                "Game": f"Game {game['gameId']}",
            })
    return pd.DataFrame(rows)


def count_actions(games: list[dict], action_type: str) -> int:
    return sum(1 for g in games for t in g.get("turns", []) if t["action"] == action_type)


def end_mode(game: dict) -> str:
    """The rule set a game ended under (voting can change it mid-game)."""
    raw = (game.get("result") or {}).get("mode")
    if isinstance(raw, int):
        return "Monopolist" if raw == 0 else "Prosperity"
    if isinstance(raw, str):
        return raw
    current = game.get("mode", "Unknown")
    for t in game.get("turns", []):
        if t["action"] == "proposalPassed":
            current = t.get("details", {}).get("newMode", current)
    return current


def creation_tx(game: dict) -> str | None:
    """First logged transaction — the game's on-chain anchor."""
    for t in game.get("turns", []):
        if t.get("txHash"):
            return t["txHash"]
    return None


# ─── UI helpers ───


def question_panel(text: str):
    st.markdown(
        f'<div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); '
        f'color: #e0e0e0; padding: 1.2rem 1.5rem; border-radius: 10px; '
        f'border-left: 4px solid {PROS_COLOR}; margin-bottom: 1.5rem; '
        f'font-size: {1.05 * (1.3 if is_presentation() else 1):.2f}rem; '
        f'font-style: italic;">{text}</div>',
        unsafe_allow_html=True,
    )


def finding_text(text: str):
    """The number under the chart; the title above it carries the claim."""
    size = 1.25 if is_presentation() else 0.95
    st.markdown(
        f'<p style="text-align: center; color: #555; font-size: {size}rem; '
        f'max-width: 720px; margin: 0.5rem auto 1.5rem auto;">{text}</p>',
        unsafe_allow_html=True,
    )


def caption(text: str):
    """Disclaimers and fine print. Hidden in presentation mode, mandatory otherwise."""
    if not is_presentation():
        st.caption(text)


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
        f'display: inline-block;">— {attribution}</span></div>',
        unsafe_allow_html=True,
    )


def verify_expander(games: list[dict], label: str = "Verify the underlying games on-chain"):
    """Per-game Basescan links. Every inferential chart earns one."""
    if is_presentation():
        return
    linked = [(g, creation_tx(g)) for g in games]
    linked = [(g, tx) for g, tx in linked if tx]
    if not linked:
        return
    with st.expander(f"\U0001f517 {label}"):
        cols = st.columns(3)
        for i, (g, tx) in enumerate(linked):
            cols[i % 3].markdown(
                f"[Game {g['gameId']} ({g['mode'][:4]})]({SEPOLIA_TX}{tx})"
            )
        st.caption(
            "Each link opens the game's first logged transaction on Base Sepolia. "
            "From there, the full game is traceable through the contract's events."
        )


# Page registry — populated by app.py before navigation runs, so views can
# link to each other without importing app (which would be circular).
PAGES: dict[str, "st.Page"] = {}


def next_page(label: str, key: str):
    st.markdown("---")
    if key in PAGES:
        st.page_link(PAGES[key], label=f"**Next: {label} →**")
