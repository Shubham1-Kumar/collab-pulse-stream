
import React from 'react';
import { FiActivity, FiUsers, FiMessageCircle, FiEye, FiMoon, FiSun } from 'react-icons/fi';

interface LandingPageProps {
  onEnterApp: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, isDark, onThemeToggle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center animate-fade-in">
        <div className="absolute top-6 right-6">
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-6 shadow-lg">
            <FiActivity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            CollabPulse
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Real-time collaborative workspace activity stream. Track, filter, and engage with your team's work as it happens.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
            <FiUsers className="w-8 h-8 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Live Presence</h3>
            <p className="text-gray-600 dark:text-gray-300">See who's online and actively editing in real-time</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
            <FiMessageCircle className="w-8 h-8 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Smart Threading</h3>
            <p className="text-gray-600 dark:text-gray-300">Organized conversations with replies and mentions</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
            <FiEye className="w-8 h-8 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Jump Navigation</h3>
            <p className="text-gray-600 dark:text-gray-300">Click to jump directly to document sections</p>
          </div>
        </div>

        <button
          onClick={onEnterApp}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 inline-flex items-center gap-2"
        >
          <FiActivity className="w-5 h-5" />
          Launch Dashboard
        </button>
      </div>
    </div>
  );
};
