import { z } from "zod";

function formatIssuePath(path: Array<string | number>): string {
  return path.length > 0 ? path.join(".") : "root";
}

export function validateSchema<TData>(
  schema: z.ZodType<TData>,
  payload: unknown,
  context = "API response",
): TData {
  const result = schema.safeParse(payload);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${formatIssuePath(issue.path)}: ${issue.message}`)
      .join("; ");

    throw new Error(`${context} validation failed. ${details}`);
  }

  return result.data;
}
