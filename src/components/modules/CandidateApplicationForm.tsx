import React, { useState } from 'react';
import { FileText, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

export const CandidateApplicationForm: React.FC = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    position: '',
    experience: '',
    education: '',
    skills: '',
    coverLetter: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.position.trim()) {
      setError('Please specify the position you are applying for');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create candidate record without resume upload
      const candidateData = {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        position: formData.position,
        resumeUrl: '', // Will be uploaded by HR later
        experience: formData.experience,
        education: formData.education,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
        coverLetter: formData.coverLetter,
        aiScore: 0, // Will be calculated by HR when resume is uploaded
        strengths: [],
        weaknesses: [],
        recommendation: '',
        summary: '',
      };

      // Submit application using Convex
      const result = await api.candidates.create(candidateData);
      console.log('Application submitted successfully:', result);

      setIsSubmitted(true);
    } catch (error) {
      console.error('Application submission failed:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your application. Our HR team will review it and get back to you soon.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong> Check your email for confirmation and track your application status in "My Applications".
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Submit Your Application</h2>
        <p className="mt-2 text-gray-600">
          Fill out the form below and upload your CV to apply for positions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Position Applied For"
              name="position"
              type="text"
              value={formData.position}
              onChange={handleInputChange}
              required
              placeholder="e.g., Frontend Developer, Software Engineer"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Years of Experience"
                name="experience"
                type="text"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="e.g., 3 years"
              />
              <Input
                label="Education"
                name="education"
                type="text"
                value={formData.education}
                onChange={handleInputChange}
                placeholder="e.g., Bachelor's in Computer Science"
              />
            </div>

            <Input
              label="Skills (comma-separated)"
              name="skills"
              type="text"
              value={formData.skills}
              onChange={handleInputChange}
              placeholder="e.g., JavaScript, React, Node.js, Python"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter (Optional)
              </label>
              <textarea
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us why you're interested in this position..."
              />
            </div>

            {/* CV Upload Section - Hidden from candidates */}
            {/* HR will upload CVs directly in the Resume Screening module */}

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">What happens next?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Your CV will be analyzed by our AI system</li>
                <li>• HR will receive your application automatically</li>
                <li>• You'll receive a confirmation email</li>
                <li>• Track your application status in "My Applications"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
