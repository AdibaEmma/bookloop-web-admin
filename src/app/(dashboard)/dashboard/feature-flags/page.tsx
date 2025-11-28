'use client';

import { useState, useMemo } from 'react';
import type { FeatureFlag } from '@/types/admin';

// Extended Feature Flag with additional fields
interface FeatureFlagWithHistory extends FeatureFlag {
  category: string;
  environment: 'production' | 'staging' | 'development';
  last_toggled_by?: string;
  last_toggled_at?: string;
}

// Mock Data
const mockFeatureFlags: FeatureFlagWithHistory[] = [
  {
    id: 'flag-1',
    key: 'dark_mode',
    name: 'Dark Mode',
    description: 'Enable dark mode theme for users',
    is_enabled: true,
    rollout_percentage: 100,
    category: 'UI',
    environment: 'production',
    created_by: 'Admin Sarah',
    created_at: '2024-01-15',
    updated_at: '2024-06-01',
    last_toggled_by: 'Admin Michael',
    last_toggled_at: '2024-06-01T10:30:00Z',
  },
  {
    id: 'flag-2',
    key: 'new_exchange_flow',
    name: 'New Exchange Flow',
    description: 'Redesigned exchange initiation process with improved UX',
    is_enabled: true,
    rollout_percentage: 50,
    target_segments: ['power_traders', 'new_enthusiasts'],
    category: 'Feature',
    environment: 'production',
    created_by: 'Admin Sarah',
    created_at: '2024-05-01',
    updated_at: '2024-05-28',
    last_toggled_by: 'Admin Sarah',
    last_toggled_at: '2024-05-28T14:00:00Z',
  },
  {
    id: 'flag-3',
    key: 'ai_book_recommendations',
    name: 'AI Book Recommendations',
    description: 'ML-powered book recommendations based on user preferences',
    is_enabled: true,
    rollout_percentage: 25,
    category: 'AI/ML',
    environment: 'production',
    created_by: 'Admin Michael',
    created_at: '2024-04-10',
    updated_at: '2024-05-20',
  },
  {
    id: 'flag-4',
    key: 'payment_v2',
    name: 'Payment System V2',
    description: 'New payment processing with instant transfers',
    is_enabled: false,
    rollout_percentage: 0,
    category: 'Payment',
    environment: 'staging',
    created_by: 'Admin Sarah',
    created_at: '2024-05-15',
    updated_at: '2024-05-15',
  },
  {
    id: 'flag-5',
    key: 'social_sharing',
    name: 'Social Sharing',
    description: 'Share listings and exchanges on social media',
    is_enabled: true,
    rollout_percentage: 100,
    category: 'Social',
    environment: 'production',
    created_by: 'Admin Michael',
    created_at: '2024-03-20',
    updated_at: '2024-04-15',
  },
  {
    id: 'flag-6',
    key: 'gamification_badges',
    name: 'Gamification Badges',
    description: 'Achievement badges and rewards system',
    is_enabled: true,
    rollout_percentage: 75,
    target_users: ['u1', 'u2', 'u3'],
    category: 'Gamification',
    environment: 'production',
    created_by: 'Admin Sarah',
    created_at: '2024-02-28',
    updated_at: '2024-05-10',
  },
  {
    id: 'flag-7',
    key: 'beta_search',
    name: 'Beta Search Algorithm',
    description: 'Improved search with fuzzy matching and filters',
    is_enabled: true,
    rollout_percentage: 10,
    category: 'Search',
    environment: 'production',
    created_by: 'Admin Michael',
    created_at: '2024-06-01',
    updated_at: '2024-06-01',
  },
  {
    id: 'flag-8',
    key: 'push_notifications_v2',
    name: 'Push Notifications V2',
    description: 'Enhanced push notifications with rich content',
    is_enabled: false,
    rollout_percentage: 0,
    category: 'Notifications',
    environment: 'development',
    created_by: 'Admin Sarah',
    created_at: '2024-05-25',
    updated_at: '2024-05-25',
  },
];

const categories = ['All', 'UI', 'Feature', 'AI/ML', 'Payment', 'Social', 'Gamification', 'Search', 'Notifications'];

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState(mockFeatureFlags);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterEnvironment, setFilterEnvironment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlagWithHistory | null>(null);
  const [newFlag, setNewFlag] = useState<{
    key: string;
    name: string;
    description: string;
    category: string;
    environment: 'development' | 'staging' | 'production';
    rollout_percentage: number;
  }>({
    key: '',
    name: '',
    description: '',
    category: 'Feature',
    environment: 'development',
    rollout_percentage: 0,
  });

  const filteredFlags = useMemo(() => {
    return flags.filter((flag) => {
      const matchesSearch =
        flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flag.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || flag.category === filterCategory;
      const matchesEnvironment = filterEnvironment === 'all' || flag.environment === filterEnvironment;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'enabled' && flag.is_enabled) ||
        (filterStatus === 'disabled' && !flag.is_enabled);
      return matchesSearch && matchesCategory && matchesEnvironment && matchesStatus;
    });
  }, [flags, searchQuery, filterCategory, filterEnvironment, filterStatus]);

  const toggleFlag = (flagId: string) => {
    setFlags(flags.map((f) =>
      f.id === flagId ? { ...f, is_enabled: !f.is_enabled, updated_at: new Date().toISOString() } : f
    ));
  };

  const updateRollout = (flagId: string, percentage: number) => {
    setFlags(flags.map((f) =>
      f.id === flagId ? { ...f, rollout_percentage: percentage, updated_at: new Date().toISOString() } : f
    ));
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production':
        return 'bg-green-100 text-green-700';
      case 'staging':
        return 'bg-yellow-100 text-yellow-700';
      case 'development':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700 dark:text-gray-300';
    }
  };

  const stats = {
    total: flags.length,
    enabled: flags.filter((f) => f.is_enabled).length,
    production: flags.filter((f) => f.environment === 'production').length,
    fullRollout: flags.filter((f) => f.rollout_percentage === 100 && f.is_enabled).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feature Flags</h1>
          <p className="text-gray-600 mt-1">
            Control feature rollouts and A/B testing
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Flag
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Flags</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Enabled</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.enabled}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">In Production</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.production}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Full Rollout</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.fullRollout}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search flags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filterCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <select
          value={filterEnvironment}
          onChange={(e) => setFilterEnvironment(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Environments</option>
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="development">Development</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {/* Flags List */}
      <div className="space-y-4">
        {filteredFlags.map((flag) => (
          <div
            key={flag.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{flag.name}</h3>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">
                    {flag.key}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getEnvironmentColor(flag.environment)}`}>
                    {flag.environment}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:text-gray-400">
                    {flag.category}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{flag.description}</p>

                {/* Rollout Slider */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-24">Rollout: {flag.rollout_percentage}%</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={flag.rollout_percentage}
                    onChange={(e) => updateRollout(flag.id, parseInt(e.target.value))}
                    disabled={!flag.is_enabled}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  />
                  <div className="flex gap-1">
                    {[0, 25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => updateRollout(flag.id, pct)}
                        disabled={!flag.is_enabled}
                        className={`px-2 py-1 text-xs rounded ${
                          flag.rollout_percentage === pct
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        } disabled:opacity-50`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Info */}
                {(flag.target_segments || flag.target_users) && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Targeting:</span>
                    {flag.target_segments?.map((seg) => (
                      <span key={seg} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                        {seg}
                      </span>
                    ))}
                    {flag.target_users && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        {flag.target_users.length} specific users
                      </span>
                    )}
                  </div>
                )}

                {/* Meta Info */}
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                  <span>Created by {flag.created_by}</span>
                  <span>Updated {new Date(flag.updated_at).toLocaleDateString()}</span>
                  {flag.last_toggled_by && (
                    <span>Last toggled by {flag.last_toggled_by}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Toggle Switch */}
                <button
                  onClick={() => toggleFlag(flag.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    flag.is_enabled ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      flag.is_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>

                {/* Actions */}
                <button
                  onClick={() => setSelectedFlag(flag)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Create Feature Flag</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flag Key</label>
                <input
                  type="text"
                  value={newFlag.key}
                  onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                  placeholder="e.g., new_feature"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={newFlag.name}
                  onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })}
                  placeholder="e.g., New Feature"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newFlag.description}
                  onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                  placeholder="What does this flag control?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newFlag.category}
                    onChange={(e) => setNewFlag({ ...newFlag, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {categories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                  <select
                    value={newFlag.environment}
                    onChange={(e) => setNewFlag({ ...newFlag, environment: e.target.value as 'development' | 'staging' | 'production' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="development">Development</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Rollout: {newFlag.rollout_percentage}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={newFlag.rollout_percentage}
                  onChange={(e) => setNewFlag({ ...newFlag, rollout_percentage: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Create Flag
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

      {/* Settings Modal */}
      {selectedFlag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Flag Settings</h2>
              <button
                onClick={() => setSelectedFlag(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flag Key</label>
                <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded-lg">{selectedFlag.key}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Segments</label>
                <select multiple className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24">
                  <option value="power_traders">Power Traders</option>
                  <option value="new_enthusiasts">New Enthusiasts</option>
                  <option value="at_risk">At-Risk Users</option>
                  <option value="regional_champions">Regional Champions</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target User IDs (comma separated)</label>
                <textarea
                  placeholder="user-1, user-2, user-3"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Save Changes
              </button>
              <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                Delete Flag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
