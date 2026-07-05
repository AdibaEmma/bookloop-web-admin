'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  BookOpen,
  CheckCircle,
  XCircle,
  Flag,
  Eye,
  Trash2,
  MapPin,
  User,
  Calendar,
  Filter,
  MoreVertical,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Heart,
  DollarSign,
  RefreshCw,
  Tag,
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

interface Listing {
  id: string;
  book_title: string;
  book_author: string;
  book_isbn?: string;
  book_condition: 'excellent' | 'good' | 'fair' | 'poor';
  book_category: string;
  description: string;
  is_active: boolean;
  is_approved: boolean;
  is_flagged: boolean;
  exchange_preference: 'swap' | 'sell' | 'both';
  price?: number;
  images?: string[];
  user: {
    id: string;
    first_name: string;
    last_name: string;
    city?: string;
  };
  created_at: string;
  views_count?: number;
  interested_count?: number;
}

interface PaginatedResponse {
  data: Listing[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const LIMIT_OPTIONS = [10, 25, 50, 100] as const;

function ConditionBadge({ condition }: { condition: string }) {
  const colors = {
    excellent: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    good: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    fair: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
    poor: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors[condition as keyof typeof colors] || colors.good}`}>
      {condition.charAt(0).toUpperCase() + condition.slice(1)}
    </span>
  );
}

// Approval Status Badge
function ApprovalBadge({ isApproved, isFlagged }: { isApproved: boolean; isFlagged: boolean }) {
  if (isFlagged) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
        <Flag className="w-3 h-3" />
        Flagged
      </span>
    );
  }
  if (!isApproved) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full">
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
      <CheckCircle className="w-3 h-3" />
      Approved
    </span>
  );
}

// Action Menu Component for table rows
function ListingActionMenu({ listing, onAction }: { listing: Listing; onAction: (action: string, listing: Listing) => void }) {
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
                onAction('view', listing);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-[#F1ECE3] dark:hover:bg-[#33291f]"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
            {!listing.is_approved && (
              <button
                onClick={() => {
                  onAction('approve', listing);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-[#F1ECE3] dark:hover:bg-[#33291f]"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
            )}
            <button
              onClick={() => {
                onAction(listing.is_flagged ? 'unflag' : 'flag', listing);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-yellow-600 dark:text-yellow-400 hover:bg-[#F1ECE3] dark:hover:bg-[#33291f]"
            >
              <Flag className="w-4 h-4" />
              {listing.is_flagged ? 'Unflag' : 'Flag'}
            </button>
            <button
              onClick={() => {
                onAction('delete', listing);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-[#F1ECE3] dark:hover:bg-[#33291f]"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function ListingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterApproval, setFilterApproval] = useState<'all' | 'approved' | 'pending'>('all');
  const [filterFlagged, setFilterFlagged] = useState<boolean | 'all'>('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<typeof LIMIT_OPTIONS[number]>(10);

  // Mock listings data - Backend admin endpoints not yet implemented
  // TODO: Replace with real API calls when admin listings endpoint is available
  const mockListings: Listing[] = [
    {
      id: '1',
      book_title: 'Things Fall Apart',
      book_author: 'Chinua Achebe',
      book_isbn: '9780385474542',
      book_condition: 'excellent',
      book_category: 'African Literature',
      description: 'A classic novel about pre-colonial life in Nigeria and the arrival of Europeans. In great condition.',
      is_active: true,
      is_approved: true,
      is_flagged: false,
      exchange_preference: 'swap',
      user: {
        id: '1',
        first_name: 'Kwame',
        last_name: 'Mensah',
        city: 'Bolgatanga',
      },
      created_at: '2025-01-20T10:30:00Z',
      views_count: 45,
      interested_count: 8,
    },
    {
      id: '2',
      book_title: 'Half of a Yellow Sun',
      book_author: 'Chimamanda Ngozi Adichie',
      book_condition: 'good',
      book_category: 'Fiction',
      description: 'Award-winning novel set during the Nigerian Civil War. Some wear on the cover but pages are pristine.',
      is_active: true,
      is_approved: false,
      is_flagged: false,
      exchange_preference: 'both',
      price: 35,
      user: {
        id: '2',
        first_name: 'Ama',
        last_name: 'Darko',
        city: 'Sumbrungu',
      },
      created_at: '2025-01-22T14:20:00Z',
      views_count: 12,
      interested_count: 3,
    },
    {
      id: '3',
      book_title: 'The Beautyful Ones Are Not Yet Born',
      book_author: 'Ayi Kwei Armah',
      book_condition: 'fair',
      book_category: 'African Literature',
      description: 'Classic Ghanaian novel. Has some markings and wear.',
      is_active: true,
      is_approved: true,
      is_flagged: true,
      exchange_preference: 'sell',
      price: 20,
      user: {
        id: '3',
        first_name: 'Kofi',
        last_name: 'Asante',
        city: 'Bolgatanga',
      },
      created_at: '2025-01-18T08:15:00Z',
      views_count: 23,
      interested_count: 2,
    },
    {
      id: '4',
      book_title: 'Purple Hibiscus',
      book_author: 'Chimamanda Ngozi Adichie',
      book_condition: 'good',
      book_category: 'Fiction',
      description: 'Coming-of-age story set in Nigeria. Great condition.',
      is_active: true,
      is_approved: true,
      is_flagged: false,
      exchange_preference: 'swap',
      user: {
        id: '4',
        first_name: 'Akua',
        last_name: 'Boateng',
        city: 'Navrongo',
      },
      created_at: '2025-01-25T16:45:00Z',
      views_count: 18,
      interested_count: 5,
    },
  ];

  // Filter mock data based on filters
  const filteredListings = mockListings.filter((listing) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        listing.book_title.toLowerCase().includes(query) ||
        listing.book_author.toLowerCase().includes(query) ||
        listing.user.first_name.toLowerCase().includes(query) ||
        listing.user.last_name.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    if (filterStatus === 'active' && !listing.is_active) return false;
    if (filterStatus === 'inactive' && listing.is_active) return false;
    if (filterApproval === 'approved' && !listing.is_approved) return false;
    if (filterApproval === 'pending' && listing.is_approved) return false;
    if (filterFlagged === true && !listing.is_flagged) return false;
    if (filterFlagged === false && listing.is_flagged) return false;
    return true;
  });

  // Paginate
  const totalFiltered = filteredListings.length;
  const totalPages = Math.ceil(totalFiltered / limit);
  const startIndex = (page - 1) * limit;
  const paginatedListings = filteredListings.slice(startIndex, startIndex + limit);

  const paginatedData: PaginatedResponse = {
    data: paginatedListings,
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
  const listings = paginatedData?.data || [];
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

  const handleListingAction = async (action: string, listing: Listing) => {
    try {
      switch (action) {
        case 'view':
          setSelectedListing(listing);
          setShowDetailsModal(true);
          break;

        case 'approve':
          await apiClient.patch(`/listings/${listing.id}/approve`);
          toast.success(`"${listing.book_title}" has been approved`);
          refetch();
          break;

        case 'flag':
          await apiClient.patch(`/listings/${listing.id}/flag`);
          toast.success(`"${listing.book_title}" has been flagged for review`);
          refetch();
          break;

        case 'unflag':
          await apiClient.patch(`/listings/${listing.id}/unflag`);
          toast.success(`"${listing.book_title}" has been unflagged`);
          refetch();
          break;

        case 'delete':
          if (confirm(`Are you sure you want to delete "${listing.book_title}"?`)) {
            await apiClient.delete(`/listings/${listing.id}`);
            toast.success(`"${listing.book_title}" has been deleted`);
            refetch();
          }
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
          Listings Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Moderate and manage book listings on the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Listings
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
              <p className="text-sm text-muted-foreground">
                Approved
              </p>
              <p className="text-2xl font-bold text-foreground">
                {listings.filter((l) => l.is_approved).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <XCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Pending
              </p>
              <p className="text-2xl font-bold text-foreground">
                {listings.filter((l) => !l.is_approved).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <Flag className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Flagged</p>
              <p className="text-2xl font-bold text-foreground">
                {listings.filter((l) => l.is_flagged).length}
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
                placeholder="Search by title, author, ISBN..."
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

          {/* Approval filter */}
          <select
            value={filterApproval}
            onChange={(e) => handleFilterChange(setFilterApproval, e.target.value as 'all' | 'approved' | 'pending')}
            className="px-4 py-2 border border-[#E4DED2] dark:border-[#33291f] rounded-lg bg-white dark:bg-[#2a2118] text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Approval</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>

          {/* Flagged filter */}
          <select
            value={String(filterFlagged)}
            onChange={(e) => handleFilterChange(setFilterFlagged, e.target.value === 'all' ? 'all' : e.target.value === 'true')}
            className="px-4 py-2 border border-[#E4DED2] dark:border-[#33291f] rounded-lg bg-white dark:bg-[#2a2118] text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Listings</option>
            <option value="true">Flagged Only</option>
            <option value="false">Not Flagged</option>
          </select>
        </div>
      </div>

      {/* Listings Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      ) : listings && listings.length > 0 ? (
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
                    Book
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground dark:text-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground dark:text-foreground uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground dark:text-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground dark:text-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground dark:text-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground dark:text-foreground uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground dark:text-foreground uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground dark:text-foreground uppercase tracking-wider">
                    Listed
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground dark:text-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE6DC] dark:divide-[#33291f]">
                {listings.map((listing) => (
                  <tr
                    key={listing.id}
                    className={`hover:bg-background dark:hover:bg-[#2a2118]/30 transition-colors ${listing.is_flagged ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                  >
                    {/* Book Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded flex items-center justify-center flex-shrink-0">
                          {listing.images && listing.images.length > 0 ? (
                            <img
                              src={listing.images[0]}
                              alt={listing.book_title}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <BookOpen className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-foreground truncate max-w-[180px]">
                              {listing.book_title}
                            </p>
                            {listing.is_flagged && (
                              <Flag className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            by {listing.book_author}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded">
                        {listing.book_category}
                      </span>
                    </td>

                    {/* Condition */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ConditionBadge condition={listing.book_condition} />
                    </td>

                    {/* Exchange Type */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-muted-foreground">
                        {listing.exchange_preference === 'swap' ? 'Swap' : listing.exchange_preference === 'sell' ? 'Sell' : 'Both'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {listing.price ? (
                        <span className="text-sm font-medium text-foreground">
                          GH₵{listing.price}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground dark:text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ApprovalBadge isApproved={listing.is_approved} isFlagged={listing.is_flagged} />
                    </td>

                    {/* Seller */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-foreground">
                          {listing.user.first_name} {listing.user.last_name}
                        </p>
                        {listing.user.city && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {listing.user.city}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Views */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3 text-sm">
                        <span className="text-foreground" title="Views">
                          {listing.views_count || 0}
                        </span>
                        <span className="text-muted-foreground dark:text-muted-foreground">/</span>
                        <span className="text-primary" title="Interested">
                          {listing.interested_count || 0}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">
                        {new Date(listing.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <ListingActionMenu listing={listing} onAction={handleListingAction} />
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
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No listings found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Listing Details Modal */}
      {showDetailsModal && selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedListing(null);
          }}
          onAction={async (action) => {
            await handleListingAction(action, selectedListing);
            if (action === 'delete') {
              setShowDetailsModal(false);
              setSelectedListing(null);
            }
          }}
        />
      )}
    </div>
  );
}

// Listing Details Modal Component
function ListingDetailsModal({
  listing,
  onClose,
  onAction,
}: {
  listing: Listing;
  onClose: () => void;
  onAction: (action: string) => void;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch detailed listing info
  const { data: listingDetails, isLoading } = useQuery({
    queryKey: ['listing-details', listing.id],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/listings/${listing.id}`);
        return response.data.result || response.data;
      } catch (error) {
        return listing;
      }
    },
  });

  const displayListing = listingDetails || listing;
  const images = displayListing.images || [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#241c16] rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#ECE6DC] dark:border-[#33291f] sticky top-0 bg-white dark:bg-[#241c16] z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-foreground">
              Listing Details
            </h2>
            {displayListing.is_flagged && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
                <Flag className="w-3 h-3" />
                Flagged
              </span>
            )}
            {!displayListing.is_approved && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full">
                Pending Approval
              </span>
            )}
          </div>
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
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Images */}
              <div>
                {/* Main Image */}
                <div className="relative aspect-[3/4] bg-[#F1ECE3] dark:bg-[#2a2118] rounded-lg overflow-hidden">
                  {images.length > 0 ? (
                    <>
                      <img
                        src={images[currentImageIndex]}
                        alt={displayListing.book_title}
                        className="w-full h-full object-cover"
                      />
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                            {images.map((_: string, index: number) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  index === currentImageIndex
                                    ? 'bg-white'
                                    : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-24 h-24 text-muted-foreground dark:text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {images.map((img: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex
                            ? 'border-amber-500'
                            : 'border-transparent'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${displayListing.book_title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* Book Info */}
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {displayListing.book_title}
                  </h3>
                  <p className="text-lg text-muted-foreground mt-1">
                    by {displayListing.book_author}
                  </p>
                  {displayListing.book_isbn && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ISBN: {displayListing.book_isbn}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <ConditionBadge condition={displayListing.book_condition} />
                  <span className="px-3 py-1 text-sm font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full">
                    {displayListing.book_category}
                  </span>
                  <span className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1">
                    {displayListing.exchange_preference === 'swap' ? (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        Swap Only
                      </>
                    ) : displayListing.exchange_preference === 'sell' ? (
                      <>
                        <DollarSign className="w-3 h-3" />
                        Sell Only
                      </>
                    ) : (
                      <>
                        <Tag className="w-3 h-3" />
                        Swap or Sell
                      </>
                    )}
                  </span>
                </div>

                {/* Price */}
                {displayListing.price && (
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-primary">
                      GH₵{displayListing.price}
                    </span>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
                    Description
                  </h4>
                  <p className="text-muted-foreground">
                    {displayListing.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background dark:bg-[#2a2118]/50 rounded-lg p-4 text-center">
                    <Eye className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      {displayListing.views_count || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                  <div className="bg-background dark:bg-[#2a2118]/50 rounded-lg p-4 text-center">
                    <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      {displayListing.interested_count || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Interested</p>
                  </div>
                </div>

                {/* Seller Info */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                    Listed By
                  </h4>
                  <div className="bg-background dark:bg-[#2a2118]/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold">
                        {displayListing.user.first_name?.[0]}
                        {displayListing.user.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {displayListing.user.first_name} {displayListing.user.last_name}
                        </p>
                        {displayListing.user.city && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {displayListing.user.city}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Listing Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Listed on {new Date(displayListing.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-[#ECE6DC] dark:border-[#33291f]">
              <div className="flex items-center gap-3">
                {!displayListing.is_approved && (
                  <button
                    onClick={() => onAction('approve')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-medium rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Listing
                  </button>
                )}
                <button
                  onClick={() => onAction(displayListing.is_flagged ? 'unflag' : 'flag')}
                  className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors ${
                    displayListing.is_flagged
                      ? 'bg-[#F1ECE3] dark:bg-[#2a2118] text-foreground hover:bg-[#ECE6DC] dark:hover:bg-[#33291f]'
                      : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                  }`}
                >
                  <Flag className="w-4 h-4" />
                  {displayListing.is_flagged ? 'Remove Flag' : 'Flag Listing'}
                </button>
                <button
                  onClick={() => onAction('delete')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>

              <button
                onClick={onClose}
                className="px-4 py-2 text-foreground bg-white dark:bg-[#2a2118] border border-[#E4DED2] dark:border-[#33291f] rounded-lg hover:bg-background dark:hover:bg-[#33291f] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
