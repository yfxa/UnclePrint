// Per-gram rates by material (USD), based on competitive market pricing for FDM services.
// Rates reflect raw material cost + machine time + labor + ~30–40% profit margin.
// Sources: Treatstock, Craftcloud, Prusa pricing guides (2025–2026).
export const MATERIAL_RATES: Record<string, number> = {
  PLA: 0.20,
  PETG: 0.28,
  ABS: 0.28,
  ASA: 0.35,
  TPU: 0.55,
  PA: 0.85,
};

// Minimum charge per order to cover setup / job overhead
export const SETUP_FEE = 10.00;

/**
 * Calculate the estimated price for a print job.
 * @param material  - Material key (e.g. "PLA", "PETG")
 * @param weightGrams - Actual print weight in grams (from slicer output)
 * @param quantity  - Number of copies
 * @returns Estimated price in USD
 */
export function calcEstimatedPrice(
  material: string,
  weightGrams: number,
  quantity: number
): number {
  const ratePerGram = MATERIAL_RATES[material] ?? MATERIAL_RATES["PLA"];
  const materialCost = weightGrams * ratePerGram * quantity;
  return Math.max(SETUP_FEE, materialCost);
}
