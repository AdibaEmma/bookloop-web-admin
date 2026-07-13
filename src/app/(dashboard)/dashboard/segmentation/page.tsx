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
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { CustomTooltip, useChartColors } from '@/components/charts/ChartComponents';

interface UserSegment {
  id: string;
  name: string;
  description: string;
  userCount: number;
  percentageOfTotal: number;
  avgExchanges: number;
  avgRating: number;
  retentionRate: number;
  color: string;
  criteria: string[];
  trend: 'growing' | 'stable' | 'declining';
}

interface SegmentUser {
  id: string;
  name: string;
  email: string;
  segment: string;
  exchanges: number;
  rating: number;
  joinedAt: string;
  lastActive: string;
}

const userSegments: UserSegment[] = [
  {
    id: '1',
    name: 'Power Exchangers',
    description: 'Highly active users who complete 10+ exchanges per month',
    userCount: 1250,
    percentageOfTotal: 8,
    avgExchanges: 15.2,
    avgRating: 4.8,
    retentionRate: 95,
    color: '#6366f1',
    criteria: ['10+ exchanges/month', 'Rating > 4.5', 'Active > 6 months'],
    trend: 'growing',
  },
  {
    id: '2',
    name: 'Regular Users',
    description: 'Consistent users with 3-9 exchanges per month',
    userCount: 4500,
    percentageOfTotal: 29,
    avgExchanges: 5.8,
    avgRating: 4.4,
    retentionRate: 78,
    color: '#10b981',
    criteria: ['3-9 exchanges/month', 'Rating > 4.0', 'Active > 3 months'],
    trend: 'stable',
  },
  {
    id: '3',
    name: 'Casual Readers',
    description: 'Occasional users with 1-2 exchanges per month',
    userCount: 5800,
    percentageOfTotal: 37,
    avgExchanges: 1.5,
    avgRating: 4.2,
    retentionRate: 55,
    color: '#f59e0b',
    criteria: ['1-2 exchanges/month', 'Active in last 30 days'],
    trend: 'stable',
  },
  {
    id: '4',
    name: 'New Users',
    description: 'Users who joined in the last 30 days',
    userCount: 2100,
    percentageOfTotal: 13,
    avgExchanges: 0.8,
    avgRating: 4.0,
    retentionRate: 65,
    color: '#8b5cf6',
    criteria: ['Joined < 30 days ago', 'Completed onboarding'],
    trend: 'growing',
  },
  {
    id: '5',
    name: 'At Risk',
    description: 'Previously active users showing declining engagement',
    userCount: 1200,
    percentageOfTotal: 8,
    avgExchanges: 0.3,
    avgRating: 3.9,
    retentionRate: 25,
    color: '#ef4444',
    criteria: ['No activity > 14 days', 'Was previously active'],
    trend: 'declining',
  },
  {
    id: '6',
    name: 'Dormant',
    description: 'Users inactive for 30+ days',
    userCount: 800,
    percentageOfTotal: 5,
    avgExchanges: 0,
    avgRating: 3.5,
    retentionRate: 10,
    color: '#6b7280',
    criteria: ['No activity > 30 days', 'Has previous exchanges'],
    trend: 'stable',
  },
];

const segmentUsers: SegmentUser[] = [
  { id: '1', name: 'Kofi Mensah', email: 'kofi@example.com', segment: 'Power Exchangers', exchanges: 18, rating: 4.9, joinedAt: '2023-01-15', lastActive: '2024-06-07' },
  { id: '2', name: 'Ama Serwaa', email: 'ama@example.com', segment: 'Power Exchangers', exchanges: 14, rating: 4.8, joinedAt: '2023-03-22', lastActive: '2024-06-07' },
  { id: '3', name: 'Yaw Boateng', email: 'yaw@example.com', segment: 'Regular Users', exchanges: 6, rating: 4.5, joinedAt: '2023-06-10', lastActive: '2024-06-06' },
  { id: '4', name: 'Efua Owusu', email: 'efua@example.com', segment: 'Casual Readers', exchanges: 2, rating: 4.2, joinedAt: '2024-02-15', lastActive: '2024-06-05' },
  { id: '5', name: 'Kweku Asante', email: 'kweku@example.com', segment: 'New Users', exchanges: 1, rating: 4.0, joinedAt: '2024-05-28', lastActive: '2024-06-07' },
  { id: '6', name: 'Akua Darko', email: 'akua@example.com', segment: 'At Risk', exchanges: 0, rating: 3.8, joinedAt: '2023-09-12', lastActive: '2024-05-20' },
];

const segmentGrowth = [
  { month: 'Jan', powerExchangers: 980, regular: 4100, casual: 5200, newUsers: 1500, atRisk: 900 },
  { month: 'Feb', powerExchangers: 1020, regular: 4200, casual: 5300, newUsers: 1800, atRisk: 950 },
  { month: 'Mar', powerExchangers: 1080, regular: 4300, casual: 5450, newUsers: 2000, atRisk: 1000 },
  { month: 'Apr', powerExchangers: 1150, regular: 4400, casual: 5600, newUsers: 1900, atRisk: 1100 },
  { month: 'May', powerExchangers: 1200, regular: 4450, casual: 5700, newUsers: 2050, atRisk: 1150 },
  { month: 'Jun', powerExchangers: 1250, regular: 4500, casual: 5800, newUsers: 2100, atRisk: 1200 },
];

const engagementScatter = [
  { exchanges: 18, rating: 4.9, size: 100, segment: 'Power Exchangers' },
  { exchanges: 15, rating: 4.8, size: 80, segment: 'Power Exchangers' },
  { exchanges: 12, rating: 4.7, size: 90, segment: 'Power Exchangers' },
  { exchanges: 7, rating: 4.5, size: 150, segment: 'Regular Users' },
  { exchanges: 5, rating: 4.3, size: 180, segment: 'Regular Users' },
  { exchanges: 6, rating: 4.4, size: 120, segment: 'Regular Users' },
  { exchanges: 2, rating: 4.2, size: 200, segment: 'Casual Readers' },
  { exchanges: 1, rating: 4.0, size: 220, segment: 'Casual Readers' },
  { exchanges: 1, rating: 3.8, size: 80, segment: 'New Users' },
  { exchanges: 0, rating: 3.5, size: 60, segment: 'At Risk' },
];

const segmentComparison = [
  { metric: 'Exchanges', powerExchangers: 100, regular: 38, casual: 10, newUsers: 5 },
  { metric: 'Retention', powerExchangers: 95, regular: 78, casual: 55, newUsers: 65 },
  { metric: 'Rating', powerExchangers: 96, regular: 88, casual: 84, newUsers: 80 },
  { metric: 'Response', powerExchangers: 98, regular: 85, casual: 70, newUsers: 75 },
  { metric: 'Listings', powerExchangers: 90, regular: 60, casual: 30, newUsers: 20 },
];

export default function SegmentationPage() {
  const [selectedSegment, setSelectedSegment] = useState<UserSegment | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'users'>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const segmentPieData = useMemo(() => {
    return userSegments.map((s) => ({
      name: s.name,
      value: s.percentageOfTotal,
      color: s.color,
    }));
  }, []);

  const getTrendIcon = (trend: UserSegment['trend']) => {
    switch (trend) {
      case 'growing':
        return (
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
          </svg>
        );
      case 'declining':
        return (
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Segmentation</h1>
          <p className="text-muted-foreground mt-1">
            Analyze and manage user segments for targeted engagement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#F1ECE3] rounded-lg p-1">
            {(['overview', 'users'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 text-sm rounded-md transition-colors capitalize ${
                  viewMode === mode
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Segment
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold text-foreground mt-1">15,650</p>
          <p className="text-xs text-green-600 mt-1">+12% this month</p>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
          <p className="text-sm text-muted-foreground">Active Segments</p>
          <p className="text-2xl font-bold text-foreground mt-1">6</p>
          <p className="text-xs text-muted-foreground mt-1">Custom segments</p>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
          <p className="text-sm text-muted-foreground">Avg. Retention</p>
          <p className="text-2xl font-bold text-foreground mt-1">68%</p>
          <p className="text-xs text-green-600 mt-1">+3% vs last month</p>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
          <p className="text-sm text-muted-foreground">At Risk Users</p>
          <p className="text-2xl font-bold text-red-600 mt-1">1,200</p>
          <p className="text-xs text-muted-foreground mt-1">8% of total</p>
        </div>
      </div>

      {viewMode === 'overview' && (
        <>
          {/* Segment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSegments.map((segment) => (
              <div
                key={segment.id}
                onClick={() => setSelectedSegment(segment)}
                className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4 hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${segment.color}20` }}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: segment.color }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{segment.name}</h3>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(segment.trend)}
                        <span className="text-xs text-muted-foreground capitalize">{segment.trend}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {segment.userCount.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{segment.description}</p>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Avg Exchanges</p>
                    <p className="font-semibold text-foreground">{segment.avgExchanges}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                    <p className="font-semibold text-foreground">{segment.avgRating}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Retention</p>
                    <p className="font-semibold text-foreground">{segment.retentionRate}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
              <h3 className="font-semibold text-foreground mb-4">Segment Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={segmentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={{ strokeWidth: 1 }}
                  >
                    {segmentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value ?? 0)}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
              <h3 className="font-semibold text-foreground mb-4">Segment Comparison</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={segmentComparison}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Power Exchangers" dataKey="powerExchangers" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                  <Radar name="Regular Users" dataKey="regular" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
            <h3 className="font-semibold text-foreground mb-4">Segment Growth Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={segmentGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="powerExchangers" name="Power Exchangers" fill="#6366f1" stackId="a" />
                <Bar dataKey="regular" name="Regular" fill="#10b981" stackId="a" />
                <Bar dataKey="casual" name="Casual" fill="#f59e0b" stackId="a" />
                <Bar dataKey="newUsers" name="New Users" fill="#8b5cf6" stackId="a" />
                <Bar dataKey="atRisk" name="At Risk" fill="#ef4444" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {viewMode === 'users' && (
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] dark:border-[#33291f]">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select className="px-3 py-2 border border-[#E4DED2] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
                <option value="">All Segments</option>
                {userSegments.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search users..."
                className="px-3 py-2 border border-[#E4DED2] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button className="px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg">
              Export Users
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Segment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Exchanges</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Last Active</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE6DC]">
                {segmentUsers.map((user) => {
                  const segment = userSegments.find((s) => s.name === user.segment);
                  return (
                    <tr key={user.id} className="hover:bg-background">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#ECE6DC] flex items-center justify-center text-sm font-medium">
                            {user.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-1 text-xs rounded-full"
                          style={{
                            backgroundColor: `${segment?.color}20`,
                            color: segment?.color,
                          }}
                        >
                          {user.segment}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground">{user.exchanges}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-foreground">{user.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">
                        {new Date(user.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">
                        {new Date(user.lastActive).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-indigo-600 hover:text-indigo-700 text-sm">
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Segment Detail Modal */}
      {selectedSegment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#241c16] rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${selectedSegment.color}20` }}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: selectedSegment.color }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedSegment.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedSegment.userCount.toLocaleString()} users</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSegment(null)}
                className="p-2 hover:bg-[#F1ECE3] rounded-lg"
              >
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              <p className="text-muted-foreground">{selectedSegment.description}</p>

              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-background rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Users</p>
                  <p className="text-xl font-bold text-foreground">{selectedSegment.userCount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-background rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Avg Exchanges</p>
                  <p className="text-xl font-bold text-foreground">{selectedSegment.avgExchanges}</p>
                </div>
                <div className="p-3 bg-background rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                  <p className="text-xl font-bold text-foreground">{selectedSegment.avgRating}</p>
                </div>
                <div className="p-3 bg-background rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Retention</p>
                  <p className="text-xl font-bold text-foreground">{selectedSegment.retentionRate}%</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Segment Criteria</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSegment.criteria.map((criterion) => (
                    <span key={criterion} className="px-3 py-1 bg-[#F1ECE3] text-foreground text-sm rounded-full">
                      {criterion}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Recommended Actions</h4>
                <div className="space-y-2">
                  {selectedSegment.trend === 'declining' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Re-engagement Campaign:</strong> Send targeted emails with personalized book recommendations
                      </p>
                    </div>
                  )}
                  {selectedSegment.name === 'Power Exchangers' && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <p className="text-sm text-indigo-800">
                        <strong>Loyalty Rewards:</strong> Offer premium features or badges to maintain engagement
                      </p>
                    </div>
                  )}
                  {selectedSegment.name === 'New Users' && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm text-purple-800">
                        <strong>Onboarding Campaign:</strong> Guide users to complete their first exchange
                      </p>
                    </div>
                  )}
                  <div className="p-3 bg-background border border-[#ECE6DC] rounded-lg">
                    <p className="text-sm text-foreground">
                      <strong>Push Notification:</strong> Send personalized notifications to this segment
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 p-4 border-t bg-background">
              <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm">
                Delete Segment
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedSegment(null)}
                  className="px-4 py-2 text-foreground hover:bg-[#F1ECE3] rounded-lg"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Send Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Segment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#241c16] rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-foreground">Create New Segment</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-[#F1ECE3] rounded-lg"
              >
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Segment Name</label>
                <input
                  type="text"
                  placeholder="e.g., High Value Users"
                  className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe this segment..."
                  className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Criteria</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <select className="flex-1 px-3 py-2 border border-[#E4DED2] rounded-lg text-sm">
                      <option>Exchanges per month</option>
                      <option>Rating</option>
                      <option>Days since join</option>
                      <option>Days since last active</option>
                    </select>
                    <select className="px-3 py-2 border border-[#E4DED2] rounded-lg text-sm">
                      <option>&gt;</option>
                      <option>&lt;</option>
                      <option>=</option>
                      <option>&gt;=</option>
                      <option>&lt;=</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Value"
                      className="w-24 px-3 py-2 border border-[#E4DED2] rounded-lg text-sm"
                    />
                  </div>
                  <button className="text-sm text-indigo-600 hover:text-indigo-700">
                    + Add Criterion
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Color</label>
                <div className="flex gap-2">
                  {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border-2 border-transparent hover:border-[#E4DED2]"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t bg-background rounded-b-xl">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-foreground hover:bg-[#F1ECE3] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Segment created!');
                  setShowCreateModal(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Segment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
