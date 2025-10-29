// Fallback local Id type if the generated convex types are not available.
// Adjust or remove this when the real "../convex/_generated/dataModel" exists.
export type Id<T extends string = string> = string & { __id?: T };

export type UserRole = 'admin' | 'hr' | 'employee' | 'candidate';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  position?: string;
  joinDate?: string;
  salary?: number;
  isActive: boolean;
  phone?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  hoursWorked?: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: 'sick' | 'vacation' | 'personal' | 'maternity' | 'paternity';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  appliedAt: string;
}

export interface PayrollRecord {
  id: string;
  userId: string;
  month: string;
  year: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'pending' | 'processed' | 'paid';
}

export interface PerformanceReview {
  id: string;
  userId: string;
  reviewerId: string;
  period: string;
  score: number;
  feedback: string;
  goals: string[];
  achievements: string[];
  createdAt: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  interviewerId: string;
  position: string;
  scheduledAt: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  feedback?: string;
  rating?: number;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  resumeUrl?: string;
  status: 'applied' | 'screening' | 'interview' | 'offered' | 'hired' | 'rejected';
  appliedAt: string;
  aiScore?: number;
  skills?: string[];
  experience?: string;
  education?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendation?: string;
  summary?: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface KPITemplate {
  _id: Id<"kpiTemplates">;
  _creationTime: number;
  title: string;
  description: string;
  targetValue: number;
  weightage: number;
  metricType: string; // e.g., "percentage", "count", "currency"
}

export interface EmployeeKPI {
  _id: Id<"employeeKPIs">;
  _creationTime: number;
  employeeId: Id<"users">;
  kpiTemplateId: Id<"kpiTemplates">;
  actualValue: number;
  calculatedScore: number;
  month: number;
  year: number;
}

export interface EmployeeKPIData extends EmployeeKPI {
  kpiTemplate: KPITemplate;
}
