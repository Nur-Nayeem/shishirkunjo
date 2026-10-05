import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(n)) return "৳0";
  return `৳${Math.round(n).toLocaleString("en-BD")}`;
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("sk_session_id");
  if (!id) {
    id = `guest-${crypto.randomUUID()}`;
    localStorage.setItem("sk_session_id", id);
  }
  return id;
}
