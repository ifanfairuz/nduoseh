import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function wildcardToRegex(wildcardPattern: string) {
  let regexPattern = wildcardPattern.replace(/[-\/\\^$+?.()|[\]{}]/g, "\\$&");
  regexPattern = regexPattern.replace(/\*/g, ".*");
  regexPattern = regexPattern.replace(/\?/g, ".");
  regexPattern = "^" + regexPattern + "$";
  return new RegExp(regexPattern);
}
