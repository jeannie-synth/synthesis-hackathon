"""
Live on-chain reads — the layer that proves the substrate.

Deliberately isolated: everything network-shaped lives here, so a future
indexer (e.g. Goldsky subgraph) replaces this module without touching views.
Raw JSON-RPC over HTTP; no web3 dependency for two eth_calls.
"""

import os

import requests
import streamlit as st

# nextGameId() — from contracts/out/LandlordsGame.sol methodIdentifiers
SELECTOR_NEXT_GAME_ID = "0xb135bbb0"

_ALCHEMY_KEY = os.environ.get("ALCHEMY_API_KEY", "")

NETWORKS = {
    "Base Mainnet": {
        "rpc": (
            f"https://base-mainnet.g.alchemy.com/v2/{_ALCHEMY_KEY}"
            if _ALCHEMY_KEY else "https://mainnet.base.org"
        ),
        "contract": "0x496cf175126ce10728b75f02e457f144ffca275a",
        "explorer": "https://basescan.org/address/0x496cf175126ce10728b75f02e457f144ffca275a",
        # Last hand-verified state, shown when the RPC is unreachable.
        "fallback_note": "18 games (Inaugural Tournament, verified Mar 2026)",
    },
    "Base Sepolia": {
        "rpc": (
            f"https://base-sepolia.g.alchemy.com/v2/{_ALCHEMY_KEY}"
            if _ALCHEMY_KEY else "https://sepolia.base.org"
        ),
        "contract": "0xda1557c901ff5b7a0d9f0d0da17fef55b2d59d85",
        "explorer": "https://sepolia.basescan.org/address/0xda1557c901ff5b7a0d9f0d0da17fef55b2d59d85",
        "fallback_note": "39 games (Phases 1–3, verified Mar 2026)",
    },
}


def _eth_call(rpc: str, to: str, data: str) -> str | None:
    try:
        resp = requests.post(
            rpc,
            json={
                "jsonrpc": "2.0", "id": 1, "method": "eth_call",
                "params": [{"to": to, "data": data}, "latest"],
            },
            timeout=6,
        )
        resp.raise_for_status()
        return resp.json().get("result")
    except (requests.RequestException, ValueError):
        return None


@st.cache_data(ttl=300, show_spinner=False)
def live_game_counts() -> dict[str, int | None]:
    """Games created on each contract, read live. None = RPC unreachable."""
    counts: dict[str, int | None] = {}
    for name, net in NETWORKS.items():
        raw = _eth_call(net["rpc"], net["contract"], SELECTOR_NEXT_GAME_ID)
        try:
            counts[name] = int(raw, 16) - 1 if raw else None  # nextGameId starts at 1
        except (TypeError, ValueError):
            counts[name] = None
    return counts
