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
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { CustomTooltip, useChartColors } from '@/components/charts/ChartComponents';
import type { Challenge } from '@/types/admin';

// Extended Challenge with analytics
interface ChallengeWithAnalytics extends Challenge {
  progress_percentage: number;
  top_participants: { name: string; progress: number }[];
  daily_progress: { date: string; completions: number }[];
}

// Mock Data
const mockChallenges: ChallengeWithAnalytics[] = [
  {
    id: 'ch-1',
    name: 'Summer Reading Challenge',
    description: 'Complete 10 book exchanges during summer to win exclusive badges',
    type: 'exchange',
    goal: 10,
    reward: { type: 'badge', value: 'summer_champion' },
    start_date: '2024-06-01',
    end_date: '2024-08-31',
    is_active: true,
    participants: 456,
    completions: 89,
    created_by: 'Admin Sarah',
    created_at: '2024-05-25',
    progress_percentage: 19.5,
    top_participants: [
      { name: 'Kwame Mensah', progress: 8 },
      { name: 'Ama Darko', progress: 7 },
      { name: 'Kofi Asante', progress: 6 },
    ],
    daily_progress: [
      { date: 'Jun 1', completions: 5 },
      { date: 'Jun 2', completions: 12 },
      { date: 'Jun 3', completions: 8 },
      { date: 'Jun 4', completions: 15 },
      { date: 'Jun 5', completions: 10 },
    ],
  },
  {
    id: 'ch-2',
    name: 'New Member Welcome',
    description: 'Create your first 5 listings within 7 days of joining',
    type: 'listing',
    goal: 5,
    reward: { type: 'promo_code', value: 'WELCOME20' },
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    is_active: true,
    participants: 1234,
    completions: 567,
    created_by: 'Admin Michael',
    created_at: '2024-01-01',
    progress_percentage: 45.9,
    top_participants: [
      { name: 'Efua Boateng', progress: 5 },
      { name: 'Yaw Owusu', progress: 5 },
      { name: 'Akua Mensah', progress: 4 },
    ],
    daily_progress: [
      { date: 'Jun 1', completions: 23 },
      { date: 'Jun 2', completions: 28 },
      { date: 'Jun 3', completions: 19 },
      { date: 'Jun 4', completions: 31 },
      { date: 'Jun 5', completions: 25 },
    ],
  },
  {
    id: 'ch-3',
    name: 'Refer & Earn',
    description: 'Refer 3 friends who complete their first exchange',
    type: 'referral',
    goal: 3,
    reward: { type: 'points', value: 500 },
    start_date: '2024-04-01',
    end_date: '2024-06-30',
    is_active: true,
    participants: 234,
    completions: 45,
    created_by: 'Admin Sarah',
    created_at: '2024-03-25',
    progress_percentage: 19.2,
    top_participants: [
      { name: 'Nana Agyei', progress: 3 },
      { name: 'Abena Darko', progress: 2 },
      { name: 'Kojo Appiah', progress: 2 },
    ],
    daily_progress: [
      { date: 'Jun 1', completions: 2 },
      { date: 'Jun 2', completions: 4 },
      { date: 'Jun 3', completions: 3 },
      { date: 'Jun 4', completions: 5 },
      { date: 'Jun 5', completions: 3 },
    ],
  },
  {
    id: 'ch-4',
    name: 'Community Builder',
    description: 'Help 5 new users complete their first exchange',
    type: 'engagement',
    goal: 5,
    reward: { type: 'feature_unlock', value: 'priority_matching' },
    start_date: '2024-05-01',
    end_date: '2024-07-31',
    is_active: true,
    participants: 89,
    completions: 12,
    created_by: 'Admin Michael',
    created_at: '2024-04-25',
    progress_percentage: 13.5,
    top_participants: [
      { name: 'Esi Mensah', progress: 4 },
      { name: 'Kwame Mensah', progress: 3 },
      { name: 'Ama Darko', progress: 3 },
    ],
    daily_progress: [
      { date: 'Jun 1', completions: 1 },
      { date: 'Jun 2', completions: 2 },
      { date: 'Jun 3', completions: 1 },
      { date: 'Jun 4', completions: 3 },
      { date: 'Jun 5', completions: 2 },
    ],
  },
  {
    id: 'ch-5',
    name: 'April Book Bonanza',
    description: 'Complete 20 exchanges in April',
    type: 'exchange',
    goal: 20,
    reward: { type: 'badge', value: 'april_champion' },
    start_date: '2024-04-01',
    end_date: '2024-04-30',
    is_active: false,
    participants: 156,
    completions: 23,
    created_by: 'Admin Sarah',
    created_at: '2024-03-20',
    progress_percentage: 14.7,
    top_participants: [],
    daily_progress: [],
  },
];

const challengeStats = {
  activeChallengers: 2013,
  totalCompletions: 736,
  avgCompletionRate: 28.4,
  rewardsGiven: 892,
};

export default function ChallengesPage() {
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeWithAnalytics | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    name: '',
    description: '',
    type: 'exchange' as Challenge['type'],
    goal: 10,
    reward_type: 'badge' as 'badge' | 'points' | 'promo_code' | 'feature_unlock',
    reward_value: '',
    start_date: '',
    end_date: '',
  });

  const filteredChallenges = useMemo(() => {
    return mockChallenges.filter((challenge) => {
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && challenge.is_active) ||
        (filterStatus === 'ended' && !challenge.is_active);
      const matchesType = filterType === 'all' || challenge.type === filterType;
      return matchesStatus && matchesType;
    });
  }, [filterStatus, filterType]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exchange':
        return 'bg-blue-100 text-blue-700';
      case 'listing':
        return 'bg-green-100 text-green-700';
      case 'referral':
        return 'bg-purple-100 text-purple-700';
      case 'engagement':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700 dark:text-gray-300';
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'badge':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
          </svg>
        );
      case 'points':
        return (
          <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'promo_code':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      case 'feature_unlock':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Challenge Campaigns</h1>
          <p className="text-gray-600 mt-1">
            Create and manage user challenges to boost engagement
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Challenge
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
          <p className="text-indigo-100">Active Challengers</p>
          <p className="text-3xl font-bold mt-1">{challengeStats.activeChallengers.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Completions</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{challengeStats.totalCompletions}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg Completion Rate</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{challengeStats.avgCompletionRate}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Rewards Given</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{challengeStats.rewardsGiven}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="ended">Ended</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Types</option>
          <option value="exchange">Exchange</option>
          <option value="listing">Listing</option>
          <option value="referral">Referral</option>
          <option value="engagement">Engagement</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Challenges List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredChallenges.map((challenge) => {
            const daysRemaining = getDaysRemaining(challenge.end_date);
            const isEnded = !challenge.is_active || daysRemaining <= 0;

            return (
              <div
                key={challenge.id}
                onClick={() => setSelectedChallenge(challenge)}
                className={`bg-white rounded-xl border-2 p-6 cursor-pointer transition-all ${
                  selectedChallenge?.id === challenge.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isEnded ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{challenge.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getTypeColor(challenge.type)}`}>
                        {challenge.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{challenge.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRewardIcon(challenge.reward.type)}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{challenge.reward.value}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      {challenge.completions} / {challenge.participants} completed
                    </span>
                    <span className="font-medium text-indigo-600">{challenge.progress_percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${challenge.progress_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{challenge.participants.toLocaleString()} participants</span>
                  <span>Goal: {challenge.goal} {challenge.type}s</span>
                  <span className={isEnded ? 'text-gray-400 dark:text-gray-500' : daysRemaining <= 7 ? 'text-red-500' : ''}>
                    {isEnded ? 'Ended' : `${daysRemaining} days left`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Challenge Details */}
        <div className="space-y-6">
          {selectedChallenge ? (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Top Participants</h3>
                <div className="space-y-3">
                  {selectedChallenge.top_participants.map((participant, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700 dark:text-gray-300' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{participant.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${(participant.progress / selectedChallenge.goal) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {participant.progress}/{selectedChallenge.goal}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Daily Progress</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={selectedChallenge.daily_progress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="completions" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Challenge Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Start Date</span>
                    <span className="text-gray-900 dark:text-white">{new Date(selectedChallenge.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">End Date</span>
                    <span className="text-gray-900 dark:text-white">{new Date(selectedChallenge.end_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Reward Type</span>
                    <span className="text-gray-900 capitalize">{selectedChallenge.reward.type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Created By</span>
                    <span className="text-gray-900 dark:text-white">{selectedChallenge.created_by}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                    Edit Challenge
                  </button>
                  <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 dark:bg-gray-900">
                    {selectedChallenge.is_active ? 'End Early' : 'Duplicate'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-2">Select a challenge to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Create Challenge</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Challenge Name</label>
                <input
                  type="text"
                  value={newChallenge.name}
                  onChange={(e) => setNewChallenge({ ...newChallenge, name: e.target.value })}
                  placeholder="e.g., Summer Reading Challenge"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                  placeholder="Describe the challenge..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newChallenge.type}
                    onChange={(e) => setNewChallenge({ ...newChallenge, type: e.target.value as Challenge['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="exchange">Exchange</option>
                    <option value="listing">Listing</option>
                    <option value="referral">Referral</option>
                    <option value="engagement">Engagement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
                  <input
                    type="number"
                    value={newChallenge.goal}
                    onChange={(e) => setNewChallenge({ ...newChallenge, goal: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newChallenge.start_date}
                    onChange={(e) => setNewChallenge({ ...newChallenge, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newChallenge.end_date}
                    onChange={(e) => setNewChallenge({ ...newChallenge, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reward Type</label>
                  <select
                    value={newChallenge.reward_type}
                    onChange={(e) => setNewChallenge({ ...newChallenge, reward_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="badge">Badge</option>
                    <option value="points">Points</option>
                    <option value="promo_code">Promo Code</option>
                    <option value="feature_unlock">Feature Unlock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reward Value</label>
                  <input
                    type="text"
                    value={newChallenge.reward_value}
                    onChange={(e) => setNewChallenge({ ...newChallenge, reward_value: e.target.value })}
                    placeholder={newChallenge.reward_type === 'points' ? 'e.g., 500' : 'e.g., summer_champion'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Create Challenge
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
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
