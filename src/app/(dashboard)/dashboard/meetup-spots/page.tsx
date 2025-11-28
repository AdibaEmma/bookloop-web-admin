'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Plus,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Navigation,
  Clock,
  Shield,
  AlertTriangle,
  MoreVertical,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface MeetupSpot {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  region: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  category: 'library' | 'community_center' | 'cafe' | 'public_space' | 'educational' | 'other';
  is_active: boolean;
  is_verified: boolean;
  safety_rating?: number;
  created_at: string;
  usage_count?: number;
}

interface PaginatedResponse {
  data: MeetupSpot[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const LIMIT_OPTIONS = [10, 25, 50, 100] as const;

function CategoryBadge({ category }: { category: string }) {
  const colors = {
    library: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    community_center: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    cafe: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    public_space: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
    educational: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300',
    other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };

  const labels = {
    library: 'Library',
    community_center: 'Community Center',
    cafe: 'Café',
    public_space: 'Public Space',
    educational: 'Educational',
    other: 'Other',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${colors[category as keyof typeof colors] || colors.other}`}>
      {labels[category as keyof typeof labels] || category}
    </span>
  );
}

function SafetyRating({ rating }: { rating?: number }) {
  if (!rating) return null;

  const stars = Array.from({ length: 5 }, (_, i) => i < rating);

  return (
    <div className="flex items-center gap-1">
      {stars.map((filled, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full ${filled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
        />
      ))}
    </div>
  );
}

// Status badge component for table
function StatusBadge({ isActive, isVerified }: { isActive: boolean; isVerified: boolean }) {
  if (!isActive) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300">
        <XCircle className="w-3 h-3" />
        Inactive
      </span>
    );
  }
  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">
        <CheckCircle className="w-3 h-3" />
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
      <Clock className="w-3 h-3" />
      Pending
    </span>
  );
}

// Action menu component for table rows
function SpotActionMenu({ spot, onAction }: { spot: MeetupSpot; onAction: (action: string, spot: MeetupSpot) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMenuOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-20 py-1">
            <button
              onClick={() => {
                onAction('details', spot);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
            <button
              onClick={() => {
                onAction('map', spot);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <Navigation className="w-4 h-4" />
              View on Map
            </button>
            <button
              onClick={() => {
                onAction('edit', spot);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <Edit className="w-4 h-4" />
              Edit Spot
            </button>
            {!spot.is_verified && (
              <button
                onClick={() => {
                  onAction('verify', spot);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <CheckCircle className="w-4 h-4" />
                Verify Spot
              </button>
            )}
            <button
              onClick={() => {
                onAction(spot.is_active ? 'deactivate' : 'activate', spot);
                setMenuOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 ${
                spot.is_active
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              {spot.is_active ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Activate
                </>
              )}
            </button>
            <button
              onClick={() => {
                onAction('delete', spot);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
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

// Meetup Spot Details Modal Component
function MeetupSpotDetailsModal({
  spot,
  onClose,
  onAction,
}: {
  spot: MeetupSpot;
  onClose: () => void;
  onAction: (action: string, spot: MeetupSpot) => void;
}) {
  const [lat, lng] = spot.location.coordinates.slice().reverse();

  const categoryLabels: Record<string, string> = {
    library: 'Library',
    community_center: 'Community Center',
    cafe: 'Cafe',
    public_space: 'Public Space',
    educational: 'Educational Institution',
    other: 'Other',
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${spot.is_verified ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
              {spot.is_verified ? (
                <Shield className="w-6 h-6 text-green-600" />
              ) : (
                <MapPin className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {spot.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge isActive={spot.is_active} isVerified={spot.is_verified} />
                <CategoryBadge category={spot.category} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Description
            </h3>
            <p className="text-gray-700 dark:text-gray-300">{spot.description}</p>
          </div>

          {/* Location Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Location Details
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                  <p className="text-gray-900 dark:text-white">{spot.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Navigation className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">City & Region</p>
                  <p className="text-gray-900 dark:text-white">{spot.city}, {spot.region}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Coordinates</p>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">
                    {lat.toFixed(6)}, {lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {spot.usage_count || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Times Used</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
              <div className="flex justify-center mb-1">
                <SafetyRating rating={spot.safety_rating} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Safety Rating</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {categoryLabels[spot.category] || spot.category}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date(spot.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
            </div>
          </div>

          {/* Map Preview Placeholder */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Location Preview
            </h3>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-48 flex items-center justify-center">
              <button
                onClick={() => onAction('map', spot)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-600 rounded-lg shadow hover:shadow-md transition-shadow text-gray-700 dark:text-gray-200"
              >
                <Navigation className="w-5 h-5" />
                Open in Google Maps
              </button>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center gap-2">
            {!spot.is_verified && (
              <button
                onClick={() => {
                  onAction('verify', spot);
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Verify Spot
              </button>
            )}
            <button
              onClick={() => {
                onAction(spot.is_active ? 'deactivate' : 'activate', spot);
                onClose();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                spot.is_active
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
              }`}
            >
              {spot.is_active ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Activate
                </>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onAction('edit', spot);
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => {
                onAction('delete', spot);
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Static mock data - Backend admin endpoints not yet implemented
// TODO: Replace with real API calls when admin endpoints are available
const mockSpots: MeetupSpot[] = [
  {
    id: '1',
    name: 'Bolgatanga Central Library',
    description: 'Main public library with spacious reading areas and safe parking',
    address: 'Library Road, Central Bolgatanga',
    city: 'Bolgatanga',
    region: 'Upper East',
    location: {
      type: 'Point',
      coordinates: [-0.8514, 10.7856],
    },
    category: 'library',
    is_active: true,
    is_verified: true,
    safety_rating: 5,
    created_at: '2025-01-15T10:00:00Z',
    usage_count: 45,
  },
  {
    id: '2',
    name: 'Sumbrungu Community Center',
    description: 'Community center with outdoor seating and security',
    address: 'Main Street, Sumbrungu',
    city: 'Sumbrungu',
    region: 'Upper East',
    location: {
      type: 'Point',
      coordinates: [-0.8245, 10.7623],
    },
    category: 'community_center',
    is_active: true,
    is_verified: true,
    safety_rating: 4,
    created_at: '2025-01-16T11:00:00Z',
    usage_count: 23,
  },
  {
    id: '3',
    name: 'BookLoop Café',
    description: 'Quiet café perfect for book exchanges',
    address: 'Market Street, Bolgatanga',
    city: 'Bolgatanga',
    region: 'Upper East',
    location: {
      type: 'Point',
      coordinates: [-0.8490, 10.7890],
    },
    category: 'cafe',
    is_active: true,
    is_verified: false,
    safety_rating: 3,
    created_at: '2025-01-20T14:00:00Z',
    usage_count: 8,
  },
  {
    id: '4',
    name: 'Navrongo Public Square',
    description: 'Central public space with benches and shade',
    address: 'Town Center, Navrongo',
    city: 'Navrongo',
    region: 'Upper East',
    location: {
      type: 'Point',
      coordinates: [-1.0920, 10.8950],
    },
    category: 'public_space',
    is_active: true,
    is_verified: true,
    safety_rating: 4,
    created_at: '2025-01-18T09:00:00Z',
    usage_count: 15,
  },
  {
    id: '5',
    name: 'University for Development Studies - Navrongo Campus',
    description: 'University campus with secure visitor areas',
    address: 'UDS Campus, Navrongo',
    city: 'Navrongo',
    region: 'Upper East',
    location: {
      type: 'Point',
      coordinates: [-1.0850, 10.8900],
    },
    category: 'educational',
    is_active: true,
    is_verified: true,
    safety_rating: 5,
    created_at: '2025-01-17T08:00:00Z',
    usage_count: 32,
  },
  {
    id: '6',
    name: 'Bawku Market Area',
    description: 'Busy market area with designated meeting point',
    address: 'Central Market, Bawku',
    city: 'Bawku',
    region: 'Upper East',
    location: {
      type: 'Point',
      coordinates: [-0.2300, 11.0600],
    },
    category: 'other',
    is_active: false,
    is_verified: false,
    safety_rating: 2,
    created_at: '2025-01-22T12:00:00Z',
    usage_count: 3,
  },
];

export default function MeetupSpotsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');
  const [filterCategory, setFilterCategory] = useState<MeetupSpot['category'] | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<MeetupSpot | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<typeof LIMIT_OPTIONS[number]>(10);

  // No loading state needed for static data
  const isLoading = false;

  // Filter and paginate mock data
  const { spots, meta } = useMemo(() => {
    // Apply filters
    let filtered = mockSpots.filter((spot) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = spot.name.toLowerCase().includes(query);
        const matchesDescription = spot.description.toLowerCase().includes(query);
        const matchesCity = spot.city.toLowerCase().includes(query);
        const matchesAddress = spot.address.toLowerCase().includes(query);
        if (!matchesName && !matchesDescription && !matchesCity && !matchesAddress) {
          return false;
        }
      }

      // Status filter
      if (filterStatus === 'active' && !spot.is_active) return false;
      if (filterStatus === 'inactive' && spot.is_active) return false;

      // Verified filter
      if (filterVerified === 'verified' && !spot.is_verified) return false;
      if (filterVerified === 'unverified' && spot.is_verified) return false;

      // Category filter
      if (filterCategory !== 'all' && spot.category !== filterCategory) return false;

      return true;
    });

    // Calculate pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedSpots = filtered.slice(startIndex, startIndex + limit);

    return {
      spots: paginatedSpots,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }, [searchQuery, filterStatus, filterVerified, filterCategory, page, limit]);

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

  const handleSpotAction = (action: string, spot: MeetupSpot) => {
    // TODO: Implement actual API calls when backend endpoints are available
    switch (action) {
      case 'details':
        setSelectedSpot(spot);
        break;

      case 'map':
        const [lat, lng] = spot.location.coordinates.slice().reverse();
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
        break;

      case 'edit':
        toast.info(`Editing "${spot.name}" (mock)`);
        break;

      case 'verify':
        toast.success(`"${spot.name}" has been verified (mock)`);
        break;

      case 'activate':
        toast.success(`"${spot.name}" has been activated (mock)`);
        break;

      case 'deactivate':
        toast.success(`"${spot.name}" has been deactivated (mock)`);
        break;

      case 'delete':
        if (confirm(`Are you sure you want to delete "${spot.name}"?`)) {
          toast.success(`"${spot.name}" has been deleted (mock)`);
        }
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Meetup Spots Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage safe locations for book exchanges
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Meetup Spot
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <MapPin className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Spots
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {spots?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Verified</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {spots?.filter((s) => s.is_verified).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {spots?.filter((s) => s.is_active).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Navigation className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Usage
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {spots?.reduce((sum, s) => sum + (s.usage_count || 0), 0) || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search spots..."
                value={searchQuery}
                onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange(setFilterStatus, e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Verified filter */}
          <select
            value={filterVerified}
            onChange={(e) => handleFilterChange(setFilterVerified, e.target.value as 'all' | 'verified' | 'unverified')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Verification</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => handleFilterChange(setFilterCategory, e.target.value as MeetupSpot['category'] | 'all')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Categories</option>
            <option value="library">Library</option>
            <option value="community_center">Community Center</option>
            <option value="cafe">Café</option>
            <option value="public_space">Public Space</option>
            <option value="educational">Educational</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Spots Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      ) : spots && spots.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {/* Table Header with Limit Selector */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center gap-2">
              <label htmlFor="limit" className="text-sm text-gray-600 dark:text-gray-400">
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
              <span className="text-sm text-gray-600 dark:text-gray-400">entries</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Spot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Safety
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {spots.map((spot) => {
                  const [lat, lng] = spot.location.coordinates.slice().reverse();
                  return (
                    <tr
                      key={spot.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!spot.is_active ? 'opacity-60' : ''}`}
                    >
                      {/* Spot Name & Description */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg flex-shrink-0 ${spot.is_verified ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                            {spot.is_verified ? (
                              <Shield className="w-5 h-5 text-green-600" />
                            ) : (
                              <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => setSelectedSpot(spot)}
                              className="font-medium text-gray-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-left"
                            >
                              {spot.name}
                            </button>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {spot.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900 dark:text-white">{spot.city}</p>
                          <p className="text-gray-500 dark:text-gray-400">{spot.region}</p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <CategoryBadge category={spot.category} />
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge isActive={spot.is_active} isVerified={spot.is_verified} />
                      </td>

                      {/* Safety Rating */}
                      <td className="px-6 py-4">
                        <SafetyRating rating={spot.safety_rating} />
                      </td>

                      {/* Usage Count */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {spot.usage_count || 0}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">times</span>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(spot.created_at).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <SpotActionMenu spot={spot} onAction={handleSpotAction} />
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
            <div className="text-sm text-gray-600 dark:text-gray-400">
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
                      <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 dark:text-gray-500">
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
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No meetup spots found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your search or filters
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add First Meetup Spot
          </button>
        </div>
      )}

      {/* Add Meetup Spot Modal */}
      {showAddModal && (
        <AddMeetupSpotModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            // TODO: Refresh data when API is implemented
          }}
        />
      )}

      {/* Meetup Spot Details Modal */}
      {selectedSpot && (
        <MeetupSpotDetailsModal
          spot={selectedSpot}
          onClose={() => setSelectedSpot(null)}
          onAction={handleSpotAction}
        />
      )}
    </div>
  );
}

// Add Meetup Spot Modal Component
interface AddMeetupSpotFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  region: string;
  latitude: string;
  longitude: string;
  category: MeetupSpot['category'];
  safety_rating: number;
}

function AddMeetupSpotModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<AddMeetupSpotFormData>({
    name: '',
    description: '',
    address: '',
    city: '',
    region: '',
    latitude: '',
    longitude: '',
    category: 'public_space',
    safety_rating: 3,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AddMeetupSpotFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ghana regions for dropdown
  const ghanaRegions = [
    'Ahafo',
    'Ashanti',
    'Bono',
    'Bono East',
    'Central',
    'Eastern',
    'Greater Accra',
    'North East',
    'Northern',
    'Oti',
    'Savannah',
    'Upper East',
    'Upper West',
    'Volta',
    'Western',
    'Western North',
  ];

  // TODO: Replace with actual API call when backend endpoints are available
  const handleCreate = () => {
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      toast.success('Meetup spot created successfully! (mock)');
      setIsSubmitting(false);
      onSuccess();
    }, 500);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddMeetupSpotFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.region) {
      newErrors.region = 'Region is required';
    }
    if (!formData.latitude.trim()) {
      newErrors.latitude = 'Latitude is required';
    } else {
      const lat = parseFloat(formData.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.latitude = 'Invalid latitude (-90 to 90)';
      }
    }
    if (!formData.longitude.trim()) {
      newErrors.longitude = 'Longitude is required';
    } else {
      const lng = parseFloat(formData.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.longitude = 'Invalid longitude (-180 to 180)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      handleCreate();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof AddMeetupSpotFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Add New Meetup Spot
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create a safe location for book exchanges
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
              Basic Information
            </h3>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Spot Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Central Library"
                  className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.name
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe the location, facilities, and why it's safe for meetups..."
                  className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none ${
                    errors.description
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="library">Library</option>
                  <option value="community_center">Community Center</option>
                  <option value="cafe">Café</option>
                  <option value="public_space">Public Space</option>
                  <option value="educational">Educational Institution</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
              Location Details
            </h3>
            <div className="space-y-4">
              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g., 123 Main Street"
                  className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.address
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                )}
              </div>

              {/* City and Region */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g., Accra"
                    className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.city
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="region"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Region <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.region
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Select Region</option>
                    {ghanaRegions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                  {errors.region && (
                    <p className="mt-1 text-sm text-red-500">{errors.region}</p>
                  )}
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="latitude"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Latitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="e.g., 5.6037"
                    className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.latitude
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.latitude && (
                    <p className="mt-1 text-sm text-red-500">{errors.latitude}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="longitude"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Longitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="e.g., -0.1870"
                    className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.longitude
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.longitude && (
                    <p className="mt-1 text-sm text-red-500">{errors.longitude}</p>
                  )}
                </div>
              </div>

              {/* Help text for coordinates */}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tip: You can get coordinates from Google Maps by right-clicking on a location.
              </p>
            </div>
          </div>

          {/* Safety Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
              Safety Assessment
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Initial Safety Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, safety_rating: rating }))
                    }
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      formData.safety_rating >= rating
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
                <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                  {formData.safety_rating === 1 && 'Poor'}
                  {formData.safety_rating === 2 && 'Fair'}
                  {formData.safety_rating === 3 && 'Good'}
                  {formData.safety_rating === 4 && 'Very Good'}
                  {formData.safety_rating === 5 && 'Excellent'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Meetup Spot
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
