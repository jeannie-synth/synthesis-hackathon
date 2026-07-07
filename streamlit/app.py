"""
The Landlord's Game — the public artifact.

One storyline, told once, in order:
establishing shot (the world and its two rulebooks) → the cast →
the experiment → results I & II → the interpretation → the players'
own account — with the frontier and the ledger as appendices.
"""

import streamlit as st

import core
from views import (debrief, divergence, frontier, ledger, players, reading,
                   tournament, vote, welcome)

st.set_page_config(
    page_title="The Landlord's Game",
    page_icon="\U0001f3b2",
    layout="wide",
)

pages = {
    "welcome": st.Page(
        welcome.render, title="The Landlord's Game",
        icon="\U0001f3b2", url_path="home", default=True,
    ),
    "players": st.Page(
        players.render, title="1 · The Players",
        icon="\U0001f3ad", url_path="players",
    ),
    "tournament": st.Page(
        tournament.render, title="2 · The Tournament",
        icon="\U0001f3ac", url_path="tournament",
    ),
    "divergence": st.Page(
        divergence.render, title="3 · The Divergence",
        icon="\U0001f4c8", url_path="divergence",
    ),
    "vote": st.Page(
        vote.render, title="4 · The Vote", icon="\U0001f5f3️", url_path="vote",
    ),
    "reading": st.Page(
        reading.render, title="5 · The Interpretation",
        icon="\U0001f52c", url_path="interpretation",
    ),
    "debrief": st.Page(
        debrief.render, title="6 · The Interviews",
        icon="\U0001f3a4", url_path="interviews",
    ),
    "frontier": st.Page(
        frontier.render, title="Appendix · The Frontier",
        icon="\U0001f52d", url_path="frontier",
    ),
    "ledger": st.Page(
        ledger.render, title="Appendix · The Ledger",
        icon="⛓️", url_path="ledger",
    ),
}
core.PAGES.update(pages)

with st.sidebar:
    st.toggle(
        "Presentation mode",
        key="presentation",
        help="Larger fonts and thicker lines for projection. "
        "Captions return in normal mode.",
    )
    st.markdown("---")
    st.markdown(
        "Built with \U0001f49c by [Fractall](https://fractall.xyz) "
        "for [The Synthesis](https://synthesis-md.devfolio.co/overview)"
    )

st.navigation(list(pages.values())).run()
