import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

export function formatCalories(calories: number) {
  return Math.round(calories)
}

export function formatMacro(value: number) {
  return Math.round(value * 10) / 10
}

export const mealTypeOptions = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
  { value: "other", label: "Other" },
]

export function getMealTypeLabel(value: string) {
  return mealTypeOptions.find((option) => option.value === value)?.label || "Other"
}

