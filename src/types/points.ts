export interface DailyPointsData {
  date: string;
  bandwidthPoints: number;
  referralPoints: number;
}

export interface ChartDataPoint {
  date: string;
  points: number;
  type: 'bandwidth' | 'referral';
}