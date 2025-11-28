'use client';

import { useState, useMemo } from 'react';
import {
  FunnelChart,
  Funnel,
  LabelList,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { CustomTooltip, useChartColors } from '@/components/charts/ChartComponents';
import type { FunnelData } from '@/types/admin';

// Funnel Types
interface FunnelStage {
  id: string;
  name: string;
  count: number;
  value: number;
  fill: string;
  conversionRate: number;
  dropOffRate: number;
  avgTimeToNext: string;
}

interface FunnelDefinition {
  id: string;
  name: string;
  description: string;
  stages: FunnelStage[];
  period: string;
  totalUsers: number;
  overallConversion: number;
}

interface DropOffReason {
  stage: string;
  reason: string;
  percentage: number;
  count: number;
}

interface CohortData {
  cohort: string;
  registration: number;
  profile_complete: number;
  first_listing: number;
  first_exchange: number;
  exchange_completed: number;
  repeat_user: number;
}

// Mock Data
const registrationFunnel: FunnelDefinition = {
  id: 'registration',
  name: 'Registration to First Exchange',
  description: 'Track user journey from sign-up to completing their first exchange',
  period: 'Last 30 days',
  totalUsers: 2450,
  overallConversion: 18.4,
  stages: [
    { id: '1', name: 'Visited Site', count: 12500, value: 12500, fill: '#6366f1', conversionRate: 100, dropOffRate: 0, avgTimeToNext: '-' },
    { id: '2', name: 'Started Registration', count: 4200, value: 4200, fill: '#8b5cf6', conversionRate: 33.6, dropOffRate: 66.4, avgTimeToNext: '2m 30s' },
    { id: '3', name: 'Completed Registration', count: 2450, value: 2450, fill: '#a855f7', conversionRate: 58.3, dropOffRate: 41.7, avgTimeToNext: '4m 15s' },
    { id: '4', name: 'Profile Completed', count: 1820, value: 1820, fill: '#c084fc', conversionRate: 74.3, dropOffRate: 25.7, avgTimeToNext: '1d 4h' },
    { id: '5', name: 'First Listing Created', count: 980, value: 980, fill: '#d946ef', conversionRate: 53.8, dropOffRate: 46.2, avgTimeToNext: '3d 12h' },
    { id: '6', name: 'First Exchange Initiated', count: 620, value: 620, fill: '#e879f9', conversionRate: 63.3, dropOffRate: 36.7, avgTimeToNext: '2d 6h' },
    { id: '7', name: 'Exchange Completed', count: 450, value: 450, fill: '#f0abfc', conversionRate: 72.6, dropOffRate: 27.4, avgTimeToNext: '-' },
  ],
};

const listingFunnel: FunnelDefinition = {
  id: 'listing',
  name: 'Listing Creation Flow',
  description: 'Track the listing creation process and identify drop-off points',
  period: 'Last 30 days',
  totalUsers: 1250,
  overallConversion: 68.0,
  stages: [
    { id: '1', name: 'Started Listing', count: 1250, value: 1250, fill: '#10b981', conversionRate: 100, dropOffRate: 0, avgTimeToNext: '-' },
    { id: '2', name: 'Added Book Details', count: 1180, value: 1180, fill: '#34d399', conversionRate: 94.4, dropOffRate: 5.6, avgTimeToNext: '1m 45s' },
    { id: '3', name: 'Uploaded Photos', count: 1020, value: 1020, fill: '#6ee7b7', conversionRate: 86.4, dropOffRate: 13.6, avgTimeToNext: '2m 30s' },
    { id: '4', name: 'Set Price/Preferences', count: 920, value: 920, fill: '#a7f3d0', conversionRate: 90.2, dropOffRate: 9.8, avgTimeToNext: '1m 15s' },
    { id: '5', name: 'Published Listing', count: 850, value: 850, fill: '#d1fae5', conversionRate: 92.4, dropOffRate: 7.6, avgTimeToNext: '-' },
  ],
};

const exchangeFunnel: FunnelDefinition = {
  id: 'exchange',
  name: 'Exchange Completion Flow',
  description: 'Track exchanges from initiation to successful completion',
  period: 'Last 30 days',
  totalUsers: 890,
  overallConversion: 71.5,
  stages: [
    { id: '1', name: 'Exchange Initiated', count: 890, value: 890, fill: '#f59e0b', conversionRate: 100, dropOffRate: 0, avgTimeToNext: '-' },
    { id: '2', name: 'Both Parties Confirmed', count: 780, value: 780, fill: '#fbbf24', conversionRate: 87.6, dropOffRate: 12.4, avgTimeToNext: '4h 30m' },
    { id: '3', name: 'Meetup Scheduled', count: 720, value: 720, fill: '#fcd34d', conversionRate: 92.3, dropOffRate: 7.7, avgTimeToNext: '1d 2h' },
    { id: '4', name: 'Meetup Completed', count: 665, value: 665, fill: '#fde68a', conversionRate: 92.4, dropOffRate: 7.6, avgTimeToNext: '2d 8h' },
    { id: '5', name: 'Both Rated', count: 636, value: 636, fill: '#fef3c7', conversionRate: 95.6, dropOffRate: 4.4, avgTimeToNext: '-' },
  ],
};

const dropOffReasons: DropOffReason[] = [
  { stage: 'Started Registration', reason: 'Abandoned during form fill', percentage: 45, count: 3735 },
  { stage: 'Started Registration', reason: 'Technical issues', percentage: 12, count: 996 },
  { stage: 'Started Registration', reason: 'Changed mind', percentage: 9.4, count: 779 },
  { stage: 'Profile Completed', reason: 'Did not verify email', percentage: 15, count: 368 },
  { stage: 'Profile Completed', reason: 'Incomplete profile', percentage: 10.7, count: 262 },
  { stage: 'First Listing Created', reason: 'No books to list', percentage: 22, count: 185 },
  { stage: 'First Listing Created', reason: 'Complex listing process', percentage: 14, count: 118 },
  { stage: 'First Listing Created', reason: 'Photo upload issues', percentage: 10.2, count: 86 },
  { stage: 'First Exchange Initiated', reason: 'No matching interests', percentage: 18, count: 65 },
  { stage: 'First Exchange Initiated', reason: 'Location too far', percentage: 12, count: 43 },
  { stage: 'Exchange Completed', reason: 'No show at meetup', percentage: 15, count: 26 },
  { stage: 'Exchange Completed', reason: 'Item condition issues', percentage: 8, count: 14 },
  { stage: 'Exchange Completed', reason: 'Payment disputes', percentage: 4.4, count: 7 },
];

const cohortData: CohortData[] = [
  { cohort: 'Jan 2024', registration: 450, profile_complete: 342, first_listing: 198, first_exchange: 124, exchange_completed: 89, repeat_user: 45 },
  { cohort: 'Feb 2024', registration: 520, profile_complete: 405, first_listing: 245, first_exchange: 156, exchange_completed: 118, repeat_user: 62 },
  { cohort: 'Mar 2024', registration: 680, profile_complete: 544, first_listing: 340, first_exchange: 224, exchange_completed: 172, repeat_user: 95 },
  { cohort: 'Apr 2024', registration: 590, profile_complete: 460, first_listing: 278, first_exchange: 178, exchange_completed: 134, repeat_user: 72 },
  { cohort: 'May 2024', registration: 720, profile_complete: 576, first_listing: 360, first_exchange: 238, exchange_completed: 180, repeat_user: 98 },
  { cohort: 'Jun 2024', registration: 850, profile_complete: 689, first_listing: 425, first_exchange: 289, exchange_completed: 221, repeat_user: 124 },
];

const conversionTrend = [
  { date: 'Week 1', registration: 58, listing: 68, exchange: 71 },
  { date: 'Week 2', registration: 55, listing: 65, exchange: 69 },
  { date: 'Week 3', registration: 61, listing: 70, exchange: 74 },
  { date: 'Week 4', registration: 58, listing: 68, exchange: 72 },
];

// Stage-specific insights
const stageInsights = [
  {
    stage: 'Registration',
    insight: 'Users who register via mobile have 23% higher completion rate',
    action: 'Optimize mobile registration flow',
    impact: 'high',
  },
  {
    stage: 'Profile',
    insight: 'Adding profile photo increases first listing creation by 45%',
    action: 'Prompt photo upload after registration',
    impact: 'high',
  },
  {
    stage: 'Listing',
    insight: 'Auto-fill from ISBN increases completion by 32%',
    action: 'Add barcode scanning feature',
    impact: 'medium',
  },
  {
    stage: 'Exchange',
    insight: 'Exchanges within 5km have 89% completion rate vs 67% for >10km',
    action: 'Prioritize nearby matches',
    impact: 'high',
  },
];

export default function FunnelsPage() {
  const [selectedFunnel, setSelectedFunnel] = useState<FunnelDefinition>(registrationFunnel);
  const [selectedStage, setSelectedStage] = useState<FunnelStage | null>(null);
  const [dateRange, setDateRange] = useState('30d');
  const [viewMode, setViewMode] = useState<'funnel' | 'comparison' | 'cohort'>('funnel');

  const funnels = [registrationFunnel, listingFunnel, exchangeFunnel];

  const stageDropOffs = useMemo(() => {
    if (!selectedStage) return [];
    return dropOffReasons.filter((r) => r.stage === selectedStage.name);
  }, [selectedStage]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Behavior Funnels</h1>
          <p className="text-gray-600 mt-1">
            Track user journeys and identify conversion opportunities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('funnel')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'funnel' ? 'bg-white shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Funnel
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'comparison' ? 'bg-white shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Compare
            </button>
            <button
              onClick={() => setViewMode('cohort')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'cohort' ? 'bg-white shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Cohort
            </button>
          </div>
        </div>
      </div>

      {/* Funnel Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {funnels.map((funnel) => (
          <button
            key={funnel.id}
            onClick={() => {
              setSelectedFunnel(funnel);
              setSelectedStage(null);
            }}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedFunnel.id === funnel.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <h3 className="font-semibold text-gray-900 dark:text-white">{funnel.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{funnel.description}</p>
            <div className="flex items-center justify-between mt-3">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{funnel.overallConversion}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Overall conversion</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {funnel.totalUsers.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total users</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {viewMode === 'funnel' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Funnel Visualization */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedFunnel.name}</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">{selectedFunnel.period}</span>
            </div>

            {/* Horizontal Funnel */}
            <div className="space-y-3">
              {selectedFunnel.stages.map((stage, index) => {
                const widthPercent = (stage.count / selectedFunnel.stages[0].count) * 100;
                const isSelected = selectedStage?.id === stage.id;

                return (
                  <button
                    key={stage.id}
                    onClick={() => setSelectedStage(stage)}
                    className={`w-full text-left transition-all ${isSelected ? 'scale-[1.02]' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-40 flex-shrink-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{stage.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{stage.count.toLocaleString()} users</p>
                      </div>
                      <div className="flex-1">
                        <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500"
                            style={{
                              width: `${widthPercent}%`,
                              backgroundColor: stage.fill,
                              opacity: isSelected ? 1 : 0.8,
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-end pr-3">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {stage.conversionRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-20 text-right">
                        {index > 0 && (
                          <span className="text-sm text-red-500">-{stage.dropOffRate}%</span>
                        )}
                      </div>
                    </div>
                    {index < selectedFunnel.stages.length - 1 && (
                      <div className="ml-44 my-1 flex items-center gap-2">
                        <div className="h-4 w-px bg-gray-300" />
                        <span className="text-xs text-gray-400 dark:text-gray-500">{stage.avgTimeToNext}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stage Details Sidebar */}
          <div className="space-y-6">
            {selectedStage ? (
              <>
                {/* Stage Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">{selectedStage.name}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedStage.count.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Users reached</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {selectedStage.conversionRate}%
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Conversion rate</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{selectedStage.dropOffRate}%</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Drop-off rate</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStage.avgTimeToNext}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Avg. time to next</p>
                    </div>
                  </div>
                </div>

                {/* Drop-off Reasons */}
                {stageDropOffs.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Drop-off Reasons</h3>
                    <div className="space-y-3">
                      {stageDropOffs.map((reason, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">{reason.reason}</p>
                            <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-400 rounded-full"
                                style={{ width: `${reason.percentage}%` }}
                              />
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{reason.percentage}%</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{reason.count} users</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-12 h-12 mx-auto text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </svg>
                  <p className="mt-2">Click on a stage to view details</p>
                </div>
              </div>
            )}

            {/* Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Insights & Recommendations</h3>
              <div className="space-y-3">
                {stageInsights.map((insight, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{insight.stage}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getImpactColor(insight.impact)}`}
                      >
                        {insight.impact} impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white">{insight.insight}</p>
                    <p className="text-xs text-indigo-600 mt-1">{insight.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'comparison' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funnel Comparison Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Funnel Comparison</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={[
                  {
                    stage: 'Start',
                    registration: 100,
                    listing: 100,
                    exchange: 100,
                  },
                  {
                    stage: 'Step 2',
                    registration: 33.6,
                    listing: 94.4,
                    exchange: 87.6,
                  },
                  {
                    stage: 'Step 3',
                    registration: 19.6,
                    listing: 81.6,
                    exchange: 80.9,
                  },
                  {
                    stage: 'Step 4',
                    registration: 14.6,
                    listing: 73.6,
                    exchange: 74.7,
                  },
                  {
                    stage: 'Completed',
                    registration: 3.6,
                    listing: 68,
                    exchange: 71.5,
                  },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis unit="%" />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Legend />
                <Bar dataKey="registration" name="Registration Funnel" fill="#6366f1" />
                <Bar dataKey="listing" name="Listing Funnel" fill="#10b981" />
                <Bar dataKey="exchange" name="Exchange Funnel" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Conversion Trend Over Time</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={conversionTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis unit="%" domain={[0, 100]} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="registration"
                  name="Registration"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="listing"
                  name="Listing"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="exchange"
                  name="Exchange"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="lg:col-span-2 grid grid-cols-3 gap-4">
            {funnels.map((funnel) => (
              <div key={funnel.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">{funnel.name}</h3>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{funnel.overallConversion}%</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Overall conversion</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      {funnel.stages[funnel.stages.length - 1].count.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-green-500 text-sm">+2.3%</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">vs. previous period</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'cohort' && (
        <div className="space-y-6">
          {/* Cohort Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Cohort Analysis</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Cohort</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Registered
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Profile Complete
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      First Listing
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      First Exchange
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Completed
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Repeat User
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cohortData.map((cohort) => {
                    const getPercentage = (value: number) =>
                      ((value / cohort.registration) * 100).toFixed(1);
                    const getColor = (percentage: number) => {
                      if (percentage >= 75) return 'bg-green-100 text-green-800';
                      if (percentage >= 50) return 'bg-yellow-100 text-yellow-800';
                      if (percentage >= 25) return 'bg-orange-100 text-orange-800';
                      return 'bg-red-100 text-red-800';
                    };

                    return (
                      <tr key={cohort.cohort} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                          {cohort.cohort}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                            {cohort.registration}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm ${getColor(
                              parseFloat(getPercentage(cohort.profile_complete))
                            )}`}
                          >
                            {getPercentage(cohort.profile_complete)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm ${getColor(
                              parseFloat(getPercentage(cohort.first_listing))
                            )}`}
                          >
                            {getPercentage(cohort.first_listing)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm ${getColor(
                              parseFloat(getPercentage(cohort.first_exchange))
                            )}`}
                          >
                            {getPercentage(cohort.first_exchange)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm ${getColor(
                              parseFloat(getPercentage(cohort.exchange_completed))
                            )}`}
                          >
                            {getPercentage(cohort.exchange_completed)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm ${getColor(
                              parseFloat(getPercentage(cohort.repeat_user))
                            )}`}
                          >
                            {getPercentage(cohort.repeat_user)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cohort Retention Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Cohort Retention Over Time</h2>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={cohortData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cohort" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="registration"
                  name="Registered"
                  stackId="1"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="exchange_completed"
                  name="Completed Exchange"
                  stackId="2"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="repeat_user"
                  name="Repeat Users"
                  stackId="3"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
