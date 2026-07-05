'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Note: useQuery is still used for UserDetailsModal
import {
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Calendar,
  X,
  Loader2,
  BookOpen,
  RefreshCw,
  Shield,
  Star,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

interface User {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  phone_number: string;
  city?: string;
  region?: string;
  address?: string;
  bio?: string;
  profile_picture?: string;
  is_active: boolean;
  is_banned?: boolean;
  is_verified: boolean;
  email_verified?: boolean;
  phone_verified?: boolean;
  ghana_card_verified?: boolean;
  subscription_tier?: string;
  rating?: number;
  total_ratings?: number;
  roles?: string[];
  created_at: string;
  last_login_at?: string;
  listings_count?: number;
  exchanges_count?: number;
  total_exchanges?: number;
}

interface PaginatedResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const LIMIT_OPTIONS = [10, 25, 50, 100] as const;

// Action Menu Component for table rows
function UserActionMenu({ user, onAction }: { user: User; onAction: (action: string, user: User) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-1.5 text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-muted-foreground hover:bg-[#F1ECE3] dark:hover:bg-[#2a2118] rounded-lg"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMenuOpen(false)}
          ></div>
          <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#2a2118] rounded-lg shadow-lg z-20 py-1">
            <button
              onClick={() => {
                onAction('view', user);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-[#F1ECE3] dark:hover:bg-[#33291f]"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
            <button
              onClick={() => {
                onAction('edit', user);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-[#F1ECE3] dark:hover:bg-[#33291f]"
            >
              <Edit className="w-4 h-4" />
              Edit User
            </button>
            <button
              onClick={() => {
                onAction(user.is_active ? 'ban' : 'unban', user);
                setMenuOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[#F1ECE3] dark:hover:bg-[#33291f] ${
                user.is_active
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              {user.is_active ? (
                <>
                  <Ban className="w-4 h-4" />
                  Ban User
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  Unban User
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ isActive, isVerified }: { isActive: boolean; isVerified: boolean }) {
  if (!isActive) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
        <XCircle className="w-3 h-3" />
        Banned
      </span>
    );
  }
  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
        <CheckCircle className="w-3 h-3" />
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F1ECE3] dark:bg-[#2a2118] text-foreground text-xs font-medium rounded-full">
      Unverified
    </span>
  );
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<typeof LIMIT_OPTIONS[number]>(10);

  // Mock users data - Backend admin endpoints not yet implemented
  // TODO: Replace with real API calls when admin user list endpoint is available
  const mockUsers: User[] = [
    {
      id: '1',
      first_name: 'Kwame',
      last_name: 'Mensah',
      email: 'kwame.mensah@example.com',
      phone_number: '+233244123456',
      city: 'Bolgatanga',
      region: 'Upper East',
      is_active: true,
      is_verified: true,
      roles: ['user'],
      created_at: '2025-01-15T10:30:00Z',
      listings_count: 5,
      exchanges_count: 3,
    },
    {
      id: '2',
      first_name: 'Ama',
      last_name: 'Darko',
      email: 'ama.darko@example.com',
      phone_number: '+233244234567',
      city: 'Sumbrungu',
      region: 'Upper East',
      is_active: true,
      is_verified: false,
      created_at: '2025-01-20T14:20:00Z',
      listings_count: 2,
      exchanges_count: 0,
    },
    {
      id: '3',
      first_name: 'Kofi',
      last_name: 'Asante',
      email: 'kofi.asante@example.com',
      phone_number: '+233244345678',
      city: 'Bolgatanga',
      region: 'Upper East',
      is_active: false,
      is_verified: true,
      roles: ['user'],
      created_at: '2025-01-10T08:15:00Z',
      listings_count: 8,
      exchanges_count: 12,
    },
    {
      id: '4',
      first_name: 'Akua',
      last_name: 'Boateng',
      email: 'akua.boateng@example.com',
      phone_number: '+233244456789',
      city: 'Navrongo',
      region: 'Upper East',
      is_active: true,
      is_verified: true,
      roles: ['user'],
      created_at: '2025-01-18T09:00:00Z',
      listings_count: 12,
      exchanges_count: 8,
    },
    {
      id: '5',
      first_name: 'Yaw',
      last_name: 'Agyei',
      email: 'yaw.agyei@example.com',
      phone_number: '+233244567890',
      city: 'Bawku',
      region: 'Upper East',
      is_active: true,
      is_verified: false,
      created_at: '2025-01-22T11:30:00Z',
      listings_count: 3,
      exchanges_count: 1,
    },
  ];

  // Filter mock data based on filters
  const filteredUsers = mockUsers.filter((user) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone_number.includes(query);
      if (!matchesSearch) return false;
    }
    if (filterStatus === 'active' && !user.is_active) return false;
    if (filterStatus === 'inactive' && user.is_active) return false;
    if (filterVerified === 'verified' && !user.is_verified) return false;
    if (filterVerified === 'unverified' && user.is_verified) return false;
    return true;
  });

  // Paginate
  const totalFiltered = filteredUsers.length;
  const totalPages = Math.ceil(totalFiltered / limit);
  const startIndex = (page - 1) * limit;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limit);

  const paginatedData: PaginatedResponse = {
    data: paginatedUsers,
    meta: {
      total: totalFiltered,
      page,
      limit,
      totalPages,
    },
  };

  const isLoading = false;
  const refetch = () => {};

  // Extract data and meta from paginated response
  const users = paginatedData?.data || [];
  const meta = paginatedData?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };

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

  const handleUserAction = async (action: string, user: User) => {
    try {
      switch (action) {
        case 'view':
          setSelectedUser(user);
          setShowViewModal(true);
          break;

        case 'edit':
          setSelectedUser(user);
          setShowEditModal(true);
          break;

        case 'ban':
          await apiClient.patch(`/users/${user.id}/ban`);
          toast.success(`${user.first_name} ${user.last_name} has been banned`);
          refetch();
          break;

        case 'unban':
          await apiClient.patch(`/users/${user.id}/unban`);
          toast.success(`${user.first_name} ${user.last_name} has been unbanned`);
          refetch();
          break;
      }
    } catch (error: any) {
      console.error('Action failed:', error);
      toast.error(error.response?.data?.message || 'Action failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Users Management
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage all users on the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Users
              </p>
              <p className="text-2xl font-bold text-foreground">
                {meta.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-foreground">
                {users.filter((u) => u.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Verified
              </p>
              <p className="text-2xl font-bold text-foreground">
                {users.filter((u) => u.is_verified).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Banned</p>
              <p className="text-2xl font-bold text-foreground">
                {users.filter((u) => !u.is_active).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E4DED2] dark:border-[#33291f] rounded-lg bg-white dark:bg-[#2a2118] text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange(setFilterStatus, e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 border border-[#E4DED2] dark:border-[#33291f] rounded-lg bg-white dark:bg-[#2a2118] text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Verified filter */}
          <select
            value={filterVerified}
            onChange={(e) => handleFilterChange(setFilterVerified, e.target.value as 'all' | 'verified' | 'unverified')}
            className="px-4 py-2 border border-[#E4DED2] dark:border-[#33291f] rounded-lg bg-white dark:bg-[#2a2118] text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Verification</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      ) : users && users.length > 0 ? (
        <div className="bg-white dark:bg-[#241c16] rounded-lg shadow overflow-hidden">
          {/* Table Header with Limit Selector */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#ECE6DC] dark:border-[#33291f] bg-background dark:bg-[#2a2118]/50">
            <div className="flex items-center gap-2">
              <label htmlFor="limit" className="text-sm text-muted-foreground">
                Show:
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value) as typeof LIMIT_OPTIONS[number])}
                className="px-2 py-1 text-sm border border-[#E4DED2] dark:border-[#33291f] rounded-lg bg-white dark:bg-[#2a2118] text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {LIMIT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background dark:bg-[#2a2118]/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground dark:text-foreground uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground dark:text-foreground uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground dark:text-foreground uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground dark:text-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground dark:text-foreground uppercase tracking-wider">
                    Listings
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground dark:text-foreground uppercase tracking-wider">
                    Exchanges
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground dark:text-foreground uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground dark:text-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE6DC] dark:divide-[#33291f]">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-background dark:hover:bg-[#2a2118]/30 transition-colors"
                  >
                    {/* User Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {user.first_name?.[0]}
                          {user.last_name?.[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">
                              {user.first_name} {user.last_name}
                            </p>
                            {user.roles && user.roles.length > 0 && user.roles.includes('admin') && (
                              <span className="px-1.5 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded">
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[180px]">{user.email}</span>
                        </div>
                        {user.phone_number && (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" />
                            {user.phone_number}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.city ? (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          {user.city}{user.region && `, ${user.region}`}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground dark:text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge isActive={user.is_active} isVerified={user.is_verified} />
                    </td>

                    {/* Listings */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-foreground">
                        {user.listings_count || 0}
                      </span>
                    </td>

                    {/* Exchanges */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-foreground">
                        {user.exchanges_count || 0}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <UserActionMenu user={user} onAction={handleUserAction} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#ECE6DC] dark:border-[#33291f] bg-background dark:bg-[#2a2118]/50">
            {/* Results info - left */}
            <div className="text-sm text-muted-foreground">
              Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
            </div>

            {/* Page navigation - right */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={meta.page === 1}
                className="p-2 text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-muted-foreground hover:bg-[#F1ECE3] dark:hover:bg-[#33291f] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title="First page"
              >
                <ChevronsLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.page === 1}
                className="p-2 text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-muted-foreground hover:bg-[#F1ECE3] dark:hover:bg-[#33291f] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
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
                      <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground dark:text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum as number)}
                        className={`min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg transition-colors ${
                          meta.page === pageNum
                            ? 'bg-primary text-white'
                            : 'text-muted-foreground hover:bg-[#F1ECE3] dark:hover:bg-[#33291f]'
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
                className="p-2 text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-muted-foreground hover:bg-[#F1ECE3] dark:hover:bg-[#33291f] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setPage(meta.totalPages)}
                disabled={meta.page === meta.totalPages}
                className="p-2 text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-muted-foreground hover:bg-[#F1ECE3] dark:hover:bg-[#33291f] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title="Last page"
              >
                <ChevronsRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-12 text-center">
          <UserX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No users found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* User Details Modal */}
      {showViewModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowViewModal(false);
            setSelectedUser(null);
          }}
          onEdit={() => {
            setShowViewModal(false);
            setShowEditModal(true);
          }}
          onBanToggle={async () => {
            await handleUserAction(selectedUser.is_active ? 'ban' : 'unban', selectedUser);
            setShowViewModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

// User Details Modal Component
function UserDetailsModal({
  user,
  onClose,
  onEdit,
  onBanToggle,
}: {
  user: User;
  onClose: () => void;
  onEdit: () => void;
  onBanToggle: () => void;
}) {
  // Fetch detailed user info
  const { data: userDetails, isLoading } = useQuery({
    queryKey: ['user-details', user.id],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/users/${user.id}`);
        return response.data.result || response.data;
      } catch (error) {
        // Return the basic user data if API fails
        return user;
      }
    },
  });

  const displayUser = userDetails || user;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#241c16] rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#ECE6DC] dark:border-[#33291f] sticky top-0 bg-white dark:bg-[#241c16] z-10">
          <h2 className="text-xl font-bold text-foreground">
            User Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-muted-foreground hover:bg-[#F1ECE3] dark:hover:bg-[#2a2118] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Profile Header */}
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {displayUser.profile_picture ? (
                  <img
                    src={displayUser.profile_picture}
                    alt={displayUser.first_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <>
                    {displayUser.first_name?.[0]}
                    {displayUser.last_name?.[0]}
                  </>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-2xl font-bold text-foreground">
                    {displayUser.first_name} {displayUser.middle_name || ''} {displayUser.last_name}
                  </h3>
                  {displayUser.is_verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                  {!displayUser.is_active && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
                      <XCircle className="w-3 h-3" />
                      Banned
                    </span>
                  )}
                </div>

                {displayUser.bio && (
                  <p className="text-muted-foreground mt-2">
                    {displayUser.bio}
                  </p>
                )}

                {/* Roles */}
                {displayUser.roles && displayUser.roles.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    {displayUser.roles.map((role: string) => (
                      <span
                        key={role}
                        className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background dark:bg-[#2a2118]/50 rounded-lg p-4 text-center">
                <BookOpen className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  {displayUser.listings_count || 0}
                </p>
                <p className="text-xs text-muted-foreground">Listings</p>
              </div>
              <div className="bg-background dark:bg-[#2a2118]/50 rounded-lg p-4 text-center">
                <RefreshCw className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  {displayUser.total_exchanges || displayUser.exchanges_count || 0}
                </p>
                <p className="text-xs text-muted-foreground">Exchanges</p>
              </div>
              <div className="bg-background dark:bg-[#2a2118]/50 rounded-lg p-4 text-center">
                <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  {displayUser.rating?.toFixed(1) || 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Rating ({displayUser.total_ratings || 0})
                </p>
              </div>
              <div className="bg-background dark:bg-[#2a2118]/50 rounded-lg p-4 text-center">
                <Shield className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground capitalize">
                  {displayUser.subscription_tier || 'Free'}
                </p>
                <p className="text-xs text-muted-foreground">Plan</p>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                Contact Information
              </h4>
              <div className="bg-background dark:bg-[#2a2118]/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{displayUser.email}</p>
                    {displayUser.email_verified && (
                      <span className="text-xs text-green-600 dark:text-green-400">Verified</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{displayUser.phone_number}</p>
                    {displayUser.phone_verified && (
                      <span className="text-xs text-green-600 dark:text-green-400">Verified</span>
                    )}
                  </div>
                </div>
                {(displayUser.city || displayUser.address) && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
                    <p className="text-sm text-foreground">
                      {displayUser.address && `${displayUser.address}, `}
                      {displayUser.city}
                      {displayUser.region && `, ${displayUser.region}`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Status */}
            <div>
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                Verification Status
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className={`rounded-lg p-3 text-center ${
                  displayUser.email_verified
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-background dark:bg-[#2a2118]/50'
                }`}>
                  <Mail className={`w-5 h-5 mx-auto mb-1 ${
                    displayUser.email_verified ? 'text-green-500' : 'text-muted-foreground dark:text-muted-foreground'
                  }`} />
                  <p className="text-xs font-medium text-foreground">Email</p>
                  <p className={`text-xs ${
                    displayUser.email_verified
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-muted-foreground'
                  }`}>
                    {displayUser.email_verified ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
                <div className={`rounded-lg p-3 text-center ${
                  displayUser.phone_verified
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-background dark:bg-[#2a2118]/50'
                }`}>
                  <Phone className={`w-5 h-5 mx-auto mb-1 ${
                    displayUser.phone_verified ? 'text-green-500' : 'text-muted-foreground dark:text-muted-foreground'
                  }`} />
                  <p className="text-xs font-medium text-foreground">Phone</p>
                  <p className={`text-xs ${
                    displayUser.phone_verified
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-muted-foreground'
                  }`}>
                    {displayUser.phone_verified ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
                <div className={`rounded-lg p-3 text-center ${
                  displayUser.ghana_card_verified
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-background dark:bg-[#2a2118]/50'
                }`}>
                  <Shield className={`w-5 h-5 mx-auto mb-1 ${
                    displayUser.ghana_card_verified ? 'text-green-500' : 'text-muted-foreground dark:text-muted-foreground'
                  }`} />
                  <p className="text-xs font-medium text-foreground">Ghana Card</p>
                  <p className={`text-xs ${
                    displayUser.ghana_card_verified
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-muted-foreground'
                  }`}>
                    {displayUser.ghana_card_verified ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Activity */}
            <div>
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                Account Activity
              </h4>
              <div className="bg-background dark:bg-[#2a2118]/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Member Since
                  </span>
                  <span className="text-foreground">
                    {new Date(displayUser.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {displayUser.last_login_at && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Last Login
                    </span>
                    <span className="text-foreground">
                      {new Date(displayUser.last_login_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#ECE6DC] dark:border-[#33291f]">
              <button
                onClick={onBanToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  displayUser.is_active
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                    : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                }`}
              >
                {displayUser.is_active ? (
                  <>
                    <Ban className="w-4 h-4" />
                    Ban User
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Unban User
                  </>
                )}
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-foreground bg-white dark:bg-[#2a2118] border border-[#E4DED2] dark:border-[#33291f] rounded-lg hover:bg-background dark:hover:bg-[#33291f] transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all"
                >
                  <Edit className="w-4 h-4" />
                  Edit User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({
  user,
  onClose,
  onSuccess,
}: {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    middle_name: user.middle_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    phone_number: user.phone_number || '',
    city: user.city || '',
    region: user.region || '',
    bio: user.bio || '',
    is_active: user.is_active,
    email_verified: user.email_verified || false,
    phone_verified: user.phone_verified || false,
    ghana_card_verified: user.ghana_card_verified || false,
  });

  const ghanaRegions = [
    'Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern',
    'Greater Accra', 'North East', 'Northern', 'Oti', 'Savannah',
    'Upper East', 'Upper West', 'Volta', 'Western', 'Western North',
  ];

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiClient.patch(`/users/${user.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-details', user.id] });
      toast.success('User updated successfully!');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#241c16] rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#ECE6DC] dark:border-[#33291f] sticky top-0 bg-white dark:bg-[#241c16] z-10">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Edit User
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Update user information
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-muted-foreground hover:bg-[#F1ECE3] dark:hover:bg-[#2a2118] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#E4DED2] dark:border-[#33291f] rounded-lg bg-white dark:bg-[#2a2118] text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Middle Name
              </label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#E4DED2] dark:border-[#33291f] rounded-lg bg-white dark:bg-[#2a2118] text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#E4DED2] dark:border-[#33291f] rounded-lg bg-white dark:bg-[#2a2118] text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#E4DED2] dark:border-[#33291f] rounded-lg bg-white dark:bg-[#2a2118] text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#E4DED2] dark:border-[#33291f] rounded-lg bg-white dark:bg-[#2a2118] text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Location Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#E4DED2] dark:border-[#33291f] rounded-lg bg-white dark:bg-[#2a2118] text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Region
              </label>
              <select
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#E4DED2] dark:border-[#33291f] rounded-lg bg-white dark:bg-[#2a2118] text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Region</option>
                {ghanaRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-[#E4DED2] dark:border-[#33291f] rounded-lg bg-white dark:bg-[#2a2118] text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Verification Toggles */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Verification Status
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="email_verified"
                  checked={formData.email_verified}
                  onChange={handleChange}
                  className="w-4 h-4 text-amber-500 border-[#E4DED2] rounded focus:ring-primary"
                />
                <span className="text-sm text-foreground">
                  Email Verified
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="phone_verified"
                  checked={formData.phone_verified}
                  onChange={handleChange}
                  className="w-4 h-4 text-amber-500 border-[#E4DED2] rounded focus:ring-primary"
                />
                <span className="text-sm text-foreground">
                  Phone Verified
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="ghana_card_verified"
                  checked={formData.ghana_card_verified}
                  onChange={handleChange}
                  className="w-4 h-4 text-amber-500 border-[#E4DED2] rounded focus:ring-primary"
                />
                <span className="text-sm text-foreground">
                  Ghana Card Verified
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 text-amber-500 border-[#E4DED2] rounded focus:ring-primary"
                />
                <span className="text-sm text-foreground">
                  Account Active
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ECE6DC] dark:border-[#33291f]">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="px-4 py-2 text-foreground bg-white dark:bg-[#2a2118] border border-[#E4DED2] dark:border-[#33291f] rounded-lg hover:bg-background dark:hover:bg-[#33291f] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
