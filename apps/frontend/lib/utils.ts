import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const normaliseOrgId = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === "string") return value;

  type IdLike = {
    _id?: unknown;
    $oid?: unknown;
    toString?: () => string;
  };

  const toStringSafe = (v: unknown): string | null => {
    if (typeof v === "string") return v;
    if (
      v != null &&
      typeof (v as { toString?: () => string }).toString === "function"
    ) {
      const s = (v as { toString: () => string }).toString();
      return typeof s === "string" ? s : null;
    }
    return null;
  };

  if (typeof value === "object" && value !== null) {
    const obj = value as IdLike;
    return (
      toStringSafe(obj._id) ??
      (typeof obj.$oid === "string" ? obj.$oid : null) ??
      toStringSafe(obj)
    );
  }
  return null;
};
