import { OrderStatus } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLitres(n: number): string {
  return n.toLocaleString("it-IT") + " L";
}

export function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("it-IT");
}

export function statusLabel(s: OrderStatus): string {
  switch (s) {
    case "WAITING":
      return "In attesa";
    case "PROCESSING":
      return "In lavorazione";
    case "DELIVERED":
      return "Evaso";
    case "CANCELLED":
      return "Annullato";
  }
}

export function statusBadgeClass(s: OrderStatus): string {
  switch (s) {
    case "WAITING":
      return "badge-waiting";
    case "PROCESSING":
      return "badge-processing";
    case "DELIVERED":
      return "badge-done";
    case "CANCELLED":
      return "badge-cancelled";
  }
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export async function generateOrderCode(
  count: number
): Promise<string> {
  return "ORD-" + String(count + 1).padStart(4, "0");
}
