import type { InventarisItem } from "@/lib/schemas/inventaris";

/** Row type used in the data table. */
export type InventarisRow = InventarisItem & {
  /** Computed: whether the item stock is critically low. */
  is_low_stock: boolean;
};
