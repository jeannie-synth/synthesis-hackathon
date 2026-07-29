"""
The Landlord's Game — the public artifact.

One storyline, told once, in order:
establishing shot (the world and its two rulebooks) → the cast →
the experiment → results I & II → the interpretation → the players'
own account — with the frontier and the ledger as appendices.
"""

import streamlit as st
import streamlit.components.v1 as components

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
        "for [The Synthesis Hackathon](https://synthesis-md.devfolio.co/overview)"
        "[Repo in github](https://github.com/jeannie-synth/synthesis-hackathon)"
    )

st.navigation(list(pages.values())).run()

# Microsoft Clarity. Streamlit only runs scripts inside a component iframe;
# the iframe is same-origin (srcdoc), so install the tag on the parent page —
# recordings capture the app itself, not the empty iframe. Guarded so
# Streamlit reruns don't stack duplicate tags.
components.html(
    """<script type="text/javascript">
    (function (c, l, a, r, i, t, y) {
        if (l.getElementById("ms-clarity")) return;
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r); t.async = 1; t.id = "ms-clarity";
        t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window.parent, window.parent.document, "clarity", "script", "vj3h2cw0yo");
    </script>""",
    height=0,
)
