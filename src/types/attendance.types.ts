export interface Attendance {
  id: string;
  date: string;
  clockIn: string;
  clockOut?: string | null;
}
