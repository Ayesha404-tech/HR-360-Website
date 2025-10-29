import React, { useState } from 'react';
import { LogOut, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';

interface ExitRequest {
  id: string;
  userId: string;
  resignationDate: string;
  lastWorkingDay: string;
  reason: string;
  status: 'pending' | 'approved' | 'completed';
  clearanceStatus: {
    it: boolean;
    hr: boolean;
    finance: boolean;
    admin: boolean;
  };
  appliedAt: string;
  exitInterviewScheduled?: boolean;
}

const mockExitRequests: ExitRequest[] = [
  {
    id: '1',
    userId: '3',
    resignationDate: '2024-02-01',
    lastWorkingDay: '2024-02-15',
    reason: 'Better opportunity',
    status: 'pending',
    clearanceStatus: {
      it: false,
      hr: false,
      finance: false,
      admin: false,
    },
    appliedAt: '2024-01-20',
  },
];

export const ExitManagement: React.FC = () => {
  const { user } = useAuth();
  const [exitRequests, setExitRequests] = useState<ExitRequest[]>(mockExitRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    resignationDate: '',
    lastWorkingDay: '',
    reason: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRequest: ExitRequest = {
      id: Date.now().toString(),
      userId: user?.id || '',
      ...formData,
      status: 'pending',
      clearanceStatus: {
        it: false,
        hr: false,
        finance: false,
        admin: false,
      },
      appliedAt: new Date().toISOString().split('T')[0],
    };
    
    setExitRequests([newRequest, ...exitRequests]);
    setIsModalOpen(false);
    setFormData({ resignationDate: '', lastWorkingDay: '', reason: '' });
  };

  const handleClearanceUpdate = (requestId: string, department: keyof ExitRequest['clearanceStatus']) => {
    setExitRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? {
              ...req,
              clearanceStatus: {
                ...req.clearanceStatus,
                [department]: !req.clearanceStatus[department],
              },
            }
          : req
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClearanceProgress = (clearanceStatus: ExitRequest['clearanceStatus']) => {
    const completed = Object.values(clearanceStatus).filter(Boolean).length;
    const total = Object.keys(clearanceStatus).length;
    return (completed / total) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Exit Management</h2>
        {user?.role === 'employee' && (
          <Button onClick={() => setIsModalOpen(true)} variant="danger">
            <LogOut size={20} className="mr-2" />
            Submit Resignation
          </Button>
        )}
      </div>

      {/* Exit Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Exit Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {exitRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Employee Resignation</h3>
                    <p className="text-gray-600">Applied on {request.appliedAt}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Resignation Date</p>
                    <p className="font-medium">{request.resignationDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Working Day</p>
                    <p className="font-medium">{request.lastWorkingDay}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reason</p>
                    <p className="font-medium">{request.reason}</p>
                  </div>
                </div>

                {/* Clearance Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Clearance Progress</h4>
                    <span className="text-sm text-gray-600">
                      {getClearanceProgress(request.clearanceStatus).toFixed(0)}% Complete
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getClearanceProgress(request.clearanceStatus)}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(request.clearanceStatus).map(([dept, completed]) => (
                      <div key={dept} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {completed ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : (
                            <Clock size={16} className="text-yellow-600" />
                          )}
                          <span className="text-sm capitalize">{dept}</span>
                        </div>
                        {(user?.role === 'hr' || user?.role === 'admin') && (
                          <Button
                            size="sm"
                            variant={completed ? "secondary" : "primary"}
                            onClick={() => handleClearanceUpdate(request.id, dept as keyof ExitRequest['clearanceStatus'])}
                          >
                            {completed ? 'Undo' : 'Clear'}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exit Interview */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText size={20} className="text-blue-600" />
                      <span className="font-medium">Exit Interview</span>
                    </div>
                    <Button size="sm" variant="outline">
                      Schedule Interview
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Resignation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Resignation"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle size={20} className="text-yellow-600" />
              <p className="text-yellow-800 font-medium">Important Notice</p>
            </div>
            <p className="text-yellow-700 text-sm mt-2">
              Please ensure you have discussed your resignation with your manager before submitting this request.
            </p>
          </div>

          <Input
            label="Resignation Date"
            type="date"
            value={formData.resignationDate}
            onChange={(e) => setFormData({ ...formData, resignationDate: e.target.value })}
            required
          />
          
          <Input
            label="Last Working Day"
            type="date"
            value={formData.lastWorkingDay}
            onChange={(e) => setFormData({ ...formData, lastWorkingDay: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leaving</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
              placeholder="Please provide your reason for leaving..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger">
              Submit Resignation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};