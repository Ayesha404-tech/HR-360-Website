import React, { useState } from 'react';
import { Download, FileText, BarChart3, Calendar, Users, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const attendanceData = [
  { month: 'Jan', present: 85, absent: 15 },
  { month: 'Feb', present: 88, absent: 12 },
  { month: 'Mar', present: 82, absent: 18 },
  { month: 'Apr', present: 90, absent: 10 },
  { month: 'May', present: 87, absent: 13 },
  { month: 'Jun', present: 92, absent: 8 },
];

const departmentData = [
  { name: 'Engineering', employees: 45, color: '#3B82F6' },
  { name: 'Marketing', employees: 20, color: '#10B981' },
  { name: 'Sales', employees: 30, color: '#F59E0B' },
  { name: 'HR', employees: 15, color: '#8B5CF6' },
  { name: 'Finance', employees: 12, color: '#EF4444' },
];

const leaveData = [
  { month: 'Jan', approved: 25, pending: 5, rejected: 3 },
  { month: 'Feb', approved: 30, pending: 8, rejected: 2 },
  { month: 'Mar', approved: 28, pending: 6, rejected: 4 },
  { month: 'Apr', approved: 35, pending: 4, rejected: 1 },
  { month: 'May', approved: 32, pending: 7, rejected: 3 },
  { month: 'Jun', approved: 38, pending: 5, rejected: 2 },
];

export const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [dateRange, setDateRange] = useState('6months');

  const handleDownloadReport = (reportType: string) => {
    // Generate actual report content based on type
    let reportContent = '';

    switch (reportType) {
      case 'attendance':
        reportContent = `
HR360 Attendance Report
Generated on: ${new Date().toLocaleDateString()}

Monthly Attendance Trends:
${attendanceData.map(item => `${item.month}: Present ${item.present}%, Absent ${item.absent}%`).join('\n')}

Summary:
- Average Attendance: 87.3%
- Average Absenteeism: 12.7%
- Total Working Days: 180
        `;
        break;
      case 'leave':
        reportContent = `
HR360 Leave Management Report
Generated on: ${new Date().toLocaleDateString()}

Monthly Leave Trends:
${leaveData.map(item => `${item.month}: Approved ${item.approved}, Pending ${item.pending}, Rejected ${item.rejected}`).join('\n')}
        `;
        break;
      case 'department':
        reportContent = `
HR360 Department Distribution Report
Generated on: ${new Date().toLocaleDateString()}

Department Statistics:
${departmentData.map(dept => `${dept.name}: ${dept.employees} employees`).join('\n')}
        `;
        break;
      default:
        reportContent = `HR360 ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report\nGenerated on: ${new Date().toLocaleDateString()}`;
    }

    // Create blob and download
    const blob = new Blob([reportContent.trim()], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(`Downloading ${reportType} report...`);
  };

  const reportTypes = [
    { id: 'attendance', name: 'Attendance Report', icon: Calendar },
    { id: 'leave', name: 'Leave Report', icon: FileText },
    { id: 'payroll', name: 'Payroll Report', icon: BarChart3 },
    { id: 'performance', name: 'Performance Report', icon: TrendingUp },
    { id: 'department', name: 'Department Report', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <div className="flex space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <Button onClick={() => handleDownloadReport(selectedReport)}>
            <Download size={20} className="mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Report Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Report Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {reportTypes.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedReport === report.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <report.icon size={24} className={`mx-auto mb-2 ${
                  selectedReport === report.id ? 'text-blue-600' : 'text-gray-600'
                }`} />
                <p className={`text-sm font-medium ${
                  selectedReport === report.id ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {report.name}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {selectedReport === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Attendance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="present" fill="#10B981" name="Present" />
                  <Bar dataKey="absent" fill="#EF4444" name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-green-600">Average Attendance</p>
                    <p className="text-2xl font-bold text-green-800">87.3%</p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm text-red-600">Average Absenteeism</p>
                    <p className="text-2xl font-bold text-red-800">12.7%</p>
                  </div>
                  <Users className="w-8 h-8 text-red-600" />
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-blue-600">Total Working Days</p>
                    <p className="text-2xl font-bold text-blue-800">180</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedReport === 'department' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="employees"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Department Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentData.map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: dept.color }}
                      ></div>
                      <span className="font-medium">{dept.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{dept.employees}</p>
                      <p className="text-sm text-gray-500">employees</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedReport === 'leave' && (
        <Card>
          <CardHeader>
            <CardTitle>Leave Management Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={leaveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="approved" stroke="#10B981" strokeWidth={2} name="Approved" />
                <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={2} name="Pending" />
                <Line type="monotone" dataKey="rejected" stroke="#EF4444" strokeWidth={2} name="Rejected" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">247</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">18</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <FileText className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Performance</p>
              <p className="text-2xl font-bold text-gray-900">4.2</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>
    </div>
  );
};
