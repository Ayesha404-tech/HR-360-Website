import React from 'react';
import { Bell, Search, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              className="relative p-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowNotifications(!showNotifications)}
            >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
            </button>
            <NotificationCenter 
              isOpen={showNotifications} 
              onClose={() => setShowNotifications(false)} 
            />
          </div>

          {/* User Avatar */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
              </span>
            </div>
            <span className="hidden md:inline text-sm font-medium text-gray-700">
              {user?.firstName} {user?.lastName}
            </span>
            </button>
            
            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border z-50">
                <div className="p-4 border-b">
                  <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                </div>
                <div className="py-2">
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
                    Profile Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
                    Preferences
                  </button>
                  <hr className="my-2" />
                  <button 
                    onClick={logout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600 flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};