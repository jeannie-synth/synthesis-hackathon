"""
The Landlord's Game — the public artifact.

Same board, two rule sets, opposite worlds. Six pages, one argument:
Landing → Rules → Divergence → Vote → Frontier → Ledger.
"""

import streamlit as st

import core
from views import divergence, frontier, landing, ledger, rules, vote, welcome

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
    "landing": st.Page(
        landing.render, title="1 · The Evidence",
        icon="\U0001f4a1", url_path="evidence",
    ),
    "rules": st.Page(
        rules.render, title="2 · The Rules", icon="⚖️", url_path="rules",
    ),
    "divergence": st.Page(
        divergence.render, title="3 · The Divergence",
        icon="\U0001f4c8", url_path="divergence",
    ),
    "vote": st.Page(
        vote.render, title="4 · The Vote", icon="\U0001f5f3️", url_path="vote",
    ),
    "frontier": st.Page(
        frontier.render, title="5 · The Frontier",
        icon="\U0001f52d", url_path="frontier",
    ),
    "ledger": st.Page(
        ledger.render, title="6 · The Ledger", icon="⛓️", url_path="ledger",
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
