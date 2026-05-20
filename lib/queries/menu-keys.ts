/**
 * lib/queries/menu-keys.ts
 *
 * Query key factory for menu queries.
 * This file has NO "use client" directive, so it can be safely imported
 * from both Server Components and Client Components.
 */

import { createCrudQueryKeys } from "./crud";

export const menuQueryKeys = createCrudQueryKeys("menus");
