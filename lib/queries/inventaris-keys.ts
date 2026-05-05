/**
 * lib/queries/inventaris-keys.ts
 *
 * Shared query key factory for inventaris queries.
 * This file intentionally has NO "use client" directive,
 * so it can be imported safely by both server and client modules.
 */

export const inventarisQueryKeys = {
  all: ["inventaris"] as const,
  byBusiness: (id: string) => [...inventarisQueryKeys.all, id] as const,
  lists: (id: string) =>
    [...inventarisQueryKeys.byBusiness(id), "list"] as const,
  stats: (id: string) =>
    [...inventarisQueryKeys.byBusiness(id), "stats"] as const,
};
