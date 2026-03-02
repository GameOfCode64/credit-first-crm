export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;

  // derived on backend or defaulted on frontend
  attendance?: number;
  assignedLeads?: number;
  completedCalls?: number;
}

export interface Team {
  id: string;
  name: string;
  users?: User[];
}

export interface Activity {
  id: string;
  createdAt: string;
  outcome?: { name: string };
  outcomeReason?: { label: string };
  remark?: string;
}

export interface PerformanceData {
  totalCalls: number;
  assignedLeads: number;
  leadsCalled: number;
  attendancePercentage: number;
  attendance: boolean;
  completion: number;
  byOutcome: Record<string, number>;
  activities: Activity[];
}

export type TimeRange = "today" | "week" | "month";
