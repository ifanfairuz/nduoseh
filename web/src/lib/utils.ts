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

/**
 * Updates a query string parameter in the URL without reloading the page.
 * @param {Record<string, string>} replaces The parameter replaces qs params.
 * @param {boolean} push - If true, creates a new history entry. If false (default), replaces the current entry.
 */
export function updateQueryParam(
  replaces: Record<string, string | undefined>,
  push = false,
) {
  // Create a new URL object based on the current window location
  const url = new URL(window.location.href);

  // Use URLSearchParams to easily manage the query parameters
  for (const key in replaces) {
    if (typeof replaces[key] !== "undefined") {
      url.searchParams.set(key, replaces[key]);
    } else {
      url.searchParams.delete(key);
    }
  }

  // Use the History API to update the address bar
  if (push) {
    // pushState creates a new entry in the browser history (allows using the back button)
    window.history.pushState({}, "", url);
  } else {
    // replaceState modifies the current history entry (does not allow using the back button for this specific change)
    window.history.replaceState({}, "", url);
  }
}
