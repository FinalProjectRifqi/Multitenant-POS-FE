import { requestWithSchema } from "@/lib/api/client";
import { healthSchema } from "@/lib/schemas/health";

export async function getHealth() {
  return requestWithSchema(
    {
      method: "GET",
      url: "/health",
    },
    healthSchema,
  );
}
