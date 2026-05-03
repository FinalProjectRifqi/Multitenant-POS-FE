// ─────────────────────────────────────────────
// lib/api/units.ts
// ─────────────────────────────────────────────
"use server";

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { parseApiError } from "@/lib/api/parsed-api-error";
import type { CrudDeleteInput, CrudUpdateInput } from "@/lib/api/crud-types";
import {
  createUnitResponseSchema,
  deleteUnitRequestSchema,
  unitIdSchema,
  unitsListResponseSchema,
  updateUnitRequestSchema,
  updateUnitResponseSchema,
  unitWritePayloadSchema,
} from "@/lib/types/unit";
import type {
  CreateUnitRequest,
  DeleteUnitRequest,
  UnitEntity,
  UpdateUnitRequest,
} from "@/lib/types/unit";
import { UnitsListResponse } from "../schemas/unit";

const UNITS_ENDPOINT = "/business-units";

export type UpdateUnitInput = CrudUpdateInput<
  UpdateUnitRequest,
  "business_unit_id"
>;
export type DeleteUnitInput = CrudDeleteInput<"business_unit_id">;
export type UnitMutationResult<TData = void> =
  | { ok: true; data: TData }
  | { ok: false; status: number; message: string };

// ── Helpers ───────────────────────────────────────────────────────────────────

function assertValidUnitId(id: string): string {
  return unitIdSchema.parse(id);
}

/**
 * Validates and normalises a write payload.
 * Uses unitWritePayloadSchema (which coerces is_active string → boolean)
 * so this is safe to call with raw form values.
 */
function normalizeWritePayload(
  payload: CreateUnitRequest | UpdateUnitRequest,
): CreateUnitRequest {
  const parsed = unitWritePayloadSchema.parse(payload);

  return {
    business_unit_name: parsed.business_unit_name.trim(),
    business_unit_address: parsed.business_unit_address.trim(),
    business_unit_phone: parsed.business_unit_phone.trim(),
    is_active: parsed.is_active as boolean, // coercion already done by schema
  };
}

// ── API calls ─────────────────────────────────────────────────────────────────

// async function getUnitsWithApi(): Promise<UnitEntity[]> {
//   return apiGet<UnitEntity[]>(UNITS_ENDPOINT, {
//     schema: unitsListResponseSchema,
//   });
// }

async function createUnitWithApi(
  payload: CreateUnitRequest,
): Promise<UnitEntity> {
  const normalized = normalizeWritePayload(payload);

  return apiPost<UnitEntity, CreateUnitRequest>(UNITS_ENDPOINT, normalized, {
    schema: createUnitResponseSchema,
  });
}

async function updateUnitWithApi(input: UpdateUnitInput): Promise<UnitEntity> {
  const unitId = assertValidUnitId(input.business_unit_id);

  // Parse + coerce the payload (handles is_active string from form)
  const normalized = updateUnitRequestSchema.parse(input.payload);

  return apiPatch<UnitEntity, UpdateUnitRequest>(
    `${UNITS_ENDPOINT}/${unitId}`,
    normalized as UpdateUnitRequest,
    { schema: updateUnitResponseSchema },
  );
}

async function deleteUnitWithApi(input: DeleteUnitInput): Promise<void> {
  // Validate the id — deleteUnitRequestSchema checks it's a valid UUID
  const payload: DeleteUnitRequest = deleteUnitRequestSchema.parse(input);

  await apiDelete<void>(`${UNITS_ENDPOINT}/${payload.business_unit_id}`);
}

function toUnitMutationError(error: unknown): UnitMutationResult<never> {
  const parsed = parseApiError(error);

  return {
    ok: false,
    status: parsed.status,
    message: parsed.message,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getUnits(params?: {
  page?: number;
  limit?: number;
  show_inactive?: boolean;
}) {
  return apiGet<UnitsListResponse>(UNITS_ENDPOINT, {
    schema: unitsListResponseSchema,
    params,
  });
}

export async function createUnit(
  payload: CreateUnitRequest,
): Promise<UnitMutationResult<UnitEntity>> {
  try {
    return { ok: true, data: await createUnitWithApi(payload) };
  } catch (error) {
    return toUnitMutationError(error);
  }
}

export async function updateUnit(
  input: UpdateUnitInput,
): Promise<UnitMutationResult<UnitEntity>> {
  try {
    return { ok: true, data: await updateUnitWithApi(input) };
  } catch (error) {
    return toUnitMutationError(error);
  }
}

export async function deleteUnit(
  input: DeleteUnitInput,
): Promise<UnitMutationResult> {
  try {
    await deleteUnitWithApi(input);
    return { ok: true, data: undefined };
  } catch (error) {
    return toUnitMutationError(error);
  }
}
