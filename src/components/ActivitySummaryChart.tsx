
import React from 'react';
import { FiActivity } from 'react-icons/fi';
import { Activity, ActivityType, activityTypeLabels } from '../types/activity';

interface ActivitySummaryChartProps {
  activities: Activity[];
  onBarClick?: (type: ActivityType) => void;
}

export const ActivitySummaryChart: React.FC<ActivitySummaryChartProps> = ({ 
  activities, 
  onBarClick 
}) => {
  const countByType = {
    edit: 0,
    comment: 0,
    mention: 0,
    upload: 0,
  };
  
  activities.forEach((a) => {
    countByType[a.type]++;
  });
  
  const total = activities.length || 1;
  
  return (
    <div className="border-t p-4">
      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-3">
        <FiActivity /> Activity Summary
      </div>
      <div className="flex items-end space-x-4 justify-center h-20 mb-2">
        {(['edit', 'comment', 'mention', 'upload'] as ActivityType[]).map((type) => (
          <div key={type} className="flex flex-col items-center">
            <div
              className={`w-4 rounded-t transition-all cursor-pointer hover:opacity-80 ${
                activityTypeLabels[type].color
              }`}
              style={{
                height: `${16 + (countByType[type] / total) * 48}px`,
                minHeight: 16,
              }}
              title={`${activityTypeLabels[type].label}: ${countByType[type]}`}
              onClick={() => onBarClick?.(type)}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {activityTypeLabels[type].icon}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
