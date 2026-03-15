import type { Address } from "viem";
import type { Agent } from "../agent.js";
import { ExtractiveAgent } from "./extractive.js";
import { GenerativeAgent } from "./generative.js";
import { ConditionalAgent } from "./conditional.js";
import { FreeRiderAgent } from "./free-rider.js";
import { PavlovAgent } from "./pavlov.js";

export type StrategyName = "Extractive" | "Generative" | "Conditional" | "FreeRider" | "Pavlov";

/** Strategy assignment order — matches AGENT_NAMES in client.ts */
export const STRATEGY_ORDER: StrategyName[] = [
  "Extractive",
  "Generative",
  "Conditional",
  "FreeRider",
  "Pavlov",
];

/** Create an agent with the given strategy */
export function createAgent(strategy: StrategyName, name: string, address: Address): Agent {
  switch (strategy) {
    case "Extractive": return new ExtractiveAgent(name, address);
    case "Generative": return new GenerativeAgent(name, address);
    case "Conditional": return new ConditionalAgent(name, address);
    case "FreeRider": return new FreeRiderAgent(name, address);
    case "Pavlov": return new PavlovAgent(name, address);
  }
}

/** Create the full set of 5 agents from addresses */
export function createAgentSet(addresses: Address[]): Agent[] {
  return STRATEGY_ORDER.map((strategy, i) =>
    createAgent(strategy, `${strategy}-${i}`, addresses[i])
  );
}

export { ExtractiveAgent, GenerativeAgent, ConditionalAgent, FreeRiderAgent, PavlovAgent };
