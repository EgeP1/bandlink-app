/**
 * Returns an array of ISO date strings for the last N days
 * @param days Number of days to include
 * @returns Array of ISO date strings
 */
export function getDateRange(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}