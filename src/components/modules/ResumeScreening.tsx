import React, { useState, useRef } from 'react';
import { Upload, FileText, Brain, CheckCircle, XCircle, Star, Download, TrendingUp, Target, Users, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { Candidate } from '../../types';
import { api } from '../../lib/api';
import { analyzeResume, parseResumeFile } from '../../lib/ai-services';
import { cloudStorage, validateFile } from '../../lib/cloud-storage';
import { emailService } from '../../lib/email-service';

const mockCandidates: Candidate[] = [
  {
    id: '1',
    firstName: 'Muhammad',
    lastName: 'Hassan',
    email: 'muhammad.hassan@email.com',
    phone: '+92-334568767',
    position: 'Frontend Developer',
    status: 'screening',
    appliedAt: '2025-01-10',
    aiScore: 85,
    resumeUrl: '/resume-alice.pdf',
  },
  {
    id: '2',
    firstName: 'Aleena',
    lastName: 'Abbas',
    email: 'aleena.abbas@email.com',
    phone: '+92-334567821',
    position: 'Backend Developer',
    status: 'interview',
    appliedAt: '2025-01-12',
    aiScore: 78,
    resumeUrl: '/resume-bob.pdf',
  },
  {
    id: '3',
    firstName: 'Warisha',
    lastName: 'Batool',
    email: 'warisha.batool@email.com',
    phone: '+92-334567890',
    position: 'Full Stack Developer',
    status: 'rejected',
    appliedAt: '2024-01-08',
    aiScore: 45,
    resumeUrl: '/resume-carol.pdf',
  },
];

export const ResumeScreening: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [uploadData, setUploadData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleViewAnalysis = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsAnalysisModalOpen(true);
  };

  const handleStatusChange = async (candidateId: string, newStatus: Candidate['status']) => {
    try {
      // Update status in database
      await api.candidates.updateCandidateStatus({ candidateId, status: newStatus });

      // Update local state
      setCandidates(candidates.map(candidate =>
        candidate.id === candidateId
          ? { ...candidate, status: newStatus }
          : candidate
      ));

      // Send notification to candidate if shortlisted
      if (newStatus === 'interview') {
        const candidate = candidates.find(c => c.id === candidateId);
        if (candidate) {
          await emailService.sendEmail({
            to: candidate.email,
            subject: 'Congratulations! You have been shortlisted - HR360',
            html: `
              <h2>Congratulations!</h2>
              <p>Dear ${candidate.firstName},</p>
              <p>We are pleased to inform you that you have been shortlisted for the position of <strong>${candidate.position}</strong>.</p>
              <p>Our HR team will contact you soon to schedule an interview.</p>
              <p>You can track your application status in "My Applications" section.</p>
              <p>Best regards,<br>HR360 Team</p>
            `
          });
        }
      }
    } catch (error) {
      console.error('Failed to update candidate status:', error);
      alert('Failed to update candidate status. Please try again.');
    }
  };

  const handleUploadResume = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    handleResumeUpload();
  };

  const handleResumeUpload = async () => {
    const file = selectedFile;

    if (!file) {
      alert('Please select a resume file');
      return;
    }

    // Validate file
    const validation = validateFile(file, {
      maxSize: 10,
      allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    });

    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      // Upload to cloud storage
      const uploadResult = await cloudStorage.uploadFile(file, 'resumes');

      if (!uploadResult.success) {
        alert('Failed to upload resume: ' + uploadResult.error);
        return;
      }

      // Parse resume text
      const resumeText = await parseResumeFile(file);

      // Analyze with AI
      const analysis = await analyzeResume(resumeText, uploadData.position);

      // Create candidate data without id (Convex will generate it)
      const candidateData = {
        firstName: uploadData.firstName,
        lastName: uploadData.lastName,
        email: uploadData.email,
        phone: uploadData.phone,
        position: uploadData.position,
        resumeUrl: uploadResult.url,
        experience: analysis.experience,
        education: analysis.education,
        skills: analysis.skills,
        aiScore: analysis.aiScore,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendation: analysis.recommendation,
        summary: analysis.summary,
      };

      // Create candidate in database
      const candidateId = await api.candidates.create(candidateData);

      // Create candidate object for local state
      const newCandidate: Candidate = {
        id: candidateId,
        ...uploadData,
        status: 'screening',
        appliedAt: new Date().toISOString().split('T')[0],
        aiScore: analysis.aiScore,
        resumeUrl: uploadResult.url,
        skills: analysis.skills,
        experience: analysis.experience,
        education: analysis.education,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendation: analysis.recommendation,
        summary: analysis.summary,
      };

      setCandidates([newCandidate, ...candidates]);

      // Send notification email
      await emailService.sendEmail({
        to: uploadData.email,
        subject: 'Application Received - HR360',
        html: `
          <h2>Thank you for your application!</h2>
          <p>Dear ${uploadData.firstName},</p>
          <p>We have received your application for the position of <strong>${uploadData.position}</strong>.</p>
          <p>Our AI system has analyzed your resume and you will hear from us soon.</p>
          <p>Best regards,<br>HR360 Team</p>
        `
      });

      setIsUploadModalOpen(false);
      setUploadData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      alert(`Resume uploaded and analyzed successfully! AI Score: ${analysis.aiScore}%`);
    } catch (error) {
      console.error('Resume processing failed:', error);
      alert('Failed to process resume. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'screening': return 'bg-yellow-100 text-yellow-800';
      case 'interview': return 'bg-blue-100 text-blue-800';
      case 'offered': return 'bg-purple-100 text-purple-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const filteredCandidates = candidates.filter(candidate =>
    selectedStatus === '' || candidate.status === selectedStatus
  );

  // Calculate comprehensive KPIs
  const calculateKPIs = () => {
    const totalCandidates = candidates.length;
    const screenedCandidates = candidates.filter(c => c.status !== 'screening');
    const interviewedCandidates = candidates.filter(c => ['interview', 'offered', 'hired'].includes(c.status));
    const hiredCandidates = candidates.filter(c => c.status === 'hired');
    const rejectedCandidates = candidates.filter(c => c.status === 'rejected');

    const avgAIScore = totalCandidates > 0
      ? Math.round(candidates.reduce((sum, c) => sum + (c.aiScore || 0), 0) / totalCandidates)
      : 0;

    const screeningToInterviewRate = screenedCandidates.length > 0
      ? Math.round((interviewedCandidates.length / screenedCandidates.length) * 100)
      : 0;

    const interviewToHireRate = interviewedCandidates.length > 0
      ? Math.round((hiredCandidates.length / interviewedCandidates.length) * 100)
      : 0;

    const overallConversionRate = totalCandidates > 0
      ? Math.round((hiredCandidates.length / totalCandidates) * 100)
      : 0;

    const rejectionRate = totalCandidates > 0
      ? Math.round((rejectedCandidates.length / totalCandidates) * 100)
      : 0;

    const highQualityCandidates = candidates.filter(c => (c.aiScore || 0) >= 80).length;
    const qualityRatio = totalCandidates > 0
      ? Math.round((highQualityCandidates / totalCandidates) * 100)
      : 0;

    return {
      total: totalCandidates,
      screening: candidates.filter(c => c.status === 'screening').length,
      interview: candidates.filter(c => c.status === 'interview').length,
      hired: hiredCandidates.length,
      avgAIScore,
      screeningToInterviewRate,
      interviewToHireRate,
      overallConversionRate,
      rejectionRate,
      qualityRatio,
      highQualityCandidates,
    };
  };

  const kpis = calculateKPIs();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">AI Resume Screening</h2>
        {(user?.role === 'hr' || user?.role === 'admin') && (
          <Button onClick={handleUploadResume}>
            <Upload size={20} className="mr-2" />
            Upload Resume
          </Button>
        )}
      </div>

      {/* Enhanced Stats Cards with KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg AI Score</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.avgAIScore}%</p>
            </div>
            <Brain className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.overallConversionRate}%</p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">High Quality (≥80%)</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.qualityRatio}%</p>
            </div>
            <Award className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Recruitment Funnel KPIs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Screening → Interview Rate</span>
                <span className="text-lg font-bold text-blue-600">{kpis.screeningToInterviewRate}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Interview → Hire Rate</span>
                <span className="text-lg font-bold text-green-600">{kpis.interviewToHireRate}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Overall Conversion</span>
                <span className="text-lg font-bold text-purple-600">{kpis.overallConversionRate}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium">Rejection Rate</span>
                <span className="text-lg font-bold text-red-600">{kpis.rejectionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-600" />
              Candidate Quality Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium">High Quality Candidates</span>
                <span className="text-lg font-bold text-yellow-600">{kpis.highQualityCandidates}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                <span className="text-sm font-medium">Quality Ratio</span>
                <span className="text-lg font-bold text-indigo-600">{kpis.qualityRatio}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                <span className="text-sm font-medium">In Screening</span>
                <span className="text-lg font-bold text-teal-600">{kpis.screening}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium">Interview Stage</span>
                <span className="text-lg font-bold text-orange-600">{kpis.interview}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Candidate Applications</CardTitle>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="screening">Screening</option>
              <option value="interview">Interview</option>
              <option value="offered">Offered</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
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
                  <th className="text-left py-4 px-2">AI Score</th>
                  <th className="text-left py-4 px-2">Status</th>
                  <th className="text-left py-4 px-2">Applied Date</th>
                  <th className="text-left py-4 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{candidate.firstName} {candidate.lastName}</p>
                          <p className="text-sm text-gray-500">{candidate.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">{candidate.position}</td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreBadge(candidate.aiScore || 0)}`}>
                          {candidate.aiScore}%
                        </span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={star <= Math.floor((candidate.aiScore || 0) / 20) ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <select
                        value={candidate.status}
                        onChange={(e) => handleStatusChange(candidate.id, e.target.value as Candidate['status'])}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-none ${getStatusColor(candidate.status)}`}
                      >
                        <option value="screening">Screening</option>
                        <option value="interview">Interview</option>
                        <option value="offered">Offered</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="py-4 px-2">{candidate.appliedAt}</td>
                    <td className="py-4 px-2">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewAnalysis(candidate)}
                        >
                          <Brain size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(candidate.resumeUrl, '_blank')}
                        >
                          <Download size={16} />
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

      {/* AI Analysis Modal */}
      <Modal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        title={`AI Analysis - ${selectedCandidate?.firstName} ${selectedCandidate?.lastName}`}
        size="xl"
      >
        {selectedCandidate && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-2" />
                  AI Score: {selectedCandidate.aiScore || 0}%
                </h4>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${(selectedCandidate.aiScore || 0) >= 80 ? 'bg-green-500' : (selectedCandidate.aiScore || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${selectedCandidate.aiScore || 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Position Applied</h4>
                <p className="text-gray-700">{selectedCandidate.position}</p>
              </div>
            </div>

            {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Skills Identified</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedCandidate.strengths && selectedCandidate.strengths.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">Strengths</h4>
                  <ul className="space-y-1">
                    {selectedCandidate.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedCandidate.weaknesses && selectedCandidate.weaknesses.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">Areas for Improvement</h4>
                  <ul className="space-y-1">
                    {selectedCandidate.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <XCircle size={16} className="text-red-600" />
                        <span className="text-sm">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {selectedCandidate.experience && (
              <div>
                <h4 className="font-semibold mb-2">Experience</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedCandidate.experience}
                </p>
              </div>
            )}

            {selectedCandidate.education && (
              <div>
                <h4 className="font-semibold mb-2">Education</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedCandidate.education}
                </p>
              </div>
            )}

            {selectedCandidate.recommendation && (
              <div>
                <h4 className="font-semibold mb-2">AI Recommendation</h4>
                <p className="text-gray-700 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                  {selectedCandidate.recommendation}
                </p>
              </div>
            )}

            {selectedCandidate.summary && (
              <div>
                <h4 className="font-semibold mb-2">Summary</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedCandidate.summary}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="outline" onClick={() => setIsAnalysisModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => handleStatusChange(selectedCandidate.id, 'interview')}>
                Move to Interview
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload Resume Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload New Resume"
        size="lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={uploadData.firstName}
              onChange={(e) => setUploadData({ ...uploadData, firstName: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={uploadData.lastName}
              onChange={(e) => setUploadData({ ...uploadData, lastName: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            value={uploadData.email}
            onChange={(e) => setUploadData({ ...uploadData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            value={uploadData.phone}
            onChange={(e) => setUploadData({ ...uploadData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Position Applied For"
            value={uploadData.position}
            onChange={(e) => setUploadData({ ...uploadData, position: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Drop resume file here or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              id="resume-upload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                }
              }}
            />
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              Choose File
            </Button>
            {selectedFile && (
              <p className="text-sm text-green-600 mt-2">Selected: {selectedFile.name}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">Supported: PDF, DOC, DOCX (Max 10MB)</p>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Brain size={16} className="mr-2" />
              Process with AI
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
