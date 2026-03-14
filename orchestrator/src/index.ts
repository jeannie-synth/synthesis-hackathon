import { setup } from "./setup.js";
import { runGameLoop } from "./game-loop.js";

async function main() {
  const network = (process.env.NETWORK as "anvil" | "base-sepolia") ?? "anvil";
  const maxRounds = parseInt(process.env.MAX_ROUNDS ?? "200", 10);

  console.log(`The Landlord's Game — Orchestrator`);
  console.log(`Network: ${network}`);
  console.log(`Max rounds: ${maxRounds}`);

  await setup();
  await runGameLoop({
    contractAddress: "", // Set after deploy
    network,
    maxRounds,
  });
}

main().catch(console.error);
