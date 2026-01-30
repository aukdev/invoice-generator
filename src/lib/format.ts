// Format number with thousand separators
// e.g., 1450 → "1,450.00"
export const formatNumber = (amount: number): string => {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Format currency with symbol
// e.g., (1450, "Rs") → "Rs 1,450.00"
export const formatCurrency = (amount: number, symbol: string): string => {
  return `${symbol} ${formatNumber(amount)}`;
};
