import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  description: string;
  className?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, description, className }) => {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-md ${className}`}>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-3xl font-bold text-indigo-600 mt-2">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );
};

export default KPICard;
