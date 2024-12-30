export function formatTotalTime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  
  const daysText = days === 1 ? 'day' : 'days';
  const hoursText = hours === 1 ? 'hour' : 'hours';
  
  if (days === 0) {
    return `${hours} ${hoursText}`;
  }
  
  if (hours === 0) {
    return `${days} ${daysText}`;
  }
  
  return `${days} ${daysText} ${hours} ${hoursText}`;
}