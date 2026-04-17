import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCompactNumber(number: number) {
  if (number === undefined || number === null) return "0";
  const formatter = Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 2
  });
  return formatter.format(number);
}
