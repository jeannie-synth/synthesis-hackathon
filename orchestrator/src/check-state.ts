import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { LANDLORDS_GAME_ABI } from "../../agents/src/chain/abi.js";

async function main() {
  const client = createPublicClient({ chain: baseSepolia, transport: http(process.env.BASE_SEPOLIA_RPC) });
  const addr = (process.env.CONTRACT_ADDRESS ?? "0xb73a17859d9d0d464419b8f5e6d166762b36df42") as `0x${string}`;

  for (const gid of [1n, 2n]) {
    try {
      const state = await client.readContract({ address: addr, abi: LANDLORDS_GAME_ABI, functionName: "getFullState", args: [gid] }) as any;
      console.log(`\nGame ${gid}: mode=${state.mode} gameOver=${state.gameOver} currentIdx=${Number(state.currentPlayerIndex)} round=${Number(state.round)} turns=${Number(state.turnsTaken)} hasRolled=${state.hasRolled} modeSwitchProposed=${state.modeSwitchProposed}`);
      console.log(`  winner: ${state.winner}`);
      for (let i = 0; i < state.players.length; i++) {
        const p = state.players[i];
        console.log(`  [${i}] ${String(p.addr).slice(0,10)} cash=${Number(p.cash)} pos=${Number(p.position)} jail=${p.inJail} turnsInJail=${p.turnsInJail}`);
      }
    } catch(e: any) { console.log(`Game ${gid}: ${e.message?.slice(0,80)}`); }
  }
}
main();
