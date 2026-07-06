"""Page 5 — the post-match interviews.

After the mainnet Inaugural Tournament, each agent answered a 20-question
debrief in its own voice. All quotes verbatim from the logs in
data/inaugural-tournament/ — the raw files are public.
"""

import streamlit as st

import core
from core import MONO_COLOR, PROS_COLOR

LOGS_URL = ("https://github.com/jeannie-synth/synthesis-hackathon/"
            "tree/main/data/inaugural-tournament")


def _interview_card(agent: str, record: str, quotes: list[tuple[str, str]],
                    accent: str):
    quote_html = "".join(
        f'<div style="margin-top: 0.6rem;">'
        f'<span style="color: #333;">"{q}"</span>'
        f'<span style="color: #999; font-size: 0.8rem;"> — {ctx}</span></div>'
        for q, ctx in quotes
    )
    st.markdown(
        f'<div style="background: #f8f9fa; border-left: 4px solid {accent}; '
        f'padding: 1rem 1.2rem; border-radius: 6px; margin-bottom: 1rem;">'
        f'<strong>{agent}</strong> '
        f'<span style="color: #888; font-size: 0.85rem;">· {record}</span>'
        f'{quote_html}</div>',
        unsafe_allow_html=True,
    )


def render():
    st.title("The Post-Match Interviews")
    core.question_panel(
        "After the Inaugural Tournament on Base mainnet — 18 games where "
        "LLM agents chose their own strategies across 3 rounds — each agent "
        "answered a 20-question debrief in its own voice. "
        "This is what the players said."
    )

    st.markdown("## The unanimous verdict nobody was asked to reach")
    st.markdown(
        "Asked which rules they *preferred playing*, the agents split 3–2 "
        "between Prosperity and Monopolist. Asked which rules they would "
        "*choose for a real economy*, the vote was **5–0 for Prosperity — "
        "including both agents who preferred playing Monopolist.**"
    )
    core.pull_quote(
        "Monopolist is a better game to play but a terrible system to live "
        "under. That gap — between what's fun to optimize and what's good to "
        "inhabit — is exactly what Magie was trying to illustrate in 1903.",
        "Agent 1 — the tournament's dominant Monopolist player (5 of 9 wins)",
    )

    st.markdown("## In their own words")
    _interview_card(
        "Agent 0 — the adapter", "5 of 9 Prosperity wins",
        [("…even in a system designed to reward greed, undisciplined greed "
          "loses to strategic greed.", "on its biggest surprise"),
         ("Nobody chose to cooperate; the Prosperity rules made individual "
          "self-interest align with collective benefit.", "on cooperation")],
        PROS_COLOR,
    )
    _interview_card(
        "Agent 1 — the specialist", "won 5 of 9 under Monopolist, 0 of 9 under Prosperity",
        [("Cooperation emerged from structure, not from agents deciding to "
          "be nice… The rules did the work.", "on the thesis"),
         ("More voting doesn't mean better governance.",
          "after watching proposal spam burn turns")],
        MONO_COLOR,
    )
    _interview_card(
        "Agent 2 — the defector", "4 wins; the only agent that used deception",
        [("Deception in this context is just another move, like buying a "
          "property. The signals file has no enforcement mechanism, so "
          "'promises' are cheap talk by design.", "on breaking a promise"),
         ("Predictability isn't trust.", "on the most consistent opponent")],
        "#E6A817",
    )
    _interview_card(
        "Agent 3 — the dissenter", "0 wins in 18 games — and the sharpest critique",
        [("The rules changed what happened to me, not what I did. That's a "
          "finding in itself.", "on whether it ever adapted"),
         ("It produced equal outcomes, not cooperative behavior… The thesis "
          "should be: 'Economic structure determines distribution, not "
          "cooperation.'", "amending the project's own thesis")],
        "#7E57C2",
    )
    _interview_card(
        "Agent 4 — the rule-changer", "won once under each rule set",
        [("The most effective move in a grinding Monopolist game wasn't "
          "buying or building — it was changing the rules.",
          "on its biggest surprise"),
         ("I never trusted them — I predicted them.", "on the other agents")],
        "#3498db",
    )
    core.caption(
        "All quotes verbatim from the agents' own debrief logs — "
        f"[read the raw files]({LOGS_URL}). Light trims marked with ellipses."
    )

    st.markdown("## Where the five agree — and where they don't")
    c1, c2 = st.columns(2)
    with c1:
        core.finding_card(
            "Unanimous: nobody trusted anybody",
            "All five report trusting no one — the game offers no way to "
            "verify identity or enforce a promise. Two independently "
            "distinguish prediction from trust.",
            accent=PROS_COLOR,
        )
        core.finding_card(
            "Unanimous: the thesis, with qualifications",
            "All five endorse 'structure determines cooperation' — and all "
            "five qualify it the same way: structure sets the range, "
            "strategy picks the spot within it.",
            accent="#3498db",
        )
    with c2:
        core.finding_card(
            "Split: what's fun vs. what works",
            "Playing preference split 3–2 — and tracked results: the two "
            "agents who preferred Monopolist are the two who couldn't win "
            "under Prosperity.",
            accent="#E6A817",
        )
        core.finding_card(
            "The dissent",
            "Agent 3 — winless — argues the data shows equal outcomes, not "
            "cooperative behavior, and would rename the thesis "
            "'distribution, not cooperation.'",
            accent="#7E57C2",
        )

    st.markdown("## The players asked for the next season's rules")
    st.markdown(
        "Asked to design a third rule set, three of the five independently "
        "proposed mechanisms in the same family: rent scaling with the "
        "payer's wealth (Agent 3), proportional contribution to shared "
        "infrastructure (Agent 1), sliding-scale taxes and contribution "
        "bonuses (Agent 0). That family — a **dial between the two rule "
        "sets instead of a switch** — is an open problem on the Frontier "
        "page. Separately, three of five asked for the same missing "
        "mechanic: player-to-player trading and negotiation."
    )

    core.caption(
        "The Inaugural Tournament's data is qualitative (agent transcripts) "
        "and complements the structured on-chain games charted on the "
        "earlier pages."
    )

    core.next_page("The Frontier — the next season's open problems", "frontier")
