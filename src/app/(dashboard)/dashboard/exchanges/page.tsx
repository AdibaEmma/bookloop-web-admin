'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  Calendar,
  AlertTriangle,
  Eye,
  Ban,
  MessageSquare,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface Exchange {
  id: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  exchange_type: 'swap' | 'purchase';
  initiator: {
    id: string;
    first_name: string;
    last_name: string;
  };
  recipient: {
    id: string;
    first_name: string;
    last_name: string;
  };
  initiator_listing: {
    id: string;
    book_title: string;
    book_author: string;
  };
  recipient_listing?: {
    id: string;
    book_title: string;
    book_author: string;
  };
  price?: number;
  meetup_spot?: {
    id: string;
    name: string;
    address: string;
  };
  scheduled_date?: string;
  completed_at?: string;
  cancelled_at?: string;
  dispute_reason?: string;
  created_at: string;
}

interface PaginatedResponse {
  data: Exchange[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const LIMIT_OPTIONS = [10, 25, 50, 100] as const;

function StatusBadge({ status }: { status: Exchange['status'] }) {
  const config = {
    pending: {
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
      icon: Clock,
    },
    confirmed: {
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
      icon: CheckCircle,
    },
    in_progress: {
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
      icon: RefreshCw,
    },
    completed: {
      color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
      icon: CheckCircle,
    },
    cancelled: {
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      icon: XCircle,
    },
    disputed: {
      color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
      icon: AlertTriangle,
    },
  };

  const { color, icon: Icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${color}`}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </span>
  );
}

// Action Menu Component for table rows
function ExchangeActionMenu({ exchange, onAction }: { exchange: Exchange; onAction: (action: string, exchange: Exchange) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMenuOpen(false)}
          ></div>
          <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-20 py-1">
            <button
              onClick={() => {
                onAction('view', exchange);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
            {exchange.status === 'disputed' && (
              <button
                onClick={() => {
                  onAction('resolve', exchange);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <CheckCircle className="w-4 h-4" />
                Resolve Dispute
              </button>
            )}
            <button
              onClick={() => {
                onAction('message', exchange);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <MessageSquare className="w-4 h-4" />
              Send Message
            </button>
            {!['completed', 'cancelled'].includes(exchange.status) && (
              <button
                onClick={() => {
                  onAction('cancel', exchange);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <Ban className="w-4 h-4" />
                Cancel Exchange
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Static mock data - Backend admin endpoints not yet implemented
// TODO: Replace with real API calls when admin endpoints are available
const mockExchanges: Exchange[] = [
  {
    id: '1a2b3c4d-5e6f-7g8h-9i0j',
    status: 'completed',
    exchange_type: 'swap',
    initiator: {
      id: '1',
      first_name: 'Kwame',
      last_name: 'Mensah',
    },
    recipient: {
      id: '2',
      first_name: 'Ama',
      last_name: 'Darko',
    },
    initiator_listing: {
      id: '1',
      book_title: 'Things Fall Apart',
      book_author: 'Chinua Achebe',
    },
    recipient_listing: {
      id: '2',
      book_title: 'Half of a Yellow Sun',
      book_author: 'Chimamanda Ngozi Adichie',
    },
    meetup_spot: {
      id: '1',
      name: 'Bolgatanga Central Library',
      address: 'Central Bolgatanga, Upper East Region',
    },
    scheduled_date: '2025-01-25T14:00:00Z',
    completed_at: '2025-01-25T14:30:00Z',
    created_at: '2025-01-20T10:30:00Z',
  },
  {
    id: '2b3c4d5e-6f7g-8h9i-0j1k',
    status: 'disputed',
    exchange_type: 'purchase',
    initiator: {
      id: '3',
      first_name: 'Kofi',
      last_name: 'Asante',
    },
    recipient: {
      id: '4',
      first_name: 'Akua',
      last_name: 'Boateng',
    },
    initiator_listing: {
      id: '3',
      book_title: 'The Beautyful Ones Are Not Yet Born',
      book_author: 'Ayi Kwei Armah',
    },
    price: 25,
    meetup_spot: {
      id: '2',
      name: 'Sumbrungu Community Center',
      address: 'Sumbrungu, Upper East Region',
    },
    scheduled_date: '2025-01-22T16:00:00Z',
    dispute_reason: 'Book condition does not match description',
    created_at: '2025-01-18T08:15:00Z',
  },
  {
    id: '3c4d5e6f-7g8h-9i0j-1k2l',
    status: 'in_progress',
    exchange_type: 'swap',
    initiator: {
      id: '5',
      first_name: 'Yaw',
      last_name: 'Agyei',
    },
    recipient: {
      id: '6',
      first_name: 'Efua',
      last_name: 'Owusu',
    },
    initiator_listing: {
      id: '4',
      book_title: 'Americanah',
      book_author: 'Chimamanda Ngozi Adichie',
    },
    recipient_listing: {
      id: '5',
      book_title: 'Purple Hibiscus',
      book_author: 'Chimamanda Ngozi Adichie',
    },
    meetup_spot: {
      id: '3',
      name: 'Bolgatanga Market Square',
      address: 'Market Area, Bolgatanga',
    },
    scheduled_date: '2025-01-24T10:00:00Z',
    created_at: '2025-01-22T14:20:00Z',
  },
  {
    id: '4d5e6f7g-8h9i-0j1k-2l3m',
    status: 'pending',
    exchange_type: 'swap',
    initiator: {
      id: '7',
      first_name: 'Abena',
      last_name: 'Osei',
    },
    recipient: {
      id: '8',
      first_name: 'Kwesi',
      last_name: 'Amankwah',
    },
    initiator_listing: {
      id: '6',
      book_title: 'No Longer at Ease',
      book_author: 'Chinua Achebe',
    },
    recipient_listing: {
      id: '7',
      book_title: 'The Joys of Motherhood',
      book_author: 'Buchi Emecheta',
    },
    created_at: '2025-01-26T09:00:00Z',
  },
  {
    id: '5e6f7g8h-9i0j-1k2l-3m4n',
    status: 'confirmed',
    exchange_type: 'purchase',
    initiator: {
      id: '9',
      first_name: 'Adjoa',
      last_name: 'Mensah',
    },
    recipient: {
      id: '10',
      first_name: 'Kojo',
      last_name: 'Annan',
    },
    initiator_listing: {
      id: '8',
      book_title: 'Homegoing',
      book_author: 'Yaa Gyasi',
    },
    price: 35,
    meetup_spot: {
      id: '1',
      name: 'Bolgatanga Central Library',
      address: 'Central Bolgatanga, Upper East Region',
    },
    scheduled_date: '2025-01-28T11:00:00Z',
    created_at: '2025-01-25T15:30:00Z',
  },
  {
    id: '6f7g8h9i-0j1k-2l3m-4n5o',
    status: 'cancelled',
    exchange_type: 'swap',
    initiator: {
      id: '11',
      first_name: 'Esi',
      last_name: 'Adjei',
    },
    recipient: {
      id: '12',
      first_name: 'Fiifi',
      last_name: 'Boateng',
    },
    initiator_listing: {
      id: '9',
      book_title: 'Ghana Must Go',
      book_author: 'Taiye Selasi',
    },
    recipient_listing: {
      id: '10',
      book_title: 'We Need New Names',
      book_author: 'NoViolet Bulawayo',
    },
    cancelled_at: '2025-01-23T10:00:00Z',
    created_at: '2025-01-21T08:00:00Z',
  },
];

export default function ExchangesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<Exchange['status'] | 'all'>('all');
  const [filterType, setFilterType] = useState<'all' | 'swap' | 'purchase'>('all');

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<typeof LIMIT_OPTIONS[number]>(10);

  // No loading state needed for static data
  const isLoading = false;

  // Filter and paginate mock data
  const { exchanges, meta } = useMemo(() => {
    // Apply filters
    let filtered = mockExchanges.filter((exchange) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesId = exchange.id.toLowerCase().includes(query);
        const matchesInitiator = `${exchange.initiator.first_name} ${exchange.initiator.last_name}`.toLowerCase().includes(query);
        const matchesRecipient = `${exchange.recipient.first_name} ${exchange.recipient.last_name}`.toLowerCase().includes(query);
        const matchesBook = exchange.initiator_listing.book_title.toLowerCase().includes(query);
        if (!matchesId && !matchesInitiator && !matchesRecipient && !matchesBook) {
          return false;
        }
      }

      // Status filter
      if (filterStatus !== 'all' && exchange.status !== filterStatus) {
        return false;
      }

      // Type filter
      if (filterType !== 'all' && exchange.exchange_type !== filterType) {
        return false;
      }

      return true;
    });

    // Calculate pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedExchanges = filtered.slice(startIndex, startIndex + limit);

    return {
      exchanges: paginatedExchanges,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }, [searchQuery, filterStatus, filterType, page, limit]);

  // Reset to page 1 when filters change
  const handleFilterChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
    setter(value);
    setPage(1);
  };

  // Handle limit change
  const handleLimitChange = (newLimit: typeof LIMIT_OPTIONS[number]) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleExchangeAction = (action: string, exchange: Exchange) => {
    // TODO: Implement actual API calls when backend endpoints are available
    switch (action) {
      case 'view':
        toast.info(`Viewing details for Exchange #${exchange.id.slice(0, 8)}`);
        break;

      case 'resolve':
        toast.success('Dispute has been resolved (mock)');
        break;

      case 'message':
        toast.info('Message feature coming soon');
        break;

      case 'cancel':
        if (confirm('Are you sure you want to cancel this exchange?')) {
          toast.success('Exchange has been cancelled (mock)');
        }
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Exchanges Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Monitor and manage book exchanges on the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {meta.total}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {exchanges.filter((e) => e.status === 'pending').length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">Confirmed</p>
            <p className="text-2xl font-bold text-blue-600">
              {exchanges.filter((e) => e.status === 'confirmed').length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">In Progress</p>
            <p className="text-2xl font-bold text-purple-600">
              {exchanges.filter((e) => e.status === 'in_progress').length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {exchanges.filter((e) => e.status === 'completed').length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">Disputed</p>
            <p className="text-2xl font-bold text-red-600">
              {exchanges.filter((e) => e.status === 'disputed').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search exchanges by ID or participants..."
                value={searchQuery}
                onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange(setFilterStatus, e.target.value as Exchange['status'] | 'all')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="disputed">Disputed</option>
          </select>

          {/* Type filter */}
          <select
            value={filterType}
            onChange={(e) => handleFilterChange(setFilterType, e.target.value as 'all' | 'swap' | 'purchase')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Types</option>
            <option value="swap">Swap</option>
            <option value="purchase">Purchase</option>
          </select>
        </div>
      </div>

      {/* Exchanges Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      ) : exchanges && exchanges.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {/* Table Header with Limit Selector */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center gap-2">
              <label htmlFor="limit" className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                Show:
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value) as typeof LIMIT_OPTIONS[number])}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {LIMIT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">entries</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Exchange ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Initiator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Book Offered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Meetup
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {exchanges.map((exchange) => {
                  const isSwap = exchange.exchange_type === 'swap';
                  return (
                    <tr
                      key={exchange.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${exchange.status === 'disputed' ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                    >
                      {/* Exchange ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-gray-900 dark:text-white">
                            #{exchange.id.slice(0, 8)}
                          </span>
                          {exchange.status === 'disputed' && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${
                          isSwap
                            ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                            : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        }`}>
                          <RefreshCw className="w-3 h-3" />
                          {isSwap ? 'Swap' : 'Purchase'}
                        </span>
                      </td>

                      {/* Initiator */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-semibold">
                            {exchange.initiator.first_name?.[0]}{exchange.initiator.last_name?.[0]}
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {exchange.initiator.first_name} {exchange.initiator.last_name}
                          </span>
                        </div>
                      </td>

                      {/* Recipient */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                            {exchange.recipient.first_name?.[0]}{exchange.recipient.last_name?.[0]}
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {exchange.recipient.first_name} {exchange.recipient.last_name}
                          </span>
                        </div>
                      </td>

                      {/* Book */}
                      <td className="px-6 py-4">
                        <div className="max-w-[180px]">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {exchange.initiator_listing.book_title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {exchange.initiator_listing.book_author}
                          </p>
                          {!isSwap && exchange.price && (
                            <p className="text-xs font-medium text-amber-600 mt-0.5">
                              GH₵{exchange.price}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={exchange.status} />
                      </td>

                      {/* Meetup */}
                      <td className="px-6 py-4">
                        {exchange.meetup_spot ? (
                          <div className="max-w-[150px]">
                            <p className="text-sm text-gray-900 dark:text-white truncate">
                              {exchange.meetup_spot.name}
                            </p>
                            {exchange.scheduled_date && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                                {new Date(exchange.scheduled_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                          {new Date(exchange.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <ExchangeActionMenu exchange={exchange} onAction={handleExchangeAction} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            {/* Results info - left */}
            <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
            </div>

            {/* Page navigation - right */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={meta.page === 1}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title="First page"
              >
                <ChevronsLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.page === 1}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1 px-2">
                {(() => {
                  const pages: (number | string)[] = [];
                  const totalPages = meta.totalPages;
                  const currentPage = meta.page;

                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    pages.push(1);
                    if (currentPage > 3) {
                      pages.push('...');
                    }
                    const start = Math.max(2, currentPage - 1);
                    const end = Math.min(totalPages - 1, currentPage + 1);
                    for (let i = start; i <= end; i++) {
                      if (!pages.includes(i)) {
                        pages.push(i);
                      }
                    }
                    if (currentPage < totalPages - 2) {
                      pages.push('...');
                    }
                    if (!pages.includes(totalPages)) {
                      pages.push(totalPages);
                    }
                  }

                  return pages.map((pageNum, idx) =>
                    pageNum === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
                        ...
                      </span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum as number)}
                        className={`min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg transition-colors ${
                          meta.page === pageNum
                            ? 'bg-amber-500 text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  );
                })()}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={meta.page === meta.totalPages}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setPage(meta.totalPages)}
                disabled={meta.page === meta.totalPages}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title="Last page"
              >
                <ChevronsRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No exchanges found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
