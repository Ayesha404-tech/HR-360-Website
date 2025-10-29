import React, { useState } from 'react';
import { Clock, Calendar, Play, Square, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { AttendanceRecord } from '../../types';
import { formatTime, formatDate } from '../../lib/utils';

const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: '1',
    userId: '3',
    date: '2024-01-15',
    clockIn: '09:00',
    clockOut: '17:30',
    hoursWorked: 8.5,
    status: 'present',
  },
  {
    id: '2',
    userId: '3',
    date: '2024-01-14',
    clockIn: '09:15',
    clockOut: '17:45',
    hoursWorked: 8.5,
    status: 'late',
  },
  {
    id: '3',
    userId: '3',
    date: '2024-01-13',
    clockIn: '09:00',
    clockOut: '13:00',
    hoursWorked: 4,
    status: 'half-day',
  },
];

export const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);

  // Update current time every second
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = () => {
    const now = new Date();
    setIsClockedIn(true);
    setClockInTime(now);
    
    // Add to attendance records
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      userId: user?.id || '',
      date: now.toISOString().split('T')[0],
      clockIn: now.toTimeString().slice(0, 5),
      status: now.getHours() > 9 ? 'late' : 'present',
    };
    
    setAttendanceRecords([newRecord, ...attendanceRecords]);
  };

  const handleClockOut = () => {
    const now = new Date();
    setIsClockedIn(false);
    
    // Update the latest record
    setAttendanceRecords(prev => 
      prev.map((record, index) => 
        index === 0 && record.userId === user?.id 
          ? {
              ...record,
              clockOut: now.toTimeString().slice(0, 5),
              hoursWorked: clockInTime ? (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60) : 0,
            }
          : record
      )
    );
    
    setClockInTime(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'half-day': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle size={16} className="text-green-600" />;
      case 'late': return <Clock size={16} className="text-yellow-600" />;
      case 'absent': return <XCircle size={16} className="text-red-600" />;
      case 'half-day': return <Calendar size={16} className="text-blue-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  const todayRecord = attendanceRecords.find(record => 
    record.date === new Date().toISOString().split('T')[0] && record.userId === user?.id
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Attendance</h2>
        <div className="text-lg font-medium text-gray-600">
          {formatTime(currentTime)} | {formatDate(currentTime)}
        </div>
      </div>

      {/* Clock In/Out Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock size={24} />
            <span>Time Tracking</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Current Status</p>
              <div className="flex items-center space-x-2">
                {isClockedIn ? (
                  <>
                    <Play size={20} className="text-green-600" />
                    <span className="text-green-600 font-medium">Clocked In</span>
                    {clockInTime && (
                      <span className="text-sm text-gray-500">
                        since {formatTime(clockInTime)}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Square size={20} className="text-gray-600" />
                    <span className="text-gray-600 font-medium">Not Clocked In</span>
                  </>
                )}
              </div>
            </div>
            <div className="space-x-4">
              {!isClockedIn ? (
                <Button onClick={handleClockIn} className="bg-green-600 hover:bg-green-700">
                  <Play size={20} className="mr-2" />
                  Clock In
                </Button>
              ) : (
                <Button onClick={handleClockOut} variant="danger">
                  <Square size={20} className="mr-2" />
                  Clock Out
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Summary */}
      {todayRecord && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Clock In</p>
                <p className="text-lg font-semibold">{todayRecord.clockIn}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Clock Out</p>
                <p className="text-lg font-semibold">{todayRecord.clockOut || 'In Progress'}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Hours Worked</p>
                <p className="text-lg font-semibold">
                  {todayRecord.hoursWorked ? `${todayRecord.hoursWorked.toFixed(1)}h` : 'In Progress'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <div className="flex items-center justify-center space-x-2">
                  {getStatusIcon(todayRecord.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(todayRecord.status)}`}>
                    {todayRecord.status.charAt(0).toUpperCase() + todayRecord.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-2">Date</th>
                  <th className="text-left py-4 px-2">Clock In</th>
                  <th className="text-left py-4 px-2">Clock Out</th>
                  <th className="text-left py-4 px-2">Hours</th>
                  <th className="text-left py-4 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{formatDate(record.date)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2">{record.clockIn}</td>
                    <td className="py-4 px-2">{record.clockOut || '-'}</td>
                    <td className="py-4 px-2">
                      {record.hoursWorked ? `${record.hoursWorked.toFixed(1)}h` : '-'}
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};