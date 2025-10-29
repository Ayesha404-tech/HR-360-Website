import React from 'react';
import { Users, Clock, Calendar, DollarSign, TrendingUp, FileText, UserPlus, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../dashboard/StatCard';
import { DashboardChart } from '../dashboard/DashboardChart';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const attendanceData = [
    { name: 'Mon', value: 85 },
    { name: 'Tue', value: 92 },
    { name: 'Wed', value: 78 },
    { name: 'Thu', value: 88 },
    { name: 'Fri', value: 95 },
    { name: 'Sat', value: 45 },
    { name: 'Sun', value: 12 },
  ];

  const performanceData = [
    { name: 'Jan', value: 4.2 },
    { name: 'Feb', value: 4.5 },
    { name: 'Mar', value: 4.3 },
    { name: 'Apr', value: 4.7 },
    { name: 'May', value: 4.6 },
    { name: 'Jun', value: 4.8 },
  ];

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={247}
          icon={Users}
          change="+12 this month"
          changeType="increase"
          color="blue"
        />
        <StatCard
          title="Present Today"
          value={198}
          icon={CheckCircle}
          change="80.2% attendance"
          changeType="increase"
          color="green"
        />
        <StatCard
          title="Pending Leaves"
          value={15}
          icon={Calendar}
          change="3 urgent"
          changeType="neutral"
          color="yellow"
        />
        <StatCard
          title="Monthly Payroll"
          value="$1.2M"
          icon={DollarSign}
          change="+8.5% from last month"
          changeType="increase"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart
          title="Weekly Attendance"
          data={attendanceData}
          type="bar"
          dataKey="value"
          color="#10B981"
        />
        <DashboardChart
          title="Performance Trends"
          data={performanceData}
          type="line"
          dataKey="value"
          color="#8B5CF6"
        />
      </div>
    </div>
  );

  const renderHRDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Employees"
          value={156}
          icon={Users}
          change="+8 this month"
          changeType="increase"
          color="blue"
        />
        <StatCard
          title="Open Positions"
          value={12}
          icon={UserPlus}
          change="5 urgent"
          changeType="neutral"
          color="yellow"
        />
        <StatCard
          title="Leave Requests"
          value={23}
          icon={Calendar}
          change="8 pending approval"
          changeType="neutral"
          color="red"
        />
        <StatCard
          title="Avg Performance"
          value={4.6}
          icon={TrendingUp}
          change="+0.3 from last month"
          changeType="increase"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart
          title="Daily Attendance"
          data={attendanceData}
          type="line"
          dataKey="value"
          color="#3B82F6"
        />
        <DashboardChart
          title="Department Performance"
          data={performanceData}
          type="bar"
          dataKey="value"
          color="#F59E0B"
        />
      </div>
    </div>
  );

  const renderEmployeeDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Hours This Week"
          value={42}
          icon={Clock}
          change="+2 from last week"
          changeType="increase"
          color="blue"
        />
        <StatCard
          title="Leave Balance"
          value={18}
          icon={Calendar}
          change="5 days pending"
          changeType="neutral"
          color="green"
        />
        <StatCard
          title="This Month Salary"
          value="$5,200"
          icon={DollarSign}
          change="Base: $4,800"
          changeType="neutral"
          color="purple"
        />
        <StatCard
          title="Performance Score"
          value={4.7}
          icon={TrendingUp}
          change="+0.2 improvement"
          changeType="increase"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart
          title="My Weekly Hours"
          data={attendanceData}
          type="bar"
          dataKey="value"
          color="#10B981"
        />
        <DashboardChart
          title="Performance History"
          data={performanceData}
          type="line"
          dataKey="value"
          color="#8B5CF6"
        />
      </div>
    </div>
  );

  const renderCandidateDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Applications"
          value={5}
          icon={FileText}
          change="2 active"
          changeType="neutral"
          color="blue"
        />
        <StatCard
          title="Interviews"
          value={3}
          icon={Users}
          change="1 scheduled"
          changeType="increase"
          color="green"
        />
        <StatCard
          title="Response Rate"
          value="60%"
          icon={TrendingUp}
          change="+20% this month"
          changeType="increase"
          color="yellow"
        />
        <StatCard
          title="AI Score"
          value={85}
          icon={CheckCircle}
          change="Excellent match"
          changeType="increase"
          color="green"
        />
      </div>
    </div>
  );

  const getDashboardContent = () => {
    switch (user?.role) {
      case 'admin':
        return renderAdminDashboard();
      case 'hr':
        return renderHRDashboard();
      case 'employee':
        return renderEmployeeDashboard();
      case 'candidate':
        return renderCandidateDashboard();
      default:
        return renderEmployeeDashboard();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Welcome back, {user?.firstName}!
        </h2>
        <p className="text-gray-600">Here's what's happening in your workspace today.</p>
      </div>
      
      {getDashboardContent()}
    </div>
  );
};