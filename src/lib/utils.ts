import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ORDER_STATUSES = [
  { key: "uploaded", label: "Uploaded", description: "Your file has been received" },
  { key: "preparing", label: "Preparing Files", description: "We're slicing and preparing your model" },
  { key: "printing", label: "Printing", description: "Your model is being printed" },
  { key: "printed", label: "Printed", description: "Printing is complete" },
  { key: "shipping", label: "Shipping", description: "Your order is on the way" },
  { key: "delivered", label: "Delivered", description: "Order delivered" },
] as const;

export const STATUS_COLORS: Record<string, string> = {
  uploaded: "bg-blue-500",
  preparing: "bg-yellow-500",
  printing: "bg-orange-500",
  printed: "bg-green-400",
  shipping: "bg-purple-500",
  delivered: "bg-green-600",
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
