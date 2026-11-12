const wholeMoneyFormat = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});
const compactNumberFormat = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 1,
});

export function wholeMoney(value: number) {
  return wholeMoneyFormat.format(value);
}

export function compactMoney(value: number) {
  if (value >= 1_000_000)
    return `$${compactNumberFormat.format(value / 1_000_000)}M`;
  if (value >= 1_000) return `$${compactNumberFormat.format(value / 1_000)}k`;
  return `$${compactNumberFormat.format(value)}`;
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
