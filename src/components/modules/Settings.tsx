import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Palette, Save, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    department: user?.department || '',
    position: user?.position || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    leaveRequests: true,
    payrollUpdates: true,
    performanceReviews: true,
    systemUpdates: false,
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'UTC+5',
    dateFormat: 'DD/MM/YYYY',
    theme: 'light',
    dashboardLayout: 'default',
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        // Load notifications
        const savedNotifications = localStorage.getItem(`hr360_notifications_${user?.id}`);
        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications));
        }

        // Load preferences
        const savedPreferences = localStorage.getItem(`hr360_preferences_${user?.id}`);
        if (savedPreferences) {
          setPreferences(JSON.parse(savedPreferences));
        }

        // Load profile data
        const savedProfile = localStorage.getItem(`hr360_profile_${user?.id}`);
        if (savedProfile) {
          const profileData = JSON.parse(savedProfile);
          setFormData(prev => ({
            ...prev,
            ...profileData,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    if (user?.id) {
      loadSettings();
    }
  }, [user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePreferenceChange = (key: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async (section: string) => {
    setIsLoading(true);
    setSaveStatus({ type: null, message: '' });

    try {
      if (user?.id) {
        if (section === 'profile') {
          // Save profile data (excluding password fields)
          const profileData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            department: formData.department,
            position: formData.position,
          };
          localStorage.setItem(`hr360_profile_${user.id}`, JSON.stringify(profileData));
        } else if (section === 'notifications') {
          localStorage.setItem(`hr360_notifications_${user.id}`, JSON.stringify(notifications));
        } else if (section === 'preferences') {
          localStorage.setItem(`hr360_preferences_${user.id}`, JSON.stringify(preferences));
        } else if (section === 'security') {
          // Validate password requirements
          if (formData.newPassword !== formData.confirmPassword) {
            throw new Error('New passwords do not match');
          }
          if (formData.newPassword.length < 8) {
            throw new Error('Password must be at least 8 characters long');
          }
          // In a real app, this would make an API call to change password
          console.log('Password change requested');
        }
      }

      setSaveStatus({ type: 'success', message: `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!` });

      // Clear password fields after successful save
      if (section === 'security') {
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      }
    } catch (error) {
      setSaveStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save settings'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
  ];

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          required
        />
        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <Input
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Department"
          name="department"
          value={formData.department}
          onChange={handleInputChange}
        />
        <Input
          label="Position"
          name="position"
          value={formData.position}
          onChange={handleInputChange}
        />
      </div>

      {saveStatus.type && (
        <div className={`p-4 rounded-lg ${saveStatus.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center space-x-2">
            {saveStatus.type === 'success' ? <CheckCircle className="text-green-600" size={20} /> : <AlertCircle className="text-red-600" size={20} />}
            <p className={`text-sm ${saveStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{saveStatus.message}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={() => handleSave('profile')} disabled={isLoading} className="flex items-center space-x-2">
          <Save size={16} />
          <span>{isLoading ? 'Saving...' : 'Save Profile'}</span>
        </Button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">Password Requirements</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• At least 8 characters long</li>
          <li>• Contains uppercase and lowercase letters</li>
          <li>• Includes at least one number</li>
          <li>• Has at least one special character</li>
        </ul>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Input
            label="Current Password"
            name="currentPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.currentPassword}
            onChange={handleInputChange}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <Input
          label="New Password"
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={handleInputChange}
          required
        />

        <Input
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">SMS Authentication</p>
            <p className="text-sm text-gray-600">Receive verification codes via SMS</p>
          </div>
          <Button variant="outline" size="sm">Enable</Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => handleSave('security')} disabled={isLoading} className="flex items-center space-x-2">
          <Save size={16} />
          <span>{isLoading ? 'Updating...' : 'Update Security'}</span>
        </Button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        {Object.entries(notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
              <p className="text-sm text-gray-600">
                {key === 'emailNotifications' && 'Receive notifications via email'}
                {key === 'pushNotifications' && 'Receive push notifications in browser'}
                {key === 'leaveRequests' && 'Notifications about leave request approvals'}
                {key === 'payrollUpdates' && 'Monthly payroll and salary updates'}
                {key === 'performanceReviews' && 'Performance review reminders and feedback'}
                {key === 'systemUpdates' && 'System maintenance and feature updates'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={value}
                onChange={(e) => handleNotificationChange(key, e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>

      {saveStatus.type && (
        <div className={`p-4 rounded-lg ${saveStatus.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center space-x-2">
            {saveStatus.type === 'success' ? <CheckCircle className="text-green-600" size={20} /> : <AlertCircle className="text-red-600" size={20} />}
            <p className={`text-sm ${saveStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{saveStatus.message}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={() => handleSave('notifications')} disabled={isLoading} className="flex items-center space-x-2">
          <Save size={16} />
          <span>{isLoading ? 'Saving...' : 'Save Notifications'}</span>
        </Button>
      </div>
    </div>
  );

  const renderPreferenceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
          <select
            value={preferences.language}
            onChange={(e) => handlePreferenceChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ar">Arabic</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={preferences.timezone}
            onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="UTC+5">Pakistan Standard Time (UTC+5)</option>
            <option value="UTC+0">Greenwich Mean Time (UTC+0)</option>
            <option value="UTC-5">Eastern Standard Time (UTC-5)</option>
            <option value="UTC-8">Pacific Standard Time (UTC-8)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
          <select
            value={preferences.dateFormat}
            onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
          <select
            value={preferences.theme}
            onChange={(e) => handlePreferenceChange('theme', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto (System)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Dashboard Layout</label>
        <select
          value={preferences.dashboardLayout}
          onChange={(e) => handlePreferenceChange('dashboardLayout', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="default">Default</option>
          <option value="compact">Compact</option>
          <option value="detailed">Detailed</option>
        </select>
      </div>

      {saveStatus.type && (
        <div className={`p-4 rounded-lg ${saveStatus.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center space-x-2">
            {saveStatus.type === 'success' ? <CheckCircle className="text-green-600" size={20} /> : <AlertCircle className="text-red-600" size={20} />}
            <p className={`text-sm ${saveStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{saveStatus.message}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={() => handleSave('preferences')} disabled={isLoading} className="flex items-center space-x-2">
          <Save size={16} />
          <span>{isLoading ? 'Saving...' : 'Save Preferences'}</span>
        </Button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'preferences':
        return renderPreferenceSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">Manage your account settings and preferences.</p>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSaveStatus({ type: null, message: '' }); // Clear save status when switching tabs
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {tabs.find(tab => tab.id === activeTab)?.icon &&
              React.createElement(tabs.find(tab => tab.id === activeTab)!.icon, { size: 20 })
            }
            <span>{tabs.find(tab => tab.id === activeTab)?.label}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};
