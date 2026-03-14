import type { Address, Abi } from "viem";

/** ABI will be generated from forge build output — placeholder for now */
export const LANDLORDS_GAME_ABI: Abi = [];

/** Contract address — set after deployment */
export let contractAddress: Address = "0x0000000000000000000000000000000000000000";

export function setContractAddress(addr: Address) {
  contractAddress = addr;
}
