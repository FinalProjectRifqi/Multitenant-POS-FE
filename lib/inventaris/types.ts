import type { InventarisItem } from "@/lib/schemas/inventaris";

/** Row type used in the data table. */
export type InventarisRow = InventarisItem & {
  /** Computed: whether the item stock is zero. */
  is_out_of_stock: boolean;
  /** Computed: whether the item stock is critically low (> 0 but <= min_threshold). */
  is_low_stock: boolean;
};
