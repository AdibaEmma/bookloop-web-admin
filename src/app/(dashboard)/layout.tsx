'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  RefreshCw,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Shield,
  Flag,
  FileText,
  Target,
  Trophy,
  Activity,
  DollarSign,
  UserCheck,
  AlertTriangle,
  Clock,
  Layers,
  Zap,
  TrendingUp,
  PieChart,
  Map,
  GitBranch,
  Award,
  Ticket,
  Server,
  Key,
  ScrollText,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Analytics',
    icon: BarChart3,
    children: [
      { name: 'Overview', href: '/dashboard/analytics', icon: PieChart },
      { name: 'Real-time', href: '/dashboard/analytics/realtime', icon: Activity },
      { name: 'Predictive', href: '/dashboard/analytics/predictive', icon: TrendingUp },
      { name: 'Heat Maps', href: '/dashboard/analytics/heatmaps', icon: Map },
      { name: 'Funnels', href: '/dashboard/analytics/funnels', icon: GitBranch },
    ]
  },
  {
    name: 'Users',
    icon: Users,
    children: [
      { name: 'All Users', href: '/dashboard/users', icon: Users },
      { name: 'Segmentation', href: '/dashboard/segmentation', icon: Target },
      { name: 'Bulk Actions', href: '/dashboard/users/bulk-actions', icon: Layers },
      { name: 'Impersonation', href: '/dashboard/users/impersonation', icon: UserCheck },
      { name: 'Reputation', href: '/dashboard/users/reputation', icon: Award },
    ]
  },
  { name: 'Listings', href: '/dashboard/listings', icon: BookOpen },
  {
    name: 'Exchanges',
    icon: RefreshCw,
    children: [
      { name: 'All Exchanges', href: '/dashboard/exchanges', icon: RefreshCw },
      { name: 'Timeline', href: '/dashboard/exchanges/timeline', icon: Clock },
      { name: 'Matching', href: '/dashboard/matching', icon: Zap },
      { name: 'Smart Matching', href: '/dashboard/exchanges/smart-matching', icon: Target },
      { name: 'Disputes', href: '/dashboard/disputes', icon: AlertTriangle },
    ]
  },
  {
    name: 'Spots',
    icon: MapPin,
    children: [
      { name: 'All Spots', href: '/dashboard/meetup-spots', icon: MapPin },
      { name: 'Suggested Spots', href: '/dashboard/suggested-spots', icon: Flag },
      { name: 'Community Spots', href: '/dashboard/spots/community-suggestions', icon: Users },
      { name: 'Capacity', href: '/dashboard/spots/capacity', icon: Activity },
    ]
  },
  {
    name: 'Moderation',
    icon: Shield,
    children: [
      { name: 'Queue', href: '/dashboard/moderation', icon: Layers },
      { name: 'Reported Content', href: '/dashboard/moderation/reported-content', icon: AlertTriangle },
    ]
  },
  {
    name: 'Safety',
    icon: AlertTriangle,
    children: [
      { name: 'Incidents', href: '/dashboard/safety/incidents', icon: AlertTriangle },
    ]
  },
  {
    name: 'Financial',
    icon: DollarSign,
    children: [
      { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
      { name: 'Revenue', href: '/dashboard/revenue', icon: TrendingUp },
      { name: 'Payouts', href: '/dashboard/payouts', icon: DollarSign },
      { name: 'Promo Codes', href: '/dashboard/promo-codes', icon: Ticket },
    ]
  },
  {
    name: 'Gamification',
    icon: Trophy,
    children: [
      { name: 'Leaderboards', href: '/dashboard/leaderboards', icon: Trophy },
      { name: 'Achievements', href: '/dashboard/gamification/achievements', icon: Award },
      { name: 'Challenges', href: '/dashboard/challenges', icon: Target },
    ]
  },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  {
    name: 'Settings',
    icon: Settings,
    children: [
      { name: 'General', href: '/dashboard/settings', icon: Settings },
      { name: 'Roles & Access', href: '/dashboard/settings/roles', icon: Key },
      { name: 'Feature Flags', href: '/dashboard/feature-flags', icon: Flag },
      { name: 'Audit Logs', href: '/dashboard/audit-logs', icon: ScrollText },
      { name: 'System Health', href: '/dashboard/system-health', icon: Server },
    ]
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (name: string) => {
    setExpandedSections(prev =>
      prev.includes(name)
        ? prev.filter(s => s !== name)
        : [...prev, name]
    );
  };

  const isChildActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some(child => child.href && pathname.startsWith(child.href));
    }
    return false;
  };

  useEffect(() => {
    // Check authentication only on client side
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('admin_token');
        const userData = localStorage.getItem('admin_user');

        if (!token || !userData) {
          router.push('/login');
          return;
        }

        setUser(JSON.parse(userData));
      } catch (error) {
        // Handle JSON parse error or localStorage access error
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_token_expires_at');
    localStorage.removeItem('admin_user');
    router.push('/login');
  };

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  // Redirect handled in useEffect, but show loading if no user yet
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                BookLoop
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedSections.includes(item.name) || isChildActive(item);
              const isActive = item.href && pathname === item.href;

              if (hasChildren) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleSection(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isChildActive(item)
                          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        {item.name}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="mt-1 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700 space-y-1">
                        {item.children!.map((child) => {
                          const ChildIcon = child.icon;
                          const isChildItemActive = child.href && pathname === child.href;

                          return (
                            <Link
                              key={child.name}
                              href={child.href || '#'}
                              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                                isChildItemActive
                                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              <ChildIcon className="w-4 h-4" />
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href || '#'}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold">
                {user.first_name?.[0]}
                {user.last_name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:text-gray-500"
            >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
