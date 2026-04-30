/**
 * UOM (Unit of Measurement) Service — Single integration point for UOM data.
 *
 * ───────────────────────────────────────────────────────────────────
 * TO SWITCH FROM DUMMY → REAL API:
 *
 *   1. Set `NEXT_PUBLIC_INVENTARIS_MODE=real` in .env.local
 *   2. Implement `getUomOptionsWithApi()` to call GET /api/uom.
 *      Backend should return array of { code: string, name: string }.
 * ───────────────────────────────────────────────────────────────────
 */

import { z } from "zod";

import { apiGet } from "@/lib/api/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export const uomOptionSchema = z.object({
  code: z.string(),
  name: z.string(),
});

export const uomOptionsListSchema = z.array(uomOptionSchema);

export type UomOption = z.infer<typeof uomOptionSchema>;

// ─── Constants ────────────────────────────────────────────────────────────────

const UOM_ENDPOINT = "/api/uom";
const DUMMY_NETWORK_DELAY_IN_MS = 200;

// ─── Dummy data (fake DB) ─────────────────────────────────────────────────────

const DUMMY_UOM_OPTIONS: UomOption[] = [
  { code: "kilogram", name: "Kilogram (Kg)" },
  { code: "gram", name: "Gram" },
  { code: "liter", name: "Liter" },
  { code: "milliliter", name: "Milliliter (ml)" },
  { code: "botol", name: "Botol" },
  { code: "pack", name: "Pack" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isDummyMode(): boolean {
  return process.env.NEXT_PUBLIC_INVENTARIS_MODE !== "real";
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── API functions ────────────────────────────────────────────────────────────

async function getUomOptionsWithDummy(): Promise<UomOption[]> {
  await delay(DUMMY_NETWORK_DELAY_IN_MS);
  return DUMMY_UOM_OPTIONS;
}

async function getUomOptionsWithApi(): Promise<UomOption[]> {
  return apiGet<UomOption[]>(UOM_ENDPOINT, {
    schema: uomOptionsListSchema,
  });
}

export async function getUomOptions(): Promise<UomOption[]> {
  return isDummyMode() ? getUomOptionsWithDummy() : getUomOptionsWithApi();
}
