import { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/apiClient/data-contracts";

export function formPathFromApiKey(key: string): string {
  const last = key.split(".").pop() ?? key;
  if (last.length === 0) return key;
  return last.charAt(0).toLowerCase() + last.slice(1);
}

export function applyApiFieldErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  error: ApiError | undefined,
): void {
  if (!error?.errors) return;
  for (const [key, messages] of Object.entries(error.errors)) {
    const message = messages.find((item) => item && item.trim().length > 0);
    if (!message) continue;
    setError(formPathFromApiKey(key) as Path<T>, {
      type: "server",
      message,
    });
  }
}
