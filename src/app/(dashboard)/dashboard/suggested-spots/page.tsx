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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface SuggestedSpot {
  id: string;
  name: string;
  address: string;
  region: string;
  type: 'cafe' | 'library' | 'park' | 'mall' | 'community_center' | 'other';
  suggestedBy: {
    name: string;
    avatar: string;
    userId: string;
  };
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  upvotes: number;
  downvotes: number;
  description: string;
  amenities: string[];
  operatingHours: string;
  photos: number;
  comments: number;
  reviewNotes?: string;
}

const suggestedSpots: SuggestedSpot[] = [
  {
    id: '1',
    name: 'Osu Reading Corner',
    address: '15 Oxford Street, Osu, Accra',
    region: 'Greater Accra',
    type: 'cafe',
    suggestedBy: { name: 'Kofi Mensah', avatar: 'KM', userId: 'u1' },
    submittedAt: '2024-06-07T09:30:00',
    status: 'pending',
    upvotes: 24,
    downvotes: 2,
    description: 'Quiet cafe with dedicated reading area, perfect for book exchanges. Has WiFi and comfortable seating.',
    amenities: ['WiFi', 'Parking', 'Air Conditioning', 'Outdoor Seating'],
    operatingHours: '8:00 AM - 9:00 PM',
    photos: 5,
    comments: 8,
  },
  {
    id: '2',
    name: 'Legon Botanical Gardens',
    address: 'University of Ghana, Legon',
    region: 'Greater Accra',
    type: 'park',
    suggestedBy: { name: 'Ama Serwaa', avatar: 'AS', userId: 'u2' },
    submittedAt: '2024-06-06T14:15:00',
    status: 'under_review',
    upvotes: 45,
    downvotes: 5,
    description: 'Beautiful outdoor space with benches and shade. Great for daytime exchanges.',
    amenities: ['Parking', 'Restrooms', 'Security'],
    operatingHours: '6:00 AM - 6:00 PM',
    photos: 12,
    comments: 15,
  },
  {
    id: '3',
    name: 'Kumasi City Mall Food Court',
    address: 'Asokwa, Kumasi',
    region: 'Ashanti',
    type: 'mall',
    suggestedBy: { name: 'Yaw Boateng', avatar: 'YB', userId: 'u3' },
    submittedAt: '2024-06-05T11:00:00',
    status: 'approved',
    upvotes: 38,
    downvotes: 3,
    description: 'Central location with easy access. Food court provides comfortable meeting area.',
    amenities: ['WiFi', 'Parking', 'Air Conditioning', 'Security', 'Restrooms'],
    operatingHours: '9:00 AM - 9:00 PM',
    photos: 8,
    comments: 12,
    reviewNotes: 'Verified by admin. Added to official spots.',
  },
  {
    id: '4',
    name: 'Cape Coast Library Annex',
    address: 'Chapel Square, Cape Coast',
    region: 'Central',
    type: 'library',
    suggestedBy: { name: 'Efua Owusu', avatar: 'EO', userId: 'u4' },
    submittedAt: '2024-06-04T16:45:00',
    status: 'rejected',
    upvotes: 8,
    downvotes: 12,
    description: 'Historic library building with reading rooms.',
    amenities: ['Air Conditioning'],
    operatingHours: '9:00 AM - 5:00 PM',
    photos: 2,
    comments: 6,
    reviewNotes: 'Library management declined partnership. Limited space for exchanges.',
  },
  {
    id: '5',
    name: 'Takoradi Harbor View Cafe',
    address: 'Beach Road, Takoradi',
    region: 'Western',
    type: 'cafe',
    suggestedBy: { name: 'Kweku Asante', avatar: 'KA', userId: 'u5' },
    submittedAt: '2024-06-03T10:20:00',
    status: 'pending',
    upvotes: 15,
    downvotes: 1,
    description: 'Seaside cafe with great ambiance. Popular local spot.',
    amenities: ['WiFi', 'Parking', 'Outdoor Seating'],
    operatingHours: '7:00 AM - 10:00 PM',
    photos: 7,
    comments: 4,
  },
  {
    id: '6',
    name: 'Ho Community Center',
    address: 'Stadium Road, Ho',
    region: 'Volta',
    type: 'community_center',
    suggestedBy: { name: 'Akua Darko', avatar: 'AD', userId: 'u6' },
    submittedAt: '2024-06-02T13:30:00',
    status: 'approved',
    upvotes: 22,
    downvotes: 0,
    description: 'Well-maintained community space with meeting rooms available.',
    amenities: ['Parking', 'Restrooms', 'Security', 'Meeting Rooms'],
    operatingHours: '8:00 AM - 6:00 PM',
    photos: 4,
    comments: 9,
    reviewNotes: 'Excellent community spot. Added with community center partnership.',
  },
];

const statusStats = [
  { status: 'Pending', count: 12, color: '#f59e0b' },
  { status: 'Under Review', count: 5, color: '#6366f1' },
  { status: 'Approved', count: 45, color: '#10b981' },
  { status: 'Rejected', count: 8, color: '#ef4444' },
];

const spotsByRegion = [
  { region: 'Greater Accra', count: 28 },
  { region: 'Ashanti', count: 15 },
  { region: 'Western', count: 8 },
  { region: 'Central', count: 6 },
  { region: 'Volta', count: 5 },
  { region: 'Eastern', count: 4 },
  { region: 'Others', count: 4 },
];

const spotsByType = [
  { type: 'Cafe', count: 25, color: '#6366f1' },
  { type: 'Library', count: 12, color: '#10b981' },
  { type: 'Mall', count: 10, color: '#f59e0b' },
  { type: 'Park', count: 8, color: '#8b5cf6' },
  { type: 'Community Center', count: 10, color: '#ec4899' },
  { type: 'Other', count: 5, color: '#6b7280' },
];

export default function SuggestedSpotsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [selectedSpot, setSelectedSpot] = useState<SuggestedSpot | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);

  const filteredSpots = useMemo(() => {
    return suggestedSpots.filter((spot) => {
      if (statusFilter !== 'all' && spot.status !== statusFilter) return false;
      if (regionFilter !== 'all' && spot.region !== regionFilter) return false;
      return true;
    });
  }, [statusFilter, regionFilter]);

  const getStatusColor = (status: SuggestedSpot['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'under_review':
        return 'bg-indigo-100 text-indigo-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
    }
  };

  const getTypeIcon = (type: SuggestedSpot['type']) => {
    switch (type) {
      case 'cafe':
        return '☕';
      case 'library':
        return '📚';
      case 'park':
        return '🌳';
      case 'mall':
        return '🏬';
      case 'community_center':
        return '🏛️';
      default:
        return '📍';
    }
  };

  const handleReview = (action: 'approve' | 'reject') => {
    setReviewAction(action);
    setShowReviewModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suggested Spots</h1>
          <p className="text-gray-600 mt-1">
            Review and manage community-suggested exchange locations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            12 Pending Review
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusStats.map((stat) => (
          <div key={stat.status} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{stat.status}</p>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stat.color }}
              />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Suggestions by Region</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={spotsByRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="region" type="category" tick={{ fontSize: 11 }} width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Spots by Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={spotsByType}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="count"
              >
                {spotsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {spotsByType.map((item) => (
              <div key={item.type} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">{item.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters & List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b flex flex-wrap items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Regions</option>
            <option value="Greater Accra">Greater Accra</option>
            <option value="Ashanti">Ashanti</option>
            <option value="Western">Western</option>
            <option value="Central">Central</option>
            <option value="Volta">Volta</option>
          </select>
          <div className="flex-1" />
          <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
            {filteredSpots.length} suggestions
          </span>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredSpots.map((spot) => (
            <div
              key={spot.id}
              className="p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedSpot(spot)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                  {getTypeIcon(spot.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{spot.name}</h4>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(spot.status)}`}>
                      {spot.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{spot.address}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      {spot.upvotes}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {spot.downvotes}
                    </span>
                    <span>📷 {spot.photos} photos</span>
                    <span>💬 {spot.comments} comments</span>
                    <span>📍 {spot.region}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Suggested by</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{spot.suggestedBy.name}</span>
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-medium">
                      {spot.suggestedBy.avatar}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(spot.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spot Detail Modal */}
      {selectedSpot && !showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                  {getTypeIcon(selectedSpot.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedSpot.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{selectedSpot.address}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSpot(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {/* Status & Votes */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedSpot.status)}`}>
                  {selectedSpot.status.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {selectedSpot.upvotes} upvotes
                  </span>
                  <span className="flex items-center gap-1 text-red-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {selectedSpot.downvotes} downvotes
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">{selectedSpot.description}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Region</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedSpot.region}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Type</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedSpot.type.replace('_', ' ')}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Operating Hours</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedSpot.operatingHours}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Submitted</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedSpot.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSpot.amenities.map((amenity) => (
                    <span key={amenity} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggested By */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium">
                  {selectedSpot.suggestedBy.avatar}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedSpot.suggestedBy.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Suggested this location</p>
                </div>
                <button className="ml-auto text-sm text-indigo-600 hover:text-indigo-700">
                  View Profile
                </button>
              </div>

              {/* Photos & Comments */}
              <div className="flex items-center gap-4">
                <button className="flex-1 p-3 border border-gray-200 rounded-lg text-center hover:bg-gray-50 dark:bg-gray-900">
                  <span className="text-2xl block">📷</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">{selectedSpot.photos} Photos</span>
                </button>
                <button className="flex-1 p-3 border border-gray-200 rounded-lg text-center hover:bg-gray-50 dark:bg-gray-900">
                  <span className="text-2xl block">💬</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">{selectedSpot.comments} Comments</span>
                </button>
              </div>

              {/* Review Notes */}
              {selectedSpot.reviewNotes && (
                <div className={`p-3 rounded-lg ${
                  selectedSpot.status === 'approved' ? 'bg-green-50 border border-green-200' :
                  selectedSpot.status === 'rejected' ? 'bg-red-50 border border-red-200' :
                  'bg-gray-50 border border-gray-200 dark:border-gray-700'
                }`}>
                  <h4 className="font-medium text-gray-900 mb-1">Review Notes</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">{selectedSpot.reviewNotes}</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 p-4 border-t bg-gray-50 dark:bg-gray-900">
              <button
                onClick={() => setSelectedSpot(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Close
              </button>
              {(selectedSpot.status === 'pending' || selectedSpot.status === 'under_review') && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleReview('reject')}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleReview('approve')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedSpot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {reviewAction === 'approve' ? 'Approve Spot' : 'Reject Spot'}
              </h3>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewAction(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white">{selectedSpot.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{selectedSpot.address}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes {reviewAction === 'reject' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  rows={3}
                  placeholder={reviewAction === 'approve'
                    ? 'Add any notes about this approval...'
                    : 'Explain why this spot is being rejected...'
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {reviewAction === 'approve' && (
                <div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Notify the user who suggested this spot</span>
                  </label>
                </div>
              )}

              {reviewAction === 'reject' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    The user will be notified of the rejection with your notes.
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewAction(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Spot ${reviewAction === 'approve' ? 'approved' : 'rejected'}!`);
                  setShowReviewModal(false);
                  setReviewAction(null);
                  setSelectedSpot(null);
                }}
                className={`px-4 py-2 text-white rounded-lg ${
                  reviewAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {reviewAction === 'approve' ? 'Approve Spot' : 'Reject Spot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
