const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem('hr360_token');

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// API service object
export const api = {
  // Authentication
  auth: {
    login: async (email: string, password: string) => {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      return response.data;
    },
    register: async (userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: "admin" | "hr" | "employee" | "candidate";
      department?: string;
      position?: string;
      salary?: number;
    }) => {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response.data;
    },
    verifyToken: async (token: string) => {
      const response = await apiRequest('/auth/verify-token', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      return response.data;
    },
  },

  // Users
  users: {
    getAll: async () => {
      const response = await apiRequest('/users');
      return response.data;
    },
    getById: async (id: string) => {
      const response = await apiRequest(`/users/${id}`);
      return response.data;
    },
    create: async (userData: {
      email: string;
      passwordHash: string;
      firstName: string;
      lastName: string;
      role: "admin" | "hr" | "employee" | "candidate";
      department?: string;
      position?: string;
      salary?: number;
      joinDate?: string;
      isActive: boolean;
    }) => {
      const response = await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response.data;
    },
    update: async (userData: {
      userId: string;
      firstName?: string;
      lastName?: string;
      role?: "admin" | "hr" | "employee" | "candidate";
      department?: string;
      position?: string;
      salary?: number;
      isActive?: boolean;
    }) => {
      const response = await apiRequest(`/users/${userData.userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      return response.data;
    },
    delete: async (userId: string) => {
      const response = await apiRequest(`/users/${userId}`, {
        method: 'DELETE',
      });
      return response.success;
    },
  },

  // Candidates
  candidates: {
    getAll: async () => {
      // For development, use Convex
      if (import.meta.env.DEV) {
        const { ConvexHttpClient } = await import('convex/browser');
        const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);
        return await (convex.query as any)('candidates:getAllCandidates');
      }
      const response = await apiRequest('/candidates');
      return response.data;
    },
    getById: async (candidateId: string) => {
      // For development, use Convex
      if (import.meta.env.DEV) {
        const { ConvexHttpClient } = await import('convex/browser');
        const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);
        return await (convex.query as any)('candidates:getCandidateById', { candidateId });
      }
      const response = await apiRequest(`/candidates/${candidateId}`);
      return response.data;
    },
    create: async (candidateData: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      position: string;
      resumeUrl?: string;
      experience?: string;
      education?: string;
      skills?: string[];
      coverLetter?: string;
      aiScore?: number;
      strengths?: string[];
      weaknesses?: string[];
      recommendation?: string;
      summary?: string;
    }) => {
      // For development, use Convex
      if (import.meta.env.DEV) {
        const { ConvexHttpClient } = await import('convex/browser');
        const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);
        return await (convex.mutation as any)('candidates:createCandidate', candidateData);
      }
      const response = await apiRequest('/candidates', {
        method: 'POST',
        body: JSON.stringify(candidateData),
      });
      return response.data;
    },
    updateStatus: async (candidateId: string, status: "applied" | "screening" | "interview" | "offered" | "hired" | "rejected") => {
      // For development, use Convex
      if (import.meta.env.DEV) {
        const { ConvexHttpClient } = await import('convex/browser');
        const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);
        return await (convex.mutation as any)('candidates:updateCandidateStatus', { candidateId, status });
      }
      const response = await apiRequest(`/candidates/${candidateId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      return response.data;
    },
    updateAIScore: async (data: {
      candidateId: string;
      aiScore: number;
      skills?: string[];
      experience?: string;
      education?: string;
      strengths?: string[];
      weaknesses?: string[];
      recommendation?: string;
      summary?: string;
    }) => {
      // For development, use Convex
      if (import.meta.env.DEV) {
        const { ConvexHttpClient } = await import('convex/browser');
        const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);
        return await (convex.mutation as any)('candidates:updateCandidateAIScore', data);
      }
      const response = await apiRequest(`/candidates/${data.candidateId}/ai-score`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.data;
    },
    search: async (searchData: {
      searchTerm: string;
      position?: string;
      status?: "applied" | "screening" | "interview" | "offered" | "hired" | "rejected";
    }) => {
      // For development, use Convex
      if (import.meta.env.DEV) {
        const { ConvexHttpClient } = await import('convex/browser');
        const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);
        return await (convex.query as any)('candidates:searchCandidates', searchData);
      }
      const params = new URLSearchParams();
      Object.entries(searchData).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await apiRequest(`/candidates/search?${params}`);
      return response.data;
    },
  },

  // Interviews
  interviews: {
    getByCandidate: async (candidateId: string) => {
      const response = await apiRequest(`/interviews/candidate/${candidateId}`);
      return response.data;
    },
    getByInterviewer: async (interviewerId: string) => {
      const response = await apiRequest(`/interviews/interviewer/${interviewerId}`);
      return response.data;
    },
    getAll: async () => {
      const response = await apiRequest('/interviews');
      return response.data;
    },
    schedule: async (interviewData: {
      candidateId: string;
      interviewerId: string;
      position: string;
      scheduledAt: string;
      meetingLink?: string;
    }) => {
      const response = await apiRequest('/interviews', {
        method: 'POST',
        body: JSON.stringify(interviewData),
      });
      return response.data;
    },
    updateStatus: async (data: {
      interviewId: string;
      status: "scheduled" | "completed" | "cancelled";
      feedback?: string;
      rating?: number;
    }) => {
      const response = await apiRequest(`/interviews/${data.interviewId}/status`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.data;
    },
    getCalendar: async (data: {
      startDate: string;
      endDate: string;
      interviewerId?: string;
    }) => {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await apiRequest(`/interviews/calendar?${params}`);
      return response.data;
    },
    reschedule: async (data: {
      interviewId: string;
      newScheduledAt: string;
      meetingLink?: string;
    }) => {
      const response = await apiRequest(`/interviews/${data.interviewId}/reschedule`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.data;
    },
  },

  // Payroll
  payroll: {
    getByUser: async (userId: string) => {
      const response = await apiRequest(`/payroll/user/${userId}`);
      return response.data;
    },
    getAll: async () => {
      const response = await apiRequest('/payroll');
      return response.data;
    },
    process: async (payrollData: {
      userId: string;
      month: string;
      year: number;
      baseSalary: number;
      allowances?: number;
      deductions?: number;
    }) => {
      const response = await apiRequest('/payroll/process', {
        method: 'POST',
        body: JSON.stringify(payrollData),
      });
      return response.data;
    },
    generatePayslip: async (payrollId: string) => {
      const response = await apiRequest(`/payroll/${payrollId}/payslip`, {
        method: 'POST',
      });
      return response.data;
    },
    updateStatus: async (data: {
      payrollId: string;
      status: "pending" | "processed" | "paid";
    }) => {
      const response = await apiRequest(`/payroll/${data.payrollId}/status`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.data;
    },
  },

  // Performance
  performance: {
    getByUser: async (userId: string) => {
      const response = await apiRequest(`/performance/user/${userId}`);
      return response.data;
    },
    getAll: async () => {
      const response = await apiRequest('/performance');
      return response.data;
    },
    create: async (reviewData: {
      userId: string;
      reviewerId: string;
      period: string;
      score: number;
      feedback: string;
      goals: string[];
      achievements: string[];
    }) => {
      const response = await apiRequest('/performance', {
        method: 'POST',
        body: JSON.stringify(reviewData),
      });
      return response.data;
    },
    update: async (data: {
      reviewId: string;
      score?: number;
      feedback?: string;
      goals?: string[];
      achievements?: string[];
    }) => {
      const response = await apiRequest(`/performance/${data.reviewId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.data;
    },
    getAnalytics: async (userId?: string) => {
      const params = userId ? `?userId=${userId}` : '';
      const response = await apiRequest(`/performance/analytics${params}`);
      return response.data;
    },
  },

  // Leaves
  leaves: {
    getByUser: async (userId: string) => {
      const response = await apiRequest(`/leaves/user/${userId}`);
      return response.data;
    },
    getAll: async () => {
      const response = await apiRequest('/leaves');
      return response.data;
    },
    create: async (leaveData: {
      userId: string;
      type: "sick" | "vacation" | "personal" | "maternity" | "paternity";
      startDate: string;
      endDate: string;
      reason: string;
    }) => {
      const response = await apiRequest('/leaves', {
        method: 'POST',
        body: JSON.stringify(leaveData),
      });
      return response.data;
    },
    updateStatus: async (data: {
      leaveId: string;
      status: "approved" | "rejected";
      approvedBy: string;
    }) => {
      const response = await apiRequest(`/leaves/${data.leaveId}/status`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.data;
    },
  },

  // Attendance
  attendance: {
    getByUser: async (userId: string) => {
      const response = await apiRequest(`/attendance/user/${userId}`);
      return response.data;
    },
    getAll: async () => {
      const response = await apiRequest('/attendance');
      return response.data;
    },
    clockIn: async (userId: string) => {
      const response = await apiRequest(`/attendance/clock-in/${userId}`, {
        method: 'POST',
      });
      return response.data;
    },
    clockOut: async (userId: string) => {
      const response = await apiRequest(`/attendance/clock-out/${userId}`, {
        method: 'POST',
      });
      return response.data;
    },
  },

  // AI
  ai: {
    analyzeResume: async (data: {
      candidateId: string;
      resumeText: string;
    }) => {
      const response = await apiRequest('/ai/analyze-resume', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.data;
    },
    chatWithAI: async (data: {
      userId: string;
      message: string;
    }) => {
      const response = await apiRequest('/ai/chat', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.data;
    },
    getChatHistory: async (userId: string) => {
      const response = await apiRequest(`/ai/chat-history/${userId}`);
      return response.data;
    },
  },

  // Email
  email: {
    sendLeaveNotification: async (data: {
      userEmail: string;
      userName: string;
      leaveType: string;
      status: string;
      startDate: string;
      endDate: string;
    }) => {
      const response = await apiRequest('/email/leave-notification', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.success;
    },
    sendInterviewNotification: async (data: {
      candidateEmail: string;
      candidateName: string;
      position: string;
      scheduledAt: string;
      meetingLink?: string;
    }) => {
      const response = await apiRequest('/email/interview-notification', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.success;
    },
    sendPayrollNotification: async (data: {
      userEmail: string;
      userName: string;
      month: string;
      year: number;
      netSalary: number;
    }) => {
      const response = await apiRequest('/email/payroll-notification', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.success;
    },
    sendWelcomeEmail: async (data: {
      userEmail: string;
      userName: string;
      role: string;
      temporaryPassword: string;
    }) => {
      const response = await apiRequest('/email/welcome-email', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.success;
    },
  },

  // Notifications
  notifications: {
    get: async (userId: string) => {
      const response = await apiRequest(`/notifications/${userId}`);
      return response.data;
    },
    create: async (notificationData: {
      userId: string;
      title: string;
      message: string;
      type: "info" | "success" | "warning" | "error";
    }) => {
      const response = await apiRequest('/notifications', {
        method: 'POST',
        body: JSON.stringify(notificationData),
      });
      return response.data;
    },
    markAsRead: async (notificationId: string) => {
      const response = await apiRequest(`/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      return response.success;
    },
    markAllAsRead: async (userId: string) => {
      const response = await apiRequest(`/notifications/user/${userId}/read-all`, {
        method: 'PUT',
      });
      return response.success;
    },
  },

  // Reports
  reports: {
    getAttendanceReport: async (data: {
      startDate: string;
      endDate: string;
      userId?: string;
    }) => {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await apiRequest(`/reports/attendance?${params}`);
      return response.data;
    },
    getLeaveReport: async (data: {
      startDate: string;
      endDate: string;
      userId?: string;
    }) => {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await apiRequest(`/reports/leaves?${params}`);
      return response.data;
    },
    getPayrollReport: async (data: {
      year: number;
      month?: string;
      userId?: string;
    }) => {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      const response = await apiRequest(`/reports/payroll?${params}`);
      return response.data;
    },
    getPerformanceReport: async (data: {
      period?: string;
      userId?: string;
    }) => {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await apiRequest(`/reports/performance?${params}`);
      return response.data;
    },
    getDashboardAnalytics: async () => {
      const response = await apiRequest('/reports/dashboard-analytics');
      return response.data;
    },
  },
};
