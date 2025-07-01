
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Activity, Filter, User, MessageCircle, FileText, Edit, ArrowDown, Users, Menu, X, Download, Sun, Moon, ChevronUp } from 'lucide-react';

// Types
type UserType = {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  editing: boolean;
  role?: string;
};

type ActivityType = 'edit' | 'comment' | 'mention' | 'upload';

type ActivityItem = {
  id: string;
  user: UserType;
  type: ActivityType;
  timestamp: string;
  content: string;
  thread?: {
    replies: {
      id: string;
      user: UserType;
      content: string;
      timestamp: string;
    }[];
  };
  filePreview?: string;
  targetSectionId?: string;
  reactions?: { emoji: string; count: number; users: string[] }[];
};

type FilterType = {
  users: string[];
  types: ActivityType[];
  projects: string[];
};

// Theme hook
const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return { isDark, setIsDark };
};

// Utility functions
const getTimeAgo = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Just now';
  if (min === 1) return '1 min ago';
  if (min < 60) return `${min} mins ago`;
  const hr = Math.floor(min / 60);
  if (hr === 1) return '1 hour ago';
  return `${hr} hours ago`;
};

const highlightMentions = (text: string) => {
  return text.replace(/@(\w+)/g, '<span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 rounded font-medium">@$1</span>');
};

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('ring-2', 'ring-blue-400', 'dark:ring-blue-500');
    setTimeout(() => {
      el.classList.remove('ring-2', 'ring-blue-400', 'dark:ring-blue-500');
    }, 1200);
  }
};

const exportActivities = (activities: ActivityItem[]) => {
  const data = {
    exportDate: new Date().toISOString(),
    totalActivities: activities.length,
    activities: activities.map(a => ({
      id: a.id,
      user: a.user.name,
      type: a.type,
      timestamp: a.timestamp,
      content: a.content,
      reactions: a.reactions?.reduce((acc, r) => ({ ...acc, [r.emoji]: r.count }), {})
    }))
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workspace-activity-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Sample data
const users: UserType[] = [
  { id: 'u1', name: 'Alice', avatar: 'https://i.pravatar.cc/40?img=1', online: true, editing: true, role: 'Designer' },
  { id: 'u2', name: 'Bob', avatar: 'https://i.pravatar.cc/40?img=2', online: true, editing: false, role: 'Developer' },
  { id: 'u3', name: 'Carol', avatar: 'https://i.pravatar.cc/40?img=3', online: false, editing: false, role: 'PM' },
  { id: 'u4', name: 'David', avatar: 'https://i.pravatar.cc/40?img=4', online: true, editing: false, role: 'Writer' },
];

const fakeProjects = ['Design System', 'Docs', 'API', 'Marketing'];

const initialActivities: ActivityItem[] = [
  {
    id: 'a1',
    user: users[0],
    type: 'edit',
    timestamp: '2024-06-27T12:00:00Z',
    content: 'Edited section "Introduction".',
    targetSectionId: 'section-intro',
    reactions: [{ emoji: '👍', count: 2, users: ['u2', 'u3'] }]
  },
  {
    id: 'a2',
    user: users[1],
    type: 'comment',
    timestamp: '2024-06-27T12:01:00Z',
    content: '@Alice Can you review this paragraph?',
    thread: {
      replies: [{
        id: 'r1',
        user: users[0],
        content: "Sure, I'll check it now.",
        timestamp: '2024-06-27T12:01:30Z',
      }],
    },
    targetSectionId: 'section-para1',
    reactions: [{ emoji: '👀', count: 1, users: ['u1'] }]
  },
  {
    id: 'a3',
    user: users[2],
    type: 'upload',
    timestamp: '2024-06-27T12:02:00Z',
    content: 'Uploaded design mockup.',
    filePreview: '/lovable-uploads/3461decf-58e8-459b-bc68-8c63f62a3e83.png',
    targetSectionId: 'section-design',
    reactions: [{ emoji: '🎨', count: 3, users: ['u1', 'u2', 'u4'] }]
  }
];

const activityTypeLabels: Record<ActivityType, { color: string; darkColor: string; icon: React.ReactNode; label: string }> = {
  edit: {
    color: 'bg-blue-100 text-blue-800',
    darkColor: 'dark:bg-blue-900 dark:text-blue-200',
    icon: <Edit className="w-3 h-3" />,
    label: 'Edit',
  },
  comment: {
    color: 'bg-green-100 text-green-800',
    darkColor: 'dark:bg-green-900 dark:text-green-200',
    icon: <MessageCircle className="w-3 h-3" />,
    label: 'Comment',
  },
  mention: {
    color: 'bg-purple-100 text-purple-800',
    darkColor: 'dark:bg-purple-900 dark:text-purple-200',
    icon: <Users className="w-3 h-3" />,
    label: 'Mention',
  },
  upload: {
    color: 'bg-yellow-100 text-yellow-800',
    darkColor: 'dark:bg-yellow-900 dark:text-yellow-200',
    icon: <FileText className="w-3 h-3" />,
    label: 'File Upload',
  },
};

// Components
const ThemeToggle = ({ isDark, setIsDark }: { isDark: boolean; setIsDark: (dark: boolean) => void }) => (
  <button
    onClick={() => setIsDark(!isDark)}
    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    aria-label="Toggle theme"
  >
    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
  </button>
);

const LandingPage = ({ onEnter }: { onEnter: () => void }) => {
  const { isDark, setIsDark } = useTheme();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
      </div>
      
      <div className="max-w-4xl mx-auto text-center animate-fade-in">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 dark:bg-blue-500 rounded-2xl mb-6 shadow-lg">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Workspace Activity
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Real-time collaboration dashboard for Fortune 500 teams
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Live Collaboration</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">See who's online and editing in real-time</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Activity Feed</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Track every edit, comment, and file upload</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Advanced Analytics</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Visual insights into team productivity</p>
          </div>
        </div>
        
        <button
          onClick={onEnter}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
        >
          Launch Dashboard
        </button>
      </div>
    </div>
  );
};

const ActivitySummaryChart = ({ 
  activities, 
  onBarClick 
}: { 
  activities: ActivityItem[];
  onBarClick: (type: ActivityType) => void;
}) => {
  const countByType = { edit: 0, comment: 0, mention: 0, upload: 0 };
  activities.forEach((a) => { countByType[a.type]++; });
  const total = activities.length || 1;
  
  return (
    <div className="flex items-end space-x-4 justify-center h-20 mb-2">
      {(['edit', 'comment', 'mention', 'upload'] as ActivityType[]).map((type) => (
        <div key={type} className="flex flex-col items-center">
          <button
            className={`w-6 rounded-t transition-all hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 ${activityTypeLabels[type].color} ${activityTypeLabels[type].darkColor}`}
            style={{
              height: `${16 + (countByType[type] / total) * 48}px`,
              minHeight: 16,
            }}
            onClick={() => onBarClick(type)}
            title={`${activityTypeLabels[type].label}: ${countByType[type]} - Click to filter`}
            aria-label={`Filter by ${activityTypeLabels[type].label}, ${countByType[type]} items`}
          />
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {activityTypeLabels[type].icon}
          </span>
        </div>
      ))}
    </div>
  );
};

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return isVisible ? (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  ) : null;
};

// Main Component
const CollaborativeActivityPanel: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>(() => {
    const saved = localStorage.getItem('workspace-filters');
    return saved ? JSON.parse(saved) : { users: [], types: [], projects: [] };
  });
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [currentUsers, setCurrentUsers] = useState<UserType[]>(users);
  const { isDark, setIsDark } = useTheme();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Save filters to localStorage
  useEffect(() => {
    localStorage.setItem('workspace-filters', JSON.stringify(filter));
  }, [filter]);

  // Simulate live activity
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        const user = users[Math.floor(Math.random() * users.length)];
        const type = (['edit', 'comment', 'mention', 'upload'] as ActivityType[])[
          Math.floor(Math.random() * 4)
        ];
        const newActivity: ActivityItem = {
          id: 'a' + Date.now(),
          user,
          type,
          timestamp: new Date().toISOString(),
          content: type === 'edit' ? `Edited section "${['Overview', 'Details', 'Conclusion'][Math.floor(Math.random() * 3)]}".`
            : type === 'comment' ? '@Alice Can you check this part?'
            : type === 'mention' ? '@Bob Feedback needed on Section 2.'
            : 'Uploaded reference image.',
          targetSectionId: ['section-overview', 'section-details', 'section-conclusion'][Math.floor(Math.random() * 3)],
          filePreview: type === 'upload' ? '/lovable-uploads/3461decf-58e8-459b-bc68-8c63f62a3e83.png' : undefined,
          reactions: []
        };
        
        setActivities(prev => [newActivity, ...prev]);
      }
      
      if (Math.random() < 0.1) {
        setCurrentUsers(prev => prev.map(u => 
          Math.random() < 0.5 ? { ...u, online: !u.online, editing: Math.random() < 0.5 } : u
        ));
      }
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Resizable sidebar
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const minW = 220, maxW = 480;
      const newWidth = Math.max(minW, Math.min(maxW, e.clientX));
      setSidebarWidth(newWidth);
    };
    const onMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileFiltersOpen) {
        setMobileFiltersOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileFiltersOpen]);

  const filteredActivities = activities.filter((a) => {
    if (filter.users.length && !filter.users.includes(a.user.id)) return false;
    if (filter.types.length && !filter.types.includes(a.type)) return false;
    if (filter.projects.length) {
      const fauxProject = fakeProjects[Math.abs(a.id.charCodeAt(0)) % fakeProjects.length];
      if (!filter.projects.includes(fauxProject)) return false;
    }
    return true;
  });

  const toggleFilter = useCallback((key: keyof FilterType, value: string) => {
    setFilter(prev => {
      const currentValues = prev[key] as string[];
      if (currentValues.includes(value)) {
        return { ...prev, [key]: currentValues.filter(v => v !== value) };
      }
      return { ...prev, [key]: [...currentValues, value] };
    });
  }, []);

  const clearAllFilters = () => {
    setFilter({ users: [], types: [], projects: [] });
  };

  const handleReaction = (activityId: string, emoji: string) => {
    setActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        const reactions = activity.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          const hasUserReacted = existingReaction.users.includes('current-user');
          return {
            ...activity,
            reactions: reactions.map(r => r.emoji === emoji ? {
              ...r,
              count: hasUserReacted ? r.count - 1 : r.count + 1,
              users: hasUserReacted 
                ? r.users.filter(u => u !== 'current-user')
                : [...r.users, 'current-user']
            } : r).filter(r => r.count > 0)
          };
        } else {
          return {
            ...activity,
            reactions: [...reactions, { emoji, count: 1, users: ['current-user'] }]
          };
        }
      }
      return activity;
    }));
  };

  const handleChartBarClick = (type: ActivityType) => {
    if (filter.types.includes(type)) {
      setFilter(prev => ({ ...prev, types: prev.types.filter(t => t !== type) }));
    } else {
      setFilter(prev => ({ ...prev, types: [...prev.types, type] }));
    }
  };

  const docSections = [
    { id: 'section-intro', label: 'Introduction' },
    { id: 'section-para1', label: 'Main Paragraph' },
    { id: 'section-design', label: 'Design Mockup' },
    { id: 'section-wireframes', label: 'Wireframes' },
    { id: 'section-summary', label: 'Summary' },
    { id: 'section-overview', label: 'Overview' },
    { id: 'section-details', label: 'Details' },
    { id: 'section-conclusion', label: 'Conclusion' },
  ];

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 antialiased overflow-hidden">
      {/* Mobile filter overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute inset-y-0 left-0 w-80 max-w-full bg-white dark:bg-gray-800 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-full">
              {/* Filter content - same as desktop sidebar */}
              <div className="flex flex-col gap-4">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
                    <User className="w-3 h-3" /> Team
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        className={`flex items-center px-2 py-1 rounded-full border transition ${
                          filter.users.includes(u.id)
                            ? 'bg-blue-100 dark:bg-blue-900 border-blue-400 dark:border-blue-500'
                            : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                        onClick={() => toggleFilter('users', u.id)}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full mr-1 ${u.online ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                        <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full mr-1 border" />
                        <span className="text-xs">{u.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
                    <Activity className="w-3 h-3" /> Type
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(['edit', 'comment', 'mention', 'upload'] as ActivityType[]).map((type) => (
                      <button
                        key={type}
                        className={`px-2 py-1 rounded-full text-xs transition border flex items-center gap-1 ${
                          filter.types.includes(type)
                            ? `${activityTypeLabels[type].color} ${activityTypeLabels[type].darkColor} border-blue-400 dark:border-blue-500`
                            : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                        onClick={() => toggleFilter('types', type)}
                      >
                        {activityTypeLabels[type].icon}
                        {activityTypeLabels[type].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
                    <FileText className="w-3 h-3" /> Project
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {fakeProjects.map((p) => (
                      <button
                        key={p}
                        className={`px-2 py-1 rounded-full text-xs transition border ${
                          filter.projects.includes(p)
                            ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-400 dark:border-indigo-500'
                            : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                        onClick={() => toggleFilter('projects', p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t dark:border-gray-700">
                  <button
                    onClick={clearAllFilters}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm transition"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div
        className="hidden lg:flex flex-col bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-sm transition-all duration-100"
        ref={sidebarRef}
        style={{ width: sidebarWidth, minWidth: 220, maxWidth: 480 }}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Filter className="text-blue-600 dark:text-blue-400 w-5 h-5" />
            Filter
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
            <span className="text-xs text-gray-400 dark:text-gray-500">Desktop view</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-4">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
              <User className="w-3 h-3" /> Team
            </div>
            <div className="flex flex-wrap gap-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  className={`flex items-center px-2 py-1 rounded-full border transition focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 ${
                    filter.users.includes(u.id)
                      ? 'bg-blue-100 dark:bg-blue-900 border-blue-400 dark:border-blue-500'
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  onClick={() => toggleFilter('users', u.id)}
                  title={`${u.name} - ${u.role} (${u.online ? 'Online' : 'Offline'})`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full mr-1 ${u.online ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                  <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full mr-1 border" />
                  <span className="text-xs">{u.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
              <Activity className="w-3 h-3" /> Type
            </div>
            <div className="flex flex-wrap gap-2">
              {(['edit', 'comment', 'mention', 'upload'] as ActivityType[]).map((type) => (
                <button
                  key={type}
                  className={`px-2 py-1 rounded-full text-xs transition border flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 ${
                    filter.types.includes(type)
                      ? `${activityTypeLabels[type].color} ${activityTypeLabels[type].darkColor} border-blue-400 dark:border-blue-500`
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  onClick={() => toggleFilter('types', type)}
                >
                  {activityTypeLabels[type].icon}
                  {activityTypeLabels[type].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
              <FileText className="w-3 h-3" /> Project
            </div>
            <div className="flex flex-wrap gap-2">
              {fakeProjects.map((p) => (
                <button
                  key={p}
                  className={`px-2 py-1 rounded-full text-xs transition border focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 ${
                    filter.projects.includes(p)
                      ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-400 dark:border-indigo-500'
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  onClick={() => toggleFilter('projects', p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={clearAllFilters}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700"
          >
            Clear All Filters
          </button>
        </div>

        <div className="border-t dark:border-gray-700 px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Users className="w-3 h-3" /> Live Presence
          </div>
          <div className="flex flex-wrap gap-3">
            {currentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-1" title={`${u.name} - ${u.role}`}>
                <span
                  className={`w-2.5 h-2.5 rounded-full border border-white dark:border-gray-800 shadow ${
                    u.online
                      ? u.editing
                        ? 'bg-blue-400 animate-pulse'
                        : 'bg-green-400'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                ></span>
                <img src={u.avatar} className="w-5 h-5 rounded-full border" alt={u.name} />
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 font-medium">
            {currentUsers.filter((u) => u.online).length} online
            {currentUsers.some((u) => u.editing) && `, ${currentUsers.filter((u) => u.editing).length} editing`}
          </div>
        </div>

        <div className="border-t dark:border-gray-700 p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
            <Activity className="w-3 h-3" /> Activity Summary
          </div>
          <ActivitySummaryChart activities={filteredActivities} onBarClick={handleChartBarClick} />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">Click bars to filter by type</p>
        </div>

        <div
          className="absolute right-0 top-0 h-full w-2 cursor-ew-resize z-20 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          style={{ userSelect: 'none' }}
          onMouseDown={() => setIsResizing(true)}
          aria-label="Resize sidebar"
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top bar */}
        <div className="h-16 flex items-center border-b dark:border-gray-700 px-4 lg:px-6 bg-white dark:bg-gray-800 sticky top-0 z-10 shadow-sm">
          <button
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mr-4"
            onClick={() => setMobileFiltersOpen(true)}
            aria-label="Open filters"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="font-bold text-lg lg:text-xl flex items-center gap-2">
            <Activity className="text-blue-600 dark:text-blue-400 w-5 h-5" />
            <span className="hidden sm:inline">Workspace Activity</span>
            <span className="sm:hidden">Activity</span>
          </div>
          
          <div className="ml-auto flex items-center gap-2 lg:gap-4">
            <button
              onClick={() => exportActivities(filteredActivities)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Export activity log"
              aria-label="Export activity log"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <div className="lg:hidden">
              <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
            </div>
            
            <div className="text-gray-400 dark:text-gray-500 text-sm flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">{currentUsers.filter((u) => u.online).length} Active</span>
              <span className="sm:hidden">{currentUsers.filter((u) => u.online).length}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Activity Feed */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gradient-to-tr from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="text-gray-500 dark:text-gray-400 text-xs mb-4">
              {filteredActivities.length} activity{filteredActivities.length === 1 ? '' : 'ies'} found
            </div>
            
            <div className="space-y-4">
              {filteredActivities.map((a, index) => (
                <article
                  key={a.id}
                  className="bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-lg rounded-lg p-4 group transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={a.user.avatar}
                        alt={a.user.name}
                        className="w-9 h-9 rounded-full border mt-1"
                      />
                      {a.user.editing && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{a.user.name}</span>
                        {a.user.role && (
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                            {a.user.role}
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${activityTypeLabels[a.type].color} ${activityTypeLabels[a.type].darkColor}`}
                        >
                          {activityTypeLabels[a.type].icon}
                          {activityTypeLabels[a.type].label}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {getTimeAgo(a.timestamp)}
                        </span>
                      </div>
                      
                      <div 
                        className="mt-2 mb-1 text-gray-700 dark:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: highlightMentions(a.content) }}
                      />
                      
                      {a.filePreview && (
                        <div className="my-3">
                          <img
                            src={a.filePreview}
                            alt="File preview"
                            className="w-40 h-24 object-cover rounded-lg border dark:border-gray-600 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              // Simple fullscreen preview
                              const modal = document.createElement('div');
                              modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
                              modal.innerHTML = `
                                <div class="relative max-w-4xl max-h-full">
                                  <img src="${a.filePreview}" class="max-w-full max-h-full object-contain rounded-lg" alt="Full preview" />
                                  <button class="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all" onclick="this.parentElement.parentElement.remove()">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                  </button>
                                </div>
                              `;
                              document.body.appendChild(modal);
                              modal.addEventListener('click', (e) => {
                                if (e.target === modal) modal.remove();
                              });
                            }}
                          />
                        </div>
                      )}

                      {a.thread && (
                        <div className="ml-3 mt-3 border-l-2 border-blue-100 dark:border-blue-800 pl-3">
                          <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">Replies</div>
                          {a.thread.replies.map((r) => (
                            <div key={r.id} className="flex items-start gap-2 mb-2">
                              <img src={r.user.avatar} className="w-5 h-5 rounded-full" alt={r.user.name} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium">{r.user.name}</span>
                                  <span className="text-xs text-gray-300 dark:text-gray-600">{getTimeAgo(r.timestamp)}</span>
                                </div>
                                <div 
                                  className="text-xs text-gray-600 dark:text-gray-400 mt-1"
                                  dangerouslySetInnerHTML={{ __html: highlightMentions(r.content) }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                          {['👍', '👀', '🎨'].map(emoji => {
                            const reaction = a.reactions?.find(r => r.emoji === emoji);
                            const hasReacted = reaction?.users.includes('current-user');
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(a.id, emoji)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 ${
                                  hasReacted 
                                    ? 'bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700' 
                                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                                title={`React with ${emoji}`}
                              >
                                <span>{emoji}</span>
                                {reaction && reaction.count > 0 && (
                                  <span className="font-medium">{reaction.count}</span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {a.targetSectionId && (
                          <button
                            type="button"
                            className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 rounded px-1"
                            onClick={() => scrollToSection(a.targetSectionId!)}
                          >
                            <ArrowDown className="w-3 h-3" />
                            Click to jump
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Document preview - hidden on mobile/tablet */}
          <div className="hidden xl:block w-96 min-w-[340px] bg-white dark:bg-gray-800 border-l dark:border-gray-700 shadow-inner relative overflow-y-auto p-6">
            <div className="text-xs text-gray-400 dark:text-gray-500 mb-3 font-semibold flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Live Document Preview
            </div>
            <div className="space-y-8">
              {docSections.map((s, idx) => (
                <section
                  key={s.id}
                  id={s.id}
                  className="relative scroll-mt-32 group rounded transition-all p-2 -m-2"
                >
                  <div className="absolute -left-6 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-gray-300 dark:text-gray-600 text-xs">{idx + 1}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{s.label}</h3>
                  <div className="text-gray-700 dark:text-gray-300 text-sm">
                    {s.label === 'Design Mockup' && (
                      <img
                        src="/lovable-uploads/3461decf-58e8-459b-bc68-8c63f62a3e83.png"
                        className="w-full h-32 object-cover rounded-lg border dark:border-gray-600 mb-3"
                        alt="Design"
                      />
                    )}
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vel euismod velit. Etiam euismod, justo eu facilisis suscipit, lacus augue dignissim enim, non bibendum justo velit eu velit.</p>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
};

export default CollaborativeActivityPanel;
