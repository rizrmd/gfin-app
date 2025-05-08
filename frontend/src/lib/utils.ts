import { type ClassValue, clsx } from "clsx";
import { chrono } from "shared/lib/chrono";
import { twMerge } from "tailwind-merge";
import * as XLSX from "xlsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ExportExcel(data_export: any[], filename: string) {
  if (data_export.length === 0) return alert("Data Kosong!")

  const date = chrono.shortDate(chrono.now())

  const ws = XLSX.utils.json_to_sheet(data_export)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
  XLSX.writeFile(wb, `${filename}-${date}.xlsx`)
}