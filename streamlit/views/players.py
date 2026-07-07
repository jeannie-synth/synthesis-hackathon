"""Page 1 — the cast. Five fixed personalities from the cooperation literature.

Introduced once, here. The establishing shot set the world; these are the
people in it. Nothing about them changes between rule sets — but their
season records don't hide anymore: the podiums live on this page, and the
per-game verification table lives on The Tournament.
"""

import base64
from pathlib import Path

import pandas as pd
import plotly.graph_objects as go
import streamlit as st

import core
from core import MONO_COLOR, PROS_COLOR

FIGURINES_DIR = Path(__file__).parent.parent / "assets" / "figurines"

LINEUP = [
    ("Extractive", "The Shark",
     "Buys everything it can afford, always. Never cooperates.",
     "Kelly's extractive owner · Always Defect"),
    ("Generative", "The Builder",
     "Buys only with money to spare. Keeps reserves. Cooperates by default.",
     "Kelly's generative owner · Always Cooperate"),
    ("Conditional", "The Mirror",
     "Treats you the way you treated everyone last round.",
     "Fischbacher's conditional cooperator · Tit-for-Tat"),
    ("FreeRider", "The Passenger",
     "Never buys. Rides on dividends and salary.",
     "Fischbacher's free rider · Ostrom's rational egoist"),
    ("Pavlov", "The Streak",
     "Repeats whatever made money last turn. Changes when it loses.",
     "Nowak & Sigmund's Win-Stay, Lose-Shift"),
]

_MEDALS = ["\U0001f947", "\U0001f948", "\U0001f949"]


@st.cache_data
def _figurine_uri(name: str) -> str | None:
    """Pixel-art token as a data URI, so it can live inside the card's HTML."""
    path = FIGURINES_DIR / f"{name.lower()}.png"
    if not path.exists():
        return None
    return "data:image/png;base64," + base64.b64encode(path.read_bytes()).decode()


def _season_records(data: dict) -> dict[str, dict[str, list[dict]]]:
    """Games won per player: Phase 1 split by rule set, Phase 2 whole.

    Phase 2 games can switch rule sets mid-play (up to 15 times in one
    game), so attributing those wins to either rule set would be arbitrary —
    the voting season is counted per game instead.
    """
    records: dict[str, dict[str, list[dict]]] = {
        name: {"mono": [], "pros": [], "vote": []} for name, *_ in LINEUP
    }
    for key, games in [("mono", data["p1_mono"]), ("pros", data["p1_pros"]),
                       ("vote", data["phase2"])]:
        for g in games:
            strat = core.champion(g)
            if strat in records:
                records[strat][key].append(g)
    return records


def _podium_chart(records: dict, key: str, ymax: int) -> go.Figure:
    """One board's champions podium. Step heights are the win counts
    themselves (not ranks), so the podium stays a zero-based bar chart;
    tied players share a step. Both podiums share the y range."""
    wins = {name: len(r[key]) for name, r in records.items()}
    # Dense ranking: tied win counts share a medal.
    steps = sorted({w for w in wins.values() if w > 0}, reverse=True)[:3]
    medal = {w: _MEDALS[i] for i, w in enumerate(steps)}

    def slot(name: str) -> int:
        """Podium arrangement: silver left, gold center, bronze right,
        winless on the floor at the far right."""
        rank = steps.index(wins[name]) if wins[name] in steps else 9
        return {1: 0, 0: 1, 2: 2}.get(rank, 3)

    order = sorted(wins, key=lambda n: (slot(n), n))
    fig = go.Figure(go.Bar(
        x=order, y=[wins[n] for n in order],
        marker_color=[core.STRATEGY_COLORS[n] for n in order],
        text=[f"{medal[wins[n]]} {wins[n]}" if wins[n] in medal else "0"
              for n in order],
        textposition="outside",
        textfont=dict(size=core.font_px(13)),
        hovertemplate="<b>%{x}</b>: %{y} wins<extra></extra>",
    ))
    core.apply_layout(
        fig, height=260,
        xaxis=dict(title="", tickfont=dict(size=core.font_px(12))),
        yaxis=dict(visible=False, range=[0, ymax + 1.5]),
        margin=dict(t=10, b=10, l=10, r=10),
        showlegend=False, bargap=0.15,
    )
    return fig


def _season_records_block(data: dict, records: dict):
    n_m, n_p = len(data["p1_mono"]), len(data["p1_pros"])

    st.markdown("## The champions swap when the rules do")
    ymax = max(len(r[k]) for r in records.values() for k in ("mono", "pros"))
    c1, c2 = st.columns(2)
    with c1:
        st.markdown(
            f"#### <span style='color:{MONO_COLOR}'>Monopolist board</span>",
            unsafe_allow_html=True,
        )
        st.plotly_chart(_podium_chart(records, "mono", ymax),
                        use_container_width=True)
    with c2:
        st.markdown(
            f"#### <span style='color:{PROS_COLOR}'>Prosperity board</span>",
            unsafe_allow_html=True,
        )
        st.plotly_chart(_podium_chart(records, "pros", ymax),
                        use_container_width=True)

    pav_m = len(records["Pavlov"]["mono"])
    pav_p = len(records["Pavlov"]["pros"])
    gen_m = len(records["Generative"]["mono"])
    gen_p = len(records["Generative"]["pros"])
    core.finding_text(
        f'Pavlov — "The Streak" — takes the Monopolist gold with '
        f"{pav_m} of {n_m} wins but manages just {pav_p} of {n_p} under "
        f'Prosperity. Generative — "The Builder" — wins {gen_m} '
        f"Monopolist games, then shares the Prosperity gold with "
        f"Conditional at {gen_p} wins each. Same players, same turn "
        "order: the rules pick different champions."
    )
    core.caption(core.SAMPLE_DISCLAIMER)
    core.caption(
        "Every one of these wins is traceable to the chain — the per-game "
        "viewing station is on The Tournament."
    )


def _ballot_block(data: dict, records: dict):
    n_v = len(data["phase2"])
    proposals = core.count_actions(data["phase2"], "proposeModeSwitch")
    votes = core.count_actions(data["phase2"], "vote")
    switches = core.count_actions(data["phase2"], "proposalPassed")

    st.markdown("## With the rules on the ballot, the wins spread out")
    vote_counts = sorted(
        ((name, len(r["vote"])) for name, r in records.items()),
        key=lambda x: (-x[1], x[0]),
    )
    tally = " · ".join(f"{name} {n}" for name, n in vote_counts)
    st.markdown(
        f"Phase 2 put the rules themselves on the ballot — {n_v} games, "
        "told in full on The Vote. Because those games can switch rule "
        "sets mid-play, wins are counted per game rather than per rule "
        f"set: {tally}."
    )
    st.markdown(
        "The political machinery those games ran on was deliberately bare. "
        "Any player could propose a rule switch, and every proposal went "
        f"straight to a vote — {proposals} proposals, {votes:,} votes, and "
        f"{switches} actual rule switches across the {n_v} games. Each "
        "round, every player also broadcast a one-bit signal of intent — "
        "a flag, not a message. That was the entire public life of these "
        "economies: **there was voting, but no discussion forum** — no "
        "debate before a ballot, no negotiation, no deals, no way to bind "
        "a promise. Whatever cooperation shows up in the results emerged "
        "without a single conversation."
    )


def render():
    data = core.load_all()
    records = _season_records(data)
    total_games = len(data["phase1"]) + len(data["phase2"])

    core.act_chip("The cast")
    st.title("Meet the Players")
    core.question_panel(
        "Five players, five fixed personalities — the same starting lineup in "
        "every game, drawn from a century of research on how people actually "
        "play economic games. If the two worlds turn out differently, it "
        "won't be because the players did."
    )

    cols = st.columns(5)
    for col, (name, nick, blurb, archetype) in zip(cols, LINEUP):
        color = core.STRATEGY_COLORS[name]
        wins = sum(len(games) for games in records[name].values())
        badge = (
            f'<div style="font-size: 0.8rem; color: #555; '
            f'margin-top: 0.5rem; font-weight: 600;">'
            f'{wins} wins in {total_games} games</div>'
        ) if total_games else ""
        uri = _figurine_uri(name)
        token = (
            f'<div style="text-align: center; margin-bottom: 0.4rem;">'
            f'<img src="{uri}" width="72" alt="{name} token" '
            f'style="image-rendering: pixelated;"/></div>'
        ) if uri else ""
        col.markdown(
            f'<div style="border-top: 4px solid {color}; background: #f8f9fa; '
            f'border-radius: 0 0 8px 8px; padding: 0.8rem; height: 100%;">'
            f'{token}'
            f'<div style="font-weight: 700; color: {color};">{name}</div>'
            f'<div style="font-size: 0.85rem; color: #888; '
            f'font-style: italic;">"{nick}"</div>'
            f'<div style="font-size: 0.85rem; color: #444; '
            f'margin-top: 0.4rem;">{blurb}</div>'
            f'{badge}'
            f'<div style="font-size: 0.75rem; color: #999; '
            f'margin-top: 0.5rem;">{archetype}</div></div>',
            unsafe_allow_html=True,
        )

    if total_games:
        totals = [sum(len(games) for games in records[name].values())
                  for name, *_ in LINEUP]
        core.finding_text(
            f"Across all {total_games} scripted games, every player won "
            f"somewhere — between {min(totals)} and {max(totals)} wins each. "
            "Nobody dominates the season overall — until you split the wins "
            "by board."
        )

    st.markdown("")
    st.markdown(
        "Each personality is a documented behavioral type, not an invention: "
        "the population mirrors what shows up when real people sit down to "
        "public-goods experiments — a hardened maximizer, an unconditional "
        "cooperator, a reciprocator, a free rider, and an adaptive learner."
    )

    if total_games:
        _season_records_block(data, records)

    with st.expander("Full behavior specifications and sources"):
        cast = pd.DataFrame([
            {"Strategy": "Extractive",
             "Behavior": "Always buys, always builds, never cooperates",
             "Archetype": "Kelly's extractive owner · Always Defect"},
            {"Strategy": "Generative",
             "Behavior": "Buys only with surplus, keeps reserves, cooperates by default",
             "Archetype": "Kelly's generative owner · Always Cooperate"},
            {"Strategy": "Conditional",
             "Behavior": "Cooperates if others did last round",
             "Archetype": "Fischbacher's conditional cooperator · Tit-for-Tat"},
            {"Strategy": "FreeRider",
             "Behavior": "Never buys, rides on dividends and salary",
             "Archetype": "Fischbacher's free rider · Ostrom's rational egoist"},
            {"Strategy": "Pavlov",
             "Behavior": "Repeats whatever made money last turn",
             "Archetype": "Nowak & Sigmund's Win-Stay, Lose-Shift"},
        ])
        st.dataframe(cast, use_container_width=True, hide_index=True)
        st.caption(
            "Sources: Marjorie Kelly, *Owning Our Future* (2012) · "
            "Fischbacher, Gächter & Fehr, *Are People Conditionally "
            "Cooperative?* (2001) · Robert Axelrod, *The Evolution of "
            "Cooperation* (1984) · Nowak & Sigmund, *A Strategy of "
            "Win-Stay, Lose-Shift* (1993) · Elinor Ostrom, *Governing the "
            "Commons* (1990)."
        )

    if total_games:
        _ballot_block(data, records)

    core.next_page("The Tournament — how the experiment ran", "tournament")
