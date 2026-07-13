'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
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
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { CustomTooltip, useChartColors } from '@/components/charts/ChartComponents';

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

interface RevenueMetric {
  date: string;
  revenue: number;
  transactions: number;
  avg_transaction: number;
  fees: number;
  net_revenue: number;
  previousRevenue?: number;
}

interface RevenueTarget {
  id: string;
  name: string;
  target: number;
  current: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  status: 'on_track' | 'at_risk' | 'behind' | 'exceeded';
}

interface PaymentMethodStats {
  method: string;
  revenue: number;
  transactions: number;
  avgValue: number;
  color: string;
}

interface HourlyRevenue {
  hour: string;
  revenue: number;
  transactions: number;
}

const dailyRevenue: RevenueMetric[] = [
  { date: 'Jun 1', revenue: 1250, transactions: 45, avg_transaction: 27.78, fees: 62.5, net_revenue: 1187.5, previousRevenue: 1100 },
  { date: 'Jun 2', revenue: 1480, transactions: 52, avg_transaction: 28.46, fees: 74, net_revenue: 1406, previousRevenue: 1350 },
  { date: 'Jun 3', revenue: 1320, transactions: 48, avg_transaction: 27.5, fees: 66, net_revenue: 1254, previousRevenue: 1420 },
  { date: 'Jun 4', revenue: 1560, transactions: 55, avg_transaction: 28.36, fees: 78, net_revenue: 1482, previousRevenue: 1380 },
  { date: 'Jun 5', revenue: 1890, transactions: 68, avg_transaction: 27.79, fees: 94.5, net_revenue: 1795.5, previousRevenue: 1650 },
  { date: 'Jun 6', revenue: 2150, transactions: 75, avg_transaction: 28.67, fees: 107.5, net_revenue: 2042.5, previousRevenue: 1920 },
  { date: 'Jun 7', revenue: 1780, transactions: 62, avg_transaction: 28.71, fees: 89, net_revenue: 1691, previousRevenue: 1580 },
];

const hourlyRevenueData: HourlyRevenue[] = [
  { hour: '6am', revenue: 120, transactions: 4 },
  { hour: '7am', revenue: 280, transactions: 10 },
  { hour: '8am', revenue: 450, transactions: 16 },
  { hour: '9am', revenue: 680, transactions: 24 },
  { hour: '10am', revenue: 920, transactions: 33 },
  { hour: '11am', revenue: 1150, transactions: 41 },
  { hour: '12pm', revenue: 1380, transactions: 49 },
  { hour: '1pm', revenue: 1250, transactions: 45 },
  { hour: '2pm', revenue: 980, transactions: 35 },
  { hour: '3pm', revenue: 1100, transactions: 39 },
  { hour: '4pm', revenue: 1350, transactions: 48 },
  { hour: '5pm', revenue: 1580, transactions: 56 },
  { hour: '6pm', revenue: 1420, transactions: 51 },
  { hour: '7pm', revenue: 980, transactions: 35 },
  { hour: '8pm', revenue: 650, transactions: 23 },
  { hour: '9pm', revenue: 320, transactions: 11 },
];

const paymentMethodStats: PaymentMethodStats[] = [
  { method: 'Mobile Money', revenue: 52400, transactions: 1872, avgValue: 28.0, color: '#6366f1' },
  { method: 'Bank Transfer', revenue: 28600, transactions: 953, avgValue: 30.0, color: '#10b981' },
  { method: 'Card Payment', revenue: 15200, transactions: 608, avgValue: 25.0, color: '#f59e0b' },
  { method: 'Cash', revenue: 5300, transactions: 212, avgValue: 25.0, color: '#8b5cf6' },
];

const revenueTargets: RevenueTarget[] = [
  { id: '1', name: 'Daily Revenue', target: 2000, current: 1780, period: 'daily', status: 'at_risk' },
  { id: '2', name: 'Weekly Revenue', target: 12000, current: 11430, period: 'weekly', status: 'on_track' },
  { id: '3', name: 'Monthly Revenue', target: 50000, current: 42100, period: 'monthly', status: 'on_track' },
  { id: '4', name: 'Quarterly Revenue', target: 150000, current: 135000, period: 'quarterly', status: 'exceeded' },
];

const weekdayPerformance = [
  { day: 'Mon', revenue: 85 },
  { day: 'Tue', revenue: 78 },
  { day: 'Wed', revenue: 72 },
  { day: 'Thu', revenue: 80 },
  { day: 'Fri', revenue: 95 },
  { day: 'Sat', revenue: 100 },
  { day: 'Sun', revenue: 88 },
];

const monthlyRevenue = [
  { month: 'Jan', revenue: 28500, growth: 12, transactions: 1020 },
  { month: 'Feb', revenue: 32400, growth: 14, transactions: 1156 },
  { month: 'Mar', revenue: 35800, growth: 10, transactions: 1278 },
  { month: 'Apr', revenue: 38200, growth: 7, transactions: 1364 },
  { month: 'May', revenue: 42100, growth: 10, transactions: 1503 },
  { month: 'Jun', revenue: 15430, growth: 8, transactions: 551 },
];

const revenueBySource = [
  { name: 'Transaction Fees', value: 45, color: '#6366f1', amount: 45678 },
  { name: 'Premium Subscriptions', value: 25, color: '#10b981', amount: 25376 },
  { name: 'Promoted Listings', value: 15, color: '#f59e0b', amount: 15226 },
  { name: 'Partner Commissions', value: 10, color: '#8b5cf6', amount: 10151 },
  { name: 'Other', value: 5, color: '#6b7280', amount: 5075 },
];

const revenueByRegion = [
  { region: 'Greater Accra', revenue: 42500, percentage: 42, exchanges: 1520 },
  { region: 'Ashanti', revenue: 25800, percentage: 25, exchanges: 922 },
  { region: 'Western', revenue: 12400, percentage: 12, exchanges: 443 },
  { region: 'Eastern', revenue: 8600, percentage: 8, exchanges: 307 },
  { region: 'Central', revenue: 7200, percentage: 7, exchanges: 257 },
  { region: 'Others', revenue: 5000, percentage: 5, exchanges: 179 },
];

const topRevenueDays = [
  { date: 'May 25, 2024', revenue: 3250, reason: 'Weekend Peak' },
  { date: 'Jun 6, 2024', revenue: 2150, reason: 'Promotion Active' },
  { date: 'May 18, 2024', revenue: 2080, reason: 'Holiday' },
  { date: 'Jun 5, 2024', revenue: 1890, reason: 'Friday Peak' },
  { date: 'May 11, 2024', revenue: 1820, reason: 'Weekend' },
];

const projectionData = [
  { month: 'Jun', actual: 15430, projected: 45000 },
  { month: 'Jul', actual: null, projected: 48500 },
  { month: 'Aug', actual: null, projected: 52000 },
  { month: 'Sep', actual: null, projected: 49500 },
  { month: 'Oct', actual: null, projected: 55000 },
  { month: 'Nov', actual: null, projected: 58500 },
  { month: 'Dec', actual: null, projected: 65000 },
];

export default function RevenueDashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [compareMode, setCompareMode] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<RevenueTarget | null>(null);

  const stats = useMemo(() => {
    const totalRevenue = monthlyRevenue.reduce((acc, m) => acc + m.revenue, 0);
    const lastMonthRevenue = monthlyRevenue[monthlyRevenue.length - 2]?.revenue || 0;
    const currentMonthRevenue = monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0;
    const projectedMonthly = (currentMonthRevenue / new Date().getDate()) * 30;

    return {
      totalRevenue,
      currentMonth: currentMonthRevenue,
      projectedMonth: Math.round(projectedMonthly),
      monthOverMonth: lastMonthRevenue > 0 ? Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0,
      avgDaily: Math.round(dailyRevenue.reduce((acc, d) => acc + d.revenue, 0) / dailyRevenue.length),
      totalTransactions: monthlyRevenue.reduce((acc, m) => acc + m.transactions, 0),
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Revenue Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive revenue analytics and financial insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#F1ECE3] rounded-lg p-1">
            {(['7d', '30d', '90d', '1y', 'all'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 border border-[#E4DED2] text-foreground rounded-lg hover:bg-background text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-indigo-100 text-xs">Total Revenue (YTD)</p>
          <p className="text-2xl font-bold mt-1">GH₵{stats.totalRevenue.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-indigo-100">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            +23% vs last year
          </div>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
          <p className="text-xs text-muted-foreground">This Month</p>
          <p className="text-2xl font-bold text-foreground mt-1">GH₵{stats.currentMonth.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">Projected: GH₵{stats.projectedMonth.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
          <p className="text-xs text-muted-foreground">Month-over-Month</p>
          <p className={`text-2xl font-bold mt-1 ${stats.monthOverMonth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.monthOverMonth >= 0 ? '+' : ''}{stats.monthOverMonth}%
          </p>
          <p className="text-xs text-muted-foreground mt-2">vs last month</p>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
          <p className="text-xs text-muted-foreground">Avg. Daily Revenue</p>
          <p className="text-2xl font-bold text-foreground mt-1">GH₵{stats.avgDaily.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">Last 7 days</p>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
          <p className="text-xs text-muted-foreground">Total Transactions</p>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.totalTransactions.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">YTD</p>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
          <p className="text-xs text-muted-foreground">Avg. Transaction</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            GH₵{(stats.totalRevenue / stats.totalTransactions).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">Per exchange</p>
        </div>
      </div>

      {/* Revenue Targets */}
      <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Revenue Targets</h3>
          <button
            onClick={() => setShowTargetModal(true)}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Manage Targets
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {revenueTargets.map((target) => {
            const progress = Math.min((target.current / target.target) * 100, 100);
            const statusColors = {
              on_track: { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' },
              at_risk: { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-500' },
              behind: { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' },
              exceeded: { bg: 'bg-indigo-100', text: 'text-indigo-700', bar: 'bg-indigo-500' },
            };
            const colors = statusColors[target.status];

            return (
              <div key={target.id} className="p-4 bg-background rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{target.name}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${colors.bg} ${colors.text} capitalize`}>
                    {target.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-xl font-bold text-foreground">GH₵{target.current.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">/ GH₵{target.target.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-[#ECE6DC] rounded-full overflow-hidden">
                  <div className={`h-full ${colors.bar} rounded-full transition-all`} style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(1)}% complete</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Methods & Hourly Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
          <h3 className="font-semibold text-foreground mb-4">Revenue by Payment Method</h3>
          <div className="space-y-4">
            {paymentMethodStats.map((method) => {
              const totalRevenue = paymentMethodStats.reduce((acc, m) => acc + m.revenue, 0);
              const percentage = (method.revenue / totalRevenue) * 100;

              return (
                <div key={method.method} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${method.color}20` }}>
                    {method.method === 'Mobile Money' && (
                      <svg className="w-5 h-5" style={{ color: method.color }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    )}
                    {method.method === 'Bank Transfer' && (
                      <svg className="w-5 h-5" style={{ color: method.color }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                    )}
                    {method.method === 'Card Payment' && (
                      <svg className="w-5 h-5" style={{ color: method.color }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                    )}
                    {method.method === 'Cash' && (
                      <svg className="w-5 h-5" style={{ color: method.color }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{method.method}</span>
                      <span className="text-sm font-semibold text-foreground">GH₵{method.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#F1ECE3] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: method.color }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-10">{percentage.toFixed(0)}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{method.transactions.toLocaleString()} txns • Avg GH₵{method.avgValue.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
          <h3 className="font-semibold text-foreground mb-4">Hourly Revenue Pattern</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hourlyRevenueData} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={1} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value) => [`GH₵${Number(value ?? 0).toLocaleString()}`, 'Revenue']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Peak Hour</p>
              <p className="font-semibold text-foreground">5pm - 6pm</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Peak Revenue</p>
              <p className="font-semibold text-indigo-600">GH₵1,580</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Slow Period</p>
              <p className="font-semibold text-foreground">6am - 8am</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekday Performance & Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
          <h3 className="font-semibold text-foreground mb-4">Weekday Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={weekdayPerformance}>
              <PolarGrid />
              <PolarAngleAxis dataKey="day" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Revenue %" dataKey="revenue" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground text-center mt-2">Revenue performance relative to peak day (Saturday = 100%)</p>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-[#ECE6DC] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Revenue Trend</h3>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={compareMode}
                onChange={(e) => setCompareMode(e.target.checked)}
                className="rounded border-[#E4DED2]"
              />
              Compare to previous period
            </label>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyRevenue}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: any, name: any) => [
                  `GH₵${value.toLocaleString()}`,
                  name === 'revenue' ? 'Current Period' : 'Previous Period',
                ]}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend />
              {compareMode && (
                <Area
                  type="monotone"
                  dataKey="previousRevenue"
                  name="Previous Period"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#colorPrevious)"
                />
              )}
              <Area
                type="monotone"
                dataKey="revenue"
                name="Current Period"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
          {compareMode && (
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-sm text-muted-foreground">Current Period: <span className="font-semibold">GH₵{dailyRevenue.reduce((acc, d) => acc + d.revenue, 0).toLocaleString()}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-sm text-muted-foreground">Previous Period: <span className="font-semibold">GH₵{dailyRevenue.reduce((acc, d) => acc + (d.previousRevenue || 0), 0).toLocaleString()}</span></span>
              </div>
              <div className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                +{((dailyRevenue.reduce((acc, d) => acc + d.revenue, 0) / dailyRevenue.reduce((acc, d) => acc + (d.previousRevenue || 0), 0) - 1) * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Revenue Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
          <h3 className="font-semibold text-foreground mb-4">Revenue Sources</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={revenueBySource}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
              >
                {revenueBySource.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${Number(value ?? 0)}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {revenueBySource.map((source) => (
              <div key={source.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                  <span className="text-muted-foreground">{source.name}</span>
                </div>
                <span className="font-medium text-foreground">GH₵{source.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Performance */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#ECE6DC] p-6">
          <h3 className="font-semibold text-foreground mb-4">Monthly Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue (GH₵)" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="growth" name="Growth %" stroke="#10b981" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Projection */}
      <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
        <h3 className="font-semibold text-foreground mb-4">Revenue Projection</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => typeof value === 'number' ? `GH₵${value.toLocaleString()}` : 'N/A'} />
              <Legend />
              <Area
                type="monotone"
                dataKey="projected"
                name="Projected"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#colorProjected)"
              />
              <Area
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke="#6366f1"
                strokeWidth={2}
                fill="#6366f1"
                fillOpacity={0.3}
              />
            </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue by Region and Top Days */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
          <h3 className="font-semibold text-foreground mb-4">Revenue by Region</h3>
          <div className="space-y-4">
            {revenueByRegion.map((region) => (
              <div key={region.region}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{region.region}</span>
                  <span className="text-sm text-foreground font-semibold">GH₵{region.revenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[#F1ECE3] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${region.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12">{region.percentage}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{region.exchanges.toLocaleString()} exchanges</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
          <h3 className="font-semibold text-foreground mb-4">Top Revenue Days</h3>
          <div className="space-y-3">
            {topRevenueDays.map((day, index) => (
              <div key={day.date} className="flex items-center gap-4 p-3 bg-background rounded-lg">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-[#ECE6DC] text-foreground' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-[#F1ECE3] text-muted-foreground'
                }`}>
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{day.date}</p>
                  <p className="text-xs text-muted-foreground">{day.reason}</p>
                </div>
                <p className="font-bold text-foreground">GH₵{day.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Transaction Breakdown</h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-700">View All Transactions</button>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dailyRevenue} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="transactions" name="Transactions" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="left" dataKey="fees" name="Fees (GH₵)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="avg_transaction" name="Avg. Transaction" stroke="#10b981" strokeWidth={2} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h4 className="font-semibold text-green-800">Gross Revenue</h4>
          </div>
          <p className="text-3xl font-bold text-green-800">GH₵{stats.totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-1">Before fees and expenses</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-yellow-800">Processing Fees</h4>
          </div>
          <p className="text-3xl font-bold text-yellow-800">GH₵{Math.round(stats.totalRevenue * 0.05).toLocaleString()}</p>
          <p className="text-sm text-yellow-600 mt-1">~5% of gross revenue</p>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-indigo-800">Net Revenue</h4>
          </div>
          <p className="text-3xl font-bold text-indigo-800">GH₵{Math.round(stats.totalRevenue * 0.95).toLocaleString()}</p>
          <p className="text-sm text-indigo-600 mt-1">After all deductions</p>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#241c16] rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-foreground">Export Revenue Data</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-2 hover:bg-[#F1ECE3] rounded-lg"
              >
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
                <select className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>This Year</option>
                  <option>All Time</option>
                  <option>Custom Range...</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Data to Include</label>
                <div className="space-y-2">
                  {['Daily Revenue', 'Monthly Summary', 'Revenue by Source', 'Revenue by Region', 'Payment Methods', 'Transactions'].map((item) => (
                    <label key={item} className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded border-[#E4DED2]" />
                      <span className="text-sm text-foreground">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Export Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { format: 'CSV', icon: '📊' },
                    { format: 'Excel', icon: '📗' },
                    { format: 'PDF', icon: '📄' },
                  ].map((option) => (
                    <button
                      key={option.format}
                      className="p-3 border border-[#ECE6DC] rounded-lg hover:border-indigo-500 hover:bg-indigo-50 text-center transition-colors"
                    >
                      <span className="text-2xl block mb-1">{option.icon}</span>
                      <span className="text-sm font-medium text-foreground">{option.format}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t bg-background rounded-b-xl">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-foreground hover:bg-[#F1ECE3] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Export started! Your file will be ready shortly.');
                  setShowExportModal(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Target Management Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#241c16] rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-foreground">Manage Revenue Targets</h3>
              <button
                onClick={() => setShowTargetModal(false)}
                className="p-2 hover:bg-[#F1ECE3] rounded-lg"
              >
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="space-y-4">
                {revenueTargets.map((target) => (
                  <div key={target.id} className="p-4 border border-[#ECE6DC] rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-foreground">{target.name}</h4>
                      <span className="text-xs text-muted-foreground uppercase">{target.period}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Target Amount</label>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">GH₵</span>
                          <input
                            type="number"
                            defaultValue={target.target}
                            className="flex-1 px-2 py-1.5 border border-[#E4DED2] rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Current Progress</label>
                        <p className="text-lg font-semibold text-foreground py-1">GH₵{target.current.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[#F1ECE3] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            target.status === 'exceeded' ? 'bg-indigo-500' :
                            target.status === 'on_track' ? 'bg-green-500' :
                            target.status === 'at_risk' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((target.current / target.target) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {((target.current / target.target) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <button className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Target
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t bg-background">
              <button
                onClick={() => setShowTargetModal(false)}
                className="px-4 py-2 text-foreground hover:bg-[#F1ECE3] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Targets saved successfully!');
                  setShowTargetModal(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
