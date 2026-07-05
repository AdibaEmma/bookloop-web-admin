'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Users,
  BookOpen,
  RefreshCw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Zap,
  Circle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MapPin,
  Bell,
} from 'lucide-react';
import { useMockWebSocket } from '@/hooks/useWebSocket';

interface LiveEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
}

interface RealTimeStats {
  activeUsers: number;
  activeExchanges: number;
  newRegistrationsToday: number;
  newListingsToday: number;
  transactionsToday: number;
  revenueToday: number;
  onlineNow: number;
}

// Real-time stat card with live indicator
function LiveStatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor,
  isLive = false,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: any;
  iconColor: string;
  isLive?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-6 relative overflow-hidden">
      {isLive && (
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <Circle className="w-2 h-2 fill-green-500 text-green-500 animate-pulse" />
          <span className="text-xs text-green-500 font-medium">LIVE</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className="text-3xl font-bold text-foreground mt-2">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-full ${iconColor}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {change && (
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
          <span className="text-sm text-muted-foreground ml-2">
            vs last hour
          </span>
        </div>
      )}
    </div>
  );
}

// Live activity feed item
function ActivityFeedItem({ event }: { event: LiveEvent }) {
  const getEventConfig = (type: string) => {
    switch (type) {
      case 'new_user':
        return {
          icon: Users,
          color: 'bg-blue-500',
          title: 'New User Registered',
          description: `${event.payload.name} from ${event.payload.city}`,
        };
      case 'new_listing':
        return {
          icon: BookOpen,
          color: 'bg-primary',
          title: 'New Listing Created',
          description: `"${event.payload.book_title}" by ${event.payload.owner}`,
        };
      case 'new_exchange':
        return {
          icon: RefreshCw,
          color: 'bg-purple-500',
          title: 'Exchange Initiated',
          description: `${event.payload.initiator} - ${event.payload.type}`,
        };
      case 'exchange_completed':
        return {
          icon: RefreshCw,
          color: 'bg-green-500',
          title: 'Exchange Completed',
          description: `"${event.payload.book_title}"`,
        };
      case 'payment_received':
        return {
          icon: DollarSign,
          color: 'bg-emerald-500',
          title: 'Payment Received',
          description: `${event.payload.currency}${event.payload.amount} from ${event.payload.from}`,
        };
      case 'user_online':
        return {
          icon: Activity,
          color: 'bg-cyan-500',
          title: 'User Online',
          description: `${event.payload.name} is now active`,
        };
      default:
        return {
          icon: Bell,
          color: 'bg-background0',
          title: 'Event',
          description: 'Unknown event',
        };
    }
  };

  const config = getEventConfig(event.type);
  const Icon = config.icon;
  const timeAgo = getTimeAgo(event.timestamp);

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-background dark:hover:bg-[#2a2118]/50 rounded-lg transition-colors animate-fadeIn">
      <div className={`p-2 rounded-lg ${config.color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {config.title}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {config.description}
        </p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {timeAgo}
      </span>
    </div>
  );
}

// Active users map placeholder
function ActiveUsersMap({ regions }: { regions: RegionActivity[] }) {
  return (
    <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Active Users by Region
        </h3>
        <div className="flex items-center gap-1">
          <Circle className="w-2 h-2 fill-green-500 text-green-500 animate-pulse" />
          <span className="text-xs text-green-500 font-medium">LIVE</span>
        </div>
      </div>
      <div className="space-y-3">
        {regions.map((region, index) => (
          <div key={region.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
              <span className="text-sm text-foreground">
                {region.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-[#ECE6DC] dark:bg-[#2a2118] rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${region.percentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-foreground w-12 text-right">
                {region.activeUsers}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Real-time exchange activity
function ExchangeActivity({ exchanges }: { exchanges: ActiveExchange[] }) {
  return (
    <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Active Exchanges
        </h3>
        <span className="text-sm text-muted-foreground">
          {exchanges.length} in progress
        </span>
      </div>
      <div className="space-y-3">
        {exchanges.map((exchange) => (
          <div
            key={exchange.id}
            className="flex items-center justify-between p-3 bg-background dark:bg-[#2a2118]/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(exchange.status)}`} />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {exchange.bookTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                  {exchange.initiator} → {exchange.recipient}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusBadge(exchange.status)}`}>
                {exchange.status}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {exchange.location}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface RegionActivity {
  name: string;
  activeUsers: number;
  percentage: number;
}

interface ActiveExchange {
  id: string;
  bookTitle: string;
  initiator: string;
  recipient: string;
  status: 'pending' | 'confirmed' | 'in_progress';
  location: string;
}

// Helper functions
function getTimeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500';
    case 'confirmed':
      return 'bg-blue-500';
    case 'in_progress':
      return 'bg-green-500 animate-pulse';
    default:
      return 'bg-background0';
  }
}

function getStatusBadge(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 'confirmed':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
    case 'in_progress':
      return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
    default:
      return 'bg-[#F1ECE3] text-foreground dark:bg-[#2a2118] dark:text-foreground';
  }
}

// Mock data
const mockRegions: RegionActivity[] = [
  { name: 'Greater Accra', activeUsers: 145, percentage: 85 },
  { name: 'Ashanti', activeUsers: 98, percentage: 65 },
  { name: 'Western', activeUsers: 67, percentage: 45 },
  { name: 'Central', activeUsers: 54, percentage: 35 },
  { name: 'Eastern', activeUsers: 43, percentage: 28 },
  { name: 'Northern', activeUsers: 32, percentage: 20 },
  { name: 'Upper East', activeUsers: 28, percentage: 18 },
  { name: 'Volta', activeUsers: 25, percentage: 16 },
];

const mockActiveExchanges: ActiveExchange[] = [
  {
    id: '1',
    bookTitle: 'Things Fall Apart',
    initiator: 'Kwame M.',
    recipient: 'Ama D.',
    status: 'in_progress',
    location: 'Accra Mall',
  },
  {
    id: '2',
    bookTitle: 'Half of a Yellow Sun',
    initiator: 'Kofi A.',
    recipient: 'Akua B.',
    status: 'confirmed',
    location: 'Kumasi Central Library',
  },
  {
    id: '3',
    bookTitle: 'Americanah',
    initiator: 'Yaw A.',
    recipient: 'Efua O.',
    status: 'pending',
    location: 'Cape Coast University',
  },
  {
    id: '4',
    bookTitle: 'Purple Hibiscus',
    initiator: 'Kojo A.',
    recipient: 'Abena O.',
    status: 'in_progress',
    location: 'Tamale Public Library',
  },
];

export default function RealTimeDashboardPage() {
  const { isConnected, lastMessage } = useMockWebSocket();
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [stats, setStats] = useState<RealTimeStats>({
    activeUsers: 492,
    activeExchanges: 23,
    newRegistrationsToday: 47,
    newListingsToday: 156,
    transactionsToday: 89,
    revenueToday: 3250,
    onlineNow: 127,
  });

  // Update events when new message arrives
  useEffect(() => {
    if (lastMessage) {
      setEvents((prev) => [
        {
          id: `${Date.now()}-${Math.random()}`,
          type: lastMessage.type,
          payload: lastMessage.payload,
          timestamp: lastMessage.timestamp,
        },
        ...prev.slice(0, 49), // Keep last 50 events
      ]);

      // Update stats based on event type
      setStats((prev) => {
        switch (lastMessage.type) {
          case 'new_user':
            return {
              ...prev,
              newRegistrationsToday: prev.newRegistrationsToday + 1,
              activeUsers: prev.activeUsers + 1,
            };
          case 'new_listing':
            return { ...prev, newListingsToday: prev.newListingsToday + 1 };
          case 'new_exchange':
            return { ...prev, activeExchanges: prev.activeExchanges + 1 };
          case 'exchange_completed':
            return {
              ...prev,
              activeExchanges: Math.max(0, prev.activeExchanges - 1),
              transactionsToday: prev.transactionsToday + 1,
            };
          case 'payment_received':
            return {
              ...prev,
              transactionsToday: prev.transactionsToday + 1,
              revenueToday: prev.revenueToday + (lastMessage.payload?.amount || 0),
            };
          case 'user_online':
            return { ...prev, onlineNow: prev.onlineNow + 1 };
          default:
            return prev;
        }
      });
    }
  }, [lastMessage]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            Real-Time Dashboard
            <span className="flex items-center gap-1 text-sm font-normal">
              <Circle
                className={`w-2 h-2 ${
                  isConnected
                    ? 'fill-green-500 text-green-500 animate-pulse'
                    : 'fill-red-500 text-red-500'
                }`}
              />
              <span className={isConnected ? 'text-green-500' : 'text-red-500'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Live platform activity and metrics
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LiveStatCard
          title="Online Now"
          value={stats.onlineNow}
          change="+12%"
          changeType="increase"
          icon={Activity}
          iconColor="bg-green-500"
          isLive
        />
        <LiveStatCard
          title="Active Exchanges"
          value={stats.activeExchanges}
          change="+5"
          changeType="increase"
          icon={RefreshCw}
          iconColor="bg-purple-500"
          isLive
        />
        <LiveStatCard
          title="New Users Today"
          value={stats.newRegistrationsToday}
          change="+23%"
          changeType="increase"
          icon={Users}
          iconColor="bg-blue-500"
        />
        <LiveStatCard
          title="Revenue Today"
          value={`GH₵${stats.revenueToday.toLocaleString()}`}
          change="+18%"
          changeType="increase"
          icon={DollarSign}
          iconColor="bg-primary"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                New Listings Today
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {stats.newListingsToday}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Transactions Today
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {stats.transactionsToday}
              </p>
            </div>
            <Zap className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Active Users
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {stats.activeUsers}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-1 bg-white dark:bg-[#241c16] rounded-lg shadow">
          <div className="p-4 border-b border-[#ECE6DC] dark:border-[#33291f]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                Live Activity Feed
              </h3>
              <div className="flex items-center gap-1">
                <Circle className="w-2 h-2 fill-green-500 text-green-500 animate-pulse" />
                <span className="text-xs text-green-500 font-medium">LIVE</span>
              </div>
            </div>
          </div>
          <div className="p-2 max-h-[500px] overflow-y-auto">
            {events.length > 0 ? (
              events.map((event) => (
                <ActivityFeedItem key={event.id} event={event} />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Waiting for activity...</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Users Map & Exchange Activity */}
        <div className="lg:col-span-2 space-y-6">
          <ActiveUsersMap regions={mockRegions} />
          <ExchangeActivity exchanges={mockActiveExchanges} />
        </div>
      </div>

      {/* Add custom animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
