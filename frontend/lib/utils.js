import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://teachmate-bc-1.onrender.com';
