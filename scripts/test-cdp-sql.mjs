import * as crypto from "crypto";
import { SignJWT, importPKCS8 } from "jose";

const keyId = process.env.CDP_API_KEY_ID;
const keySecret = process.env.CDP_API_KEY_SECRET;

if (!keyId || !keySecret) {
  console.error("Missing CDP_API_KEY_ID or CDP_API_KEY_SECRET");
  process.exit(1);
}

const API_HOST = "api.cdp.coinbase.com";
const API_PATH = "/platform/v2/data/query/run";
const API_URL = `https://${API_HOST}${API_PATH}`;

async function makeJwt() {
  // CDP Ed25519 secret is base64-encoded. May be 64 bytes (seed+pub) or 32 bytes (seed only).
  // PKCS8 needs just the 32-byte seed.
  const rawKey = Buffer.from(keySecret, "base64");
  const seed = rawKey.length > 32 ? rawKey.subarray(0, 32) : rawKey;

  // Ed25519 PKCS8 DER prefix (RFC 8410)
  const pkcs8Prefix = Buffer.from("302e020100300506032b657004220420", "hex");
  const pkcs8Der = Buffer.concat([pkcs8Prefix, seed]);
  const pkcs8Pem = `-----BEGIN PRIVATE KEY-----\n${pkcs8Der.toString("base64")}\n-----END PRIVATE KEY-----`;

  const privateKey = await importPKCS8(pkcs8Pem, "EdDSA");
  const nonce = crypto.randomBytes(16).toString("hex");

  const jwt = await new SignJWT({
    sub: keyId,
    iss: "cdp",
    aud: ["cdp_service"],
    uri: `POST ${API_HOST}${API_PATH}`,
  })
    .setProtectedHeader({ alg: "EdDSA", typ: "JWT", kid: keyId, nonce })
    .setIssuedAt()
    .setExpirationTime("2m")
    .sign(privateKey);

  return jwt;
}

async function runQuery(name, sql) {
  console.log(`\n=== ${name} ===`);
  try {
    const token = await makeJwt();
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`HTTP ${res.status}: ${text.slice(0, 500)}`);
      return;
    }

    const data = await res.json();
    const rows = data.result || data.rows || [];
    console.log(`Rows: ${rows.length}`);
    for (const row of rows.slice(0, 5)) {
      console.log(JSON.stringify(row));
    }
    if (rows.length > 5) console.log(`... and ${rows.length - 5} more`);
  } catch (e) {
    console.error(`Error: ${e.message}`);
  }
}

// Test 1: Base mainnet — WETH contract (known address, small volume)
await runQuery(
  "WETH deposit events on Base (3)",
  "SELECT event_name, block_number, transaction_hash FROM base.events WHERE address = '0x4200000000000000000000000000000000000006' LIMIT 3"
);

// Test 2: Base Sepolia — known Sepolia contract (Base bridge)
await runQuery(
  "Base Sepolia events from bridge (3)",
  "SELECT event_name, block_number, transaction_hash FROM base_sepolia.events WHERE address = '0x4200000000000000000000000000000000000010' LIMIT 3"
);

// Test 3: Schema discovery — what columns exist?
await runQuery(
  "Column names in base.events",
  "SELECT * FROM base.events WHERE address = '0x4200000000000000000000000000000000000006' LIMIT 1"
);

// Contract-specific if available
const contract = process.env.CONTRACT_ADDRESS;
if (contract) {
  await runQuery(
    "Our contract — event census",
    `SELECT event_name, count() AS cnt
     FROM base.events
     WHERE address = '${contract.toLowerCase()}'
     GROUP BY event_name
     ORDER BY cnt DESC`
  );
} else {
  console.log("\nNo CONTRACT_ADDRESS — skipping contract queries.");
}

console.log("\nDone.");