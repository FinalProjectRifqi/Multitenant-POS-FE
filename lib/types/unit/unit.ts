// ─────────────────────────────────────────────
// lib/schemas/unit/types.ts
// Pure TypeScript interfaces — no Zod dependency
// ─────────────────────────────────────────────

/** Possible status values as stored on the API */
export type UnitStatus = "active" | "inactive";

// ── API response shape (what the server returns) ──────────────────────────────

/** A single unit as returned by GET /business-units */
export interface UnitEntity {
  business_unit_id: string;
  business_unit_name: string;
  business_unit_address: string;
  business_unit_phone: string;
  /** Already transformed from "active"/"inactive" → boolean by Zod schema */
  business_unit_status: boolean;
  created_at?: string;
  updated_at?: string;
}

// ── Request / write payloads (what we send to the API) ────────────────────────

/**
 * Shape the backend expects for CREATE and UPDATE.
 * `is_active` is a boolean; the form coerces strings before calling the API.
 */
export interface UnitWritePayload {
  business_unit_name: string;
  business_unit_address: string;
  business_unit_phone: string;
  is_active: boolean;
}

export type CreateUnitRequest = UnitWritePayload;
export type UpdateUnitRequest = UnitWritePayload;

export interface DeleteUnitRequest {
  business_unit_id: string;
}

// ── Paginated list meta (from the API envelope) ───────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
