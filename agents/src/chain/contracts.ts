import type { Address } from "viem";
import { LANDLORDS_GAME_ABI } from "./abi.js";

export { LANDLORDS_GAME_ABI };

/** Contract address — set after deployment */
export let contractAddress: Address = "0x0000000000000000000000000000000000000000";

export function setContractAddress(addr: Address) {
  contractAddress = addr;
}
