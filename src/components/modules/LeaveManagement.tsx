import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Plus, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { LeaveRequest } from '../../types';
import { formatDate } from '../../lib/utils';
import { emailService } from '../../lib/email-service';

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    userId: '3',
    type: 'vacation',
    startDate: '2024-02-15',
    endDate: '2024-02-20',
    reason: 'Family vacation to Dubai',
    status: 'approved',
    approvedBy: '2',
    appliedAt: '2024-01-20',
  },
  {
    id: '2',
    userId: '3',
    type: 'sick',
    startDate: '2024-01-25',
    endDate: '2024-01-26',
    reason: 'Fever and flu symptoms',
    status: 'pending',
    appliedAt: '2024-01-24',
  },
];

export const LeaveManagement: React.FC = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [formData, setFormData] = useState({
    type: 'vacation' as LeaveRequest['type'],
    startDate: '',
    endDate: '',
    reason: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      userId: user?.id || '',
      ...formData,
      status: 'pending',
      appliedAt: new Date().toISOString().split('T')[0],
    };
    setLeaveRequests([newRequest, ...leaveRequests]);
    setIsModalOpen(false);
    setFormData({ type: 'vacation', startDate: '', endDate: '', reason: '' });
  };

  const handleApproval = (id: string, status: 'approved' | 'rejected') => {
    setLeaveRequests(prev =>
      prev.map(req =>
        req.id === id
          ? { ...req, status, approvedBy: user?.id }
          : req
      )
    );
    
    // Send email notification
    const request = leaveRequests.find(req => req.id === id);
    if (request) {
      emailService.sendLeaveApprovalEmail(
        'employee@hr360.com', // In real app, get from user data
        'Employee Name',
        status,
        {
          type: request.type,
          startDate: request.startDate,
          endDate: request.endDate,
          reason: request.reason
        }
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} className="text-green-600" />;
      case 'rejected': return <XCircle size={16} className="text-red-600" />;
      case 'pending': return <AlertCircle size={16} className="text-yellow-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  const filteredRequests = leaveRequests.filter(req => 
    selectedStatus === '' || req.status === selectedStatus
  );

  const leaveBalance = {
    vacation: 20,
    sick: 10,
    personal: 5,
    used: 8,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Leave Management</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Apply for Leave
        </Button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="text-center">
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{leaveBalance.vacation}</p>
            <p className="text-sm text-gray-600">Vacation Days</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{leaveBalance.sick}</p>
            <p className="text-sm text-gray-600">Sick Days</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{leaveBalance.personal}</p>
            <p className="text-sm text-gray-600">Personal Days</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{leaveBalance.used}</p>
            <p className="text-sm text-gray-600">Days Used</p>
          </div>
        </Card>
      </div>

      {/* Leave Requests */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Leave Requests</CardTitle>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-2">Type</th>
                  <th className="text-left py-4 px-2">Duration</th>
                  <th className="text-left py-4 px-2">Reason</th>
                  <th className="text-left py-4 px-2">Status</th>
                  <th className="text-left py-4 px-2">Applied</th>
                  {(user?.role === 'hr' || user?.role === 'admin') && (
                    <th className="text-left py-4 px-2">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-2">
                      <span className="capitalize font-medium">{request.type}</span>
                    </td>
                    <td className="py-4 px-2">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </td>
                    <td className="py-4 px-2 max-w-xs truncate">{request.reason}</td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-2">{formatDate(request.appliedAt)}</td>
                    {(user?.role === 'hr' || user?.role === 'admin') && (
                      <td className="py-4 px-2">
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproval(request.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleApproval(request.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Apply for Leave"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as LeaveRequest['type'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="vacation">Vacation</option>
              <option value="sick">Sick Leave</option>
              <option value="personal">Personal</option>
              <option value="maternity">Maternity</option>
              <option value="paternity">Paternity</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};