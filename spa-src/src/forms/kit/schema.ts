import { z } from "zod";

const idInput = z.union([
  z.number(),
  z.string(),
  z.nan(),
  z.null(),
  z.undefined(),
]);

function parseId(value: unknown): number | null {
  if (value === "" || value == null) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** Required FK / lookup id. Empty, 0, and NaN fail with `message`. */
export function requiredId(message = "This field is required") {
  return idInput.transform((value, ctx) => {
    const id = parseId(value);
    if (id == null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message });
      return z.NEVER;
    }
    return id;
  });
}

/** Optional FK / lookup id. Empty, 0, and NaN become `null`. */
export function optionalId() {
  return idInput.transform((value): number | null => parseId(value));
}

export function requiredText(message = "This field is required") {
  return z.string().trim().min(1, message);
}

/** Optional text. Blank strings become `null`. */
export function optionalText() {
  return z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value): string | null => {
      if (value == null) return null;
      const trimmed = value.trim();
      return trimmed.length === 0 ? null : trimmed;
    });
}
