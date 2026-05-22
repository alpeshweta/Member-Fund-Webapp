import type { TdpProduct } from '../types/performance'

/** Sorted list of unique product names (the fund name members recognise). */
export function getUniqueProductNames(tdp: TdpProduct[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const r of tdp) {
    if (r.product_name && !seen.has(r.product_name)) {
      seen.add(r.product_name)
      result.push(r.product_name)
    }
  }
  return result.sort((a, b) => a.localeCompare(b))
}

/** All investment options under a given product name, sorted alphabetically. */
export function getOptionsForProduct(tdp: TdpProduct[], productName: string): TdpProduct[] {
  return tdp
    .filter((r) => r.product_name === productName)
    .sort((a, b) => a.investment_option_name.localeCompare(b.investment_option_name))
}
