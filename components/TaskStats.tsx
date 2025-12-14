import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Task } from '../types';

interface TaskStatsProps {
  tasks: Task[];
}

export const TaskStats: React.FC<TaskStatsProps> = ({ tasks }) => {
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const pending = tasks.filter(t => t.status === 'pending').length;

  const data = [
    { name: 'Completed', value: completed },
    { name: 'In Progress', value: inProgress },
    { name: 'Pending', value: pending },
  ];

  // Colors: Green, Blue, Yellow
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

  if (tasks.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-80 flex flex-col">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Task Overview</h3>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
             <div className="w-32 h-32 rounded-full border-4 border-gray-100 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-gray-300">0%</span>
             </div>
             <p className="text-sm">No tasks created yet</p>
        </div>
      </div>
    );
  }

  const completionRate = Math.round((completed / tasks.length) * 100) || 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-80 flex flex-col">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Task Overview</h3>
      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%" 
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Centered Text Overlay - Positioned to align with cy="45%" */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
            <span className="text-3xl font-bold text-gray-900">{completionRate}%</span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Done</span>
        </div>
      </div>
    </div>
  );
};