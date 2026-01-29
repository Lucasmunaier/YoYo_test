
export interface TestResult {
  name: string;
  distance: number;
  level: string;
  vo2max: number;
  date: string;
}

export interface Stage {
  level: string;
  speed: number; // km/h
  shuttleTime: number; // seconds for 40m
  cumulativeDistance: number; // meters
}
