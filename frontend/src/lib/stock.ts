type StockLike =
  | { total_stock?: unknown; initial_stock?: unknown }
  | null
  | undefined;

export function getTotalStock(item: StockLike): number {
  const raw = item?.initial_stock ?? 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export function isLowStock(item: StockLike, threshold: number): boolean {
  return getTotalStock(item) < threshold;
}
