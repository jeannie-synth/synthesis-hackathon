"""Page 2 — the experiment. Twin-game design, the chain as lab notebook.

The method page: how the one-variable comparison was actually run, and why
the record can be trusted before a single result is shown. Ends in the
viewing station: every game of every season, each with its own replay and
its own on-chain record — one table, both networks.
"""

import json
import os

import pandas as pd
import streamlit as st

import core

# Overridable for local review (the deployed viewer only updates on merge)
VIEWER_URL = os.environ.get(
    "VIEWER_URL", "https://jeannie-synth.github.io/synthesis-hackathon/viewer/"
)

INAUGURAL_DIR = core.DATA_ROOT.parent / "inaugural-tournament"


def _replay_link(game: dict, season_dir: str) -> str:
    """Full replay (control bar + turn banner): the viewer loads the game's
    JSON log, published alongside it under the viewer's games/ directory."""
    fname = f"game-{game['gameId']}-{game['mode'].lower()}.json"
    return f"{VIEWER_URL}?game=games/{season_dir}/{fname}"


def _live_link(contract: str, game_id: int, chain: str) -> str:
    """Viewer live mode: rebuilds the board from the contract's current
    state. No replay timeline — used where no turn log exists (mainnet)."""
    return f"{VIEWER_URL}?contract={contract}&gameId={game_id}&chain={chain}"


@st.cache_data
def _mainnet_games() -> list[dict]:
    """The Inaugural Tournament's game list: on-chain game IDs per round."""
    games = []
    for f in sorted(INAUGURAL_DIR.glob("round-*-games.json")):
        with open(f) as fp:
            r = json.load(fp)
        for mode in ("monopolist", "prosperity"):
            for gid in r.get(mode, []):
                games.append({"gameId": gid, "round": r.get("round"),
                              "mode": mode.capitalize()})
    games.sort(key=lambda g: g["gameId"])
    return games


def _viewing_station(data: dict) -> pd.DataFrame:
    rows = []
    for g in data["phase1"]:
        tx = core.creation_tx(g)
        rows.append({
            "Game": f"Game {g['gameId']}",
            "Season": "Phase 1 — fixed rules",
            "Board": g["mode"],
            "Champion": core.champion(g) or "—",
            "Replay": _replay_link(g, "phase1"),
            "On-chain": (f"{core.SEPOLIA_TX}{tx}" if tx
                         else f"{core.SEPOLIA_ADDRESS}{core.PHASE1_CONTRACT}"),
        })
    for g in data["phase2"]:
        end = core.end_mode(g)
        rows.append({
            "Game": f"Game {g['gameId']}",
            "Season": "Phase 2 — voting",
            "Board": (g["mode"] if end == g["mode"]
                      else f"{g['mode']} → {end}"),
            "Champion": core.champion(g) or "—",
            "Replay": _replay_link(g, "phase2"),
            "On-chain": f"{core.SEPOLIA_ADDRESS}{core.PHASE2_CONTRACT}",
        })
    for g in _mainnet_games():
        rows.append({
            "Game": f"Game {g['gameId']}",
            "Season": "Inaugural — mainnet",
            "Board": g["mode"],
            "Champion": "—",
            "Replay": _live_link(core.MAINNET_CONTRACT, g["gameId"], "base"),
            "On-chain": f"{core.MAINNET_ADDRESS}{core.MAINNET_CONTRACT}",
        })
    return pd.DataFrame(rows)


def render():
    core.act_chip("The experiment")
    st.title("One Economy, Run Twice")
    core.question_panel(
        "How do you isolate a single variable in an economy? Run the same "
        "economy twice — identical in everything but the one rule — and do "
        "it somewhere nobody can edit the record afterwards. Not even the "
        "experimenters."
    )

    st.markdown("## The twin-game design")
    st.markdown(
        "Games ran in **pairs**: one board under Monopolist rules, one under "
        "Prosperity rules, with the **same five players** in the **same "
        "shuffled turn order** — the shuffle is drawn once per pair and "
        "shared by both twins, so first-mover advantage cancels out. "
        "Whatever differs between a game and its twin is attributable to "
        "the rule set."
    )

    data = core.load_all()
    tx_count = sum(
        1 for g in data["phase1"] + data["phase2"]
        for t in g.get("turns", []) if t.get("txHash")
    )
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Phase 1 — fixed rules", "30 games",
              help="15 twin pairs on Base Sepolia; the rule set never changes "
              "mid-game")
    c2.metric("Phase 2 — voting enabled", "13 games",
              help="Same board, but the players can propose and vote on "
              "switching the rule set mid-game")
    c3.metric("Inaugural — Base mainnet", "18 games",
              help="LLM agents choosing their own strategies across 3 rounds; "
              "source of The Interviews page")
    c4.metric("On-chain moves logged", f"{tx_count:,}",
              help="Transactions recorded across Phases 1–2")

    st.markdown("## The chain is the lab notebook")
    st.markdown(
        "Every move — every dice roll, purchase, rent payment, and vote — is "
        "a transaction on Base, a public blockchain. The ledger is "
        "append-only: once a move lands, no one can revise it, including us. "
        "For an experiment, that is a tamper-proof lab notebook with a "
        "public timestamp on every line — anyone can re-derive every chart "
        "in this dashboard from the raw record."
    )

    st.markdown("### Every game: watch the replay, check the chain")
    df = _viewing_station(data)
    st.dataframe(
        df, use_container_width=True, hide_index=True, height=420,
        column_config={
            "Replay": st.column_config.LinkColumn(
                "Replay", display_text="▶ Watch"),
            "On-chain": st.column_config.LinkColumn(
                "On-chain", display_text="Basescan"),
        },
    )
    core.caption(
        "Replay links open the game viewer with the full turn-by-turn "
        "replay — play, pause, and a banner narrating each move. Inaugural "
        "games have no published turn log, so their links open the "
        "viewer's live mode: the board as the mainnet contract holds it "
        "now, without a timeline. On-chain links open Basescan: Phase 1 "
        "games open their first logged transaction; Phase 2 and Inaugural "
        "games open their contract, whose event log holds the full "
        "history. Champions are named for the scripted seasons; the "
        "mainnet agents' records are on The Interviews."
    )

    core.caption(
        "Phases 1–2 use the five scripted strategies for reproducibility. "
        "The mainnet Inaugural Tournament let LLM agents choose their own "
        "strategies; it produced the transcripts on The Interviews page."
    )

    core.next_page("The Divergence — every game, one picture", "divergence")
