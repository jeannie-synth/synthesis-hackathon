#!/usr/bin/env node
/**
 * Enrich existing game JSON files with transaction hashes.
 *
 * Strategy: For each JSONL txConfirmed entry, find the matching tx in the block
 * by (from address, to address, nonce). Nonce uniquely identifies a tx from a given sender.
 * Then correlate JSONL→game turns by timestamp proximity.
 *
 * Usage: node scripts/enrich-tx-hashes.mjs [tournament-dir] [contract-address]
 * Default tournament: data/games/tournament-1773831296297
 * Contract auto-detected from first block if not provided.
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

// ─── Config ───

const RPC_URL = process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org";
const TOURNAMENT_DIR = process.argv[2] || "data/games/tournament-1773831296297";
let CONTRACT = (process.argv[3] || process.env.ENRICH_CONTRACT || "").toLowerCase();

// Known agent addresses (from AGENT_MNEMONIC HD derivation)
const KNOWN_AGENTS = [
  "0xae42d435907C78C1a9ccc9508ee9af76A301D716",
  "0x1bF0762288A5e4FD67fD2B0B08321865C8a47a83",
  "0x2F5127d166C77eA01941cF14C7b7F0221BBaFf33",
  "0xA5CE87AB26BeeB961d84C80CAF75384eBdff852C",
  "0x85e33926d447c2696A7779Fa67f226d6EaF5b1d5",
].map(a => a.toLowerCase());

const KNOWN_AGENTS_SET = new Set(KNOWN_AGENTS);

// Map agent prefix (first 10 chars as logged in JSONL) to full address
const PREFIX_TO_ADDR = {};
for (const addr of KNOWN_AGENTS) {
  PREFIX_TO_ADDR[addr.slice(0, 10)] = addr;
}

// ─── RPC helpers ───

let rpcId = 1;
async function rpcCall(method, params) {
  const resp = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: rpcId++, method, params }),
  });
  const json = await resp.json();
  if (json.error) throw new Error(`RPC error: ${json.error.message}`);
  return json.result;
}

const blockCache = new Map();
async function getBlock(blockNumber) {
  const hex = "0x" + blockNumber.toString(16);
  if (blockCache.has(hex)) return blockCache.get(hex);
  const block = await rpcCall("eth_getBlockByNumber", [hex, true]);
  blockCache.set(hex, block);
  return block;
}

// ─── Auto-detect contract address ───

async function detectContract(confirmed) {
  // Get first block, find tx from our agent → that's the contract
  const firstBlock = await getBlock(confirmed[0].blockNumber);
  for (const tx of firstBlock.transactions) {
    if (KNOWN_AGENTS_SET.has(tx.from?.toLowerCase()) && tx.to) {
      return tx.to.toLowerCase();
    }
  }
  throw new Error("Could not auto-detect contract address from first block");
}

// ─── Enrichment logic ───

function extractGameId(filename) {
  const m = filename.match(/game-(\d+)-/);
  return m ? parseInt(m[1]) : null;
}

async function enrichGame(tournamentDir, gameFile) {
  const gameId = extractGameId(gameFile);
  if (gameId === null) return { file: gameFile, enriched: 0, skipped: "no gameId" };

  const gamePath = join(tournamentDir, gameFile);
  const jsonlPath = join(tournamentDir, `orchestrator-${gameId}.jsonl`);

  const game = JSON.parse(readFileSync(gamePath, "utf-8"));

  let jsonlEntries;
  try {
    const lines = readFileSync(jsonlPath, "utf-8").trim().split("\n");
    jsonlEntries = lines.map(l => JSON.parse(l));
  } catch {
    return { file: gameFile, enriched: 0, skipped: "no JSONL" };
  }

  // Extract txConfirmed entries (these have blockNumber)
  const confirmed = jsonlEntries.filter(e => e.event === "txConfirmed" && e.blockNumber);
  if (confirmed.length === 0) {
    return { file: gameFile, enriched: 0, skipped: "no txConfirmed entries" };
  }

  // Also get txSent entries (these have nonce)
  const sent = jsonlEntries.filter(e => e.event === "txSent");

  // Pair sent→confirmed by matching agent + sequential ordering
  // txSent and txConfirmed alternate per-agent: sent[i].agent === confirmed[j].agent
  // Build agent-grouped pairs
  const agentSentQueues = {};
  for (const s of sent) {
    if (!agentSentQueues[s.agent]) agentSentQueues[s.agent] = [];
    agentSentQueues[s.agent].push(s);
  }
  const agentConfirmedQueues = {};
  for (const c of confirmed) {
    if (!agentConfirmedQueues[c.agent]) agentConfirmedQueues[c.agent] = [];
    agentConfirmedQueues[c.agent].push(c);
  }

  // For each confirmed, find its matching sent (same agent, same position in queue) to get nonce
  const confirmedWithNonce = [];
  const agentConfIdx = {};
  for (const c of confirmed) {
    if (!agentConfIdx[c.agent]) agentConfIdx[c.agent] = 0;
    const idx = agentConfIdx[c.agent]++;
    const sentQ = agentSentQueues[c.agent] || [];
    const matchingSent = sentQ[idx];
    confirmedWithNonce.push({
      ...c,
      nonce: matchingSent ? matchingSent.nonce : undefined,
    });
  }

  // Collect unique blocks
  const uniqueBlocks = [...new Set(confirmed.map(c => c.blockNumber))];
  console.log(`  ${gameFile}: ${confirmed.length} txs across ${uniqueBlocks.length} blocks`);

  for (let i = 0; i < uniqueBlocks.length; i++) {
    await getBlock(uniqueBlocks[i]);
    if (i > 0 && i % 50 === 0) {
      console.log(`    fetched ${i}/${uniqueBlocks.length} blocks...`);
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // Auto-detect contract if needed
  if (!CONTRACT) {
    CONTRACT = await detectContract(confirmedWithNonce);
    console.log(`  Auto-detected contract: ${CONTRACT}`);
  }

  // Match JSONL entries → block txs using (from, to, nonce)
  const txHashByTs = new Map();

  for (const entry of confirmedWithNonce) {
    const block = blockCache.get("0x" + entry.blockNumber.toString(16));
    if (!block?.transactions) continue;

    const agentAddr = PREFIX_TO_ADDR[entry.agent];
    if (!agentAddr) continue;

    let matchingTx;

    if (entry.nonce !== undefined) {
      // Best match: nonce is unique per sender
      const nonceHex = "0x" + entry.nonce.toString(16);
      matchingTx = block.transactions.find(tx =>
        tx.from?.toLowerCase() === agentAddr &&
        tx.to?.toLowerCase() === CONTRACT &&
        tx.nonce === nonceHex
      );
    }

    if (!matchingTx) {
      // Fallback: match by from + to (may be ambiguous if multiple txs in same block)
      matchingTx = block.transactions.find(tx =>
        tx.from?.toLowerCase() === agentAddr &&
        tx.to?.toLowerCase() === CONTRACT
      );
    }

    if (matchingTx) {
      txHashByTs.set(entry.ts, matchingTx.hash);
    }
  }

  console.log(`    matched ${txHashByTs.size}/${confirmed.length} txs to hashes`);

  // Correlate JSONL timestamps to game JSON turns
  const WINDOW_MS = 5000;
  const jsonlWithHash = confirmedWithNonce
    .filter(e => txHashByTs.has(e.ts))
    .map(e => ({ ts: e.ts, fn: e.fn, agent: e.agent, txHash: txHashByTs.get(e.ts) }))
    .sort((a, b) => a.ts - b.ts);

  const WRITE_ACTIONS = new Set(["roll", "buy", "build", "jailBuyout", "jailWait", "proposeModeSwitch", "vote", "endTurn"]);
  let enriched = 0;
  const usedJsonl = new Set();

  for (const turn of game.turns) {
    if (!WRITE_ACTIONS.has(turn.action)) continue;
    if (turn.txHash) continue;

    let bestMatch = null;
    let bestDelta = Infinity;

    for (let i = 0; i < jsonlWithHash.length; i++) {
      if (usedJsonl.has(i)) continue;
      const delta = Math.abs(jsonlWithHash[i].ts - turn.timestamp);
      if (delta < bestDelta && delta <= WINDOW_MS) {
        bestDelta = delta;
        bestMatch = i;
      }
    }

    if (bestMatch !== null) {
      turn.txHash = jsonlWithHash[bestMatch].txHash;
      usedJsonl.add(bestMatch);
      enriched++;
    }
  }

  writeFileSync(gamePath, JSON.stringify(game, null, 2));
  return { file: gameFile, enriched, total: game.turns.length };
}

// ─── Main ───

async function main() {
  console.log(`Enriching tournament: ${TOURNAMENT_DIR}`);
  console.log(`RPC: ${RPC_URL}`);
  console.log(`Contract: ${CONTRACT || "(auto-detect)"}`);
  console.log();

  const files = readdirSync(TOURNAMENT_DIR).filter(f => f.startsWith("game-") && f.endsWith(".json"));
  console.log(`Found ${files.length} game files\n`);

  const results = [];
  for (const file of files.sort()) {
    try {
      const result = await enrichGame(TOURNAMENT_DIR, file);
      results.push(result);
      if (result.enriched > 0) {
        console.log(`  >> ${result.enriched}/${result.total} turns enriched\n`);
      } else {
        console.log(`  >> ${result.skipped || "0 matches"}\n`);
      }
    } catch (e) {
      console.error(`  !! ${file}: ${e.message}\n`);
      results.push({ file, enriched: 0, skipped: e.message });
    }
  }

  console.log("── Summary ──");
  const totalEnriched = results.reduce((s, r) => s + (r.enriched || 0), 0);
  const totalFiles = results.filter(r => r.enriched > 0).length;
  console.log(`${totalEnriched} turns enriched across ${totalFiles} files`);
  console.log(`${blockCache.size} unique blocks fetched`);
}

main().catch(e => { console.error(e); process.exit(1); });
