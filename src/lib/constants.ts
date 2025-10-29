import { User } from '../types';

// Mock users for demo
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@hr360.com',
    firstName: 'John',
    lastName: 'Admin',
    role: 'admin',
    department: 'Administration',
    position: 'System Administrator',
    joinDate: '2023-01-15',
    isActive: true,
  },
  {
    id: '2',
    email: 'hr@hr360.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'hr',
    department: 'Human Resources',
    position: 'HR Manager',
    joinDate: '2023-02-01',
    isActive: true,
  },
  {
    id: '3',
    email: 'employee@hr360.com',
    firstName: 'Mike',
    lastName: 'Smith',
    role: 'employee',
    department: 'Engineering',
    position: 'Software Developer',
    joinDate: '2023-03-10',
    salary: 75000,
    isActive: true,
  },
  {
    id: '4',
    email: 'candidate@hr360.com',
    firstName: 'Emily',
    lastName: 'Davis',
    role: 'candidate',
    position: 'Frontend Developer',
    isActive: true,
  },
];
