'use client';

import { useState, useMemo } from 'react';

type SuggestionStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'duplicate';

interface SpotSuggestion {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  type: 'cafe' | 'library' | 'bookstore' | 'mall' | 'community_center' | 'other';
  description: string;
  amenities: string[];
  photos: string[];
  operating_hours?: string;
  suggested_by: {
    id: string;
    name: string;
    email: string;
    total_suggestions: number;
    approved_suggestions: number;
  };
  upvotes: number;
  downvotes: number;
  comments: { user: string; text: string; created_at: string }[];
  status: SuggestionStatus;
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

const mockSuggestions: SpotSuggestion[] = [
  {
    id: 'sug-1',
    name: 'Vida e Caffe - Osu',
    address: '12 Oxford Street, Osu',
    city: 'Accra',
    region: 'Greater Accra',
    type: 'cafe',
    description: 'Popular coffee shop with comfortable seating and good WiFi. Perfect for book exchanges with its relaxed atmosphere and central location.',
    amenities: ['WiFi', 'Air Conditioning', 'Parking Nearby', 'Power Outlets'],
    photos: ['/spots/vida1.jpg', '/spots/vida2.jpg'],
    operating_hours: 'Mon-Sat: 7AM-9PM, Sun: 8AM-6PM',
    suggested_by: { id: 'u1', name: 'Kwame Mensah', email: 'kwame@example.com', total_suggestions: 5, approved_suggestions: 3 },
    upvotes: 24,
    downvotes: 2,
    comments: [
      { user: 'Ama Darko', text: 'Great spot! I have done 3 exchanges here.', created_at: '2024-06-01T10:00:00Z' },
      { user: 'Kofi Asante', text: 'Easy to find and very safe.', created_at: '2024-06-01T14:00:00Z' },
    ],
    status: 'pending',
    created_at: '2024-05-30T09:00:00Z',
  },
  {
    id: 'sug-2',
    name: 'KNUST Library Lobby',
    address: 'KNUST Main Campus, Kumasi',
    city: 'Kumasi',
    region: 'Ashanti',
    type: 'library',
    description: 'The main library lobby offers a quiet and academic environment. Security presence and ample seating make it ideal for student exchanges.',
    amenities: ['Security', 'Seating', 'Water Fountain', 'Restrooms'],
    photos: ['/spots/knust1.jpg'],
    operating_hours: 'Mon-Fri: 8AM-8PM, Sat: 9AM-5PM',
    suggested_by: { id: 'u3', name: 'Kofi Asante', email: 'kofi@example.com', total_suggestions: 8, approved_suggestions: 6 },
    upvotes: 45,
    downvotes: 1,
    comments: [
      { user: 'Efua Boateng', text: 'Perfect for students! Highly recommend.', created_at: '2024-05-28T16:00:00Z' },
    ],
    status: 'under_review',
    created_at: '2024-05-25T11:00:00Z',
  },
  {
    id: 'sug-3',
    name: 'EPP Bookshop - Accra Mall',
    address: 'Accra Mall, Spintex Road',
    city: 'Accra',
    region: 'Greater Accra',
    type: 'bookstore',
    description: 'Inside the main bookstore. Great for book lovers to meet and exchange. Staff is friendly and allows exchanges in their space.',
    amenities: ['Air Conditioning', 'Parking', 'Security', 'Restrooms'],
    photos: ['/spots/epp1.jpg', '/spots/epp2.jpg'],
    operating_hours: 'Mon-Sat: 10AM-9PM, Sun: 12PM-6PM',
    suggested_by: { id: 'u4', name: 'Efua Boateng', email: 'efua@example.com', total_suggestions: 2, approved_suggestions: 1 },
    upvotes: 38,
    downvotes: 3,
    comments: [],
    status: 'approved',
    created_at: '2024-05-20T14:00:00Z',
    reviewed_by: 'Admin Sarah',
    reviewed_at: '2024-05-22T10:00:00Z',
  },
  {
    id: 'sug-4',
    name: 'Random Location',
    address: 'Behind the market, near the tree',
    city: 'Tamale',
    region: 'Northern',
    type: 'other',
    description: 'A nice spot under a big tree. Very shady.',
    amenities: [],
    photos: [],
    suggested_by: { id: 'u7', name: 'Kojo Appiah', email: 'kojo@example.com', total_suggestions: 1, approved_suggestions: 0 },
    upvotes: 1,
    downvotes: 15,
    comments: [
      { user: 'Admin', text: 'Location is too vague and lacks safety considerations.', created_at: '2024-05-15T10:00:00Z' },
    ],
    status: 'rejected',
    created_at: '2024-05-14T08:00:00Z',
    reviewed_by: 'Admin Michael',
    reviewed_at: '2024-05-15T10:00:00Z',
    rejection_reason: 'Vague address, no safety features, no photos provided',
  },
  {
    id: 'sug-5',
    name: 'Marina Mall Food Court',
    address: 'Marina Mall, Community 4',
    city: 'Tema',
    region: 'Greater Accra',
    type: 'mall',
    description: 'Busy food court area with many seating options. Central location in Tema with easy parking access.',
    amenities: ['Parking', 'Security', 'Food & Drinks', 'Air Conditioning', 'Restrooms'],
    photos: ['/spots/marina1.jpg'],
    operating_hours: 'Mon-Sun: 10AM-10PM',
    suggested_by: { id: 'u5', name: 'Yaw Owusu', email: 'yaw@example.com', total_suggestions: 3, approved_suggestions: 2 },
    upvotes: 19,
    downvotes: 4,
    comments: [],
    status: 'pending',
    created_at: '2024-06-01T15:00:00Z',
  },
  {
    id: 'sug-6',
    name: 'Accra Mall Bookstore Cafe',
    address: 'Accra Mall, Tetteh Quarshie',
    city: 'Accra',
    region: 'Greater Accra',
    type: 'bookstore',
    description: 'Same as EPP Bookshop at Accra Mall',
    amenities: ['Air Conditioning', 'Parking'],
    photos: [],
    suggested_by: { id: 'u6', name: 'Akua Mensah', email: 'akua@example.com', total_suggestions: 1, approved_suggestions: 0 },
    upvotes: 5,
    downvotes: 8,
    comments: [
      { user: 'Admin', text: 'This appears to be a duplicate of sug-3', created_at: '2024-05-28T09:00:00Z' },
    ],
    status: 'duplicate',
    created_at: '2024-05-27T10:00:00Z',
    reviewed_by: 'Admin Sarah',
    reviewed_at: '2024-05-28T09:00:00Z',
  },
];

export default function CommunitySuggestionsPage() {
  const [filterStatus, setFilterStatus] = useState<SuggestionStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<SpotSuggestion | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredSuggestions = useMemo(() => {
    return mockSuggestions.filter((suggestion) => {
      const matchesStatus = filterStatus === 'all' || suggestion.status === filterStatus;
      const matchesType = filterType === 'all' || suggestion.type === filterType;
      const matchesRegion = filterRegion === 'all' || suggestion.region === filterRegion;
      const matchesSearch =
        !searchQuery ||
        suggestion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        suggestion.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        suggestion.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesType && matchesRegion && matchesSearch;
    });
  }, [filterStatus, filterType, filterRegion, searchQuery]);

  const stats = useMemo(() => ({
    total: mockSuggestions.length,
    pending: mockSuggestions.filter((s) => s.status === 'pending').length,
    underReview: mockSuggestions.filter((s) => s.status === 'under_review').length,
    approved: mockSuggestions.filter((s) => s.status === 'approved').length,
    rejected: mockSuggestions.filter((s) => s.status === 'rejected').length,
  }), []);

  const regions = [...new Set(mockSuggestions.map((s) => s.region))];
  const types = [...new Set(mockSuggestions.map((s) => s.type))];

  const getStatusBadge = (status: SuggestionStatus) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      under_review: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      duplicate: 'bg-gray-100 text-gray-600 dark:text-gray-400',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${styles[status]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cafe':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'library':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'bookstore':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'mall':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'community_center':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
    }
  };

  const handleReview = (suggestion: SpotSuggestion, action: 'approve' | 'reject') => {
    setSelectedSuggestion(suggestion);
    setReviewAction(action);
    setShowReviewModal(true);
  };

  const submitReview = () => {
    console.log(`${reviewAction} suggestion ${selectedSuggestion?.id} ${reviewAction === 'reject' ? `with reason: ${rejectionReason}` : ''}`);
    setShowReviewModal(false);
    setSelectedSuggestion(null);
    setReviewAction(null);
    setRejectionReason('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community-Suggested Spots</h1>
          <p className="text-gray-600 mt-1">
            Review and approve exchange locations suggested by the community
          </p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
          Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Suggestions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Under Review</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.underReview}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Approved</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Rejected</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search spots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as SuggestionStatus | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="duplicate">Duplicate</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Types</option>
          {types.map((type) => (
            <option key={type} value={type}>{type.replace('_', ' ')}</option>
          ))}
        </select>
        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Regions</option>
          {regions.map((region) => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </div>

      {/* Suggestions List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filteredSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              onClick={() => setSelectedSuggestion(suggestion)}
              className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
                selectedSuggestion?.id === suggestion.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    suggestion.status === 'approved' ? 'bg-green-100 text-green-600' :
                    suggestion.status === 'rejected' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600 dark:text-gray-400'
                  }`}>
                    {getTypeIcon(suggestion.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{suggestion.name}</h3>
                      {getStatusBadge(suggestion.status)}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{suggestion.address}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{suggestion.city}, {suggestion.region}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 text-green-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {suggestion.upvotes}
                  </div>
                  <div className="flex items-center gap-1 text-red-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {suggestion.downvotes}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-3 line-clamp-2">{suggestion.description}</p>

              {suggestion.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {suggestion.amenities.slice(0, 4).map((amenity) => (
                    <span key={amenity} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {amenity}
                    </span>
                  ))}
                  {suggestion.amenities.length > 4 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">+{suggestion.amenities.length - 4} more</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Suggested by {suggestion.suggested_by.name}</span>
                  <span>·</span>
                  <span>{new Date(suggestion.created_at).toLocaleDateString()}</span>
                </div>
                {(suggestion.status === 'pending' || suggestion.status === 'under_review') && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleReview(suggestion, 'approve'); }}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleReview(suggestion, 'reject'); }}
                      className="px-3 py-1 border border-red-300 text-red-600 text-xs rounded-lg hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="space-y-4">
          {selectedSuggestion ? (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Spot Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Type</p>
                    <p className="text-gray-900 capitalize">{selectedSuggestion.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Operating Hours</p>
                    <p className="text-gray-900 dark:text-white">{selectedSuggestion.operating_hours || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Photos</p>
                    <p className="text-gray-900 dark:text-white">{selectedSuggestion.photos.length} uploaded</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Amenities</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedSuggestion.amenities.length > 0 ? (
                        selectedSuggestion.amenities.map((a) => (
                          <span key={a} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full">{a}</span>
                        ))
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">None listed</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Contributor</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-medium">
                    {selectedSuggestion.suggested_by.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedSuggestion.suggested_by.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedSuggestion.suggested_by.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{selectedSuggestion.suggested_by.total_suggestions} suggestions</span>
                  <span>{selectedSuggestion.suggested_by.approved_suggestions} approved</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Community Feedback</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedSuggestion.upvotes}</span>
                    <span className="text-gray-500 text-sm">upvotes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedSuggestion.downvotes}</span>
                    <span className="text-gray-500 text-sm">downvotes</span>
                  </div>
                </div>
                {selectedSuggestion.comments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedSuggestion.comments.map((comment, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {comment.user} · {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet</p>
                )}
              </div>

              {selectedSuggestion.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h3 className="font-semibold text-red-800 mb-2">Rejection Reason</h3>
                  <p className="text-sm text-red-700">{selectedSuggestion.rejection_reason}</p>
                  <p className="text-xs text-red-500 mt-2">
                    Reviewed by {selectedSuggestion.reviewed_by} on {new Date(selectedSuggestion.reviewed_at!).toLocaleDateString()}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6 text-center text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p>Select a suggestion to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedSuggestion && reviewAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {reviewAction === 'approve' ? 'Approve Spot' : 'Reject Spot'}
            </h2>

            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <p className="font-medium text-gray-900 dark:text-white">{selectedSuggestion.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{selectedSuggestion.address}</p>
            </div>

            {reviewAction === 'reject' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this spot is being rejected..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}

            {reviewAction === 'approve' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                <p className="text-sm text-green-700">
                  This spot will be added to the official exchange locations list.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={submitReview}
                className={`flex-1 px-4 py-2 text-white rounded-lg ${
                  reviewAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm {reviewAction === 'approve' ? 'Approval' : 'Rejection'}
              </button>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewAction(null);
                  setRejectionReason('');
                }}
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
