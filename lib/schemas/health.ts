import { z } from "zod";

export const healthSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string().datetime(),
});

export type Health = z.infer<typeof healthSchema>;
