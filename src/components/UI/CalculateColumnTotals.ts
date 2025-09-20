export default function CalculateColumnTotals(
  data: any[],
  columnsToSum: any[]
) {
  const totals: Record<string, string> = {};

  columnsToSum.forEach((columnName) => {
    totals[columnName] = data.reduce((sum, row) => sum + row[columnName], 0);
  });

  return totals;
}
