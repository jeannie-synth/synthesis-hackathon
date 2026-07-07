"""Page 1 — the cast. Five fixed personalities from the cooperation literature.

Introduced once, here. The establishing shot set the world; these are the
people in it. Nothing about them changes between rule sets.
"""

import pandas as pd
import streamlit as st

import core

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
     "Buys almost nothing. Rides on dividends and salary.",
     "Fischbacher's free rider · Ostrom's rational egoist"),
    ("Pavlov", "The Streak",
     "Repeats whatever made money last turn. Changes when it loses.",
     "Nowak & Sigmund's Win-Stay, Lose-Shift"),
]


def render():
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
        col.markdown(
            f'<div style="border-top: 4px solid {color}; background: #f8f9fa; '
            f'border-radius: 0 0 8px 8px; padding: 0.8rem; height: 100%;">'
            f'<div style="font-weight: 700; color: {color};">{name}</div>'
            f'<div style="font-size: 0.85rem; color: #888; '
            f'font-style: italic;">"{nick}"</div>'
            f'<div style="font-size: 0.85rem; color: #444; '
            f'margin-top: 0.4rem;">{blurb}</div>'
            f'<div style="font-size: 0.75rem; color: #999; '
            f'margin-top: 0.5rem;">{archetype}</div></div>',
            unsafe_allow_html=True,
        )

    st.markdown("")
    st.markdown(
        "Each personality is a documented behavioral type, not an invention: "
        "the population mirrors what shows up when real people sit down to "
        "public-goods experiments — a hardened maximizer, an unconditional "
        "cooperator, a reciprocator, a free rider, and an adaptive learner."
    )

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
             "Behavior": "Avoids buying, rides on dividends and salary",
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

    core.next_page("The Tournament — how the experiment ran", "tournament")
