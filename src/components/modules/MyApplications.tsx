import React, { useState, useEffect } from 'react';
import { Eye, Calendar, FileText, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

interface Application {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  status: 'screening' | 'interview' | 'offered' | 'hired' | 'rejected';
  appliedAt: string;
  aiScore?: number;
  resumeUrl?: string;
  experience?: string;
  education?: string;
  skills?: string[];
  coverLetter?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendation?: string;
  summary?: string;
}

export const MyApplications: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      // Use Convex to get applications by email
      const allCandidates = await api.candidates.getAll() as Application[];
      const userApplications = allCandidates.filter(
        (candidate: Application) => candidate.email === user.email
      );
      setApplications(userApplications);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'screening':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'interview':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'offered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'hired':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'screening':
        return 'bg-blue-100 text-blue-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'offered':
        return 'bg-green-100 text-green-800';
      case 'hired':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't submitted any applications yet. Start by applying for a position.
          </p>
          <Button onClick={() => window.location.href = '/dashboard'}>
            Apply for a Position
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">My Applications</h2>
        <p className="mt-2 text-gray-600">
          Track the status of your job applications
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((application) => (
          <Card key={application._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{application.position}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Applied on {formatDate(application.appliedAt)}
                  </p>
                </div>
                {getStatusIcon(application.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>

                {application.aiScore && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">AI Score:</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {application.aiScore}%
                    </span>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setSelectedApplication(application)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedApplication.position}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Applied on {formatDate(selectedApplication.appliedAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(selectedApplication.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.status)}`}>
                    {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Application Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Position:</span>
                        <span className="font-medium">{selectedApplication.position}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Applied Date:</span>
                        <span className="font-medium">{formatDate(selectedApplication.appliedAt)}</span>
                      </div>
                      {selectedApplication.aiScore && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">AI Score:</span>
                          <span className="font-medium text-blue-600">{selectedApplication.aiScore}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedApplication.experience && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
                      <p className="text-sm text-gray-700">{selectedApplication.experience}</p>
                    </div>
                  )}

                  {selectedApplication.education && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Education</h4>
                      <p className="text-sm text-gray-700">{selectedApplication.education}</p>
                    </div>
                  )}

                  {selectedApplication.skills && selectedApplication.skills.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedApplication.coverLetter && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Cover Letter</h4>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedApplication.coverLetter}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedApplication.strengths && selectedApplication.strengths.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">AI Analysis - Strengths</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {selectedApplication.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedApplication.weaknesses && selectedApplication.weaknesses.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">AI Analysis - Areas for Improvement</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {selectedApplication.weaknesses.map((weakness, index) => (
                          <li key={index} className="flex items-start">
                            <AlertCircle className="w-4 h-4 text-alert-600 mr-2 mt-0.5 flex-shrink-0" />
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedApplication.recommendation && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">AI Recommendation</h4>
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-sm text-blue-800">{selectedApplication.recommendation}</p>
                      </div>
                    </div>
                  )}

                  {selectedApplication.resumeUrl && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Resume</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedApplication.resumeUrl, '_blank')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Resume
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
