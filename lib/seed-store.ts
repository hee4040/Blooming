import type { SeedData } from "@/lib/seed-types";

const store = new Map<string, SeedData>();

export function setSeed(seedId: string, data: SeedData): void {
  store.set(seedId, data);
}

export function getSeed(seedId: string): SeedData | undefined {
  return store.get(seedId);
}
