
export type User = {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  editing: boolean;
};

export type ActivityType = 'edit' | 'comment' | 'mention' | 'upload';

export type Activity = {
  id: string;
  user: User;
  type: ActivityType;
  timestamp: string;
  content: string;
  thread?: {
    replies: {
      id: string;
      user: User;
      content: string;
      timestamp: string;
    }[];
  };
  filePreview?: string;
  targetSectionId?: string;
  reactions?: Record<string, number>;
};

export type Filter = {
  users: string[];
  types: ActivityType[];
  projects: string[];
};

export const activityTypeLabels: Record<ActivityType, { color: string; iconName: string; label: string }> = {
  edit: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    iconName: 'Edit3',
    label: 'Edit',
  },
  comment: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    iconName: 'MessageCircle',
    label: 'Comment',
  },
  mention: {
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    iconName: 'Users',
    label: 'Mention',
  },
  upload: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    iconName: 'FileText',
    label: 'File Upload',
  },
};
