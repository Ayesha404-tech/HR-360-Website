import React, { useState } from 'react';
import { Calendar, Clock, User, Video, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { Interview, Candidate } from '../../types';
import { formatDate, formatTime } from '../../lib/utils';
import { emailService } from '../../lib/email-service';

const mockCandidates: Candidate[] = [
  {
    id: '1',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@email.com',
    phone: '+1-555-0123',
    position: 'Frontend Developer',
    status: 'interview',
    appliedAt: '2024-01-10',
    aiScore: 85,
  },
  {
    id: '2',
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob.smith@email.com',
    phone: '+1-555-0124',
    position: 'Backend Developer',
    status: 'screening',
    appliedAt: '2024-01-12',
    aiScore: 78,
  },
];

const mockInterviews: Interview[] = [
  {
    id: '1',
    candidateId: '1',
    interviewerId: '2',
    position: 'Frontend Developer',
    scheduledAt: '2024-01-20T10:00:00',
    status: 'scheduled',
  },
  {
    id: '2',
    candidateId: '2',
    interviewerId: '2',
    position: 'Backend Developer',
    scheduledAt: '2024-01-22T14:00:00',
    status: 'completed',
    feedback: 'Strong technical skills, good communication',
    rating: 4,
  },
];

export const InterviewScheduling: React.FC = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>(mockInterviews);
  const [candidates] = useState<Candidate[]>(mockCandidates);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [formData, setFormData] = useState({
    candidateId: '',
    position: '',
    scheduledAt: '',
    type: 'video' as 'video' | 'in-person' | 'phone',
    location: '',
    notes: '',
  });

  const handleCreateInterview = () => {
    setEditingInterview(null);
    setFormData({
      candidateId: '',
      position: '',
      scheduledAt: '',
      type: 'video',
      location: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleEditInterview = (interview: Interview) => {
    setEditingInterview(interview);
    setFormData({
      candidateId: interview.candidateId,
      position: interview.position,
      scheduledAt: interview.scheduledAt.slice(0, 16),
      type: 'video',
      location: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingInterview) {
      setInterviews(interviews.map(interview => 
        interview.id === editingInterview.id 
          ? { ...interview, ...formData, scheduledAt: formData.scheduledAt }
          : interview
      ));
    } else {
      const newInterview: Interview = {
        id: Date.now().toString(),
        ...formData,
        interviewerId: user?.id || '',
        status: 'scheduled',
      };
      setInterviews([...interviews, newInterview]);
      
      // Send email notification to candidate
      const candidate = candidates.find(c => c.id === formData.candidateId);
      if (candidate) {
        emailService.sendInterviewScheduleEmail(
          candidate.email,
          `${candidate.firstName} ${candidate.lastName}`,
          {
            position: formData.position,
            scheduledAt: formData.scheduledAt,
            meetingLink: formData.location,
            location: formData.location
          }
        );
      }
    }
    
    setIsModalOpen(false);
  };

  const handleDeleteInterview = (interviewId: string) => {
    if (window.confirm('Are you sure you want to delete this interview?')) {
      setInterviews(interviews.filter(interview => interview.id !== interviewId));
    }
  };

  const handleCompleteInterview = (interviewId: string) => {
    const feedback = prompt('Enter interview feedback:');
    const rating = prompt('Enter rating (1-5):');
    
    if (feedback && rating) {
      setInterviews(interviews.map(interview => 
        interview.id === interviewId 
          ? { 
              ...interview, 
              status: 'completed' as const,
              feedback,
              rating: parseInt(rating)
            }
          : interview
      ));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCandidateName = (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    return candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown';
  };

  const getCandidateEmail = (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    return candidate?.email || '';
  };

  const filteredInterviews = interviews.filter(interview => {
    // For candidates, only show their own interviews
    if (user?.role === 'candidate') {
      const candidateEmail = user.email;
      const candidate = candidates.find(c => c.email === candidateEmail);
      return candidate && interview.candidateId === candidate.id && (selectedStatus === '' || interview.status === selectedStatus);
    }
    // For HR/Admin, show all interviews
    return selectedStatus === '' || interview.status === selectedStatus;
  });

  const upcomingInterviews = interviews.filter(interview => 
    interview.status === 'scheduled' && new Date(interview.scheduledAt) > new Date()
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Interview Scheduling</h2>
        {(user?.role === 'hr' || user?.role === 'admin') && (
          <Button onClick={handleCreateInterview}>
            <Plus size={20} className="mr-2" />
            Schedule Interview
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Interviews</p>
              <p className="text-2xl font-bold text-gray-900">{interviews.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingInterviews.length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {interviews.filter(i => i.status === 'completed').length}
              </p>
            </div>
            <User className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">75%</p>
            </div>
            <Video className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Upcoming Interviews */}
      {upcomingInterviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock size={24} className="text-blue-600" />
              <span>Upcoming Interviews</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingInterviews.slice(0, 3).map((interview) => (
                <div key={interview.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{getCandidateName(interview.candidateId)}</p>
                      <p className="text-sm text-gray-600">{interview.position}</p>
                      <p className="text-sm text-blue-600">
                        {formatDate(interview.scheduledAt)} at {formatTime(interview.scheduledAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Video size={16} className="mr-2" />
                      Join
                    </Button>
                    <Button size="sm" onClick={() => handleCompleteInterview(interview.id)}>
                      Complete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Interviews */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Interviews</CardTitle>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-2">Candidate</th>
                  <th className="text-left py-4 px-2">Position</th>
                  <th className="text-left py-4 px-2">Date & Time</th>
                  <th className="text-left py-4 px-2">Status</th>
                  <th className="text-left py-4 px-2">Rating</th>
                  <th className="text-left py-4 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterviews.map((interview) => (
                  <tr key={interview.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-2">
                      <div>
                        <p className="font-medium">{getCandidateName(interview.candidateId)}</p>
                        <p className="text-sm text-gray-500">{getCandidateEmail(interview.candidateId)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-2">{interview.position}</td>
                    <td className="py-4 px-2">
                      <div>
                        <p>{formatDate(interview.scheduledAt)}</p>
                        <p className="text-sm text-gray-500">{formatTime(interview.scheduledAt)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                        {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      {interview.rating ? (
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{interview.rating}</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex space-x-2">
                        {interview.status === 'scheduled' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditInterview(interview)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleCompleteInterview(interview.id)}
                            >
                              Complete
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteInterview(interview.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingInterview ? 'Edit Interview' : 'Schedule Interview'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate</label>
            <select
              value={formData.candidateId}
              onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Candidate</option>
              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.firstName} {candidate.lastName} - {candidate.position}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            required
          />
          <Input
            label="Date & Time"
            type="datetime-local"
            value={formData.scheduledAt}
            onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'video' | 'in-person' | 'phone' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="video">Video Call</option>
              <option value="in-person">In-Person</option>
              <option value="phone">Phone Call</option>
            </select>
          </div>
          <Input
            label="Location/Meeting Link"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Meeting room or video call link"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional notes or instructions"
            />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingInterview ? 'Update' : 'Schedule'} Interview
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};