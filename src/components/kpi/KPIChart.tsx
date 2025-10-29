import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EmployeeKPIData } from '../../types';

interface KPIChartProps {
  data: EmployeeKPIData[];
  type: 'bar' | 'pie';
  title: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const KPIChart: React.FC<KPIChartProps> = ({ data, type, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md text-center text-gray-500">
        No KPI data available for {title}.
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: item.kpiTemplate?.title || 'Unknown KPI',
    score: item.calculatedScore,
    actual: item.actualValue,
    target: item.kpiTemplate?.targetValue,
  }));

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {type === 'bar' ? (
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="score" fill="#8884d8" name="KPI Score" />
          </BarChart>
        ) : (
          <PieChart>
            <Pie
              data={chartData}
              dataKey="score"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default KPIChart;
