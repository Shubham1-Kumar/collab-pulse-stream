
import React from 'react';
import { ArrowDown, Edit3, MessageCircle, Users, FileText } from 'lucide-react';
import { Activity, activityTypeLabels } from '../types/activity';
import { getTimeAgo, scrollToSection, highlightMentions } from '../utils/helpers';

interface ActivityItemProps {
  activity: Activity;
  onReactionAdd: (activityId: string, emoji: string) => void;
}

const iconMap = {
  Edit3,
  MessageCircle,
  Users,
  FileText,
};

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onReactionAdd }) => {
  const reactions = ['👍', '❤️', '😊'];
  const IconComponent = iconMap[activityTypeLabels[activity.type].iconName as keyof typeof iconMap];

  return (
    <li className="bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-sm rounded-lg p-4 flex items-start gap-4 group hover:shadow-md transition-all animate-fade-in">
      <img
        src={activity.user.avatar}
        alt={activity.user.name}
        className="w-9 h-9 rounded-full border mt-1"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 dark:text-white">{activity.user.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${activityTypeLabels[activity.type].color}`}>
            <IconComponent className="inline-block mr-1 w-3 h-3" />
            {activityTypeLabels[activity.type].label}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">{getTimeAgo(activity.timestamp)}</span>
        </div>
        
        <div className="mt-2 mb-1 text-gray-700 dark:text-gray-300">
          <span dangerouslySetInnerHTML={{ __html: highlightMentions(activity.content) }} />
        </div>
        
        {activity.filePreview && (
          <div className="my-2">
            <img
              src={activity.filePreview}
              alt="File preview"
              className="w-32 h-20 object-cover rounded border cursor-pointer hover:shadow-md transition-shadow"
            />
          </div>
        )}
        
        {activity.thread && (
          <div className="ml-3 mt-2 border-l-2 pl-3 border-blue-100 dark:border-blue-800">
            <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">Replies</div>
            {activity.thread.replies.map((r) => (
              <div key={r.id} className="flex items-center gap-2 mb-1">
                <img src={r.user.avatar} className="w-5 h-5 rounded-full" alt={r.user.name} />
                <span className="text-xs font-medium text-gray-900 dark:text-white">{r.user.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  <span dangerouslySetInnerHTML={{ __html: highlightMentions(r.content) }} />
                </span>
                <span className="text-xs text-gray-300 dark:text-gray-600 ml-2">{getTimeAgo(r.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1">
            {reactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReactionAdd(activity.id, emoji)}
                className="text-sm hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors flex items-center gap-1"
              >
                <span>{emoji}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.reactions?.[emoji] || 0}
                </span>
              </button>
            ))}
          </div>
          
          {activity.targetSectionId && (
            <button
              type="button"
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition"
              onClick={() => scrollToSection(activity.targetSectionId!)}
            >
              <ArrowDown className="w-3 h-3" /> Click to jump
            </button>
          )}
        </div>
      </div>
    </li>
  );
};
