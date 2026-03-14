/**
 * Game loop — orchestrates turns between agents and the on-chain contract.
 *
 * This is a stub. The full implementation will:
 * 1. Read game state from the contract
 * 2. Pass state to the current agent's decision functions
 * 3. Submit the agent's action as a transaction
 * 4. Log the result
 * 5. Advance to next turn
 */

export interface GameLoopConfig {
  contractAddress: string;
  network: "anvil" | "base-sepolia";
  maxRounds: number;
}

export async function runGameLoop(_config: GameLoopConfig): Promise<void> {
  // TODO: Implement after contracts are deployed and ABI is generated
  console.log("Game loop not yet implemented");
}
