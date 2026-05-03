/**
 * lib/queries/unit-keys.ts
 *
 * Query key factory for unit queries.
 * This file has NO "use client" directive, so it can be safely imported
 * from both Server Components and Client Components.
 */

import { createCrudQueryKeys } from "./crud";

export const unitQueryKeys = createCrudQueryKeys("units");
