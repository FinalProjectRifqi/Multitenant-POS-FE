/**
 * Role codes — kept in sync with the `role_code` column of the `roles` table.
 * When the real backend is integrated, these must match the API's values.
 */
export const ROLE_CODE = {
  STAF_UNIT: "STAF_UNIT",
  TIM_DAPUR: "TIM_DAPUR",
  MANAJER_UNIT: "MANAJER_UNIT",
  MANAJEMEN_GRUP: "MANAJEMEN_GRUP",
} as const;

export type RoleCode = (typeof ROLE_CODE)[keyof typeof ROLE_CODE];

/** Human-readable label for each role (Indonesian) */
export const ROLE_LABEL: Record<RoleCode, string> = {
  [ROLE_CODE.STAF_UNIT]: "Staf Unit",
  [ROLE_CODE.TIM_DAPUR]: "Tim Dapur",
  [ROLE_CODE.MANAJER_UNIT]: "Manajer Unit",
  [ROLE_CODE.MANAJEMEN_GRUP]: "Manajemen Grup",
};

/**
 * Maps each role to its post-login dashboard route.
 * Update these paths when the actual dashboard pages are created.
 */
export const ROLE_DASHBOARD_ROUTE: Record<RoleCode, string> = {
  [ROLE_CODE.STAF_UNIT]: "/unit/pos",
  [ROLE_CODE.TIM_DAPUR]: "/unit/kitchen",
  [ROLE_CODE.MANAJER_UNIT]: "/unit",
  [ROLE_CODE.MANAJEMEN_GRUP]: "/group",
};

/** Fallback route for unknown role codes */
export const DEFAULT_DASHBOARD_ROUTE = "/dashboard";

/** Returns the correct dashboard route for a given role code. */
export function getDashboardRoute(roleCode: string): string {
  return (
    ROLE_DASHBOARD_ROUTE[roleCode as RoleCode] ?? DEFAULT_DASHBOARD_ROUTE
  );
}
