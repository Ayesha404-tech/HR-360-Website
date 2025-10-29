import React, { useState } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { chatWithAI } from '../../lib/ai-services';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
  suggestions?: string[];
}



export const ChatBot: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: `Hello ${user?.firstName}! I'm your HR360 AI assistant. How can I help you today?`,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get AI response
      const aiResponse = await chatWithAI(inputMessage, `User: ${user?.firstName} ${user?.lastName}, Role: ${user?.role}`);

      // Generate contextual suggestions based on the query
      const suggestions = generateSuggestions(inputMessage);

      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: suggestions,
      };

      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again or contact HR directly.",
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorResponse]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const generateSuggestions = (userMessage: string): string[] => {
    const lowerMessage = userMessage.toLowerCase();
    const suggestions: string[] = [];
    const userRole = user?.role?.toLowerCase() || 'employee';

    // Role-based suggestions
    if (userRole === 'hr') {
      // HR-specific suggestions
      if (lowerMessage.includes('leave') || lowerMessage.includes('vacation')) {
        suggestions.push(
          "View pending leave approvals",
          "Generate leave reports",
          "Update leave policies"
        );
      } else if (lowerMessage.includes('attendance') || lowerMessage.includes('clock')) {
        suggestions.push(
          "View team attendance summary",
          "Generate attendance reports",
          "Approve time-off requests"
        );
      } else if (lowerMessage.includes('payroll') || lowerMessage.includes('salary')) {
        suggestions.push(
          "Process payroll adjustments",
          "Generate payroll reports",
          "Handle payroll queries"
        );
      } else if (lowerMessage.includes('performance') || lowerMessage.includes('review')) {
        suggestions.push(
          "Conduct performance reviews",
          "Set employee goals",
          "Manage improvement plans"
        );
      } else if (lowerMessage.includes('recruit') || lowerMessage.includes('interview')) {
        suggestions.push(
          "Schedule interviews",
          "Review candidate applications",
          "Manage job postings"
        );
      } else {
        suggestions.push(
          "View attendance summary",
          "Approve leave requests",
          "Schedule interview",
          "Manage payroll"
        );
      }
    } else if (userRole === 'admin') {
      // Admin-specific suggestions
      if (lowerMessage.includes('user') || lowerMessage.includes('account')) {
        suggestions.push(
          "Create new user accounts",
          "Manage user permissions",
          "Reset user passwords"
        );
      } else if (lowerMessage.includes('system') || lowerMessage.includes('config')) {
        suggestions.push(
          "Configure system settings",
          "Monitor system performance",
          "Manage database backups"
        );
      } else if (lowerMessage.includes('security') || lowerMessage.includes('access')) {
        suggestions.push(
          "Manage access controls",
          "Monitor security logs",
          "Handle security incidents"
        );
      } else if (lowerMessage.includes('report') || lowerMessage.includes('analytics')) {
        suggestions.push(
          "Generate system reports",
          "Monitor KPIs",
          "Analyze usage patterns"
        );
      } else {
        suggestions.push(
          "Manage users",
          "View system logs",
          "Change permissions",
          "Generate reports"
        );
      }
    } else if (userRole === 'candidate') {
      // Candidate-specific suggestions
      if (lowerMessage.includes('job') || lowerMessage.includes('apply')) {
        suggestions.push(
          "View available job openings",
          "Submit job application",
          "Track my application status"
        );
      } else if (lowerMessage.includes('interview') || lowerMessage.includes('schedule')) {
        suggestions.push(
          "Check interview schedule",
          "Prepare for interview",
          "Reschedule interview"
        );
      } else if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
        suggestions.push(
          "Upload my resume",
          "Update application info",
          "Withdraw application"
        );
      } else {
        suggestions.push(
          "View job openings",
          "Check interview time",
          "Track my application",
          "Update resume"
        );
      }
    } else {
      // Employee-specific suggestions (default)
      if (lowerMessage.includes('leave') || lowerMessage.includes('vacation')) {
        suggestions.push(
          "What's my leave balance?",
          "How do I apply for leave?",
          "Can I see my leave history?"
        );
      } else if (lowerMessage.includes('attendance') || lowerMessage.includes('clock')) {
        suggestions.push(
          "Show me my attendance report",
          "How many hours did I work this month?",
          "Clock in/out procedures"
        );
      } else if (lowerMessage.includes('payroll') || lowerMessage.includes('salary') || lowerMessage.includes('pay')) {
        suggestions.push(
          "What's my salary breakdown?",
          "When is payday?",
          "How do I download my payslip?"
        );
      } else if (lowerMessage.includes('performance') || lowerMessage.includes('review')) {
        suggestions.push(
          "What's my current performance score?",
          "When is my next review?",
          "How can I improve my performance?"
        );
      } else if (lowerMessage.includes('benefit') || lowerMessage.includes('insurance')) {
        suggestions.push(
          "What health insurance do I have?",
          "Tell me about retirement benefits",
          "How does the 401k work?"
        );
      } else if (lowerMessage.includes('career') || lowerMessage.includes('training')) {
        suggestions.push(
          "What training programs are available?",
          "How can I get promoted?",
          "Are there mentorship opportunities?"
        );
      } else if (lowerMessage.includes('policy') || lowerMessage.includes('handbook')) {
        suggestions.push(
          "What's the remote work policy?",
          "Tell me about the code of conduct",
          "What are the safety procedures?"
        );
      } else {
        suggestions.push(
          "How do I apply for leave?",
          "Check my attendance",
          "Show me my payslip",
          "Tell me about benefits"
        );
      }
    }

    return suggestions.slice(0, 3); // Return max 3 suggestions
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">AI Assistant</h2>

      <Card className="h-96">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot size={24} className="text-blue-600" />
            <span>HR360 AI Assistant</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {message.sender === 'user' ? (
                      <User size={16} />
                    ) : (
                      <Bot size={16} />
                    )}
                    <span className="text-xs opacity-75">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-line">{message.text}</p>

                  {/* Contextual Suggestions */}
                  {message.sender === 'bot' && message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-gray-500 font-medium">Suggested questions:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setInputMessage(suggestion)}
                            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader size={16} className="animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading}>
              <Send size={20} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user?.role?.toLowerCase() === 'hr' ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('View pending leave approvals')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Leave Approvals</div>
                    <div className="text-xs text-gray-500">Review pending requests</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('View team attendance summary')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Team Attendance</div>
                    <div className="text-xs text-gray-500">Monitor team hours</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('Schedule interview')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Schedule Interview</div>
                    <div className="text-xs text-gray-500">Manage recruitment</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('Manage payroll')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Payroll Management</div>
                    <div className="text-xs text-gray-500">Process salaries</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('Conduct performance reviews')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Performance Reviews</div>
                    <div className="text-xs text-gray-500">Employee evaluations</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('Handle employee relations')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Employee Relations</div>
                    <div className="text-xs text-gray-500">Manage HR issues</div>
                  </div>
                </Button>
              </>
            ) : user?.role?.toLowerCase() === 'admin' ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('Manage users')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">User Management</div>
                    <div className="text-xs text-gray-500">Create & manage accounts</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('View system logs')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">System Logs</div>
                    <div className="text-xs text-gray-500">Monitor activity</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('Change permissions')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Permissions</div>
                    <div className="text-xs text-gray-500">Access controls</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('Generate reports')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">System Reports</div>
                    <div className="text-xs text-gray-500">Analytics & insights</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('Configure system settings')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">System Config</div>
                    <div className="text-xs text-gray-500">Settings & preferences</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('Monitor system performance')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Performance</div>
                    <div className="text-xs text-gray-500">System health</div>
                  </div>
                </Button>
              </>
            ) : user?.role?.toLowerCase() === 'candidate' ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('View job openings')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Job Openings</div>
                    <div className="text-xs text-gray-500">Browse available positions</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('Check interview time')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Interview Schedule</div>
                    <div className="text-xs text-gray-500">View appointment times</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('Track my application')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Application Status</div>
                    <div className="text-xs text-gray-500">Track progress</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('Update resume')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Update Resume</div>
                    <div className="text-xs text-gray-500">Modify application</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('Prepare for interview')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Interview Prep</div>
                    <div className="text-xs text-gray-500">Tips & advice</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('Contact recruitment')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Contact HR</div>
                    <div className="text-xs text-gray-500">Get recruitment help</div>
                  </div>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('How do I apply for leave?')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Apply for Leave</div>
                    <div className="text-xs text-gray-500">Submit leave requests</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('Check my attendance records')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Attendance History</div>
                    <div className="text-xs text-gray-500">View clock in/out times</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('Show me my payslip')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Payroll Information</div>
                    <div className="text-xs text-gray-500">Salary breakdown & payslips</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('Tell me about performance reviews')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Performance Reviews</div>
                    <div className="text-xs text-gray-500">Review cycles & feedback</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('What benefits do I have?')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Employee Benefits</div>
                    <div className="text-xs text-gray-500">Insurance, retirement, PTO</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('How can I develop my career?')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Career Development</div>
                    <div className="text-xs text-gray-500">Training & growth opportunities</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('What are the company policies?')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Company Policies</div>
                    <div className="text-xs text-gray-500">Code of conduct & guidelines</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('How do I update my profile information?')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Update Profile</div>
                    <div className="text-xs text-gray-500">Personal information changes</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputMessage('How do I contact HR?')}
                  className="text-left justify-start h-auto py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Contact HR</div>
                    <div className="text-xs text-gray-500">Get help from HR team</div>
                  </div>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};