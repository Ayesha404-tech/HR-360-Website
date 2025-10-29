import React from 'react';
import {
  Home,
  Users,
  Clock,
  Calendar,
  DollarSign,
  BarChart3,
  UserPlus,
  LogOut,
  Settings,
  MessageSquare,
  FileText,
  Shield,
  LogOut as ExitIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
    ];

    const roleSpecificItems = {
      admin: [
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'roles', label: 'Role Management', icon: Shield },
        { id: 'attendance', label: 'Attendance', icon: Clock },
        { id: 'leave', label: 'Leave Management', icon: Calendar },
        { id: 'payroll', label: 'Payroll', icon: DollarSign },
        { id: 'performance', label: 'Performance', icon: BarChart3 },
        { id: 'recruitment', label: 'Recruitment', icon: UserPlus },
        { id: 'interviews', label: 'Interviews', icon: Calendar },
        { id: 'exit', label: 'Exit Management', icon: ExitIcon },
        { id: 'reports', label: 'Reports', icon: FileText },
      ],
      hr: [
        { id: 'employees', label: 'Employees', icon: Users },
        { id: 'attendance', label: 'Attendance', icon: Clock },
        { id: 'leave', label: 'Leave Management', icon: Calendar },
        { id: 'payroll', label: 'Payroll', icon: DollarSign },
        { id: 'performance', label: 'Performance', icon: BarChart3 },
        { id: 'recruitment', label: 'Recruitment', icon: UserPlus },
        { id: 'interviews', label: 'Interviews', icon: Calendar },
        { id: 'reports', label: 'Reports', icon: FileText },
      ],
      employee: [
        { id: 'attendance', label: 'My Attendance', icon: Clock },
        { id: 'leave', label: 'My Leave', icon: Calendar },
        { id: 'payroll', label: 'My Payroll', icon: DollarSign },
        { id: 'performance', label: 'My Performance', icon: BarChart3 },
      ],
      candidate: [
        { id: 'applications', label: 'My Applications', icon: FileText },
        { id: 'interviews', label: 'My Interviews', icon: Calendar },
      ],
    };

    const commonItems = [
      { id: 'chatbot', label: 'AI Assistant', icon: MessageSquare },
      { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return [
      ...baseItems,
      ...roleSpecificItems[user?.role || 'employee'],
      ...commonItems,
    ];
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Users size={20} />
          </div>
          <span className="text-xl font-bold">HR360</span>
        </div>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4">
        {getMenuItems().map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              'w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-gray-800 transition-colors',
              activeTab === item.id && 'bg-blue-600 hover:bg-blue-700'
            )}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-6 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:bg-gray-800 rounded-md transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};