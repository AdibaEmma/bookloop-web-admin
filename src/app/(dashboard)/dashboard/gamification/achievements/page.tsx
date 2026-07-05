'use client';

import { useState, useMemo } from 'react';

type AchievementCategory = 'exchange' | 'listing' | 'community' | 'milestone' | 'special';
type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  criteria: {
    type: string;
    target: number;
    current_metric?: string;
  };
  reward?: {
    type: 'points' | 'badge' | 'feature_unlock' | 'discount';
    value: string | number;
  };
  total_earned: number;
  is_active: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

const mockAchievements: Achievement[] = [
  {
    id: 'ach-1',
    name: 'First Exchange',
    description: 'Complete your first book exchange',
    icon: '🎉',
    category: 'exchange',
    rarity: 'common',
    criteria: { type: 'exchanges_completed', target: 1 },
    reward: { type: 'points', value: 50 },
    total_earned: 3456,
    is_active: true,
    is_hidden: false,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'ach-2',
    name: 'Book Collector',
    description: 'Create 10 book listings',
    icon: '📚',
    category: 'listing',
    rarity: 'common',
    criteria: { type: 'listings_created', target: 10 },
    reward: { type: 'points', value: 100 },
    total_earned: 2145,
    is_active: true,
    is_hidden: false,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'ach-3',
    name: 'Trading Pro',
    description: 'Complete 25 successful exchanges',
    icon: '⭐',
    category: 'exchange',
    rarity: 'rare',
    criteria: { type: 'exchanges_completed', target: 25 },
    reward: { type: 'badge', value: 'trading_pro' },
    total_earned: 456,
    is_active: true,
    is_hidden: false,
    created_at: '2024-01-15',
    updated_at: '2024-03-10',
  },
  {
    id: 'ach-4',
    name: 'Community Champion',
    description: 'Help 5 new users complete their first exchange',
    icon: '🤝',
    category: 'community',
    rarity: 'rare',
    criteria: { type: 'new_users_helped', target: 5 },
    reward: { type: 'feature_unlock', value: 'priority_support' },
    total_earned: 89,
    is_active: true,
    is_hidden: false,
    created_at: '2024-02-01',
    updated_at: '2024-04-15',
  },
  {
    id: 'ach-5',
    name: 'Century Club',
    description: 'Complete 100 exchanges',
    icon: '💯',
    category: 'milestone',
    rarity: 'epic',
    criteria: { type: 'exchanges_completed', target: 100 },
    reward: { type: 'badge', value: 'century_club' },
    total_earned: 23,
    is_active: true,
    is_hidden: false,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'ach-6',
    name: 'Perfect Rating',
    description: 'Maintain a 5.0 rating for 20 consecutive exchanges',
    icon: '✨',
    category: 'exchange',
    rarity: 'epic',
    criteria: { type: 'consecutive_5_star', target: 20 },
    reward: { type: 'discount', value: '20% off next exchange' },
    total_earned: 45,
    is_active: true,
    is_hidden: false,
    created_at: '2024-02-15',
    updated_at: '2024-05-01',
  },
  {
    id: 'ach-7',
    name: 'Book Master',
    description: 'Complete 500 exchanges',
    icon: '👑',
    category: 'milestone',
    rarity: 'legendary',
    criteria: { type: 'exchanges_completed', target: 500 },
    reward: { type: 'badge', value: 'book_master' },
    total_earned: 5,
    is_active: true,
    is_hidden: false,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'ach-8',
    name: 'Founding Member',
    description: 'Join during the platform launch period',
    icon: '🏆',
    category: 'special',
    rarity: 'legendary',
    criteria: { type: 'join_date_before', target: 2024 },
    reward: { type: 'badge', value: 'founding_member' },
    total_earned: 234,
    is_active: false,
    is_hidden: false,
    created_at: '2024-01-01',
    updated_at: '2024-06-01',
  },
  {
    id: 'ach-9',
    name: 'Secret Achievement',
    description: 'Complete a special hidden challenge',
    icon: '🎭',
    category: 'special',
    rarity: 'legendary',
    criteria: { type: 'hidden_challenge', target: 1 },
    reward: { type: 'badge', value: 'mystery_solver' },
    total_earned: 12,
    is_active: true,
    is_hidden: true,
    created_at: '2024-03-01',
    updated_at: '2024-05-15',
  },
];

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState(mockAchievements);
  const [filterCategory, setFilterCategory] = useState<AchievementCategory | 'all'>('all');
  const [filterRarity, setFilterRarity] = useState<AchievementRarity | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const [newAchievement, setNewAchievement] = useState({
    name: '',
    description: '',
    icon: '🏅',
    category: 'exchange' as AchievementCategory,
    rarity: 'common' as AchievementRarity,
    criteria_type: 'exchanges_completed',
    criteria_target: 1,
    reward_type: 'points' as 'points' | 'badge' | 'feature_unlock' | 'discount',
    reward_value: '',
    is_hidden: false,
  });

  const filteredAchievements = useMemo(() => {
    return achievements.filter((achievement) => {
      const matchesCategory = filterCategory === 'all' || achievement.category === filterCategory;
      const matchesRarity = filterRarity === 'all' || achievement.rarity === filterRarity;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && achievement.is_active) ||
        (filterStatus === 'inactive' && !achievement.is_active);
      const matchesSearch =
        !searchQuery ||
        achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesRarity && matchesStatus && matchesSearch;
    });
  }, [achievements, filterCategory, filterRarity, filterStatus, searchQuery]);

  const stats = useMemo(() => ({
    total: achievements.length,
    active: achievements.filter((a) => a.is_active).length,
    totalEarned: achievements.reduce((acc, a) => acc + a.total_earned, 0),
    legendary: achievements.filter((a) => a.rarity === 'legendary').length,
  }), [achievements]);

  const getRarityColor = (rarity: AchievementRarity) => {
    switch (rarity) {
      case 'common':
        return 'bg-[#F1ECE3] text-foreground border-[#E4DED2]';
      case 'rare':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'epic':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'legendary':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    }
  };

  const getCategoryIcon = (category: AchievementCategory) => {
    switch (category) {
      case 'exchange':
        return '🔄';
      case 'listing':
        return '📖';
      case 'community':
        return '👥';
      case 'milestone':
        return '🎯';
      case 'special':
        return '✨';
    }
  };

  const toggleActive = (id: string) => {
    setAchievements(achievements.map((a) =>
      a.id === id ? { ...a, is_active: !a.is_active } : a
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Achievement Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage user achievements and badges
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Achievement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
          <p className="text-xs text-muted-foreground">Total Achievements</p>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
          <p className="text-xs text-muted-foreground">Total Earned</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.totalEarned.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
          <p className="text-xs text-muted-foreground">Legendary</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.legendary}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-[#E4DED2] rounded-lg"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as AchievementCategory | 'all')}
          className="px-3 py-2 border border-[#E4DED2] rounded-lg"
        >
          <option value="all">All Categories</option>
          <option value="exchange">Exchange</option>
          <option value="listing">Listing</option>
          <option value="community">Community</option>
          <option value="milestone">Milestone</option>
          <option value="special">Special</option>
        </select>
        <select
          value={filterRarity}
          onChange={(e) => setFilterRarity(e.target.value as AchievementRarity | 'all')}
          className="px-3 py-2 border border-[#E4DED2] rounded-lg"
        >
          <option value="all">All Rarity</option>
          <option value="common">Common</option>
          <option value="rare">Rare</option>
          <option value="epic">Epic</option>
          <option value="legendary">Legendary</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-3 py-2 border border-[#E4DED2] rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            onClick={() => setSelectedAchievement(achievement)}
            className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedAchievement?.id === achievement.id
                ? 'border-indigo-500'
                : 'border-[#ECE6DC] dark:border-[#33291f]'
            } ${!achievement.is_active ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  getRarityColor(achievement.rarity).replace('text-', 'bg-').split(' ')[0]
                }`}>
                  {achievement.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{achievement.name}</h3>
                    {achievement.is_hidden && (
                      <svg className="w-4 h-4 text-muted-foreground dark:text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full border ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleActive(achievement.id); }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  achievement.is_active ? 'bg-indigo-600' : 'bg-[#ECE6DC]'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    achievement.is_active ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>{getCategoryIcon(achievement.category)}</span>
                <span className="capitalize">{achievement.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{achievement.total_earned.toLocaleString()} earned</span>
              </div>
            </div>

            {achievement.reward && (
              <div className="mt-3 pt-3 border-t border-[#F0EBE1] flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Reward:</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  {achievement.reward.type === 'points' ? `${achievement.reward.value} pts` :
                   achievement.reward.type === 'badge' ? `🏅 ${achievement.reward.value}` :
                   String(achievement.reward.value)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detail Sidebar */}
      {selectedAchievement && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-[#ECE6DC] shadow-xl z-40 overflow-y-auto">
          <div className="p-4 border-b border-[#ECE6DC] flex items-center justify-between sticky top-0 bg-white">
            <h3 className="font-semibold text-foreground">Achievement Details</h3>
            <button
              onClick={() => setSelectedAchievement(null)}
              className="p-1 text-muted-foreground hover:text-muted-foreground"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 space-y-6">
            {/* Icon and Name */}
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl ${
                getRarityColor(selectedAchievement.rarity).replace('text-', 'bg-').split(' ')[0]
              }`}>
                {selectedAchievement.icon}
              </div>
              <h3 className="text-lg font-semibold text-foreground mt-3">{selectedAchievement.name}</h3>
              <span className={`inline-block px-3 py-1 text-sm rounded-full border mt-2 ${getRarityColor(selectedAchievement.rarity)}`}>
                {selectedAchievement.rarity}
              </span>
            </div>

            <p className="text-sm text-muted-foreground text-center">{selectedAchievement.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-background rounded-lg text-center">
                <p className="text-2xl font-bold text-indigo-600">{selectedAchievement.total_earned.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Users Earned</p>
              </div>
              <div className="p-3 bg-background rounded-lg text-center">
                <p className="text-2xl font-bold text-foreground">{selectedAchievement.criteria.target}</p>
                <p className="text-xs text-muted-foreground">Target</p>
              </div>
            </div>

            {/* Criteria */}
            <div>
              <h4 className="font-medium text-foreground mb-2">Criteria</h4>
              <div className="p-3 bg-background rounded-lg">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{selectedAchievement.criteria.type.replace(/_/g, ' ')}</span>
                  {' ≥ '}
                  <span className="font-bold">{selectedAchievement.criteria.target}</span>
                </p>
              </div>
            </div>

            {/* Reward */}
            {selectedAchievement.reward && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Reward</h4>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    <span className="font-medium capitalize">{selectedAchievement.reward.type.replace('_', ' ')}:</span>{' '}
                    <span>{selectedAchievement.reward.value}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Settings */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Settings</h4>
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <span className="text-sm text-muted-foreground">Active</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  selectedAchievement.is_active ? 'bg-green-100 text-green-700' : 'bg-[#ECE6DC] text-muted-foreground'
                }`}>
                  {selectedAchievement.is_active ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <span className="text-sm text-muted-foreground">Hidden</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  selectedAchievement.is_hidden ? 'bg-purple-100 text-purple-700' : 'bg-[#ECE6DC] text-muted-foreground'
                }`}>
                  {selectedAchievement.is_hidden ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <span className="text-sm text-muted-foreground">Category</span>
                <span className="text-sm text-foreground capitalize">{selectedAchievement.category}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-[#ECE6DC] dark:border-[#33291f]">
              <button className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                Edit Achievement
              </button>
              <button className="px-3 py-2 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#241c16] rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Create Achievement</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-muted-foreground hover:text-muted-foreground"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Icon</label>
                  <input
                    type="text"
                    value={newAchievement.icon}
                    onChange={(e) => setNewAchievement({ ...newAchievement, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg text-center text-2xl"
                    maxLength={2}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                  <input
                    type="text"
                    value={newAchievement.name}
                    onChange={(e) => setNewAchievement({ ...newAchievement, name: e.target.value })}
                    placeholder="Achievement name"
                    className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <textarea
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                  placeholder="Describe how to earn this achievement..."
                  rows={2}
                  className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                  <select
                    value={newAchievement.category}
                    onChange={(e) => setNewAchievement({ ...newAchievement, category: e.target.value as AchievementCategory })}
                    className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg"
                  >
                    <option value="exchange">Exchange</option>
                    <option value="listing">Listing</option>
                    <option value="community">Community</option>
                    <option value="milestone">Milestone</option>
                    <option value="special">Special</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Rarity</label>
                  <select
                    value={newAchievement.rarity}
                    onChange={(e) => setNewAchievement({ ...newAchievement, rarity: e.target.value as AchievementRarity })}
                    className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg"
                  >
                    <option value="common">Common</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Criteria Type</label>
                  <select
                    value={newAchievement.criteria_type}
                    onChange={(e) => setNewAchievement({ ...newAchievement, criteria_type: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg"
                  >
                    <option value="exchanges_completed">Exchanges Completed</option>
                    <option value="listings_created">Listings Created</option>
                    <option value="new_users_helped">New Users Helped</option>
                    <option value="consecutive_5_star">Consecutive 5-Star</option>
                    <option value="referrals">Referrals</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Target</label>
                  <input
                    type="number"
                    value={newAchievement.criteria_target}
                    onChange={(e) => setNewAchievement({ ...newAchievement, criteria_target: parseInt(e.target.value) })}
                    min={1}
                    className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Reward Type</label>
                  <select
                    value={newAchievement.reward_type}
                    onChange={(e) => setNewAchievement({ ...newAchievement, reward_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg"
                  >
                    <option value="points">Points</option>
                    <option value="badge">Badge</option>
                    <option value="feature_unlock">Feature Unlock</option>
                    <option value="discount">Discount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Reward Value</label>
                  <input
                    type="text"
                    value={newAchievement.reward_value}
                    onChange={(e) => setNewAchievement({ ...newAchievement, reward_value: e.target.value })}
                    placeholder={newAchievement.reward_type === 'points' ? '100' : 'badge_name'}
                    className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_hidden"
                  checked={newAchievement.is_hidden}
                  onChange={(e) => setNewAchievement({ ...newAchievement, is_hidden: e.target.checked })}
                  className="rounded border-[#E4DED2]"
                />
                <label htmlFor="is_hidden" className="text-sm text-foreground">Hidden Achievement</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Achievement
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-[#E4DED2] text-foreground rounded-lg hover:bg-background"
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
