export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "N/A";
  }
  return value.toLocaleString(undefined, {
    style: 'currency',
    currency: 'INR', // Using Indian Rupee
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};