'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FiChevronLeft,
  FiFilter,
  FiUser,
  FiFileText,
  FiActivity,
  FiUsers,
  FiMenu,
  FiX,
  FiDownload,
  FiMoon,
  FiSun,
} from 'react-icons/fi';
import { LandingPage } from '../components/LandingPage';
import { ActivitySummaryChart } from '../components/ActivitySummaryChart';
import { ActivityItem } from '../components/ActivityItem';
import { User, Activity, ActivityType, Filter, activityTypeLabels } from '../types/activity';
import { exportActivities } from '../utils/helpers';

// Mock data
const users: User[] = [
  { id: 'u1', name: 'Alice', avatar: 'https://i.pravatar.cc/40?img=1', online: true, editing: true },
  { id: 'u2', name: 'Bob', avatar: 'https://i.pravatar.cc/40?img=2', online: true, editing: false },
  { id: 'u3', name: 'Carol', avatar: 'https://i.pravatar.cc/40?img=3', online: false, editing: false },
  { id: 'u4', name: 'David', avatar: 'https://i.pravatar.cc/40?img=4', online: true, editing: false },
];

const fakeProjects = ['Design System', 'Docs', 'API', 'Marketing'];

const initialActivities: Activity[] = [
  {
    id: 'a1',
    user: users[0],
    type: 'edit',
    timestamp: '2024-06-27T12:00:00Z',
    content: 'Edited section "Introduction".',
    targetSectionId: 'section-intro',
    reactions: { '👍': 2, '❤️': 1 },
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
    reactions: { '👀': 1 }
  },
  {
    id: 'a3',
    user: users[2],
    type: 'upload',
    timestamp: '2024-06-27T12:02:00Z',
    content: 'Uploaded design mockup.',
    filePreview: '/lovable-uploads/3461decf-58e8-459b-bc68-8c63f62a3e83.png',
    targetSectionId: 'section-design',
    reactions: { '🎨': 3 }
  }
];

const docSections = [
  { id: 'section-intro', label: 'Introduction' },
  { id: 'section-para1', label: 'Main Paragraph' },
  { id: 'section-design', label: 'Design Mockup' },
  { id: 'section-wireframes', label: 'Wireframes' },
  { id: 'section-summary', label: 'Summary' },
];

const Index: React.FC = () => {
  const [showLanding, setShowLanding] = useState(() => {
    return localStorage.getItem('collabpulse-visited') !== 'true';
  });
  
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('collabpulse-theme');
    return saved === 'dark' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const [filter, setFilter] = useState<Filter>(() => {
    const saved = localStorage.getItem('collabpulse-filters');
    return saved ? JSON.parse(saved) : { users: [], types: [], projects: [] };
  });
  
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [currentUsers, setCurrentUsers] = useState<User[]>(users);

  // Theme effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('collabpulse-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Save filters
  useEffect(() => {
    localStorage.setItem('collabpulse-filters', JSON.stringify(filter));
  }, [filter]);

  const handleEnterApp = () => {
    setShowLanding(false);
    localStorage.setItem('collabpulse-visited', 'true');
  };

  const toggleFilter = (key: keyof Filter, value: string) => {
    setFilter((prev) => {
      const currentArray = prev[key] as string[];
      if (currentArray.includes(value)) {
        return { ...prev, [key]: currentArray.filter((v) => v !== value) };
      }
      return { ...prev, [key]: [...currentArray, value] };
    });
  };

  const clearFilters = () => {
    setFilter({ users: [], types: [], projects: [] });
  };

  const handleBarClick = (type: ActivityType) => {
    toggleFilter('types', type);
  };

  const handleReactionAdd = (activityId: string, emoji: string) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === activityId
          ? {
              ...a,
              reactions: {
                ...a.reactions,
                [emoji]: (a.reactions?.[emoji] || 0) + 1,
              },
            }
          : a
      )
    );
  };

  const filteredActivities = activities.filter((a) => {
    if (filter.users.length && !filter.users.includes(a.user.id)) return false;
    if (filter.types.length && !filter.types.includes(a.type)) return false;
    if (filter.projects.length) {
      const fauxProject = fakeProjects[Math.abs(a.id.charCodeAt(0)) % fakeProjects.length];
      if (!filter.projects.includes(fauxProject)) return false;
    }
    return true;
  });

  if (showLanding) {
    return <LandingPage onEnterApp={handleEnterApp} isDark={isDark} onThemeToggle={() => setIsDark(!isDark)} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 antialiased overflow-hidden">
      {/* Mobile backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`flex flex-col bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-sm transition-all duration-300 ${
          isMobileSidebarOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden lg:flex'
        }`}
        style={{ width: isMobileSidebarOpen ? 320 : sidebarWidth, minWidth: 220, maxWidth: 480 }}
      >
        {/* ... keep existing sidebar content but simplified */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <FiFilter className="text-blue-600" /> Filter
          </div>
          <button
            className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Filters section - simplified */}
        <div className="flex-1 overflow-y-auto">
          {/* Users filter */}
          <div className="p-4 border-b dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
              <FiUser /> Team
            </div>
            <div className="flex flex-wrap gap-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  className={`flex items-center px-2 py-1 rounded-full border transition text-xs ${
                    filter.users.includes(u.id)
                      ? 'bg-blue-100 dark:bg-blue-900 border-blue-400'
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-400'
                  }`}
                  onClick={() => toggleFilter('users', u.id)}
                >
                  <img src={u.avatar} alt={u.name} className="w-4 h-4 rounded-full mr-1" />
                  {u.name}
                </button>
              ))}
            </div>
          </div>

          {/* Clear filters button */}
          <div className="p-4">
            <button
              onClick={clearFilters}
              className="w-full text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-2 rounded transition"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        <ActivitySummaryChart activities={filteredActivities} onBarClick={handleBarClick} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-16 flex items-center border-b dark:border-gray-700 px-4 lg:px-6 bg-white dark:bg-gray-800 sticky top-0 z-10 shadow-sm">
          <button
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded mr-2"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <FiMenu className="w-5 h-5" />
          </button>
          
          <div className="font-bold text-xl flex items-center gap-2">
            <FiActivity className="text-blue-600" />
            <span className="hidden sm:inline">Workspace Activity</span>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            <button
              onClick={() => exportActivities(filteredActivities)}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition"
            >
              <FiDownload className="w-4 h-4" />
              Export
            </button>
            
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="text-gray-500 dark:text-gray-400 text-xs mb-4">
            {filteredActivities.length} activity{filteredActivities.length === 1 ? '' : 'ies'} found
          </div>
          
          <ol className="space-y-4">
            {filteredActivities.map((activity) => (
              <ActivityItem 
                key={activity.id} 
                activity={activity} 
                onReactionAdd={handleReactionAdd} 
              />
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Index;
