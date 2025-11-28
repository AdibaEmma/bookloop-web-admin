'use client';

import { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { CustomTooltip, useChartColors } from '@/components/charts/ChartComponents';
import type { UserSegment, SegmentCriteria, User } from '@/types/admin';

// Extended Segment interface
interface Segment extends UserSegment {
  color: string;
  icon: string;
  growth: number;
  avgEngagement: number;
  avgLifetimeValue: number;
  topRegions: string[];
  topCategories: string[];
}

interface SegmentComparisonMetric {
  metric: string;
  [key: string]: string | number;
}

// Mock Segments Data
const mockSegments: Segment[] = [
  {
    id: 'seg-1',
    name: 'Power Traders',
    description: 'Highly active users with 10+ exchanges per month',
    criteria: {
      activity_level: 'high',
      min_exchanges: 10,
    },
    user_count: 245,
    created_at: '2024-01-15',
    color: '#6366f1',
    icon: 'trophy',
    growth: 12.5,
    avgEngagement: 92,
    avgLifetimeValue: 156,
    topRegions: ['Greater Accra', 'Ashanti', 'Western'],
    topCategories: ['Fiction', 'Education', 'Self-Help'],
  },
  {
    id: 'seg-2',
    name: 'New Enthusiasts',
    description: 'Users who joined in the last 30 days with active listings',
    criteria: {
      activity_level: 'medium',
      registered_after: '2024-05-01',
    },
    user_count: 892,
    created_at: '2024-02-20',
    color: '#10b981',
    icon: 'sparkles',
    growth: 34.2,
    avgEngagement: 68,
    avgLifetimeValue: 42,
    topRegions: ['Greater Accra', 'Central', 'Eastern'],
    topCategories: ['Fiction', 'Children', 'Academic'],
  },
  {
    id: 'seg-3',
    name: 'At-Risk Users',
    description: 'Previously active users with no activity in 30+ days',
    criteria: {
      activity_level: 'inactive',
    },
    user_count: 1234,
    created_at: '2024-03-10',
    color: '#f59e0b',
    icon: 'exclamation',
    growth: -8.3,
    avgEngagement: 12,
    avgLifetimeValue: 28,
    topRegions: ['Northern', 'Upper East', 'Volta'],
    topCategories: ['Academic', 'Religious', 'Fiction'],
  },
  {
    id: 'seg-4',
    name: 'Book Collectors',
    description: 'Users with 20+ active listings',
    criteria: {
      activity_level: 'high',
    },
    user_count: 156,
    created_at: '2024-01-25',
    color: '#8b5cf6',
    icon: 'book',
    growth: 5.8,
    avgEngagement: 78,
    avgLifetimeValue: 198,
    topRegions: ['Greater Accra', 'Ashanti', 'Western'],
    topCategories: ['Academic', 'Fiction', 'Non-Fiction'],
  },
  {
    id: 'seg-5',
    name: 'Regional Champions',
    description: 'Top exchangers in underserved regions',
    criteria: {
      regions: ['Northern', 'Upper East', 'Upper West'],
      min_exchanges: 3,
    },
    user_count: 89,
    created_at: '2024-04-05',
    color: '#ec4899',
    icon: 'map',
    growth: 22.1,
    avgEngagement: 85,
    avgLifetimeValue: 67,
    topRegions: ['Northern', 'Upper East', 'Upper West'],
    topCategories: ['Education', 'Religious', 'Children'],
  },
  {
    id: 'seg-6',
    name: 'Casual Browsers',
    description: 'Users who browse but rarely exchange',
    criteria: {
      activity_level: 'low',
      max_exchanges: 2,
    },
    user_count: 2456,
    created_at: '2024-02-15',
    color: '#64748b',
    icon: 'eye',
    growth: 2.1,
    avgEngagement: 25,
    avgLifetimeValue: 12,
    topRegions: ['Greater Accra', 'Central', 'Volta'],
    topCategories: ['Fiction', 'Self-Help', 'Biography'],
  },
];

const segmentDistribution = mockSegments.map((seg) => ({
  name: seg.name,
  value: seg.user_count,
  color: seg.color,
}));

const comparisonMetrics: SegmentComparisonMetric[] = [
  { metric: 'Avg Exchanges/Month', 'Power Traders': 15.2, 'New Enthusiasts': 3.4, 'At-Risk': 0.2, 'Collectors': 8.7, 'Regional Champions': 5.1, 'Casual Browsers': 0.8 },
  { metric: 'Avg Listings', 'Power Traders': 12.4, 'New Enthusiasts': 4.2, 'At-Risk': 2.1, 'Collectors': 28.5, 'Regional Champions': 6.3, 'Casual Browsers': 1.2 },
  { metric: 'Response Rate %', 'Power Traders': 94, 'New Enthusiasts': 78, 'At-Risk': 23, 'Collectors': 88, 'Regional Champions': 91, 'Casual Browsers': 45 },
  { metric: 'Avg Rating', 'Power Traders': 4.8, 'New Enthusiasts': 4.5, 'At-Risk': 4.2, 'Collectors': 4.7, 'Regional Champions': 4.6, 'Casual Browsers': 4.3 },
  { metric: 'Retention 30d %', 'Power Traders': 95, 'New Enthusiasts': 72, 'At-Risk': 15, 'Collectors': 89, 'Regional Champions': 82, 'Casual Browsers': 48 },
];

const radarData = [
  { metric: 'Engagement', 'Power Traders': 92, 'New Enthusiasts': 68, 'At-Risk': 12 },
  { metric: 'Listings', 'Power Traders': 75, 'New Enthusiasts': 45, 'At-Risk': 20 },
  { metric: 'Exchanges', 'Power Traders': 95, 'New Enthusiasts': 55, 'At-Risk': 8 },
  { metric: 'Response Rate', 'Power Traders': 94, 'New Enthusiasts': 78, 'At-Risk': 23 },
  { metric: 'Rating', 'Power Traders': 96, 'New Enthusiasts': 90, 'At-Risk': 84 },
  { metric: 'Retention', 'Power Traders': 95, 'New Enthusiasts': 72, 'At-Risk': 15 },
];

// Sample users for segment preview
const sampleUsers: (User & { segment_id: string })[] = [
  {
    id: 'user-1',
    email: 'kwame.mensah@gmail.com',
    first_name: 'Kwame',
    last_name: 'Mensah',
    is_active: true,
    is_verified: true,
    created_at: '2024-01-15',
    last_login_at: '2024-06-01',
    location: { city: 'Accra', region: 'Greater Accra' },
    stats: { total_listings: 24, total_exchanges: 45, successful_exchanges: 42, rating: 4.9 },
    segment_id: 'seg-1',
  },
  {
    id: 'user-2',
    email: 'ama.darko@yahoo.com',
    first_name: 'Ama',
    last_name: 'Darko',
    is_active: true,
    is_verified: true,
    created_at: '2024-05-20',
    last_login_at: '2024-06-02',
    location: { city: 'Kumasi', region: 'Ashanti' },
    stats: { total_listings: 5, total_exchanges: 3, successful_exchanges: 3, rating: 4.7 },
    segment_id: 'seg-2',
  },
  {
    id: 'user-3',
    email: 'kofi.asante@outlook.com',
    first_name: 'Kofi',
    last_name: 'Asante',
    is_active: false,
    is_verified: true,
    created_at: '2023-11-10',
    last_login_at: '2024-04-15',
    location: { city: 'Tamale', region: 'Northern' },
    stats: { total_listings: 2, total_exchanges: 4, successful_exchanges: 3, rating: 4.2 },
    segment_id: 'seg-3',
  },
];

export default function SegmentsPage() {
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'compare' | 'builder'>('overview');
  const [newSegment, setNewSegment] = useState<Partial<Segment>>({
    name: '',
    description: '',
    criteria: {},
  });

  const segmentUsers = useMemo(() => {
    if (!selectedSegment) return [];
    return sampleUsers.filter((u) => u.segment_id === selectedSegment.id);
  }, [selectedSegment]);

  const totalUsers = mockSegments.reduce((sum, seg) => sum + seg.user_count, 0);

  const getSegmentIcon = (icon: string) => {
    switch (icon) {
      case 'trophy':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case 'sparkles':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'exclamation':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'book':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'map':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        );
      case 'eye':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Segmentation</h1>
          <p className="text-gray-600 mt-1">
            Create and manage user segments for targeted engagement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'overview' ? 'bg-white shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('compare')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'compare' ? 'bg-white shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Compare
            </button>
            <button
              onClick={() => setViewMode('builder')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'builder' ? 'bg-white shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Builder
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Segment
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Segments</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{mockSegments.length}</p>
          <p className="text-xs text-gray-500 mt-1">Active segments</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Segmented Users</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalUsers.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">92% of total users</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Largest Segment</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">Casual Browsers</p>
          <p className="text-xs text-gray-500 mt-1">2,456 users (45%)</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Fastest Growing</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">New Enthusiasts</p>
          <p className="text-xs text-green-600 mt-1">+34.2% this month</p>
        </div>
      </div>

      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Segment List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Segments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockSegments.map((segment) => (
                <button
                  key={segment.id}
                  onClick={() => setSelectedSegment(segment)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedSegment?.id === segment.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${segment.color}20` }}
                    >
                      <span style={{ color: segment.color }}>{getSegmentIcon(segment.icon)}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        segment.growth > 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {segment.growth > 0 ? '+' : ''}
                      {segment.growth}%
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mt-3">{segment.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{segment.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {segment.user_count.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Users</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{segment.avgEngagement}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Engagement</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Segment Distribution & Details */}
          <div className="space-y-6">
            {/* Distribution Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Segment Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={segmentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {segmentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => value.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {segmentDistribution.map((seg) => (
                  <div key={seg.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                      <span className="text-gray-600 dark:text-gray-400">{seg.name}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {((seg.value / totalUsers) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Segment Details */}
            {selectedSegment && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{selectedSegment.name}</h3>
                  <button className="text-sm text-indigo-600 hover:text-indigo-700">Edit</button>
                </div>

                <div className="space-y-4">
                  {/* Criteria */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Criteria</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSegment.criteria.activity_level && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          Activity: {selectedSegment.criteria.activity_level}
                        </span>
                      )}
                      {selectedSegment.criteria.min_exchanges && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          Min exchanges: {selectedSegment.criteria.min_exchanges}
                        </span>
                      )}
                      {selectedSegment.criteria.regions && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          Regions: {selectedSegment.criteria.regions.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Avg Lifetime Value</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        GH₵{selectedSegment.avgLifetimeValue}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Engagement Score</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedSegment.avgEngagement}%
                      </p>
                    </div>
                  </div>

                  {/* Top Regions */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Top Regions</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSegment.topRegions.map((region) => (
                        <span
                          key={region}
                          className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                        >
                          {region}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-100 flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                      Send Campaign
                    </button>
                    <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 dark:bg-gray-900">
                      Export
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'compare' && (
        <div className="space-y-6">
          {/* Comparison Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Segment Comparison</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={comparisonMetrics}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Power Traders" fill="#6366f1" />
                <Bar dataKey="New Enthusiasts" fill="#10b981" />
                <Bar dataKey="At-Risk" fill="#f59e0b" />
                <Bar dataKey="Collectors" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Comparison */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Engagement Profile</h3>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Power Traders"
                    dataKey="Power Traders"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="New Enthusiasts"
                    dataKey="New Enthusiasts"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="At-Risk"
                    dataKey="At-Risk"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.3}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Segment Recommendations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recommendations by Segment</h3>
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                    <span className="font-medium text-indigo-900">Power Traders</span>
                  </div>
                  <p className="text-sm text-indigo-700">
                    Reward with exclusive features and early access. Consider ambassador program.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="font-medium text-green-900">New Enthusiasts</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Send onboarding tips and first exchange incentives. High conversion potential.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="font-medium text-yellow-900">At-Risk Users</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Re-engagement campaign with personalized book recommendations needed urgently.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                    <span className="font-medium text-gray-900 dark:text-white">Casual Browsers</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Highlight success stories and simplify first listing process to convert.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Segment Builder */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Create New Segment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Segment Name
                </label>
                <input
                  type="text"
                  value={newSegment.name}
                  onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                  placeholder="e.g., High-Value Collectors"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newSegment.description}
                  onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                  placeholder="Describe who this segment targets..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {['high', 'medium', 'low', 'inactive'].map((level) => (
                    <button
                      key={level}
                      onClick={() =>
                        setNewSegment({
                          ...newSegment,
                          criteria: {
                            ...newSegment.criteria,
                            activity_level: level as SegmentCriteria['activity_level'],
                          },
                        })
                      }
                      className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                        newSegment.criteria?.activity_level === level
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Exchanges
                  </label>
                  <input
                    type="number"
                    value={newSegment.criteria?.min_exchanges || ''}
                    onChange={(e) =>
                      setNewSegment({
                        ...newSegment,
                        criteria: {
                          ...newSegment.criteria,
                          min_exchanges: parseInt(e.target.value) || undefined,
                        },
                      })
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Exchanges
                  </label>
                  <input
                    type="number"
                    value={newSegment.criteria?.max_exchanges || ''}
                    onChange={(e) =>
                      setNewSegment({
                        ...newSegment,
                        criteria: {
                          ...newSegment.criteria,
                          max_exchanges: parseInt(e.target.value) || undefined,
                        },
                      })
                    }
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Regions</label>
                <div className="flex flex-wrap gap-2">
                  {['Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern', 'Northern'].map(
                    (region) => (
                      <button
                        key={region}
                        onClick={() => {
                          const currentRegions = newSegment.criteria?.regions || [];
                          const newRegions = currentRegions.includes(region)
                            ? currentRegions.filter((r) => r !== region)
                            : [...currentRegions, region];
                          setNewSegment({
                            ...newSegment,
                            criteria: { ...newSegment.criteria, regions: newRegions },
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          newSegment.criteria?.regions?.includes(region)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {region}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registered After
                  </label>
                  <input
                    type="date"
                    value={newSegment.criteria?.registered_after || ''}
                    onChange={(e) =>
                      setNewSegment({
                        ...newSegment,
                        criteria: { ...newSegment.criteria, registered_after: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registered Before
                  </label>
                  <input
                    type="date"
                    value={newSegment.criteria?.registered_before || ''}
                    onChange={(e) =>
                      setNewSegment({
                        ...newSegment,
                        criteria: { ...newSegment.criteria, registered_before: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Create Segment
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Preview
                </button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Segment Preview</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Estimated Users</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">~1,250</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Based on current criteria</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Sample Users</h3>
                <div className="space-y-3">
                  {sampleUsers.slice(0, 3).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-medium">
                        {user.first_name[0]}
                        {user.last_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.location?.city} · {user.stats?.total_exchanges} exchanges
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {user.stats?.rating?.toFixed(1)} ★
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">68%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Avg Engagement</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">GH₵45</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Avg LTV</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">4.5</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Avg Rating</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">72%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">30d Retention</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Segment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Create Segment</h2>
            <p className="text-sm text-gray-500 mb-4">
              Use the Builder tab for full segment creation with all options.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setViewMode('builder');
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Go to Builder
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
