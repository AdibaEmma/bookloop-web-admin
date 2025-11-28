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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { Payout } from '@/types/admin';

// Extended Payout with additional fields
interface PayoutWithDetails extends Payout {
  transaction_fee: number;
  net_amount: number;
}

// Mock Data
const mockPayouts: PayoutWithDetails[] = [
  {
    id: 'pay-1',
    user_id: 'u1',
    user: { id: 'u1', email: 'kwame.mensah@gmail.com', first_name: 'Kwame', last_name: 'Mensah', is_active: true, is_verified: true, created_at: '2023-06-15' },
    amount: 245,
    currency: 'GH₵',
    status: 'pending',
    method: 'momo',
    account_details: { provider: 'MTN', account_number: '024XXXXXXX', account_name: 'Kwame Mensah' },
    created_at: '2024-06-02T10:30:00Z',
    transaction_fee: 2.45,
    net_amount: 242.55,
  },
  {
    id: 'pay-2',
    user_id: 'u2',
    user: { id: 'u2', email: 'ama.darko@yahoo.com', first_name: 'Ama', last_name: 'Darko', is_active: true, is_verified: true, created_at: '2023-09-20' },
    amount: 180,
    currency: 'GH₵',
    status: 'processing',
    method: 'momo',
    account_details: { provider: 'Vodafone', account_number: '020XXXXXXX', account_name: 'Ama Darko' },
    created_at: '2024-06-02T09:15:00Z',
    transaction_fee: 1.80,
    net_amount: 178.20,
  },
  {
    id: 'pay-3',
    user_id: 'u3',
    user: { id: 'u3', email: 'kofi.asante@outlook.com', first_name: 'Kofi', last_name: 'Asante', is_active: true, is_verified: true, created_at: '2024-01-10' },
    amount: 520,
    currency: 'GH₵',
    status: 'completed',
    method: 'bank_transfer',
    account_details: { account_number: '00123456789', account_name: 'Kofi Asante' },
    reference: 'TXN-123456',
    created_at: '2024-06-01T14:00:00Z',
    processed_at: '2024-06-01T15:30:00Z',
    transaction_fee: 5.20,
    net_amount: 514.80,
  },
  {
    id: 'pay-4',
    user_id: 'u4',
    user: { id: 'u4', email: 'efua.boateng@gmail.com', first_name: 'Efua', last_name: 'Boateng', is_active: true, is_verified: true, created_at: '2024-03-05' },
    amount: 85,
    currency: 'GH₵',
    status: 'failed',
    method: 'momo',
    account_details: { provider: 'AirtelTigo', account_number: '027XXXXXXX', account_name: 'Efua Boateng' },
    created_at: '2024-06-01T11:00:00Z',
    transaction_fee: 0.85,
    net_amount: 84.15,
  },
  {
    id: 'pay-5',
    user_id: 'u5',
    user: { id: 'u5', email: 'yaw.owusu@gmail.com', first_name: 'Yaw', last_name: 'Owusu', is_active: true, is_verified: true, created_at: '2023-11-20' },
    amount: 320,
    currency: 'GH₵',
    status: 'completed',
    method: 'momo',
    account_details: { provider: 'MTN', account_number: '024XXXXXXX', account_name: 'Yaw Owusu' },
    reference: 'TXN-123457',
    created_at: '2024-05-31T16:00:00Z',
    processed_at: '2024-05-31T16:45:00Z',
    transaction_fee: 3.20,
    net_amount: 316.80,
  },
  {
    id: 'pay-6',
    user_id: 'u6',
    user: { id: 'u6', email: 'akua.mensah@hotmail.com', first_name: 'Akua', last_name: 'Mensah', is_active: true, is_verified: true, created_at: '2024-02-15' },
    amount: 150,
    currency: 'GH₵',
    status: 'pending',
    method: 'momo',
    account_details: { provider: 'MTN', account_number: '055XXXXXXX', account_name: 'Akua Mensah' },
    created_at: '2024-06-02T08:00:00Z',
    transaction_fee: 1.50,
    net_amount: 148.50,
  },
];

const payoutStats = {
  pending: { count: 12, amount: 2456 },
  processing: { count: 5, amount: 1234 },
  completed: { count: 156, amount: 45678 },
  failed: { count: 3, amount: 345 },
};

const monthlyPayouts = [
  { month: 'Jan', amount: 12450, count: 45 },
  { month: 'Feb', amount: 15670, count: 52 },
  { month: 'Mar', amount: 18900, count: 68 },
  { month: 'Apr', amount: 16540, count: 58 },
  { month: 'May', amount: 21300, count: 78 },
  { month: 'Jun', amount: 8450, count: 32 },
];

const methodDistribution = [
  { name: 'MTN MoMo', value: 65, color: '#ffc107' },
  { name: 'Vodafone Cash', value: 20, color: '#e91e63' },
  { name: 'AirtelTigo Money', value: 10, color: '#ff5722' },
  { name: 'Bank Transfer', value: 5, color: '#2196f3' },
];

export default function PayoutsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [selectedPayout, setSelectedPayout] = useState<PayoutWithDetails | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);

  const filteredPayouts = useMemo(() => {
    return mockPayouts.filter((payout) => {
      const matchesSearch =
        payout.user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payout.user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payout.user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || payout.status === filterStatus;
      const matchesMethod = filterMethod === 'all' || payout.method === filterMethod;
      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [searchQuery, filterStatus, filterMethod]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700 dark:text-gray-300';
    }
  };

  const handleProcess = (payout: PayoutWithDetails) => {
    setSelectedPayout(payout);
    setShowProcessModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payout Management</h1>
          <p className="text-gray-600 mt-1">
            Process and track user payouts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Process All Pending
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">Pending</p>
              <p className="text-2xl font-bold text-yellow-800 mt-1">{payoutStats.pending.count}</p>
              <p className="text-sm text-yellow-600">GH₵{payoutStats.pending.amount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Processing</p>
              <p className="text-2xl font-bold text-blue-800 mt-1">{payoutStats.processing.count}</p>
              <p className="text-sm text-blue-600">GH₵{payoutStats.processing.amount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Completed (MTD)</p>
              <p className="text-2xl font-bold text-green-800 mt-1">{payoutStats.completed.count}</p>
              <p className="text-sm text-green-600">GH₵{payoutStats.completed.amount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Failed</p>
              <p className="text-2xl font-bold text-red-800 mt-1">{payoutStats.failed.count}</p>
              <p className="text-sm text-red-600">GH₵{payoutStats.failed.amount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Monthly Payouts</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyPayouts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="amount" name="Amount (GH₵)" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="count" name="Count" stroke="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">By Payment Method</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={methodDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {methodDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {methodDistribution.map((method) => (
              <div key={method.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }} />
                  <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">{method.name}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{method.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Methods</option>
          <option value="momo">Mobile Money</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
      </div>

      {/* Payouts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Account</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPayouts.map((payout) => (
              <tr key={payout.id} className="hover:bg-gray-50 dark:bg-gray-900">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                      {payout.user.first_name[0]}{payout.user.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{payout.user.first_name} {payout.user.last_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{payout.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="font-semibold text-gray-900 dark:text-white">GH₵{payout.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Fee: GH₵{payout.transaction_fee}</p>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-700 capitalize">{payout.method.replace('_', ' ')}</span>
                  {payout.account_details.provider && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{payout.account_details.provider}</p>
                  )}
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{payout.account_details.account_number}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{payout.account_details.account_name}</p>
                </td>
                <td className="py-4 px-4">
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(payout.status)}`}>
                    {payout.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{new Date(payout.created_at).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{new Date(payout.created_at).toLocaleTimeString()}</p>
                </td>
                <td className="py-4 px-4">
                  {payout.status === 'pending' && (
                    <button
                      onClick={() => handleProcess(payout)}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                    >
                      Process
                    </button>
                  )}
                  {payout.status === 'failed' && (
                    <button
                      onClick={() => handleProcess(payout)}
                      className="px-3 py-1 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700"
                    >
                      Retry
                    </button>
                  )}
                  {payout.status === 'completed' && (
                    <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 dark:bg-gray-900">
                      Receipt
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Process Modal */}
      {showProcessModal && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Process Payout</h2>

            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Recipient</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedPayout.user.first_name} {selectedPayout.user.last_name}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Amount</span>
                <span className="font-bold text-gray-900 dark:text-white">GH₵{selectedPayout.amount}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Transaction Fee</span>
                <span className="text-gray-700 dark:text-gray-300">-GH₵{selectedPayout.transaction_fee}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Net Amount</span>
                <span className="font-bold text-green-600">GH₵{selectedPayout.net_amount}</span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {selectedPayout.method.replace('_', ' ')}
                  {selectedPayout.account_details.provider && ` (${selectedPayout.account_details.provider})`}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Account</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedPayout.account_details.account_number}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{selectedPayout.account_details.account_name}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowProcessModal(false)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Confirm & Process
              </button>
              <button
                onClick={() => setShowProcessModal(false)}
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
