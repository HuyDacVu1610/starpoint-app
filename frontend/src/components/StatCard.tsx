import { Card } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down';
  colorClass?: string; // Color wrapper for icon, e.g., 'bg-blue-50 text-blue-600'
}

export const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendDirection = 'up',
  colorClass = 'bg-indigo-50 text-indigo-600',
}: StatCardProps) => {
  return (
    <Card hoverable className="border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {value}
            </span>
            {trend && (
              <span
                className={`text-xs font-semibold inline-flex items-center ${
                  trendDirection === 'up' ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {trendDirection === 'up' ? (
                  <ArrowUpOutlined className="mr-0.5" />
                ) : (
                  <ArrowDownOutlined className="mr-0.5" />
                )}
                {trend}
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg shadow-sm ${colorClass}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
