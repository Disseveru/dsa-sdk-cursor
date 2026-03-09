import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: ReactNode;
  iconBg?: string;
}

export function StatCard({ label, value, change, changeType = 'neutral', icon, iconBg = 'bg-accent-blue/10' }: StatCardProps) {
  return (
    <div className="glass-card p-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label mb-1">{label}</p>
          <p className="stat-value">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${
              changeType === 'positive' ? 'text-accent-green' :
              changeType === 'negative' ? 'text-accent-red' :
              'text-dark-300'
            }`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-2.5 rounded-xl ${iconBg}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
