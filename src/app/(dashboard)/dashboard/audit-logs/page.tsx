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
  LineChart,
  Line,
  Legend,
} from 'recharts';
import type { AuditLog } from '@/types/admin';

// Extended Audit Log
interface AuditLogEntry extends AuditLog {
  severity: 'info' | 'warning' | 'critical';
}

// Mock Data
const mockAuditLogs: AuditLogEntry[] = [
  {
    id: 'log-1',
    action: 'User suspended',
    category: 'moderation',
    actor_id: 'admin-1',
    actor_name: 'Admin Sarah',
    actor_role: 'Senior Moderator',
    target_type: 'user',
    target_id: 'user-456',
    details: { user_name: 'Kofi Mensah', reason: 'Multiple policy violations', duration: '7 days' },
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: '2024-06-02T14:30:00Z',
    severity: 'warning',
  },
  {
    id: 'log-2',
    action: 'Exchange completed',
    category: 'exchange',
    actor_id: 'user-123',
    actor_name: 'Kwame Asante',
    actor_role: 'User',
    target_type: 'exchange',
    target_id: 'exc-789',
    details: { book: 'Things Fall Apart', type: 'swap', parties: ['Kwame Asante', 'Ama Darko'] },
    created_at: '2024-06-02T14:15:00Z',
    severity: 'info',
  },
  {
    id: 'log-3',
    action: 'Payment processed',
    category: 'payment',
    actor_id: 'system',
    actor_name: 'System',
    actor_role: 'System',
    target_type: 'payment',
    target_id: 'pay-123',
    details: { amount: 'GH₵45', method: 'MTN MoMo', status: 'success' },
    created_at: '2024-06-02T14:00:00Z',
    severity: 'info',
  },
  {
    id: 'log-4',
    action: 'Admin login',
    category: 'system',
    actor_id: 'admin-2',
    actor_name: 'Admin Michael',
    actor_role: 'Administrator',
    details: { location: 'Accra, Ghana' },
    ip_address: '41.215.176.45',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    created_at: '2024-06-02T13:45:00Z',
    severity: 'info',
  },
  {
    id: 'log-5',
    action: 'Listing removed',
    category: 'listing',
    actor_id: 'admin-1',
    actor_name: 'Admin Sarah',
    actor_role: 'Senior Moderator',
    target_type: 'listing',
    target_id: 'list-456',
    details: { reason: 'Copyright violation', book_title: 'PDF Collection' },
    created_at: '2024-06-02T13:30:00Z',
    severity: 'warning',
  },
  {
    id: 'log-6',
    action: 'Role permission changed',
    category: 'system',
    actor_id: 'admin-0',
    actor_name: 'Super Admin',
    actor_role: 'Super Admin',
    target_type: 'role',
    target_id: 'role-2',
    details: { role: 'Moderator', permission_added: 'user.ban', permission_removed: null },
    ip_address: '192.168.1.1',
    created_at: '2024-06-02T12:00:00Z',
    severity: 'critical',
  },
  {
    id: 'log-7',
    action: 'User registered',
    category: 'user',
    actor_id: 'user-999',
    actor_name: 'Efua Mensah',
    actor_role: 'User',
    target_type: 'user',
    target_id: 'user-999',
    details: { email: 'efua.mensah@gmail.com', referral: 'organic' },
    created_at: '2024-06-02T11:30:00Z',
    severity: 'info',
  },
  {
    id: 'log-8',
    action: 'Failed login attempt',
    category: 'system',
    actor_id: 'unknown',
    actor_name: 'Unknown',
    actor_role: 'Unknown',
    details: { attempted_email: 'admin@bookloop.com', attempts: 3 },
    ip_address: '85.234.112.67',
    user_agent: 'Mozilla/5.0 (compatible; bot)',
    created_at: '2024-06-02T11:00:00Z',
    severity: 'critical',
  },
  {
    id: 'log-9',
    action: 'Dispute resolved',
    category: 'moderation',
    actor_id: 'admin-1',
    actor_name: 'Admin Sarah',
    actor_role: 'Senior Moderator',
    target_type: 'dispute',
    target_id: 'disp-123',
    details: { resolution: 'mutual_agreement', affected_users: 2 },
    created_at: '2024-06-02T10:30:00Z',
    severity: 'info',
  },
  {
    id: 'log-10',
    action: 'Feature flag enabled',
    category: 'system',
    actor_id: 'admin-0',
    actor_name: 'Super Admin',
    actor_role: 'Super Admin',
    target_type: 'feature_flag',
    target_id: 'flag-dark-mode',
    details: { flag: 'dark_mode', enabled: true, rollout: '100%' },
    created_at: '2024-06-02T09:00:00Z',
    severity: 'warning',
  },
];

const activityByHour = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, '0')}:00`,
  actions: Math.floor(Math.random() * 50) + 10,
}));

const activityByCategory = [
  { category: 'User', count: 245 },
  { category: 'Exchange', count: 189 },
  { category: 'Listing', count: 156 },
  { category: 'Payment', count: 98 },
  { category: 'Moderation', count: 67 },
  { category: 'System', count: 45 },
];

const activityTrend = [
  { date: 'Mon', actions: 456, admins: 12 },
  { date: 'Tue', actions: 523, admins: 15 },
  { date: 'Wed', actions: 489, admins: 11 },
  { date: 'Thu', actions: 612, admins: 18 },
  { date: 'Fri', actions: 578, admins: 14 },
  { date: 'Sat', actions: 234, admins: 5 },
  { date: 'Sun', actions: 189, admins: 3 },
];

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterActor, setFilterActor] = useState<string>('all');
  const [dateRange, setDateRange] = useState('24h');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const filteredLogs = useMemo(() => {
    return mockAuditLogs.filter((log) => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(log.details).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || log.category === filterCategory;
      const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
      const matchesActor = filterActor === 'all' || log.actor_role.toLowerCase().includes(filterActor.toLowerCase());
      return matchesSearch && matchesCategory && matchesSeverity && matchesActor;
    });
  }, [searchQuery, filterCategory, filterSeverity, filterActor]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'user':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'exchange':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'listing':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'payment':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'moderation':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'system':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
          <p className="text-gray-600 mt-1">
            Track all system activities and admin actions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="1h">Last hour</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="custom">Custom range</option>
          </select>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Logs
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Total Actions (24h)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">2,847</p>
          <p className="text-xs text-green-600 mt-1">+12% from yesterday</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Admin Actions</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">156</p>
          <p className="text-xs text-gray-500 mt-1">By 8 active admins</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Critical Events</p>
          <p className="text-2xl font-bold text-red-600 mt-1">3</p>
          <p className="text-xs text-red-600 mt-1">Requires attention</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Failed Logins</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">12</p>
          <p className="text-xs text-gray-500 mt-1">From 4 IPs</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Activity by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={activityByCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Activity Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={activityTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="actions" name="Total Actions" stroke="#6366f1" strokeWidth={2} />
              <Line type="monotone" dataKey="admins" name="Active Admins" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters and Log List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Categories</option>
              <option value="user">User</option>
              <option value="exchange">Exchange</option>
              <option value="listing">Listing</option>
              <option value="payment">Payment</option>
              <option value="moderation">Moderation</option>
              <option value="system">System</option>
            </select>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Severity</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={filterActor}
              onChange={(e) => setFilterActor(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Actors</option>
              <option value="admin">Admins Only</option>
              <option value="user">Users Only</option>
              <option value="system">System Only</option>
            </select>
          </div>
        </div>

        {/* Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actor</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-900 dark:text-white">{formatDate(log.created_at)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                        log.actor_role === 'System' ? 'bg-gray-500' :
                        log.actor_role.includes('Admin') ? 'bg-indigo-500' :
                        'bg-green-500'
                      }`}>
                        {log.actor_name === 'System' ? 'S' : log.actor_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">{log.actor_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{log.actor_role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-600 capitalize">
                      {getCategoryIcon(log.category)}
                      {log.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full border capitalize ${getSeverityColor(log.severity)}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-500 truncate max-w-[200px] block">
                      {Object.entries(log.details).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(', ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Showing {filteredLogs.length} of {mockAuditLogs.length} logs</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:bg-gray-900">Previous</button>
            <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:bg-gray-900">2</button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:bg-gray-900">3</button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:bg-gray-900">Next</button>
          </div>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Log Details</h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full border capitalize ${getSeverityColor(selectedLog.severity)}`}>
                  {selectedLog.severity}
                </span>
                <span className="inline-flex items-center gap-1 text-sm text-gray-600 capitalize">
                  {getCategoryIcon(selectedLog.category)}
                  {selectedLog.category}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Action</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Timestamp</p>
                  <p className="text-sm text-gray-900 dark:text-white">{formatDate(selectedLog.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Actor</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                      selectedLog.actor_role === 'System' ? 'bg-gray-500' :
                      selectedLog.actor_role.includes('Admin') ? 'bg-indigo-500' :
                      'bg-green-500'
                    }`}>
                      {selectedLog.actor_name === 'System' ? 'S' : selectedLog.actor_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white">{selectedLog.actor_name}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Role</p>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedLog.actor_role}</p>
                </div>
                {selectedLog.target_type && (
                  <>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Target Type</p>
                      <p className="text-sm text-gray-900 capitalize">{selectedLog.target_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Target ID</p>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">{selectedLog.target_id}</p>
                    </div>
                  </>
                )}
                {selectedLog.ip_address && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">IP Address</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">{selectedLog.ip_address}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Details</p>
                <pre className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 overflow-x-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>

              {selectedLog.user_agent && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">User Agent</p>
                  <p className="text-xs text-gray-600 font-mono break-all">{selectedLog.user_agent}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-900"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Copy Log ID
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
