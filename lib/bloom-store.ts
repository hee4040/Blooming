import type { BloomData } from "@/lib/bloom-types";

const store = new Map<string, BloomData>();

export function setBloom(seedId: string, data: BloomData): void {
  store.set(seedId, data);
}

export function getBloom(seedId: string): BloomData | undefined {
  return store.get(seedId);
}
