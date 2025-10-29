import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/modules/Dashboard';
import { UserManagement } from './components/modules/UserManagement';
import { Attendance } from './components/modules/Attendance';
import { ChatBot } from './components/modules/ChatBot';
import { LeaveManagement } from './components/modules/LeaveManagement';
import { PayrollManagement } from './components/modules/PayrollManagement';
import { PerformanceManagement } from './components/modules/PerformanceManagement';
import { InterviewScheduling } from './components/modules/InterviewScheduling';
import { ResumeScreening } from './components/modules/ResumeScreening';
import { ExitManagement } from './components/modules/ExitManagement';
import { Reports } from './components/modules/Reports';
import { Settings } from './components/modules/Settings';
import { RoleManagement } from './components/modules/RoleManagement';
import { CandidateApplicationForm } from './components/modules/CandidateApplicationForm';
import { MyApplications } from './components/modules/MyApplications';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading HR360...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const getTabTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      users: 'User Management',
      employees: 'Employee Management',
      attendance: 'Attendance Tracking',
      leave: 'Leave Management',
      payroll: 'Payroll Management',
      performance: 'Performance Management',
      recruitment: 'Recruitment',
      chatbot: 'AI Assistant',
      settings: 'Settings',
      reports: 'Reports',
      roles: 'Role Management',
      applications: 'My Applications',
      interviews: 'Interviews',
      profile: 'Profile',
    };
    return titles[activeTab as keyof typeof titles] || 'Dashboard';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return user?.role === 'candidate' ? <CandidateApplicationForm /> : <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'attendance':
        return <Attendance />;
      case 'chatbot':
        return <ChatBot />;
      case 'employees':
        return <UserManagement />;
      case 'leave':
        return <LeaveManagement />;
      case 'payroll':
        return <PayrollManagement />;
      case 'performance':
        return <PerformanceManagement />;
      case 'recruitment':
        return <ResumeScreening />;
      case 'interviews':
        return <InterviewScheduling />;
      case 'exit':
        return <ExitManagement />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'roles':
        return <RoleManagement />;
      case 'applications':
        return <MyApplications />;
      case 'profile':
        return <div className="p-8 text-center text-gray-500">Profile - Coming Soon</div>;
      default:
        return user?.role === 'candidate' ? <CandidateApplicationForm /> : <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block`}>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title={getTabTitle()} 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;