
import React from 'react';
import { Activity, ActivityType, activityTypeLabels } from '../types/activity';
import { Activity as ActivityIcon, Edit3, MessageCircle, Users, FileText } from 'lucide-react';

interface ActivitySummaryChartProps {
  activities: Activity[];
  onBarClick?: (type: ActivityType) => void;
}

const iconMap = {
  Edit3,
  MessageCircle,
  Users,
  FileText,
};

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
        <ActivityIcon className="w-3 h-3" /> Activity Summary
      </div>
      <div className="flex items-end space-x-4 justify-center h-20 mb-2">
        {(['edit', 'comment', 'mention', 'upload'] as ActivityType[]).map((type) => {
          const IconComponent = iconMap[activityTypeLabels[type].iconName as keyof typeof iconMap];
          return (
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
                <IconComponent className="w-3 h-3" />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
