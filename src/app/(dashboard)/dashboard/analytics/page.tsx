'use client';

import { useState } from 'react';
import {
  Users,
  BookOpen,
  RefreshCw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Filter,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type TimeRange = '7d' | '30d' | '90d' | '12m';

// Metric card component
function MetricCard({
  title,
  value,
  change,
  changeType,
  subtitle,
  icon: Icon,
  iconColor,
}: {
  title: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  subtitle?: string;
  icon: React.ElementType;
  iconColor: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconColor}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {changeType === 'increase' ? (
          <ArrowUpRight className="w-4 h-4 text-green-500" />
        ) : changeType === 'decrease' ? (
          <ArrowDownRight className="w-4 h-4 text-red-500" />
        ) : (
          <TrendingUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        )}
        <span
          className={`text-sm font-medium ml-1 ${
            changeType === 'increase'
              ? 'text-green-500'
              : changeType === 'decrease'
              ? 'text-red-500'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {change}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
          vs previous period
        </span>
      </div>
    </div>
  );
}

// Top performers table row
function TopPerformerRow({
  rank,
  name,
  metric,
  value,
  trend,
}: {
  rank: number;
  name: string;
  metric: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
}) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-700 last:border-0">
      <td className="py-3 px-4">
        <span
          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
            rank === 1
              ? 'bg-amber-100 text-amber-700'
              : rank === 2
              ? 'bg-gray-100 text-gray-700 dark:text-gray-300'
              : rank === 3
              ? 'bg-orange-100 text-orange-700'
              : 'bg-gray-50 text-gray-500 dark:text-gray-400 dark:text-gray-500'
          }`}
        >
          {rank}
        </span>
      </td>
      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
        {name}
      </td>
      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 dark:text-gray-500">{metric}</td>
      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
        {value}
      </td>
      <td className="py-3 px-4">
        {trend === 'up' ? (
          <TrendingUp className="w-4 h-4 text-green-500" />
        ) : trend === 'down' ? (
          <TrendingDown className="w-4 h-4 text-red-500" />
        ) : (
          <span className="w-4 h-4 block bg-gray-300 rounded-full" />
        )}
      </td>
    </tr>
  );
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  // Use mock data - Backend analytics endpoints not yet implemented
  // TODO: Replace with real API calls when admin analytics endpoints are available
  const analytics = getMockData(timeRange);
  const isLoading = false;

  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'];

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Detailed insights into platform performance and user behavior
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time range selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            {(['7d', '30d', '90d', '12m'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-amber-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {range === '7d'
                  ? '7 Days'
                  : range === '30d'
                  ? '30 Days'
                  : range === '90d'
                  ? '90 Days'
                  : '12 Months'}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={analytics?.metrics?.totalUsers?.toLocaleString() || '0'}
          change={analytics?.metrics?.userGrowth || '+0%'}
          changeType={
            analytics?.metrics?.userGrowth?.startsWith('+')
              ? 'increase'
              : analytics?.metrics?.userGrowth?.startsWith('-')
              ? 'decrease'
              : 'neutral'
          }
          subtitle={`${analytics?.metrics?.newUsers || 0} new this period`}
          icon={Users}
          iconColor="bg-blue-500"
        />
        <MetricCard
          title="Active Listings"
          value={analytics?.metrics?.totalListings?.toLocaleString() || '0'}
          change={analytics?.metrics?.listingGrowth || '+0%'}
          changeType={
            analytics?.metrics?.listingGrowth?.startsWith('+')
              ? 'increase'
              : analytics?.metrics?.listingGrowth?.startsWith('-')
              ? 'decrease'
              : 'neutral'
          }
          subtitle={`${analytics?.metrics?.newListings || 0} new this period`}
          icon={BookOpen}
          iconColor="bg-amber-500"
        />
        <MetricCard
          title="Completed Exchanges"
          value={analytics?.metrics?.completedExchanges?.toLocaleString() || '0'}
          change={analytics?.metrics?.exchangeGrowth || '+0%'}
          changeType={
            analytics?.metrics?.exchangeGrowth?.startsWith('+')
              ? 'increase'
              : analytics?.metrics?.exchangeGrowth?.startsWith('-')
              ? 'decrease'
              : 'neutral'
          }
          subtitle={`${analytics?.metrics?.successRate || 0}% success rate`}
          icon={RefreshCw}
          iconColor="bg-green-500"
        />
        <MetricCard
          title="Total Revenue"
          value={`GH₵${analytics?.metrics?.totalRevenue?.toLocaleString() || '0'}`}
          change={analytics?.metrics?.revenueGrowth || '+0%'}
          changeType={
            analytics?.metrics?.revenueGrowth?.startsWith('+')
              ? 'increase'
              : analytics?.metrics?.revenueGrowth?.startsWith('-')
              ? 'decrease'
              : 'neutral'
          }
          subtitle={`Avg. GH₵${analytics?.metrics?.avgTransactionValue || 0} per transaction`}
          icon={DollarSign}
          iconColor="bg-purple-500"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                User Growth Trend
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                New user registrations over time
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics?.charts?.userGrowth || []}>
              <defs>
                <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#userGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Revenue Trend
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                Platform revenue over time
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics?.charts?.revenue || []}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value: number) => [`GH₵${value}`, 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exchange Statistics */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Exchange Statistics
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                Exchange status breakdown by period
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.charts?.exchanges || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cancelled" name="Cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Book Categories Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Book Categories
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
              Distribution by category
            </p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics?.charts?.categories || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {(analytics?.charts?.categories || []).map((_: unknown, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(analytics?.charts?.categories || []).map((cat: { name: string; value: number }, index: number) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  {cat.name} ({cat.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listings Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Listings Activity
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                New vs removed listings
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.charts?.listings || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="new"
                name="New Listings"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b' }}
              />
              <Line
                type="monotone"
                dataKey="removed"
                name="Removed"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Users by Region
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                Geographic distribution
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.charts?.regions || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} />
              <YAxis dataKey="region" type="category" stroke="#9ca3af" fontSize={12} width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="users" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Active Users
            </h3>
            <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-2 px-4">#</th>
                  <th className="py-2 px-4">User</th>
                  <th className="py-2 px-4">Activity</th>
                  <th className="py-2 px-4">Exchanges</th>
                  <th className="py-2 px-4">Trend</th>
                </tr>
              </thead>
              <tbody>
                {(analytics?.topUsers || []).map((user: { name: string; activity: string; exchanges: number; trend: 'up' | 'down' | 'stable' }, index: number) => (
                  <TopPerformerRow
                    key={index}
                    rank={index + 1}
                    name={user.name}
                    metric={user.activity}
                    value={user.exchanges}
                    trend={user.trend}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Listed Books */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Most Popular Books
            </h3>
            <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-2 px-4">#</th>
                  <th className="py-2 px-4">Book</th>
                  <th className="py-2 px-4">Category</th>
                  <th className="py-2 px-4">Interest</th>
                  <th className="py-2 px-4">Trend</th>
                </tr>
              </thead>
              <tbody>
                {(analytics?.topBooks || []).map((book: { title: string; category: string; interest: number; trend: 'up' | 'down' | 'stable' }, index: number) => (
                  <TopPerformerRow
                    key={index}
                    rank={index + 1}
                    name={book.title}
                    metric={book.category}
                    value={book.interest}
                    trend={book.trend}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Platform Performance Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {analytics?.summary?.avgResponseTime || '0'}ms
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Avg Response Time
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {analytics?.summary?.uptime || '99.9'}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Uptime
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {analytics?.summary?.activeUsers || '0'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Active Users (24h)
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {analytics?.summary?.conversionRate || '0'}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Conversion Rate
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {analytics?.summary?.bounceRate || '0'}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Bounce Rate
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {analytics?.summary?.retention || '0'}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              User Retention
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock data generator based on time range
function getMockData(range: TimeRange) {
  const generateDates = (count: number) => {
    const dates = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now);
      if (range === '12m') {
        date.setMonth(date.getMonth() - i);
        dates.push(date.toLocaleDateString('en-US', { month: 'short' }));
      } else {
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
    }
    return dates;
  };

  const dataPoints = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 12 : 12;
  const dates = generateDates(dataPoints);

  return {
    metrics: {
      totalUsers: 1247,
      newUsers: range === '7d' ? 45 : range === '30d' ? 156 : range === '90d' ? 412 : 1247,
      userGrowth: '+12.5%',
      totalListings: 3542,
      newListings: range === '7d' ? 89 : range === '30d' ? 324 : range === '90d' ? 876 : 2156,
      listingGrowth: '+8.3%',
      completedExchanges: 892,
      exchangeGrowth: '+15.2%',
      successRate: 94,
      totalRevenue: 12450,
      revenueGrowth: '+23.1%',
      avgTransactionValue: 45,
    },
    charts: {
      userGrowth: dates.map((date, i) => ({
        date,
        users: Math.floor(800 + Math.random() * 400 + i * 15),
      })),
      revenue: dates.map((date, i) => ({
        date,
        amount: Math.floor(500 + Math.random() * 1000 + i * 50),
      })),
      exchanges: dates.slice(0, Math.min(dataPoints, 12)).map((date) => ({
        date,
        completed: Math.floor(40 + Math.random() * 50),
        pending: Math.floor(10 + Math.random() * 20),
        cancelled: Math.floor(2 + Math.random() * 8),
      })),
      categories: [
        { name: 'Fiction', value: 35 },
        { name: 'Non-Fiction', value: 25 },
        { name: 'Academic', value: 20 },
        { name: 'Children', value: 12 },
        { name: 'Religious', value: 5 },
        { name: 'Others', value: 3 },
      ],
      listings: dates.slice(0, Math.min(dataPoints, 12)).map((date) => ({
        date,
        new: Math.floor(20 + Math.random() * 30),
        removed: Math.floor(5 + Math.random() * 10),
      })),
      regions: [
        { region: 'Greater Accra', users: 456 },
        { region: 'Ashanti', users: 312 },
        { region: 'Western', users: 187 },
        { region: 'Central', users: 134 },
        { region: 'Eastern', users: 98 },
        { region: 'Northern', users: 60 },
      ],
    },
    topUsers: [
      { name: 'Kwame Mensah', activity: '45 exchanges', exchanges: 45, trend: 'up' as const },
      { name: 'Ama Darko', activity: '38 exchanges', exchanges: 38, trend: 'up' as const },
      { name: 'Kofi Asante', activity: '32 exchanges', exchanges: 32, trend: 'stable' as const },
      { name: 'Akua Boateng', activity: '28 exchanges', exchanges: 28, trend: 'up' as const },
      { name: 'Yaw Agyei', activity: '24 exchanges', exchanges: 24, trend: 'down' as const },
    ],
    topBooks: [
      { title: 'Things Fall Apart', category: 'Fiction', interest: 156, trend: 'up' as const },
      { title: 'Half of a Yellow Sun', category: 'Fiction', interest: 134, trend: 'up' as const },
      { title: 'The Beautiful Ones...', category: 'Fiction', interest: 98, trend: 'stable' as const },
      { title: 'Introduction to Law', category: 'Academic', interest: 87, trend: 'up' as const },
      { title: 'Ghana Must Go', category: 'Fiction', interest: 76, trend: 'down' as const },
    ],
    summary: {
      avgResponseTime: 245,
      uptime: 99.9,
      activeUsers: 342,
      conversionRate: 12.4,
      bounceRate: 34.2,
      retention: 67.8,
    },
  };
}
