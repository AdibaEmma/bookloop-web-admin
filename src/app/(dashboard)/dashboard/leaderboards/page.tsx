'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { LeaderboardEntry } from '@/types/admin';

// Extended types
interface LeaderboardCategory {
  id: string;
  name: string;
  description: string;
  metric: string;
  icon: string;
  entries: LeaderboardEntry[];
}

// Mock Data
const leaderboardCategories: LeaderboardCategory[] = [
  {
    id: 'exchanges',
    name: 'Top Exchangers',
    description: 'Users with most successful exchanges this month',
    metric: 'Exchanges',
    icon: 'exchange',
    entries: [
      { rank: 1, user_id: 'u1', user_name: 'Kwame Mensah', score: 45, metric: 'exchanges', change: 2 },
      { rank: 2, user_id: 'u2', user_name: 'Ama Darko', score: 38, metric: 'exchanges', change: 1 },
      { rank: 3, user_id: 'u3', user_name: 'Kofi Asante', score: 32, metric: 'exchanges', change: -1 },
      { rank: 4, user_id: 'u4', user_name: 'Efua Boateng', score: 28, metric: 'exchanges', change: 3 },
      { rank: 5, user_id: 'u5', user_name: 'Yaw Owusu', score: 25, metric: 'exchanges', change: 0 },
      { rank: 6, user_id: 'u6', user_name: 'Akua Mensah', score: 23, metric: 'exchanges', change: -2 },
      { rank: 7, user_id: 'u7', user_name: 'Kojo Appiah', score: 21, metric: 'exchanges', change: 1 },
      { rank: 8, user_id: 'u8', user_name: 'Abena Darko', score: 19, metric: 'exchanges', change: 0 },
      { rank: 9, user_id: 'u9', user_name: 'Nana Agyei', score: 17, metric: 'exchanges', change: 2 },
      { rank: 10, user_id: 'u10', user_name: 'Esi Mensah', score: 15, metric: 'exchanges', change: -1 },
    ],
  },
  {
    id: 'listings',
    name: 'Top Listers',
    description: 'Users with most active listings',
    metric: 'Listings',
    icon: 'book',
    entries: [
      { rank: 1, user_id: 'u11', user_name: 'Nana Agyei', score: 67, metric: 'listings', change: 5 },
      { rank: 2, user_id: 'u1', user_name: 'Kwame Mensah', score: 54, metric: 'listings', change: 0 },
      { rank: 3, user_id: 'u12', user_name: 'Adjoa Mensah', score: 48, metric: 'listings', change: 2 },
      { rank: 4, user_id: 'u3', user_name: 'Kofi Asante', score: 42, metric: 'listings', change: -1 },
      { rank: 5, user_id: 'u13', user_name: 'Kweku Darko', score: 38, metric: 'listings', change: 1 },
      { rank: 6, user_id: 'u2', user_name: 'Ama Darko', score: 35, metric: 'listings', change: 0 },
      { rank: 7, user_id: 'u14', user_name: 'Akosua Boateng', score: 32, metric: 'listings', change: 3 },
      { rank: 8, user_id: 'u5', user_name: 'Yaw Owusu', score: 29, metric: 'listings', change: -2 },
      { rank: 9, user_id: 'u4', user_name: 'Efua Boateng', score: 26, metric: 'listings', change: 1 },
      { rank: 10, user_id: 'u15', user_name: 'Fiifi Asante', score: 24, metric: 'listings', change: 0 },
    ],
  },
  {
    id: 'ratings',
    name: 'Highest Rated',
    description: 'Users with best average ratings (min 10 reviews)',
    metric: 'Rating',
    icon: 'star',
    entries: [
      { rank: 1, user_id: 'u1', user_name: 'Kwame Mensah', score: 4.95, metric: 'rating', change: 0 },
      { rank: 2, user_id: 'u16', user_name: 'Maame Serwaa', score: 4.92, metric: 'rating', change: 1 },
      { rank: 3, user_id: 'u2', user_name: 'Ama Darko', score: 4.88, metric: 'rating', change: -1 },
      { rank: 4, user_id: 'u17', user_name: 'Papa Kofi', score: 4.85, metric: 'rating', change: 2 },
      { rank: 5, user_id: 'u11', user_name: 'Nana Agyei', score: 4.82, metric: 'rating', change: 0 },
      { rank: 6, user_id: 'u5', user_name: 'Yaw Owusu', score: 4.78, metric: 'rating', change: 1 },
      { rank: 7, user_id: 'u18', user_name: 'Adwoa Mensah', score: 4.75, metric: 'rating', change: -1 },
      { rank: 8, user_id: 'u3', user_name: 'Kofi Asante', score: 4.72, metric: 'rating', change: 0 },
      { rank: 9, user_id: 'u19', user_name: 'Kukua Darko', score: 4.68, metric: 'rating', change: 2 },
      { rank: 10, user_id: 'u4', user_name: 'Efua Boateng', score: 4.65, metric: 'rating', change: -2 },
    ],
  },
  {
    id: 'referrals',
    name: 'Top Referrers',
    description: 'Users who brought the most new members',
    metric: 'Referrals',
    icon: 'users',
    entries: [
      { rank: 1, user_id: 'u2', user_name: 'Ama Darko', score: 23, metric: 'referrals', change: 3 },
      { rank: 2, user_id: 'u20', user_name: 'Kwesi Mensah', score: 19, metric: 'referrals', change: 0 },
      { rank: 3, user_id: 'u1', user_name: 'Kwame Mensah', score: 16, metric: 'referrals', change: 1 },
      { rank: 4, user_id: 'u21', user_name: 'Afia Asante', score: 14, metric: 'referrals', change: -1 },
      { rank: 5, user_id: 'u3', user_name: 'Kofi Asante', score: 12, metric: 'referrals', change: 2 },
      { rank: 6, user_id: 'u11', user_name: 'Nana Agyei', score: 10, metric: 'referrals', change: 0 },
      { rank: 7, user_id: 'u5', user_name: 'Yaw Owusu', score: 9, metric: 'referrals', change: 1 },
      { rank: 8, user_id: 'u22', user_name: 'Abena Serwaa', score: 8, metric: 'referrals', change: -1 },
      { rank: 9, user_id: 'u4', user_name: 'Efua Boateng', score: 7, metric: 'referrals', change: 0 },
      { rank: 10, user_id: 'u23', user_name: 'Kofi Darko', score: 6, metric: 'referrals', change: 2 },
    ],
  },
];

const regionalLeaderboard = [
  { region: 'Greater Accra', users: 2456, exchanges: 4567, growth: 12.5 },
  { region: 'Ashanti', users: 1234, exchanges: 2345, growth: 8.3 },
  { region: 'Western', users: 567, exchanges: 1234, growth: 15.2 },
  { region: 'Central', users: 456, exchanges: 987, growth: 6.7 },
  { region: 'Eastern', users: 345, exchanges: 765, growth: 9.1 },
];

export default function LeaderboardsPage() {
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>(leaderboardCategories[0]);
  const [timeRange, setTimeRange] = useState('month');

  const getCategoryIcon = (icon: string) => {
    switch (icon) {
      case 'exchange':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'book':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'star':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'users':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold shadow-lg">
          1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white font-bold">
          2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
          3
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
        {rank}
      </div>
    );
  };

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <span className="flex items-center text-green-600 text-xs">
          <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          {change}
        </span>
      );
    }
    if (change < 0) {
      return (
        <span className="flex items-center text-red-600 text-xs">
          <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          {Math.abs(change)}
        </span>
      );
    }
    return <span className="text-gray-400 text-xs">-</span>;
  };

  const chartData = selectedCategory.entries.slice(0, 5).map((entry) => ({
    name: entry.user_name.split(' ')[0],
    score: entry.score,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leaderboards</h1>
          <p className="text-gray-600 mt-1">
            Celebrate and track top performers in the community
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-3">
        {leaderboardCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              selectedCategory.id === category.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-300'
            }`}
          >
            {getCategoryIcon(category.icon)}
            <span className="font-medium">{category.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Leaderboard */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCategory.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{selectedCategory.description}</p>
          </div>

          {/* Top 3 Podium */}
          <div className="p-6 bg-gradient-to-b from-indigo-50 to-white">
            <div className="flex items-end justify-center gap-4">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white text-xl font-bold mb-2">
                  {selectedCategory.entries[1]?.user_name.split(' ').map(n => n[0]).join('')}
                </div>
                <p className="font-medium text-gray-900 text-sm">{selectedCategory.entries[1]?.user_name}</p>
                <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{selectedCategory.entries[1]?.score}</p>
                <div className="w-20 h-16 bg-gray-200 rounded-t-lg mt-2 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-500 dark:text-gray-400 dark:text-gray-500">2</span>
                </div>
              </div>
              {/* 1st Place */}
              <div className="text-center -mb-4">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-2xl font-bold mb-2 shadow-lg">
                    {selectedCategory.entries[0]?.user_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <svg className="w-6 h-6 absolute -top-2 left-1/2 transform -translate-x-1/2 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedCategory.entries[0]?.user_name}</p>
                <p className="text-xl font-bold text-indigo-600">{selectedCategory.entries[0]?.score}</p>
                <div className="w-24 h-24 bg-yellow-200 rounded-t-lg mt-2 flex items-center justify-center">
                  <span className="text-3xl font-bold text-yellow-600">1</span>
                </div>
              </div>
              {/* 3rd Place */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl font-bold mb-2">
                  {selectedCategory.entries[2]?.user_name.split(' ').map(n => n[0]).join('')}
                </div>
                <p className="font-medium text-gray-900 text-sm">{selectedCategory.entries[2]?.user_name}</p>
                <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{selectedCategory.entries[2]?.score}</p>
                <div className="w-20 h-12 bg-orange-200 rounded-t-lg mt-2 flex items-center justify-center">
                  <span className="text-2xl font-bold text-orange-600">3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full List */}
          <div className="divide-y divide-gray-100">
            {selectedCategory.entries.slice(3).map((entry) => (
              <div key={entry.user_id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center gap-4">
                  {getRankBadge(entry.rank)}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-medium">
                    {entry.user_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{entry.user_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{entry.score} {selectedCategory.metric.toLowerCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getChangeIndicator(entry.change)}
                  <button className="text-sm text-indigo-600 hover:text-indigo-700">View Profile</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Top 5 Comparison</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={60} />
                <Tooltip />
                <Bar dataKey="score" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Regional Leaders */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Regional Rankings</h3>
            <div className="space-y-3">
              {regionalLeaderboard.map((region, index) => (
                <div key={region.region} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700 dark:text-gray-300' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-600 dark:text-gray-400 dark:text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{region.region}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{region.users.toLocaleString()} users</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{region.exchanges.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+{region.growth}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Unlocked */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Achievements</h3>
            <div className="space-y-3">
              {[
                { user: 'Kwame Mensah', badge: 'Super Trader', time: '2h ago' },
                { user: 'Ama Darko', badge: 'Rising Star', time: '5h ago' },
                { user: 'Kofi Asante', badge: 'Community Helper', time: '1d ago' },
              ].map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{achievement.user}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Earned "{achievement.badge}"</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{achievement.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
