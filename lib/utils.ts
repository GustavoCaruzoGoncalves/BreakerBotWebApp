import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata valor de aura com separador de milhares (pt-BR: 1.000.000) */
export function formatAura(value: number): string {
  return (Number(value) || 0).toLocaleString('pt-BR', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
}
