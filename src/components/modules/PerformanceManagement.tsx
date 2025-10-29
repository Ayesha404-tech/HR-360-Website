import React, { useState } from 'react';
import { TrendingUp, Target, Award, Calendar, Star, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { PerformanceReview } from '../../types';
import { formatDate } from '../../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const mockPerformanceReviews: PerformanceReview[] = [
  {
    id: '1',
    userId: '3',
    reviewerId: '2',
    period: 'Q4 2023',
    score: 4.5,
    feedback: 'Excellent performance with strong technical skills and leadership qualities.',
    goals: ['Complete React certification', 'Lead team project', 'Improve communication skills'],
    achievements: ['Delivered 3 major features', 'Mentored 2 junior developers', 'Reduced bug count by 40%'],
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    userId: '3',
    reviewerId: '2',
    period: 'Q3 2023',
    score: 4.2,
    feedback: 'Good performance with room for improvement in project management.',
    goals: ['Improve time management', 'Learn new technologies', 'Enhance teamwork'],
    achievements: ['Completed 5 projects on time', 'Learned TypeScript', 'Improved code quality'],
    createdAt: '2023-10-15',
  },
];

const performanceData = [
  { period: 'Q1 2023', score: 3.8 },
  { period: 'Q2 2023', score: 4.0 },
  { period: 'Q3 2023', score: 4.2 },
  { period: 'Q4 2023', score: 4.5 },
];

const skillsData = [
  { skill: 'Technical Skills', score: 4.5, fullMark: 5 },
  { skill: 'Communication', score: 4.0, fullMark: 5 },
  { skill: 'Leadership', score: 4.2, fullMark: 5 },
  { skill: 'Problem Solving', score: 4.6, fullMark: 5 },
  { skill: 'Teamwork', score: 4.3, fullMark: 5 },
  { skill: 'Innovation', score: 4.1, fullMark: 5 },
];

export const PerformanceManagement: React.FC = () => {
  const { user } = useAuth();
  const [reviews] = useState<PerformanceReview[]>(mockPerformanceReviews);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewDetails = (review: PerformanceReview) => {
    setSelectedReview(review);
    setIsDetailModalOpen(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 4.0) return 'text-blue-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 4.5) return 'bg-green-100 text-green-800';
    if (score >= 4.0) return 'bg-blue-100 text-blue-800';
    if (score >= 3.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const currentScore = reviews.length > 0 ? reviews[0].score : 0;
  const averageScore = reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Performance Management</h2>
        {(user?.role === 'hr' || user?.role === 'admin') && (
          <Button>
            <Award size={20} className="mr-2" />
            Create Review
          </Button>
        )}
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(currentScore)}`}>
                {currentScore.toFixed(1)}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>
                {averageScore.toFixed(1)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Reviews</p>
              <p className="text-3xl font-bold text-gray-900">{reviews.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Goals Achieved</p>
              <p className="text-3xl font-bold text-gray-900">85%</p>
            </div>
            <Target className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={90} domain={[0, 5]} />
                <Radar name="Score" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-2">Period</th>
                  <th className="text-left py-4 px-2">Score</th>
                  <th className="text-left py-4 px-2">Reviewer</th>
                  <th className="text-left py-4 px-2">Date</th>
                  <th className="text-left py-4 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="font-medium">{review.period}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBadge(review.score)}`}>
                        {review.score.toFixed(1)} / 5.0
                      </span>
                    </td>
                    <td className="py-4 px-2">HR Manager</td>
                    <td className="py-4 px-2">{formatDate(review.createdAt)}</td>
                    <td className="py-4 px-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(review)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Review Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Performance Review - ${selectedReview?.period}`}
        size="xl"
      >
        {selectedReview && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Review Details</h4>
                <div className="space-y-2">
                  <p><span className="text-gray-600">Period:</span> {selectedReview.period}</p>
                  <p><span className="text-gray-600">Score:</span> 
                    <span className={`ml-2 font-bold ${getScoreColor(selectedReview.score)}`}>
                      {selectedReview.score.toFixed(1)} / 5.0
                    </span>
                  </p>
                  <p><span className="text-gray-600">Date:</span> {formatDate(selectedReview.createdAt)}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Overall Rating</h4>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={24}
                      className={star <= selectedReview.score ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Feedback</h4>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedReview.feedback}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Goals for Next Period</h4>
                <ul className="space-y-2">
                  {selectedReview.goals.map((goal, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Target size={16} className="text-blue-600" />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Key Achievements</h4>
                <ul className="space-y-2">
                  {selectedReview.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Award size={16} className="text-green-600" />
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};