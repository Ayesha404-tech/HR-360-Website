import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Shield, Users, Check, Save, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { UserRole } from '../../types';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: UserRole;
  displayName: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystemRole: boolean;
  createdAt: string;
}

const availablePermissions: Permission[] = [
  // User Management
  { id: 'users.view', name: 'View Users', description: 'Can view user profiles and basic information', category: 'User Management' },
  { id: 'users.create', name: 'Create Users', description: 'Can create new user accounts', category: 'User Management' },
  { id: 'users.edit', name: 'Edit Users', description: 'Can edit user profiles and information', category: 'User Management' },
  { id: 'users.delete', name: 'Delete Users', description: 'Can delete user accounts', category: 'User Management' },
  { id: 'users.manage_roles', name: 'Manage User Roles', description: 'Can assign and change user roles', category: 'User Management' },

  // Attendance
  { id: 'attendance.view', name: 'View Attendance', description: 'Can view attendance records', category: 'Attendance' },
  { id: 'attendance.manage', name: 'Manage Attendance', description: 'Can edit and manage attendance records', category: 'Attendance' },

  // Leave Management
  { id: 'leave.view', name: 'View Leave Requests', description: 'Can view leave requests', category: 'Leave Management' },
  { id: 'leave.approve', name: 'Approve Leave', description: 'Can approve or reject leave requests', category: 'Leave Management' },
  { id: 'leave.manage', name: 'Manage Leave Policies', description: 'Can create and edit leave policies', category: 'Leave Management' },

  // Payroll
  { id: 'payroll.view', name: 'View Payroll', description: 'Can view payroll information', category: 'Payroll' },
  { id: 'payroll.manage', name: 'Manage Payroll', description: 'Can process and manage payroll', category: 'Payroll' },
  { id: 'payroll.approve', name: 'Approve Payroll', description: 'Can approve payroll changes', category: 'Payroll' },

  // Performance
  { id: 'performance.view', name: 'View Performance', description: 'Can view performance reviews', category: 'Performance' },
  { id: 'performance.manage', name: 'Manage Performance', description: 'Can create and edit performance reviews', category: 'Performance' },

  // Recruitment
  { id: 'recruitment.view', name: 'View Candidates', description: 'Can view candidate profiles', category: 'Recruitment' },
  { id: 'recruitment.manage', name: 'Manage Recruitment', description: 'Can manage recruitment process', category: 'Recruitment' },
  { id: 'recruitment.interview', name: 'Schedule Interviews', description: 'Can schedule and manage interviews', category: 'Recruitment' },

  // Reports
  { id: 'reports.view', name: 'View Reports', description: 'Can view system reports', category: 'Reports' },
  { id: 'reports.create', name: 'Create Reports', description: 'Can generate custom reports', category: 'Reports' },

  // System
  { id: 'system.settings', name: 'System Settings', description: 'Can access and modify system settings', category: 'System' },
  { id: 'system.backup', name: 'System Backup', description: 'Can perform system backups', category: 'System' },
  { id: 'system.logs', name: 'View System Logs', description: 'Can view system logs and audit trails', category: 'System' },
];

const defaultRoles: Role[] = [
  {
    id: 'admin',
    name: 'admin' as UserRole,
    displayName: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: availablePermissions.map(p => p.id),
    userCount: 1,
    isSystemRole: true,
    createdAt: '2023-01-01',
  },
  {
    id: 'hr',
    name: 'hr' as UserRole,
    displayName: 'HR Manager',
    description: 'Human Resources management with employee-related permissions',
    permissions: [
      'users.view', 'users.create', 'users.edit',
      'attendance.view', 'attendance.manage',
      'leave.view', 'leave.approve', 'leave.manage',
      'payroll.view', 'payroll.manage',
      'performance.view', 'performance.manage',
      'recruitment.view', 'recruitment.manage', 'recruitment.interview',
      'reports.view', 'reports.create',
    ],
    userCount: 2,
    isSystemRole: true,
    createdAt: '2023-01-01',
  },
  {
    id: 'employee',
    name: 'employee' as UserRole,
    displayName: 'Employee',
    description: 'Standard employee access to personal data',
    permissions: [
      'attendance.view',
      'leave.view',
      'payroll.view',
      'performance.view',
    ],
    userCount: 5,
    isSystemRole: true,
    createdAt: '2023-01-01',
  },
  {
    id: 'candidate',
    name: 'candidate' as UserRole,
    displayName: 'Candidate',
    description: 'Limited access for job candidates',
    permissions: [
      'recruitment.view',
    ],
    userCount: 3,
    isSystemRole: true,
    createdAt: '2023-01-01',
  },
];

export const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: [] as string[],
  });
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const filteredRoles = roles.filter(role =>
    role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(availablePermissions.map(p => p.category)));

  const handleCreateRole = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      displayName: '',
      description: '',
      permissions: [],
    });
    setIsModalOpen(true);
    setSaveStatus({ type: null, message: '' });
  };

  const handleEditRole = (role: Role) => {
    if (role.isSystemRole) {
      alert('System roles cannot be edited. You can only modify custom roles.');
      return;
    }
    setEditingRole(role);
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      permissions: [...role.permissions],
    });
    setIsModalOpen(true);
    setSaveStatus({ type: null, message: '' });
  };

  const handleDeleteRole = (role: Role) => {
    if (role.isSystemRole) {
      alert('System roles cannot be deleted.');
      return;
    }
    if (role.userCount > 0) {
      alert('Cannot delete a role that has users assigned to it. Please reassign users first.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the "${role.displayName}" role?`)) {
      setRoles(roles.filter(r => r.id !== role.id));
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleCategoryToggle = (category: string) => {
    const categoryPermissions = availablePermissions
      .filter(p => p.category === category)
      .map(p => p.id);

    const hasAllPermissions = categoryPermissions.every(p => formData.permissions.includes(p));

    if (hasAllPermissions) {
      // Remove all permissions from this category
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !categoryPermissions.includes(p))
      }));
    } else {
      // Add all permissions from this category
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...categoryPermissions])]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus({ type: null, message: '' });

    try {
      if (editingRole) {
        setRoles(roles.map(role =>
          role.id === editingRole.id
            ? { ...role, ...formData, name: formData.name as UserRole }
            : role
        ));
        setSaveStatus({ type: 'success', message: 'Role updated successfully!' });
      } else {
        const newRole: Role = {
          id: Date.now().toString(),
          name: formData.name as UserRole,
          displayName: formData.displayName,
          description: formData.description,
          permissions: formData.permissions,
          userCount: 0,
          isSystemRole: false,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setRoles(prevRoles => [...prevRoles, newRole]);
        setSaveStatus({ type: 'success', message: 'Role created successfully!' });
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setSaveStatus({ type: null, message: '' });
      }, 1500);
    } catch (error) {
      setSaveStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save role'
      });
    }
  };

  const getPermissionsByCategory = (category: string) => {
    return availablePermissions.filter(p => p.category === category);
  };

  const hasAllCategoryPermissions = (category: string) => {
    const categoryPermissions = availablePermissions
      .filter(p => p.category === category)
      .map(p => p.id);
    return categoryPermissions.every(p => formData.permissions.includes(p));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
          <p className="text-gray-600">Manage user roles and their permissions</p>
        </div>
        <Button onClick={handleCreateRole}>
          <Plus size={20} className="mr-2" />
          Create Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => (
              <Card key={role.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Shield className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{role.displayName}</CardTitle>
                        {role.isSystemRole && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">System</span>
                        )}
                      </div>
                    </div>
                    {!role.isSystemRole && (
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRole(role)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteRole(role)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Users:</span>
                      <div className="flex items-center space-x-1">
                        <Users size={14} className="text-gray-400" />
                        <span>{role.userCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Permissions:</span>
                      <span className="font-medium">{role.permissions.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole ? 'Edit Role' : 'Create New Role'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Role Name"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="e.g., Senior Developer"
              required
            />
            <Input
              label="System Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              placeholder="e.g., senior_developer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe the role and its responsibilities..."
              required
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Permissions</h3>
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{category}</h4>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasAllCategoryPermissions(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Select All</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getPermissionsByCategory(category).map((permission) => (
                      <label key={permission.id} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                          <p className="text-xs text-gray-600">{permission.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {saveStatus.type && (
            <div className={`p-4 rounded-lg ${saveStatus.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center space-x-2">
                {saveStatus.type === 'success' ? <Check className="text-green-600" size={20} /> : <AlertCircle className="text-red-600" size={20} />}
                <p className={`text-sm ${saveStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{saveStatus.message}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.displayName || !formData.name || !formData.description}>
              <Save size={16} className="mr-2" />
              {editingRole ? 'Update' : 'Create'} Role
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
