/**
 * Currency, Number, and Date formatting utilities standardized on Kenyan Shillings (KSh.)
 */

const CURRENCY_PREFIX = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "KSh.";

/**
 * Formats an exact amount in KSh.
 * Example: formatKSh(4200000) -> "KSh. 4,200,000"
 */
export function formatKSh(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${CURRENCY_PREFIX} 0`;
  }
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat("en-KE", {
    maximumFractionDigits: 0,
  }).format(Math.abs(rounded));

  if (rounded < 0) {
    return `-${CURRENCY_PREFIX} ${formatted}`;
  }
  return `${CURRENCY_PREFIX} ${formatted}`;
}

/**
 * Formats a compact amount in KSh. for Dashboard KPI Cards and Kanban Pipeline Cards
 * Example: formatCompactKSh(4200000) -> "KSh. 4.2M"
 * Example: formatCompactKSh(850000)  -> "KSh. 850K"
 */
export function formatCompactKSh(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${CURRENCY_PREFIX} 0`;
  }
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (abs >= 1_000_000_000) {
    const val = (abs / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "");
    return `${sign}${CURRENCY_PREFIX} ${val}B`;
  }
  if (abs >= 1_000_000) {
    const val = (abs / 1_000_000).toFixed(2).replace(/\.?0+$/, "");
    return `${sign}${CURRENCY_PREFIX} ${val}M`;
  }
  if (abs >= 1_000) {
    const val = (abs / 1_000).toFixed(0);
    return `${sign}${CURRENCY_PREFIX} ${val}K`;
  }
  return formatKSh(amount);
}

/**
 * Formats mileage in kilometers
 * Example: formatMileage(48500) -> "48,500 km"
 */
export function formatMileage(km: number | null | undefined): string {
  if (km === null || km === undefined) return "0 km";
  return `${new Intl.NumberFormat("en-KE").format(km)} km`;
}

/**
 * Calculates vehicle profitability metrics
 */
export function calculateVehicleFinancials(params: {
  purchasePrice: number;
  expensesTotal: number;
  askingPrice: number;
  actualSalePrice?: number | null;
}) {
  const totalCost = (params.purchasePrice || 0) + (params.expensesTotal || 0);
  const expectedProfit = (params.askingPrice || 0) - totalCost;
  const actualProfit =
    params.actualSalePrice !== null && params.actualSalePrice !== undefined
      ? params.actualSalePrice - totalCost
      : null;
  const marginPercent =
    params.askingPrice > 0
      ? Number(((expectedProfit / params.askingPrice) * 100).toFixed(1))
      : 0;

  return {
    totalCost,
    expectedProfit,
    actualProfit,
    marginPercent,
  };
}

/**
 * Calculates the number of days a vehicle has been in stock
 */
export function getInventoryAgeDays(dateAcquired: Date | string): number {
  const acquired = new Date(dateAcquired);
  const now = new Date();
  const diffMs = now.getTime() - acquired.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Returns the aging bucket label: "0-30 days", "31-60 days", "61-90 days", or "90+ days"
 */
export function getInventoryAgeBucket(
  dateAcquired: Date | string
): "0–30 days" | "31–60 days" | "61–90 days" | "90+ days" {
  const days = getInventoryAgeDays(dateAcquired);
  if (days <= 30) return "0–30 days";
  if (days <= 60) return "31–60 days";
  if (days <= 90) return "61–90 days";
  return "90+ days";
}

/**
 * Formats a Date into East Africa standard readable format (e.g., "03 Oct 2026")
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Formats relative time (e.g., "Today", "Yesterday", "3 days ago")
 */
export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return "Never";
  const target = new Date(date);
  const now = new Date();
  const diffDays = Math.floor(
    (now.setHours(0, 0, 0, 0) - target.setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays === -1) return "Tomorrow";
  if (diffDays < -1) return `In ${Math.abs(diffDays)} days`;
  if (diffDays < 30) return `${diffDays} days ago`;
  return formatDate(date);
}
