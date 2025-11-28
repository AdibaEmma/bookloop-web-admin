'use client';

import {
  Users,
  BookOpen,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Stats card component
function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor,
}: {
  title: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: any;
  iconColor: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-full ${iconColor}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {changeType === 'increase' ? (
          <ArrowUpRight className="w-4 h-4 text-green-600" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-red-600" />
        )}
        <span
          className={`text-sm font-medium ml-1 ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {change}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
          vs last month
        </span>
      </div>
    </div>
  );
}

// Recent activity item component
function ActivityItem({
  type,
  user,
  details,
  time,
}: {
  type: 'user' | 'listing' | 'exchange';
  user: string;
  details: string;
  time: string;
}) {
  const getIcon = () => {
    switch (type) {
      case 'user':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'listing':
        return <BookOpen className="w-5 h-5 text-amber-600" />;
      case 'exchange':
        return <RefreshCw className="w-5 h-5 text-green-600" />;
    }
  };

  return (
    <div className="flex items-start gap-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {user}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">{details}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
        <Clock className="w-3 h-3" />
        {time}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  // Static mock data - Backend admin endpoints not yet implemented
  // TODO: Replace with real API calls when admin endpoints are available
  const stats = {
    totalUsers: 1247,
    totalListings: 3542,
    activeExchanges: 89,
    totalMeetupSpots: 24,
    userGrowth: '+12.5%',
    listingGrowth: '+8.3%',
    exchangeGrowth: '+15.2%',
    meetupGrowth: '+5.0%',
  };

  // Mock recent activity data
  const activities = [
    {
      type: 'user' as const,
      user: 'Kwame Mensah',
      details: 'Registered a new account',
      time: '5m ago',
    },
    {
      type: 'listing' as const,
      user: 'Ama Darko',
      details: 'Listed "Things Fall Apart" for exchange',
      time: '12m ago',
    },
    {
      type: 'exchange' as const,
      user: 'Kofi Asante',
      details: 'Completed exchange for "Half of a Yellow Sun"',
      time: '23m ago',
    },
    {
      type: 'user' as const,
      user: 'Akua Boateng',
      details: 'Updated their reading preferences',
      time: '1h ago',
    },
    {
      type: 'listing' as const,
      user: 'Yaw Agyei',
      details: 'Listed "The Beautiful Ones Are Not Yet Born"',
      time: '2h ago',
    },
  ];

  // Mock chart data
  const userGrowthData = [
    { month: 'Jan', users: 850 },
    { month: 'Feb', users: 920 },
    { month: 'Mar', users: 1050 },
    { month: 'Apr', users: 1150 },
    { month: 'May', users: 1180 },
    { month: 'Jun', users: 1247 },
  ];

  const exchangeData = [
    { month: 'Jan', completed: 45, pending: 12, cancelled: 3 },
    { month: 'Feb', completed: 52, pending: 15, cancelled: 2 },
    { month: 'Mar', completed: 68, pending: 18, cancelled: 5 },
    { month: 'Apr', completed: 71, pending: 14, cancelled: 4 },
    { month: 'May', completed: 85, pending: 20, cancelled: 3 },
    { month: 'Jun', completed: 89, pending: 16, cancelled: 2 },
  ];

  const bookCategoryData = [
    { name: 'Fiction', value: 45 },
    { name: 'Non-Fiction', value: 25 },
    { name: 'Academic', value: 15 },
    { name: 'Children', value: 10 },
    { name: 'Others', value: 5 },
  ];

  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back! Here&apos;s what&apos;s happening with your platform today.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          change={stats?.userGrowth || '0%'}
          changeType="increase"
          icon={Users}
          iconColor="bg-blue-500"
        />
        <StatsCard
          title="Active Listings"
          value={stats?.totalListings?.toLocaleString() || '0'}
          change={stats?.listingGrowth || '0%'}
          changeType="increase"
          icon={BookOpen}
          iconColor="bg-amber-500"
        />
        <StatsCard
          title="Active Exchanges"
          value={stats?.activeExchanges?.toLocaleString() || '0'}
          change={stats?.exchangeGrowth || '0%'}
          changeType="increase"
          icon={RefreshCw}
          iconColor="bg-green-500"
        />
        <StatsCard
          title="Meetup Spots"
          value={stats?.totalMeetupSpots?.toLocaleString() || '0'}
          change={stats?.meetupGrowth || '0%'}
          changeType="increase"
          icon={MapPin}
          iconColor="bg-purple-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            User Growth
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#f59e0b"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Exchange Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Exchange Statistics
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={exchangeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#10b981" />
              <Bar dataKey="pending" fill="#f59e0b" />
              <Bar dataKey="cancelled" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Book Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Book Categories
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={bookCategoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {bookCategoryData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-0">
            {activities?.map((activity: any, index: number) => (
              <ActivityItem
                key={index}
                type={activity.type}
                user={activity.user}
                details={activity.details}
                time={activity.time}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-amber-500 transition-colors">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              Add New User
            </span>
          </button>
          <button className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-amber-500 transition-colors">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              Moderate Listings
            </span>
          </button>
          <button className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-amber-500 transition-colors">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              Add Meetup Spot
            </span>
          </button>
          <button className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-amber-500 transition-colors">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              View Analytics
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
