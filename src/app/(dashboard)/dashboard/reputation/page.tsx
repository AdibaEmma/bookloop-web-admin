'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { CustomTooltip, useChartColors } from '@/components/charts/ChartComponents';
import type { UserReputation, Badge, Review, Violation } from '@/types/admin';

// Extended types
interface ReputationUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  trust_score: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  total_exchanges: number;
  successful_exchanges: number;
  avg_rating: number;
  total_reviews: number;
  badges: Badge[];
  violations: Violation[];
  joined_at: string;
  last_active: string;
}

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'achievement' | 'milestone' | 'special';
  criteria: string;
  earned_count: number;
  is_active: boolean;
}

interface TrustScoreBreakdown {
  factor: string;
  weight: number;
  score: number;
  maxScore: number;
}

// Mock Data
const mockUsers: ReputationUser[] = [
  {
    id: 'user-1',
    name: 'Kwame Mensah',
    email: 'kwame.mensah@gmail.com',
    trust_score: 95,
    level: 'platinum',
    total_exchanges: 156,
    successful_exchanges: 152,
    avg_rating: 4.9,
    total_reviews: 148,
    badges: [
      { id: 'b1', name: 'Super Trader', description: '100+ exchanges', icon: 'trophy', earned_at: '2024-03-15', category: 'milestone' },
      { id: 'b2', name: 'Trusted Member', description: 'Verified identity', icon: 'shield', earned_at: '2024-01-20', category: 'achievement' },
      { id: 'b3', name: 'Quick Responder', description: '<1hr response time', icon: 'clock', earned_at: '2024-02-10', category: 'achievement' },
    ],
    violations: [],
    joined_at: '2023-06-15',
    last_active: '2024-06-02',
  },
  {
    id: 'user-2',
    name: 'Ama Darko',
    email: 'ama.darko@yahoo.com',
    trust_score: 88,
    level: 'gold',
    total_exchanges: 78,
    successful_exchanges: 75,
    avg_rating: 4.7,
    total_reviews: 72,
    badges: [
      { id: 'b4', name: 'Rising Star', description: '50+ exchanges', icon: 'star', earned_at: '2024-04-20', category: 'milestone' },
      { id: 'b5', name: 'Book Lover', description: '25+ listings', icon: 'book', earned_at: '2024-03-25', category: 'achievement' },
    ],
    violations: [],
    joined_at: '2023-09-20',
    last_active: '2024-06-01',
  },
  {
    id: 'user-3',
    name: 'Kofi Asante',
    email: 'kofi.asante@outlook.com',
    trust_score: 72,
    level: 'silver',
    total_exchanges: 34,
    successful_exchanges: 30,
    avg_rating: 4.3,
    total_reviews: 28,
    badges: [
      { id: 'b6', name: 'Active Member', description: '10+ exchanges', icon: 'check', earned_at: '2024-02-15', category: 'milestone' },
    ],
    violations: [
      { id: 'v1', type: 'warning', reason: 'Late to meetup', issued_by: 'System', issued_at: '2024-04-10' },
    ],
    joined_at: '2024-01-10',
    last_active: '2024-05-28',
  },
  {
    id: 'user-4',
    name: 'Efua Boateng',
    email: 'efua.boateng@gmail.com',
    trust_score: 45,
    level: 'bronze',
    total_exchanges: 12,
    successful_exchanges: 8,
    avg_rating: 3.8,
    total_reviews: 7,
    badges: [],
    violations: [
      { id: 'v2', type: 'warning', reason: 'Item not as described', issued_by: 'Admin', issued_at: '2024-05-01' },
      { id: 'v3', type: 'suspension', reason: 'Multiple complaints', issued_by: 'Admin', issued_at: '2024-05-15', expires_at: '2024-06-15' },
    ],
    joined_at: '2024-03-05',
    last_active: '2024-05-14',
  },
  {
    id: 'user-5',
    name: 'Yaw Owusu',
    email: 'yaw.owusu@gmail.com',
    trust_score: 82,
    level: 'gold',
    total_exchanges: 65,
    successful_exchanges: 62,
    avg_rating: 4.6,
    total_reviews: 58,
    badges: [
      { id: 'b7', name: 'Community Helper', description: 'Helped 10 new users', icon: 'heart', earned_at: '2024-04-05', category: 'special' },
      { id: 'b8', name: 'Rising Star', description: '50+ exchanges', icon: 'star', earned_at: '2024-05-10', category: 'milestone' },
    ],
    violations: [],
    joined_at: '2023-11-20',
    last_active: '2024-06-02',
  },
];

const badgeDefinitions: BadgeDefinition[] = [
  { id: 'badge-1', name: 'Super Trader', description: 'Complete 100+ successful exchanges', icon: 'trophy', category: 'milestone', criteria: 'successful_exchanges >= 100', earned_count: 45, is_active: true },
  { id: 'badge-2', name: 'Rising Star', description: 'Complete 50+ successful exchanges', icon: 'star', category: 'milestone', criteria: 'successful_exchanges >= 50', earned_count: 156, is_active: true },
  { id: 'badge-3', name: 'Active Member', description: 'Complete 10+ successful exchanges', icon: 'check', category: 'milestone', criteria: 'successful_exchanges >= 10', earned_count: 892, is_active: true },
  { id: 'badge-4', name: 'Trusted Member', description: 'Complete identity verification', icon: 'shield', category: 'achievement', criteria: 'is_verified = true', earned_count: 1234, is_active: true },
  { id: 'badge-5', name: 'Quick Responder', description: 'Average response time under 1 hour', icon: 'clock', category: 'achievement', criteria: 'avg_response_time < 1hr', earned_count: 567, is_active: true },
  { id: 'badge-6', name: 'Book Lover', description: 'Have 25+ active listings', icon: 'book', category: 'achievement', criteria: 'active_listings >= 25', earned_count: 234, is_active: true },
  { id: 'badge-7', name: 'Community Helper', description: 'Help 10+ new users with their first exchange', icon: 'heart', category: 'special', criteria: 'helped_new_users >= 10', earned_count: 89, is_active: true },
  { id: 'badge-8', name: 'Early Adopter', description: 'Joined during beta period', icon: 'rocket', category: 'special', criteria: 'joined_at < 2024-01-01', earned_count: 156, is_active: false },
];

const levelDistribution = [
  { name: 'Platinum', value: 45, color: '#6366f1' },
  { name: 'Gold', value: 234, color: '#f59e0b' },
  { name: 'Silver', value: 567, color: '#9ca3af' },
  { name: 'Bronze', value: 1456, color: '#cd7c3c' },
];

const trustScoreTrend = [
  { month: 'Jan', avgScore: 72, newUsers: 450, violations: 12 },
  { month: 'Feb', avgScore: 74, newUsers: 520, violations: 8 },
  { month: 'Mar', avgScore: 73, newUsers: 680, violations: 15 },
  { month: 'Apr', avgScore: 76, newUsers: 590, violations: 6 },
  { month: 'May', avgScore: 78, newUsers: 720, violations: 9 },
  { month: 'Jun', avgScore: 79, newUsers: 450, violations: 4 },
];

const trustScoreFactors: TrustScoreBreakdown[] = [
  { factor: 'Exchange Success Rate', weight: 30, score: 28, maxScore: 30 },
  { factor: 'Average Rating', weight: 25, score: 23, maxScore: 25 },
  { factor: 'Response Time', weight: 15, score: 12, maxScore: 15 },
  { factor: 'Profile Completeness', weight: 10, score: 10, maxScore: 10 },
  { factor: 'Verification Status', weight: 10, score: 10, maxScore: 10 },
  { factor: 'Account Age', weight: 10, score: 7, maxScore: 10 },
];

export default function ReputationPage() {
  const [selectedUser, setSelectedUser] = useState<ReputationUser | null>(null);
  const [viewMode, setViewMode] = useState<'users' | 'badges' | 'violations'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = levelFilter === 'all' || user.level === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [searchQuery, levelFilter]);

  const usersWithViolations = mockUsers.filter((u) => u.violations.length > 0);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'platinum':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'gold':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'silver':
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:border-gray-700';
      case 'bronze':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 dark:text-gray-300';
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getBadgeIcon = (icon: string) => {
    const iconClass = 'w-5 h-5';
    switch (icon) {
      case 'trophy':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case 'star':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'shield':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'clock':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'book':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'heart':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'check':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'rocket':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reputation System</h1>
          <p className="text-gray-600 mt-1">
            Manage user trust scores, badges, and violations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('users')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'users' ? 'bg-white shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setViewMode('badges')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'badges' ? 'bg-white shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Badges
            </button>
            <button
              onClick={() => setViewMode('violations')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'violations' ? 'bg-white shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Violations
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg Trust Score</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">76.4</p>
          <p className="text-xs text-green-600 mt-1">+2.1 from last month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Platinum Users</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">45</p>
          <p className="text-xs text-gray-500 mt-1">Top 2% of users</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Badges Earned</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">3,373</p>
          <p className="text-xs text-green-600 mt-1">+156 this month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Violations</p>
          <p className="text-2xl font-bold text-red-600 mt-1">23</p>
          <p className="text-xs text-gray-500 mt-1">12 warnings, 11 suspensions</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg Rating</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">4.6</p>
          <p className="text-xs text-gray-500 mt-1">Based on 12,456 reviews</p>
        </div>
      </div>

      {viewMode === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Levels</option>
                <option value="platinum">Platinum</option>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="bronze">Bronze</option>
              </select>
            </div>

            {/* User Cards */}
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedUser?.id === user.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${getLevelColor(user.level)}`}>
                          {user.level}
                        </span>
                        {user.violations.length > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            {user.violations.length} violation{user.violations.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <span className={`text-lg font-bold ${getTrustScoreColor(user.trust_score)}`}>
                            {user.trust_score}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">trust score</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.avg_rating}</span>
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {user.successful_exchanges}/{user.total_exchanges} exchanges
                        </span>
                      </div>
                    </div>
                    <div className="flex -space-x-1">
                      {user.badges.slice(0, 3).map((badge) => (
                        <div
                          key={badge.id}
                          className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border-2 border-white"
                          title={badge.name}
                        >
                          {getBadgeIcon(badge.icon)}
                        </div>
                      ))}
                      {user.badges.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                          +{user.badges.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Level Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Level Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={levelDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {levelDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {levelDistribution.map((level) => (
                  <div key={level.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: level.color }} />
                      <span className="text-gray-600 dark:text-gray-400">{level.name}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{level.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected User Details */}
            {selectedUser && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Trust Score Breakdown</h3>
                <div className="space-y-3">
                  {trustScoreFactors.map((factor) => (
                    <div key={factor.factor}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">{factor.factor}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {factor.score}/{factor.maxScore}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${(factor.score / factor.maxScore) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Total Score</span>
                    <span className={`text-2xl font-bold ${getTrustScoreColor(selectedUser.trust_score)}`}>
                      {selectedUser.trust_score}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                    Award Badge
                  </button>
                  <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 dark:bg-gray-900">
                    Issue Warning
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'badges' && (
        <div className="space-y-6">
          {/* Badge Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold">Most Earned Badge</h3>
              <p className="text-3xl font-bold mt-2">Trusted Member</p>
              <p className="text-yellow-100 mt-1">1,234 users</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold">Rarest Badge</h3>
              <p className="text-3xl font-bold mt-2">Super Trader</p>
              <p className="text-indigo-100 mt-1">45 users (2%)</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold">Badges This Month</h3>
              <p className="text-3xl font-bold mt-2">+156</p>
              <p className="text-green-100 mt-1">12% increase</p>
            </div>
          </div>

          {/* Badge Grid */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Badges</h2>
              <button
                onClick={() => setShowBadgeModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Badge
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {badgeDefinitions.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-xl border-2 ${
                    badge.is_active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${
                      badge.category === 'milestone' ? 'bg-yellow-100 text-yellow-600' :
                      badge.category === 'achievement' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {getBadgeIcon(badge.icon)}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      badge.category === 'milestone' ? 'bg-yellow-100 text-yellow-700' :
                      badge.category === 'achievement' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {badge.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mt-3">{badge.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{badge.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{badge.earned_count} earned</span>
                    <button className="text-sm text-indigo-600 hover:text-indigo-700">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'violations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Violations List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Violations</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {usersWithViolations.map((user) =>
                  user.violations.map((violation) => (
                    <div key={violation.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            violation.type === 'warning' ? 'bg-yellow-100' :
                            violation.type === 'suspension' ? 'bg-orange-100' :
                            'bg-red-100'
                          }`}>
                            <svg className={`w-5 h-5 ${
                              violation.type === 'warning' ? 'text-yellow-600' :
                              violation.type === 'suspension' ? 'text-orange-600' :
                              'text-red-600'
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                                violation.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                violation.type === 'suspension' ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {violation.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{violation.reason}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Issued by {violation.issued_by} on {new Date(violation.issued_at).toLocaleDateString()}
                              {violation.expires_at && ` · Expires ${new Date(violation.expires_at).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                            Review
                          </button>
                          <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                            Escalate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Violations Stats */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Violation Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trustScoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="violations" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Issue New Violation</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Search user..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Select violation type</option>
                  <option value="warning">Warning</option>
                  <option value="suspension">Suspension</option>
                  <option value="ban">Ban</option>
                </select>
                <textarea
                  placeholder="Reason for violation..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Issue Violation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Badge Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Badge</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Badge Name</label>
                <input
                  type="text"
                  placeholder="e.g., Super Exchanger"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="What does this badge represent?"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="milestone">Milestone</option>
                  <option value="achievement">Achievement</option>
                  <option value="special">Special</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Criteria</label>
                <input
                  type="text"
                  placeholder="e.g., successful_exchanges >= 100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Create Badge
              </button>
              <button
                onClick={() => setShowBadgeModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
