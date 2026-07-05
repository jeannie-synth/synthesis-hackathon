"""
The Landlord's Game — the public artifact.

Same board, two rule sets, opposite worlds. Six pages, one argument:
Landing → Rules → Divergence → Vote → Frontier → Ledger.
"""

import streamlit as st

import core
from views import divergence, frontier, landing, ledger, rules, vote

st.set_page_config(
    page_title="The Landlord's Game",
    page_icon="\U0001f3b2",
    layout="wide",
)

pages = {
    "landing": st.Page(
        landing.render, title="Same Board, Two Rules",
        icon="\U0001f3b2", url_path="home", default=True,
    ),
    "rules": st.Page(
        rules.render, title="1 · The Rules", icon="⚖️", url_path="rules",
    ),
    "divergence": st.Page(
        divergence.render, title="2 · The Divergence",
        icon="\U0001f4c8", url_path="divergence",
    ),
    "vote": st.Page(
        vote.render, title="3 · The Vote", icon="\U0001f5f3️", url_path="vote",
    ),
    "frontier": st.Page(
        frontier.render, title="4 · The Frontier",
        icon="\U0001f52d", url_path="frontier",
    ),
    "ledger": st.Page(
        ledger.render, title="5 · The Ledger", icon="⛓️", url_path="ledger",
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
        "for [The Synthesis](https://www.thesynthesis.ai/)"
    )

st.navigation(list(pages.values())).run()
