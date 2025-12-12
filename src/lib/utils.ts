import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a full name as "FirstName L." (first name + last initial)
 * Returns "Anonymous" if no name provided
 */
export function formatDisplayName(fullName: string | null | undefined): string {
  if (!fullName || !fullName.trim()) return "Anonymous";
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase();
  
  return lastInitial ? `${firstName} ${lastInitial}.` : firstName;
}
