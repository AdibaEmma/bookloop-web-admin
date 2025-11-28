'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CustomTooltip, useChartColors } from '@/components/charts/ChartComponents';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: 'momo' | 'card' | 'cash';
  exchange_id: string;
  payer: {
    id: string;
    first_name: string;
    last_name: string;
  };
  payee: {
    id: string;
    first_name: string;
    last_name: string;
  };
  transaction_reference?: string;
  created_at: string;
  completed_at?: string;
}

function StatusBadge({ status }: { status: Payment['status'] }) {
  const config = {
    pending: {
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
      icon: Clock,
    },
    completed: {
      color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
      icon: CheckCircle,
    },
    failed: {
      color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
      icon: XCircle,
    },
    refunded: {
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      icon: ArrowDownRight,
    },
  };

  const { color, icon: Icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${color}`}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function PaymentMethodBadge({ method }: { method: Payment['payment_method'] }) {
  const config = {
    momo: { label: 'Mobile Money', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' },
    card: { label: 'Card', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' },
    cash: { label: 'Cash', color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' },
  };

  const { label, color } = config[method];

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${color}`}>
      {label}
    </span>
  );
}

function PaymentRow({ payment, onView }: { payment: Payment; onView: (payment: Payment) => void }) {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="px-6 py-4">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            #{payment.id.slice(0, 8)}
          </p>
          {payment.transaction_reference && (
            <p className="text-xs text-gray-500 dark:text-gray-500 dark:text-gray-400">
              Ref: {payment.transaction_reference}
            </p>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-900 dark:text-white">
          {payment.payer.first_name} {payment.payer.last_name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 dark:text-gray-400">
          → {payment.payee.first_name} {payment.payee.last_name}
        </p>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {payment.currency} {payment.amount.toFixed(2)}
        </p>
      </td>
      <td className="px-6 py-4">
        <PaymentMethodBadge method={payment.payment_method} />
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={payment.status} />
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(payment.created_at).toLocaleDateString()}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 dark:text-gray-400">
          {new Date(payment.created_at).toLocaleTimeString()}
        </p>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => onView(payment)}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <Eye className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
}

// Static mock data - Backend admin endpoints not yet implemented
// TODO: Replace with real API calls when admin endpoints are available
const mockPayments: Payment[] = [
  {
    id: '1a2b3c4d-5e6f',
    amount: 35.0,
    currency: 'GH₵',
    status: 'completed',
    payment_method: 'momo',
    exchange_id: 'ex-123',
    payer: { id: '1', first_name: 'Kwame', last_name: 'Mensah' },
    payee: { id: '2', first_name: 'Ama', last_name: 'Darko' },
    transaction_reference: 'TXN-2025-001234',
    created_at: '2025-01-23T14:30:00Z',
    completed_at: '2025-01-23T14:31:00Z',
  },
  {
    id: '2b3c4d5e-6f7g',
    amount: 25.0,
    currency: 'GH₵',
    status: 'pending',
    payment_method: 'card',
    exchange_id: 'ex-124',
    payer: { id: '3', first_name: 'Kofi', last_name: 'Asante' },
    payee: { id: '4', first_name: 'Akua', last_name: 'Boateng' },
    created_at: '2025-01-23T16:00:00Z',
  },
  {
    id: '3c4d5e6f-7g8h',
    amount: 40.0,
    currency: 'GH₵',
    status: 'completed',
    payment_method: 'cash',
    exchange_id: 'ex-125',
    payer: { id: '5', first_name: 'Yaw', last_name: 'Agyei' },
    payee: { id: '6', first_name: 'Efua', last_name: 'Owusu' },
    transaction_reference: 'TXN-2025-001235',
    created_at: '2025-01-22T10:00:00Z',
    completed_at: '2025-01-22T10:05:00Z',
  },
  {
    id: '4d5e6f7g-8h9i',
    amount: 50.0,
    currency: 'GH₵',
    status: 'completed',
    payment_method: 'momo',
    exchange_id: 'ex-126',
    payer: { id: '7', first_name: 'Abena', last_name: 'Osei' },
    payee: { id: '8', first_name: 'Kwesi', last_name: 'Amankwah' },
    transaction_reference: 'TXN-2025-001236',
    created_at: '2025-01-21T09:00:00Z',
    completed_at: '2025-01-21T09:02:00Z',
  },
  {
    id: '5e6f7g8h-9i0j',
    amount: 30.0,
    currency: 'GH₵',
    status: 'failed',
    payment_method: 'card',
    exchange_id: 'ex-127',
    payer: { id: '9', first_name: 'Adjoa', last_name: 'Mensah' },
    payee: { id: '10', first_name: 'Kojo', last_name: 'Annan' },
    created_at: '2025-01-20T15:00:00Z',
  },
  {
    id: '6f7g8h9i-0j1k',
    amount: 45.0,
    currency: 'GH₵',
    status: 'refunded',
    payment_method: 'momo',
    exchange_id: 'ex-128',
    payer: { id: '11', first_name: 'Esi', last_name: 'Adjei' },
    payee: { id: '12', first_name: 'Fiifi', last_name: 'Boateng' },
    transaction_reference: 'TXN-2025-001237',
    created_at: '2025-01-19T11:00:00Z',
    completed_at: '2025-01-19T11:01:00Z',
  },
];

const mockStats = {
  totalRevenue: 12450,
  revenueGrowth: '+23.1%',
  totalTransactions: 342,
  transactionGrowth: '+15.2%',
  averageTransaction: 36.4,
  completedTransactions: 298,
};

// Mock revenue chart data
const revenueData = [
  { month: 'Jan', revenue: 8500 },
  { month: 'Feb', revenue: 9200 },
  { month: 'Mar', revenue: 10500 },
  { month: 'Apr', revenue: 11200 },
  { month: 'May', revenue: 11800 },
  { month: 'Jun', revenue: 12450 },
];

// Mock payment methods chart data
const paymentMethodsData = [
  { method: 'MoMo', count: 180 },
  { method: 'Card', count: 95 },
  { method: 'Cash', count: 67 },
];

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<Payment['status'] | 'all'>('all');
  const [filterMethod, setFilterMethod] = useState<Payment['payment_method'] | 'all'>('all');

  // Use static mock data - no loading state needed
  const stats = mockStats;
  const isLoading = false;

  // Filter payments using useMemo
  const filteredPayments = useMemo(() => {
    return mockPayments.filter((payment) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesId = payment.id.toLowerCase().includes(query);
        const matchesRef = payment.transaction_reference?.toLowerCase().includes(query);
        const matchesPayer = `${payment.payer.first_name} ${payment.payer.last_name}`.toLowerCase().includes(query);
        const matchesPayee = `${payment.payee.first_name} ${payment.payee.last_name}`.toLowerCase().includes(query);
        if (!matchesId && !matchesRef && !matchesPayer && !matchesPayee) {
          return false;
        }
      }

      // Status filter
      if (filterStatus !== 'all' && payment.status !== filterStatus) return false;

      // Method filter
      if (filterMethod !== 'all' && payment.payment_method !== filterMethod) return false;

      return true;
    });
  }, [searchQuery, filterStatus, filterMethod]);

  const handleViewPayment = (payment: Payment) => {
    toast.info(`Viewing payment #${payment.id.slice(0, 8)}`);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Payments & Revenue
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor transactions and platform revenue
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all">
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Revenue
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                GH₵{stats?.totalRevenue?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-500">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUpRight className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium ml-1 text-green-600">
              {stats?.revenueGrowth || '0%'}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
              vs last month
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Transactions
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats?.totalTransactions?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-500">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUpRight className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium ml-1 text-green-600">
              {stats?.transactionGrowth || '0%'}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
              vs last month
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg. Transaction
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                GH₵{stats?.averageTransaction?.toFixed(2) || '0'}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-500">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Based on {stats?.completedTransactions || 0} completed
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Success Rate
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats?.completedTransactions && stats?.totalTransactions
                  ? ((stats.completedTransactions / stats.totalTransactions) * 100).toFixed(1)
                  : '0'}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-amber-500">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {stats?.completedTransactions || 0} of {stats?.totalTransactions || 0} successful
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue trend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payment methods */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Payment Methods
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={paymentMethodsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="method" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search by transaction ID or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Method filter */}
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Methods</option>
            <option value="momo">Mobile Money</option>
            <option value="card">Card</option>
            <option value="cash">Cash</option>
          </select>
        </div>
      </div>

      {/* Payments table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
          ) : filteredPayments && filteredPayments.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Parties
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <PaymentRow
                    key={payment.id}
                    payment={payment}
                    onView={handleViewPayment}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No payments found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
