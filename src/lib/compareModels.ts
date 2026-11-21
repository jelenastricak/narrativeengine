export function compareItems<T>(older: T[], newer: T[], name: (item: T) => string) {
  const key = (item: T) => name(item).trim().toLowerCase();
  const oldItems = new Map(older.map(item => [key(item), item]));
  const newItems = new Map(newer.map(item => [key(item), item]));
  return {
    added: newer.filter(item => !oldItems.has(key(item))),
    removed: older.filter(item => !newItems.has(key(item))),
    changed: newer.filter(item => oldItems.has(key(item)) && JSON.stringify(oldItems.get(key(item))) !== JSON.stringify(item)),
    unchanged: newer.filter(item => oldItems.has(key(item)) && JSON.stringify(oldItems.get(key(item))) === JSON.stringify(item)),
  };
}