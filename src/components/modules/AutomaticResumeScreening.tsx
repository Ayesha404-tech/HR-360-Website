import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import {
  Mail,
  Settings,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface EmailConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
  enabled: boolean;
  monitoringInterval: number;
}

export const AutomaticResumeScreening: React.FC = () => {
  const { user } = useAuth();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [config, setConfig] = useState<EmailConfig>({
    user: '',
    password: '',
    host: 'outlook.office365.com',
    port: 993,
    tls: true,
    enabled: false,
    monitoringInterval: 5,
  });

  // State for email processing (since this feature doesn't exist in the new API yet)
  // TODO: Replace with actual API calls when email processing endpoints are implemented
  const [processingStats] = useState<{ totalCandidates: number; screeningCandidates: number; recentProcessing: number } | null>(null);
  const [processingStatus] = useState<{ recentProcessing: Array<{ _id: string; title: string; message: string; type: string; createdAt: string }> } | null>(null);

  // TODO: Add useEffect to load email config when API is available

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email config API call when available
    console.log('Email config submitted:', config);
    setIsConfigModalOpen(false);
    // Show success message
  };

  const handleTriggerProcessing = async () => {
    // TODO: Implement trigger processing API call when available
    console.log('Trigger processing clicked');
    // Show success message
  };

  const toggleMonitoring = async () => {
    // TODO: Implement toggle monitoring API call when available
    setConfig(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  if (!user || user.role !== 'hr') {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only HR personnel can access automatic resume screening.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automatic Resume Screening</h1>
          <p className="text-gray-600">Monitor emails and automatically process CV attachments</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
          <Button
            onClick={handleTriggerProcessing}
            className="flex items-center"
          >
            <Play className="w-4 h-4 mr-2" />
            Process Now
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${config.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                {config.enabled ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Pause className="w-6 h-6 text-gray-600" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monitoring Status</p>
                <p className="text-2xl font-bold text-gray-900">
                  {config.enabled ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {processingStats?.totalCandidates || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Screening</p>
                <p className="text-2xl font-bold text-gray-900">
                  {processingStats?.screeningCandidates || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-100">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Processing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {processingStats?.recentProcessing || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Email Monitoring Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Email: {config.user || 'Not configured'}
              </p>
              <p className="text-sm text-gray-600">
                Check interval: {config.monitoringInterval} minutes
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant={config.enabled ? "danger" : "primary"}
                onClick={toggleMonitoring}
                className="flex items-center"
              >
                {config.enabled ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Monitoring
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Monitoring
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Recent Processing Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {processingStatus?.recentProcessing?.length ? (
            <div className="space-y-4">
              {processingStatus.recentProcessing.map((notification: { _id: string; title: string; message: string; type: string; createdAt: string }) => (
                <div key={notification._id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-1 rounded ${
                    notification.type === 'success' ? 'bg-green-100' :
                    notification.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    {notification.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : notification.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent processing activity</p>
          )}
        </CardContent>
      </Card>

      {/* Configuration Modal */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="Email Configuration"
      >
        <form onSubmit={handleConfigSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={config.user}
              onChange={(e) => setConfig({ ...config, user: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your.email@domain.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={config.password}
              onChange={(e) => setConfig({ ...config, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email password"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              For Outlook/iqra.edu.pk, use your email password or app password
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IMAP Host
              </label>
              <input
                type="text"
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="outlook.office365.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Port
              </label>
              <input
                type="number"
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="993"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check Interval (minutes)
            </label>
            <input
              type="number"
              value={config.monitoringInterval}
              onChange={(e) => setConfig({ ...config, monitoringInterval: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="60"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="tls"
              checked={config.tls}
              onChange={(e) => setConfig({ ...config, tls: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="tls" className="ml-2 block text-sm text-gray-900">
              Use TLS encryption
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsConfigModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Configuration
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
