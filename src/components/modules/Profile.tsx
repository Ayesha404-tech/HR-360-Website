import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, Briefcase, Calendar, Edit, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../lib/utils';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    department: user?.department || '',
    position: user?.position || '',
    employeeId: user?.id || '',
    joinDate: '2023-01-15', // Mock data
    manager: 'Sarah Khan', // Mock data
  });

  // Load profile data from localStorage on component mount
  useEffect(() => {
    if (user?.id) {
      const savedProfile = localStorage.getItem(`hr360_profile_${user.id}`);
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        setFormData(prev => ({
          ...prev,
          ...profileData,
        }));
      }
    }
  }, [user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSaveStatus({ type: null, message: '' });

    try {
      if (user?.id) {
        const profileData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          position: formData.position,
        };
        localStorage.setItem(`hr360_profile_${user.id}`, JSON.stringify(profileData));
      }

      setSaveStatus({ type: 'success', message: 'Profile updated successfully!' });
      setIsEditing(false);

      setTimeout(() => {
        setSaveStatus({ type: null, message: '' });
      }, 3000);
    } catch (error) {
      setSaveStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update profile'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: '',
      department: user?.department || '',
      position: user?.position || '',
      employeeId: user?.id || '',
      joinDate: '2023-01-15',
      manager: 'Sarah khan',
    });
    setIsEditing(false);
    setSaveStatus({ type: null, message: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit size={20} className="mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              <X size={20} className="mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save size={20} className="mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      {saveStatus.type && (
        <div className={`p-4 rounded-lg ${saveStatus.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center space-x-2">
            {saveStatus.type === 'success' ? <CheckCircle className="text-green-600" size={20} /> : <AlertCircle className="text-red-600" size={20} />}
            <p className={`text-sm ${saveStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{saveStatus.message}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">
                {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {formData.firstName} {formData.lastName}
            </h3>
            <p className="text-gray-600 mb-2">{formData.position}</p>
            <p className="text-sm text-gray-500">{formData.department}</p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <User size={16} />
                <span>Employee ID: {formData.employeeId}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Calendar size={16} />
                <span>Joined: {formatDate(formData.joinDate)}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <User size={16} />
                <span>Manager: {formData.manager}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                {isEditing ? (
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <User size={16} className="text-gray-400" />
                    <span>{formData.firstName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                {isEditing ? (
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <User size={16} className="text-gray-400" />
                    <span>{formData.lastName}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              {isEditing ? (
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Mail size={16} className="text-gray-400" />
                  <span>{formData.email}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              {isEditing ? (
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Phone size={16} className="text-gray-400" />
                  <span>{formData.phone || 'Not provided'}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                {isEditing ? (
                  <Input
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Building size={16} className="text-gray-400" />
                    <span>{formData.department}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                {isEditing ? (
                  <Input
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Briefcase size={16} className="text-gray-400" />
                    <span>{formData.position}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Employment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Join Date</p>
              <p className="font-semibold text-gray-900">{formatDate(formData.joinDate)}</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <User className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Manager</p>
              <p className="font-semibold text-gray-900">{formData.manager}</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Briefcase className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Employee ID</p>
              <p className="font-semibold text-gray-900">{formData.employeeId}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="text-left justify-start h-auto py-4">
              <div>
                <div className="font-medium">Update Password</div>
                <div className="text-sm text-gray-500">Change your account password</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="text-left justify-start h-auto py-4"
              onClick={() => {
                const profileContent = `
HR360 Employee Profile
Generated on: ${new Date().toLocaleDateString()}

Personal Information:
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}

Employment Information:
Employee ID: ${formData.employeeId}
Department: ${formData.department}
Position: ${formData.position}
Join Date: ${formatDate(formData.joinDate)}
Manager: ${formData.manager}
                `.trim();

                const blob = new Blob([profileContent], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `profile-${formData.firstName}-${formData.lastName}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
            >
              <div>
                <div className="font-medium">Download Profile</div>
                <div className="text-sm text-gray-500">Export your profile data</div>
              </div>
            </Button>
            <Button variant="outline" className="text-left justify-start h-auto py-4">
              <div>
                <div className="font-medium">Contact HR</div>
                <div className="text-sm text-gray-500">Get help with profile updates</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
