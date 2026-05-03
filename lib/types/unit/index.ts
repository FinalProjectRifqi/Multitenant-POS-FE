// ─────────────────────────────────────────────
// lib/schemas/unit/index.ts
// Barrel — import from here everywhere else
// ─────────────────────────────────────────────

// Pure TypeScript types (no Zod)
export type {
  UnitStatus,
  UnitEntity,
  UnitWritePayload,
  CreateUnitRequest,
  UpdateUnitRequest,
  DeleteUnitRequest,
  PaginationMeta,
} from "./unit";

// Zod schemas (runtime validation)
export {
  unitIdSchema,
  unitStatusSchema,
  unitWritePayloadSchema,
  createUnitRequestSchema,
  updateUnitRequestSchema,
  deleteUnitRequestSchema,
  unitSchema,
  unitsListResponseSchema,
  unitEntityResponseSchema,
  createUnitResponseSchema,
  updateUnitResponseSchema,
} from "@/lib/schemas/unit";
