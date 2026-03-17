/** Shared utilities for orchestrator */

/** Fisher-Yates shuffle — returns a new array, does not mutate input */
export function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Apply a permutation to an array — perm[i] is the index to take from arr */
export function applyPermutation<T>(arr: T[], perm: number[]): T[] {
  return perm.map(i => arr[i]);
}

/** Get the next nonce for an address, using pending block tag to avoid stale nonce on live RPCs.
 *  Alchemy free tier returns stale nonces between rapid sequential txs from the same wallet. */
export async function getNextNonce(publicClient: any, address: string): Promise<number> {
  return Number(await publicClient.getTransactionCount({ address, blockTag: "pending" }));
}
