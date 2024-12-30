export function formatPoints(points: number | undefined | null): string {
  const value = typeof points === 'number' ? points : 0;
  
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}