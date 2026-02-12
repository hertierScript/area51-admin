import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Rwandan Francs (RWF) with comma separators
 * Example: 15000 -> "15,000 RWF"
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString()} RWF`;
}
