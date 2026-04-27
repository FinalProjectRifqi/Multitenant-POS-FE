import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type { CrudDeleteInput, CrudUpdateInput } from "@/lib/api/crud-types";
import {
  createUnitRequestSchema,
  createUnitResponseSchema,
  type CreateUnitRequest,
  type DeleteUnitRequest,
  deleteUnitRequestSchema,
  unitIdSchema,
  type UnitEntity,
  unitsListResponseSchema,
  updateUnitRequestSchema,
  updateUnitResponseSchema,
  type UpdateUnitRequest,
} from "@/lib/schemas/unit";

const UNIT_STORAGE_KEY = "units_storage";
const DUMMY_NETWORK_DELAY_IN_MS = 350;
const UNITS_ENDPOINT = "/units";

export type UpdateUnitInput = CrudUpdateInput<UpdateUnitRequest, "unit_id">;

export type DeleteUnitInput = CrudDeleteInput<"unit_id">;

const DUMMY_UNITS_SEED: UnitEntity[] = [
  {
    unit_id: "d5d0cf7a-5c43-4bb0-beb2-31bca863f431",
    unit_name: "XYZ Cabang Sudirman",
    unit_address: "Jl. Sudirman No. 1, Jakarta",
    phone_number: "021-12345678",
    status: "active",
    created_at: "2026-04-22T08:10:00.000Z",
    updated_at: "2026-04-22T08:10:00.000Z",
  },
  {
    unit_id: "8766905d-faf0-41b9-929a-817c30ebf499",
    unit_name: "XYZ Cabang Kuningan",
    unit_address: "Jl. Kuningan Raya No. 11, Jakarta",
    phone_number: "021-76543210",
    status: "active",
    created_at: "2026-04-21T09:00:00.000Z",
    updated_at: "2026-04-21T09:00:00.000Z",
  },
  {
    unit_id: "f60e6f75-e4b1-4cb9-b72f-6578f58cf6c4",
    unit_name: "XYZ Cabang Bandung",
    unit_address: "Jl. Asia Afrika No. 45, Bandung",
    phone_number: "022-44001122",
    status: "active",
    created_at: "2026-04-20T10:45:00.000Z",
    updated_at: "2026-04-20T10:45:00.000Z",
  },
  {
    unit_id: "f5d95e22-bbfe-48bf-991e-f3f3a46c2d3f",
    unit_name: "XYZ Cabang Surabaya",
    unit_address: "Jl. Darmo No. 27, Surabaya",
    phone_number: "031-33445566",
    status: "active",
    created_at: "2026-04-18T12:15:00.000Z",
    updated_at: "2026-04-18T12:15:00.000Z",
  },
  {
    unit_id: "5ef1d5ec-c1ea-4fdd-a90b-2f54f435f9e8",
    unit_name: "XYZ Cabang Depok",
    unit_address: "Jl. Margonda Raya No. 88, Depok",
    phone_number: "021-99988877",
    status: "inactive",
    created_at: "2026-04-12T07:20:00.000Z",
    updated_at: "2026-04-12T07:20:00.000Z",
  },
];

function cloneSeedUnits(): UnitEntity[] {
  return DUMMY_UNITS_SEED.map((unit) => ({ ...unit }));
}

function delay(ms = DUMMY_NETWORK_DELAY_IN_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isDummyMode(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_MODE !== "real";
}

function assertValidUnitId(unitId: string): string {
  return unitIdSchema.parse(unitId);
}

function ensureUnitsStorageSeeded(): void {
  if (typeof window === "undefined") {
    return;
  }

  const raw = localStorage.getItem(UNIT_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(UNIT_STORAGE_KEY, JSON.stringify(cloneSeedUnits()));
  }
}

function readUnitsFromStorage(): UnitEntity[] {
  if (typeof window === "undefined") {
    return cloneSeedUnits();
  }

  ensureUnitsStorageSeeded();
  const raw = localStorage.getItem(UNIT_STORAGE_KEY);

  if (!raw) {
    return cloneSeedUnits();
  }

  try {
    const parsed = unitsListResponseSchema.parse(JSON.parse(raw));
    return parsed.map((unit) => ({ ...unit }));
  } catch {
    const fallback = cloneSeedUnits();
    localStorage.setItem(UNIT_STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
}

function writeUnitsToStorage(units: UnitEntity[]): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(UNIT_STORAGE_KEY, JSON.stringify(units));
}

function normalizeWritePayload(
  payload: CreateUnitRequest | UpdateUnitRequest,
): CreateUnitRequest {
  const parsed = createUnitRequestSchema.parse(payload);

  return {
    unit_name: parsed.unit_name.trim(),
    unit_address: parsed.unit_address.trim(),
    phone_number: parsed.phone_number.trim(),
    status: parsed.status,
  };
}

async function getUnitsWithDummy(): Promise<UnitEntity[]> {
  await delay();
  return readUnitsFromStorage();
}

async function createUnitWithDummy(
  payload: CreateUnitRequest,
): Promise<UnitEntity> {
  await delay();

  const normalized = normalizeWritePayload(payload);
  const now = new Date().toISOString();

  const nextUnit: UnitEntity = {
    unit_id: crypto.randomUUID(),
    unit_name: normalized.unit_name,
    unit_address: normalized.unit_address,
    phone_number: normalized.phone_number,
    status: normalized.status,
    created_at: now,
    updated_at: now,
  };

  const currentUnits = readUnitsFromStorage();
  writeUnitsToStorage([nextUnit, ...currentUnits]);

  return nextUnit;
}

async function updateUnitWithDummy(
  input: UpdateUnitInput,
): Promise<UnitEntity> {
  await delay();

  const unitId = assertValidUnitId(input.unit_id);
  const normalized = normalizeWritePayload(input.payload);
  const units = readUnitsFromStorage();
  const targetIndex = units.findIndex((unit) => unit.unit_id === unitId);

  if (targetIndex < 0) {
    throw new Error("Unit usaha tidak ditemukan.");
  }

  const now = new Date().toISOString();
  const current = units[targetIndex];

  const updatedUnit: UnitEntity = {
    ...current,
    ...normalized,
    updated_at: now,
  };

  const nextUnits = [...units];
  nextUnits[targetIndex] = updatedUnit;
  writeUnitsToStorage(nextUnits);

  return updatedUnit;
}

async function deleteUnitWithDummy(input: DeleteUnitInput): Promise<void> {
  await delay();

  const payload: DeleteUnitRequest = deleteUnitRequestSchema.parse(input);
  const units = readUnitsFromStorage();
  const nextUnits = units.filter((unit) => unit.unit_id !== payload.unit_id);

  if (nextUnits.length === units.length) {
    throw new Error("Unit usaha tidak ditemukan.");
  }

  writeUnitsToStorage(nextUnits);
}

async function getUnitsWithApi(): Promise<UnitEntity[]> {
  return apiGet<UnitEntity[]>(UNITS_ENDPOINT, {
    schema: unitsListResponseSchema,
  });
}

async function createUnitWithApi(
  payload: CreateUnitRequest,
): Promise<UnitEntity> {
  const normalized = normalizeWritePayload(payload);

  return apiPost<UnitEntity, CreateUnitRequest>(UNITS_ENDPOINT, normalized, {
    schema: createUnitResponseSchema,
  });
}

async function updateUnitWithApi(input: UpdateUnitInput): Promise<UnitEntity> {
  const unitId = assertValidUnitId(input.unit_id);
  const normalized = updateUnitRequestSchema.parse(input.payload);

  return apiPatch<UnitEntity, UpdateUnitRequest>(
    `${UNITS_ENDPOINT}/${unitId}`,
    normalized,
    {
      schema: updateUnitResponseSchema,
    },
  );
}

async function deleteUnitWithApi(input: DeleteUnitInput): Promise<void> {
  const payload: DeleteUnitRequest = deleteUnitRequestSchema.parse(input);

  await apiDelete<void>(`${UNITS_ENDPOINT}/${payload.unit_id}`);
}

export async function getUnits(): Promise<UnitEntity[]> {
  return isDummyMode() ? getUnitsWithDummy() : getUnitsWithApi();
}

export async function createUnit(
  payload: CreateUnitRequest,
): Promise<UnitEntity> {
  return isDummyMode()
    ? createUnitWithDummy(payload)
    : createUnitWithApi(payload);
}

export async function updateUnit(input: UpdateUnitInput): Promise<UnitEntity> {
  return isDummyMode() ? updateUnitWithDummy(input) : updateUnitWithApi(input);
}

export async function deleteUnit(input: DeleteUnitInput): Promise<void> {
  return isDummyMode() ? deleteUnitWithDummy(input) : deleteUnitWithApi(input);
}
