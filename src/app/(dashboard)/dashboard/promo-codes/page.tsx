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
import { CustomTooltip, useChartColors } from '@/components/charts/ChartComponents';
import type { PromoCode } from '@/types/admin';

// Extended PromoCode with analytics
interface PromoCodeWithAnalytics extends PromoCode {
  revenue_generated: number;
  avg_order_value: number;
}

// Mock Data
const mockPromoCodes: PromoCodeWithAnalytics[] = [
  {
    id: 'promo-1',
    code: 'WELCOME25',
    type: 'percentage',
    value: 25,
    description: '25% off first exchange for new users',
    usage_limit: 1000,
    usage_count: 456,
    min_transaction: 10,
    valid_from: '2024-01-01',
    valid_until: '2024-12-31',
    is_active: true,
    applicable_to: 'new_users',
    created_by: 'Admin Sarah',
    created_at: '2024-01-01',
    revenue_generated: 4560,
    avg_order_value: 35,
  },
  {
    id: 'promo-2',
    code: 'BOOKWORM10',
    type: 'percentage',
    value: 10,
    description: '10% off for users with 5+ exchanges',
    usage_limit: 500,
    usage_count: 234,
    valid_from: '2024-03-01',
    valid_until: '2024-06-30',
    is_active: true,
    applicable_to: 'specific_users',
    user_ids: ['u1', 'u2', 'u3'],
    created_by: 'Admin Michael',
    created_at: '2024-03-01',
    revenue_generated: 2340,
    avg_order_value: 42,
  },
  {
    id: 'promo-3',
    code: 'SUMMER2024',
    type: 'fixed',
    value: 5,
    description: 'GH₵5 off any exchange',
    usage_limit: 2000,
    usage_count: 1876,
    valid_from: '2024-06-01',
    valid_until: '2024-08-31',
    is_active: true,
    applicable_to: 'all',
    created_by: 'Admin Sarah',
    created_at: '2024-06-01',
    revenue_generated: 18760,
    avg_order_value: 28,
  },
  {
    id: 'promo-4',
    code: 'FREELISTING',
    type: 'free_listing',
    value: 1,
    description: 'One free premium listing',
    usage_limit: 100,
    usage_count: 89,
    valid_from: '2024-05-01',
    valid_until: '2024-05-31',
    is_active: false,
    applicable_to: 'all',
    created_by: 'Admin Michael',
    created_at: '2024-05-01',
    revenue_generated: 890,
    avg_order_value: 0,
  },
  {
    id: 'promo-5',
    code: 'REFER50',
    type: 'percentage',
    value: 50,
    description: '50% off for referred users',
    usage_limit: 500,
    usage_count: 123,
    min_transaction: 15,
    valid_from: '2024-01-01',
    valid_until: '2024-12-31',
    is_active: true,
    applicable_to: 'new_users',
    created_by: 'Admin Sarah',
    created_at: '2024-01-15',
    revenue_generated: 1845,
    avg_order_value: 45,
  },
];

const usageData = [
  { date: 'Jan', usage: 234, revenue: 2340 },
  { date: 'Feb', usage: 356, revenue: 3560 },
  { date: 'Mar', usage: 445, revenue: 4450 },
  { date: 'Apr', usage: 567, revenue: 5670 },
  { date: 'May', usage: 678, revenue: 6780 },
  { date: 'Jun', usage: 498, revenue: 4980 },
];

const promoStats = {
  totalCodes: mockPromoCodes.length,
  activeCodes: mockPromoCodes.filter((p) => p.is_active).length,
  totalUsage: mockPromoCodes.reduce((sum, p) => sum + p.usage_count, 0),
  totalRevenue: mockPromoCodes.reduce((sum, p) => sum + p.revenue_generated, 0),
};

export default function PromoCodesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<PromoCodeWithAnalytics | null>(null);
  const [newPromo, setNewPromo] = useState({
    code: '',
    type: 'percentage' as PromoCode['type'],
    value: 0,
    description: '',
    usage_limit: undefined as number | undefined,
    min_transaction: undefined as number | undefined,
    valid_from: '',
    valid_until: '',
    applicable_to: 'all' as PromoCode['applicable_to'],
  });

  const filteredCodes = useMemo(() => {
    return mockPromoCodes.filter((promo) => {
      const matchesSearch =
        promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promo.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && promo.is_active) ||
        (filterStatus === 'inactive' && !promo.is_active);
      const matchesType = filterType === 'all' || promo.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchQuery, filterStatus, filterType]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'bg-blue-100 text-blue-700';
      case 'fixed':
        return 'bg-green-100 text-green-700';
      case 'free_listing':
        return 'bg-purple-100 text-purple-700';
      case 'free_exchange':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700 dark:text-gray-300';
    }
  };

  const formatValue = (promo: PromoCode) => {
    switch (promo.type) {
      case 'percentage':
        return `${promo.value}% off`;
      case 'fixed':
        return `GH₵${promo.value} off`;
      case 'free_listing':
        return `${promo.value} free listing${promo.value > 1 ? 's' : ''}`;
      case 'free_exchange':
        return `${promo.value} free exchange${promo.value > 1 ? 's' : ''}`;
      default:
        return promo.value.toString();
    }
  };

  const getUsagePercentage = (promo: PromoCode) => {
    if (!promo.usage_limit) return 0;
    return (promo.usage_count / promo.usage_limit) * 100;
  };

  const isExpired = (promo: PromoCode) => {
    return new Date(promo.valid_until) < new Date();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Promotional Codes</h1>
          <p className="text-gray-600 mt-1">
            Create and manage promotional codes for users
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Code
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Codes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{promoStats.totalCodes}</p>
          <p className="text-xs text-gray-500 mt-1">{promoStats.activeCodes} active</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Redemptions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{promoStats.totalUsage.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">+12% this month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Revenue Generated</p>
          <p className="text-2xl font-bold text-green-600 mt-1">GH₵{promoStats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">From promo users</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Discount Given</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">GH₵8.50</p>
          <p className="text-xs text-gray-500 mt-1">Per redemption</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Usage Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="usage" name="Redemptions" stroke="#6366f1" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue (GH₵)" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Performing Codes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={mockPromoCodes.slice(0, 5).sort((a, b) => b.usage_count - a.usage_count)}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="code" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="usage_count" name="Redemptions" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by code or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Types</option>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
          <option value="free_listing">Free Listing</option>
          <option value="free_exchange">Free Exchange</option>
        </select>
      </div>

      {/* Promo Codes List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Usage</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Valid Period</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCodes.map((promo) => (
                <tr key={promo.id} className="hover:bg-gray-50 dark:bg-gray-900">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-mono font-semibold text-gray-900 dark:text-white">{promo.code}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{promo.description}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getTypeColor(promo.type)}`}>
                      {promo.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-900 dark:text-white">{formatValue(promo)}</span>
                    {promo.min_transaction && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">Min: GH₵{promo.min_transaction}</p>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {promo.usage_count} / {promo.usage_limit || '∞'}
                      </p>
                      {promo.usage_limit && (
                        <div className="w-24 h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${Math.min(getUsagePercentage(promo), 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(promo.valid_from).toLocaleDateString()} -{' '}
                      {new Date(promo.valid_until).toLocaleDateString()}
                    </p>
                    {isExpired(promo) && (
                      <span className="text-xs text-red-600">Expired</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      promo.is_active && !isExpired(promo)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500 dark:text-gray-400'
                    }`}>
                      {promo.is_active && !isExpired(promo) ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPromo(promo)}
                        className="p-1 text-gray-400 hover:text-indigo-600"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button className="p-1 text-gray-400 hover:text-indigo-600" title="Edit">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600" title="Delete">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Create Promotional Code</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  type="text"
                  value={newPromo.code}
                  onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SUMMER2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newPromo.type}
                    onChange={(e) => setNewPromo({ ...newPromo, type: e.target.value as PromoCode['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_listing">Free Listing</option>
                    <option value="free_exchange">Free Exchange</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value {newPromo.type === 'percentage' ? '(%)' : newPromo.type === 'fixed' ? '(GH₵)' : '(Count)'}
                  </label>
                  <input
                    type="number"
                    value={newPromo.value || ''}
                    onChange={(e) => setNewPromo({ ...newPromo, value: parseFloat(e.target.value) })}
                    placeholder="e.g., 25"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newPromo.description}
                  onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                  placeholder="Short description of the promo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={newPromo.usage_limit || ''}
                    onChange={(e) => setNewPromo({ ...newPromo, usage_limit: parseInt(e.target.value) || undefined })}
                    placeholder="Leave empty for unlimited"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Transaction (GH₵)</label>
                  <input
                    type="number"
                    value={newPromo.min_transaction || ''}
                    onChange={(e) => setNewPromo({ ...newPromo, min_transaction: parseFloat(e.target.value) || undefined })}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                  <input
                    type="date"
                    value={newPromo.valid_from}
                    onChange={(e) => setNewPromo({ ...newPromo, valid_from: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={newPromo.valid_until}
                    onChange={(e) => setNewPromo({ ...newPromo, valid_until: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applicable To</label>
                <select
                  value={newPromo.applicable_to}
                  onChange={(e) => setNewPromo({ ...newPromo, applicable_to: e.target.value as PromoCode['applicable_to'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Users</option>
                  <option value="new_users">New Users Only</option>
                  <option value="specific_users">Specific Users</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Create Code
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

      {/* Details Modal */}
      {selectedPromo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Promo Code Details</h2>
              <button
                onClick={() => setSelectedPromo(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-lg text-center">
                <p className="font-mono text-2xl font-bold text-indigo-600">{selectedPromo.code}</p>
                <p className="text-sm text-indigo-700 mt-1">{formatValue(selectedPromo)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Redemptions</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedPromo.usage_count} / {selectedPromo.usage_limit || '∞'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Revenue Generated</p>
                  <p className="text-lg font-bold text-green-600">GH₵{selectedPromo.revenue_generated.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Avg Order Value</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">GH₵{selectedPromo.avg_order_value}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Status</p>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    selectedPromo.is_active && !isExpired(selectedPromo)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500 dark:text-gray-400'
                  }`}>
                    {selectedPromo.is_active && !isExpired(selectedPromo) ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Description</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedPromo.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Valid From</p>
                  <p className="text-sm text-gray-900 dark:text-white">{new Date(selectedPromo.valid_from).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Valid Until</p>
                  <p className="text-sm text-gray-900 dark:text-white">{new Date(selectedPromo.valid_until).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Created By</p>
                <p className="text-sm text-gray-900 dark:text-white">{selectedPromo.created_by}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Edit Code
              </button>
              <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
