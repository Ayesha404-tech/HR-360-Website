import React, { useState } from 'react';
import { DollarSign, Download, Eye, TrendingUp, Calculator, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { PayrollRecord } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { emailService } from '../../lib/email-service';
import jsPDF from 'jspdf';

const mockPayrollRecords: PayrollRecord[] = [
  {
    id: '1',
    userId: '3',
    month: 'January',
    year: 2024,
    baseSalary: 70000,
    allowances: 5000,
    deductions: 8000,
    netSalary: 67000,
    status: 'paid',
  },
  {
    id: '2',
    userId: '3',
    month: 'December',
    year: 2023,
    baseSalary: 70000,
    allowances: 7000,
    deductions: 9000,
    netSalary: 68000,
    status: 'paid',
  },
];

export const PayrollManagement: React.FC = () => {
  const { user } = useAuth();
  const [payrollRecords] = useState<PayrollRecord[]>(mockPayrollRecords);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2025);

  const handleViewDetails = (record: PayrollRecord) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleDownloadPayslip = (record: PayrollRecord) => {
    // Generate PDF and send email notification
    emailService.sendPayrollNotification(
      user?.email || '',
      `${user?.firstName} ${user?.lastName}`,
      record as unknown as Record<string, unknown>
    );

    // Create a proper PDF using jsPDF
    const doc = new jsPDF();

    // Add company header
    doc.setFontSize(20);
    doc.text('HR360 Company', 105, 20, { align: 'center' });

    doc.setFontSize(16);
    doc.text(`Payslip for ${record.month} ${record.year}`, 105, 35, { align: 'center' });

    // Employee details
    doc.setFontSize(12);
    let yPosition = 50;
    doc.text(`Employee: ${user?.firstName} ${user?.lastName}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Employee ID: ${user?.id}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Department: ${user?.department}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Position: ${user?.position}`, 20, yPosition);
    yPosition += 20;

    // Salary breakdown
    doc.setFontSize(14);
    doc.text('Salary Breakdown:', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.text(`Base Salary: ${formatCurrency(record.baseSalary)}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Allowances: +${formatCurrency(record.allowances)}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Deductions: -${formatCurrency(record.deductions)}`, 20, yPosition);
    yPosition += 10;
    doc.setFontSize(14);
    doc.text(`Net Salary: ${formatCurrency(record.netSalary)}`, 20, yPosition);
    yPosition += 20;

    // Footer
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);

    // Download the PDF
    doc.save(`payslip-${record.month}-${record.year}.pdf`);

    alert(`Payslip for ${record.month} ${record.year} downloaded and email sent!`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'processed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentMonthRecord = payrollRecords.find(record =>
    record.month === new Date().toLocaleString('default', { month: 'long' }) &&
    record.year === new Date().getFullYear()
  );

  const yearlyTotal = payrollRecords
    .filter(record => record.year === selectedYear)
    .reduce((total, record) => total + record.netSalary, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Payroll Management</h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={2025}>2025</option>
          <option value={2024}>2024</option>
          <option value={2023}>2023</option>
          <option value={2022}>2022</option>
        </select>
      </div>

      {/* Current Month Summary */}
      {currentMonthRecord && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign size={24} className="text-green-600" />
              <span>Current Month Salary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Base Salary</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(currentMonthRecord.baseSalary)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Allowances</p>
                <p className="text-2xl font-bold text-green-600">
                  +{formatCurrency(currentMonthRecord.allowances)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Deductions</p>
                <p className="text-2xl font-bold text-red-600">
                  -{formatCurrency(currentMonthRecord.deductions)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Net Salary</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(currentMonthRecord.netSalary)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Yearly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Yearly Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(yearlyTotal)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Monthly</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(yearlyTotal / 12)}
              </p>
            </div>
            <Calculator className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tax Deducted</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(yearlyTotal * 0.15)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Payroll History */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-2">Period</th>
                  <th className="text-left py-4 px-2">Base Salary</th>
                  <th className="text-left py-4 px-2">Allowances</th>
                  <th className="text-left py-4 px-2">Deductions</th>
                  <th className="text-left py-4 px-2">Net Salary</th>
                  <th className="text-left py-4 px-2">Status</th>
                  <th className="text-left py-4 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrollRecords
                  .filter(record => record.year === selectedYear)
                  .map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="font-medium">{record.month} {record.year}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2">{formatCurrency(record.baseSalary)}</td>
                    <td className="py-4 px-2 text-green-600">
                      +{formatCurrency(record.allowances)}
                    </td>
                    <td className="py-4 px-2 text-red-600">
                      -{formatCurrency(record.deductions)}
                    </td>
                    <td className="py-4 px-2 font-bold">
                      {formatCurrency(record.netSalary)}
                    </td>
                    <td className="py-4 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(record)}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownloadPayslip(record)}
                        >
                          <Download size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payslip Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Payslip - ${selectedRecord?.month} ${selectedRecord?.year}`}
        size="lg"
      >
        {selectedRecord && (
          <div className="space-y-6">
            <div className="text-center border-b pb-4">
              <h3 className="text-xl font-bold">HR360 Company</h3>
              <p className="text-gray-600">Payslip for {selectedRecord.month} {selectedRecord.year}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Employee Name</p>
                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Employee ID</p>
                <p className="font-medium">{user?.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium">{user?.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Position</p>
                <p className="font-medium">{user?.position}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-4">Salary Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Salary</span>
                  <span>{formatCurrency(selectedRecord.baseSalary)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Allowances</span>
                  <span>+{formatCurrency(selectedRecord.allowances)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Deductions</span>
                  <span>-{formatCurrency(selectedRecord.deductions)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Net Salary</span>
                  <span>{formatCurrency(selectedRecord.netSalary)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => handleDownloadPayslip(selectedRecord)}>
                <Download size={16} className="mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
