import { measureCPUUsage } from './cpu';
import { updatePoints as dbUpdatePoints } from './database/points';

export async function updatePoints(userId: string): Promise<number> {
  const cpuUsage = await measureCPUUsage();
  return dbUpdatePoints(userId, cpuUsage);
}