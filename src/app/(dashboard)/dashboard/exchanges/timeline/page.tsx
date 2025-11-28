'use client';

import { useState, useMemo } from 'react';

type ExchangeStatus = 'proposed' | 'accepted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

interface TimelineEvent {
  id: string;
  type: 'status_change' | 'message' | 'meeting_scheduled' | 'book_verified' | 'rating_submitted' | 'dispute_opened' | 'admin_action' | 'system';
  timestamp: string;
  actor: {
    id: string;
    name: string;
    role: 'user' | 'admin' | 'system';
  };
  description: string;
  metadata?: Record<string, string | number>;
}

interface Exchange {
  id: string;
  book_offered: {
    title: string;
    author: string;
    condition: string;
    image_url?: string;
  };
  book_requested: {
    title: string;
    author: string;
    condition: string;
    image_url?: string;
  };
  initiator: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
  };
  recipient: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
  };
  status: ExchangeStatus;
  created_at: string;
  updated_at: string;
  meeting_spot?: {
    name: string;
    address: string;
  };
  meeting_time?: string;
  timeline: TimelineEvent[];
}

const mockExchange: Exchange = {
  id: 'ex-123',
  book_offered: {
    title: 'Things Fall Apart',
    author: 'Chinua Achebe',
    condition: 'Like New',
  },
  book_requested: {
    title: 'Half of a Yellow Sun',
    author: 'Chimamanda Ngozi Adichie',
    condition: 'Good',
  },
  initiator: {
    id: 'u1',
    name: 'Kwame Mensah',
    rating: 4.9,
  },
  recipient: {
    id: 'u2',
    name: 'Ama Darko',
    rating: 4.7,
  },
  status: 'completed',
  created_at: '2024-05-28T10:00:00Z',
  updated_at: '2024-06-02T15:30:00Z',
  meeting_spot: {
    name: 'Accra Mall Bookstore Cafe',
    address: 'Tetteh Quarshie, Accra',
  },
  meeting_time: '2024-06-01T14:00:00Z',
  timeline: [
    { id: 't1', type: 'status_change', timestamp: '2024-05-28T10:00:00Z', actor: { id: 'u1', name: 'Kwame Mensah', role: 'user' }, description: 'Exchange proposal created' },
    { id: 't2', type: 'message', timestamp: '2024-05-28T10:05:00Z', actor: { id: 'u1', name: 'Kwame Mensah', role: 'user' }, description: 'Sent initial message: "Hi! I saw your listing for Half of a Yellow Sun. Would you be interested in trading?"' },
    { id: 't3', type: 'system', timestamp: '2024-05-28T10:05:30Z', actor: { id: 'system', name: 'System', role: 'system' }, description: 'Notification sent to Ama Darko' },
    { id: 't4', type: 'message', timestamp: '2024-05-28T14:30:00Z', actor: { id: 'u2', name: 'Ama Darko', role: 'user' }, description: 'Replied: "Hi Kwame! Yes, Things Fall Apart is on my wishlist. What condition is your copy in?"' },
    { id: 't5', type: 'message', timestamp: '2024-05-28T15:00:00Z', actor: { id: 'u1', name: 'Kwame Mensah', role: 'user' }, description: 'Replied: "It\'s in like-new condition, barely read. Spine is perfect."' },
    { id: 't6', type: 'status_change', timestamp: '2024-05-28T16:00:00Z', actor: { id: 'u2', name: 'Ama Darko', role: 'user' }, description: 'Exchange accepted', metadata: { previous_status: 'proposed', new_status: 'accepted' } },
    { id: 't7', type: 'meeting_scheduled', timestamp: '2024-05-29T09:00:00Z', actor: { id: 'u1', name: 'Kwame Mensah', role: 'user' }, description: 'Meeting scheduled at Accra Mall Bookstore Cafe for June 1st at 2:00 PM' },
    { id: 't8', type: 'status_change', timestamp: '2024-05-29T09:00:00Z', actor: { id: 'system', name: 'System', role: 'system' }, description: 'Status updated to scheduled', metadata: { previous_status: 'accepted', new_status: 'scheduled' } },
    { id: 't9', type: 'system', timestamp: '2024-06-01T08:00:00Z', actor: { id: 'system', name: 'System', role: 'system' }, description: 'Meeting reminder sent to both parties' },
    { id: 't10', type: 'status_change', timestamp: '2024-06-01T14:00:00Z', actor: { id: 'u1', name: 'Kwame Mensah', role: 'user' }, description: 'Exchange marked as in progress', metadata: { previous_status: 'scheduled', new_status: 'in_progress' } },
    { id: 't11', type: 'book_verified', timestamp: '2024-06-01T14:15:00Z', actor: { id: 'u2', name: 'Ama Darko', role: 'user' }, description: 'Verified "Things Fall Apart" condition matches listing' },
    { id: 't12', type: 'book_verified', timestamp: '2024-06-01T14:20:00Z', actor: { id: 'u1', name: 'Kwame Mensah', role: 'user' }, description: 'Verified "Half of a Yellow Sun" condition matches listing' },
    { id: 't13', type: 'status_change', timestamp: '2024-06-01T14:30:00Z', actor: { id: 'u1', name: 'Kwame Mensah', role: 'user' }, description: 'Exchange marked as completed', metadata: { previous_status: 'in_progress', new_status: 'completed' } },
    { id: 't14', type: 'rating_submitted', timestamp: '2024-06-01T15:00:00Z', actor: { id: 'u1', name: 'Kwame Mensah', role: 'user' }, description: 'Rated Ama Darko 5 stars', metadata: { rating: 5 } },
    { id: 't15', type: 'rating_submitted', timestamp: '2024-06-01T15:30:00Z', actor: { id: 'u2', name: 'Ama Darko', role: 'user' }, description: 'Rated Kwame Mensah 5 stars', metadata: { rating: 5 } },
  ],
};

const recentExchanges: Exchange[] = [
  { ...mockExchange, id: 'ex-123' },
  {
    id: 'ex-124',
    book_offered: { title: 'No Longer at Ease', author: 'Chinua Achebe', condition: 'Good' },
    book_requested: { title: 'The Beautyful Ones Are Not Yet Born', author: 'Ayi Kwei Armah', condition: 'Fair' },
    initiator: { id: 'u3', name: 'Kofi Asante', rating: 4.2 },
    recipient: { id: 'u4', name: 'Efua Boateng', rating: 4.5 },
    status: 'in_progress',
    created_at: '2024-06-01T08:00:00Z',
    updated_at: '2024-06-02T10:00:00Z',
    timeline: [],
  },
  {
    id: 'ex-125',
    book_offered: { title: 'Homegoing', author: 'Yaa Gyasi', condition: 'Like New' },
    book_requested: { title: 'Transcendent Kingdom', author: 'Yaa Gyasi', condition: 'New' },
    initiator: { id: 'u5', name: 'Yaw Owusu', rating: 4.6 },
    recipient: { id: 'u6', name: 'Akua Mensah', rating: 4.4 },
    status: 'disputed',
    created_at: '2024-05-25T12:00:00Z',
    updated_at: '2024-06-02T09:00:00Z',
    timeline: [],
  },
];

export default function ExchangeTimelinePage() {
  const [selectedExchange, setSelectedExchange] = useState<Exchange>(mockExchange);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ExchangeStatus | 'all'>('all');
  const [showEventFilter, setShowEventFilter] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState<string[]>([]);

  const filteredTimeline = useMemo(() => {
    if (eventTypeFilter.length === 0) return selectedExchange.timeline;
    return selectedExchange.timeline.filter((event) => eventTypeFilter.includes(event.type));
  }, [selectedExchange.timeline, eventTypeFilter]);

  const eventTypes = [...new Set(selectedExchange.timeline.map((e) => e.type))];

  const getStatusColor = (status: ExchangeStatus) => {
    const colors = {
      proposed: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-blue-100 text-blue-700',
      scheduled: 'bg-purple-100 text-purple-700',
      in_progress: 'bg-indigo-100 text-indigo-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-gray-100 text-gray-600 dark:text-gray-400',
      disputed: 'bg-red-100 text-red-700',
    };
    return colors[status];
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return (
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        );
      case 'message':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      case 'meeting_scheduled':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'book_verified':
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'rating_submitted':
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        );
      case 'dispute_opened':
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'admin_action':
        return (
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        );
      case 'system':
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const toggleEventTypeFilter = (type: string) => {
    if (eventTypeFilter.includes(type)) {
      setEventTypeFilter(eventTypeFilter.filter((t) => t !== type));
    } else {
      setEventTypeFilter([...eventTypeFilter, type]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exchange Timeline</h1>
          <p className="text-gray-600 mt-1">
            Detailed event history and timeline view for book exchanges
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exchange Selector */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Find Exchange</h3>
            <input
              type="text"
              placeholder="Search by ID, user, or book..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ExchangeStatus | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-2"
            >
              <option value="all">All Status</option>
              <option value="proposed">Proposed</option>
              <option value="accepted">Accepted</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="disputed">Disputed</option>
            </select>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Exchanges</p>
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {recentExchanges.map((exchange) => (
                <div
                  key={exchange.id}
                  onClick={() => setSelectedExchange(exchange.id === mockExchange.id ? mockExchange : { ...exchange, timeline: [] })}
                  className={`p-3 hover:bg-gray-50 cursor-pointer ${
                    selectedExchange.id === exchange.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{exchange.id}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(exchange.status)}`}>
                      {exchange.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{exchange.book_offered.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {exchange.initiator.name} ↔ {exchange.recipient.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {/* Exchange Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-mono text-gray-500 dark:text-gray-400">{selectedExchange.id}</p>
                <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${getStatusColor(selectedExchange.status)}`}>
                  {selectedExchange.status}
                </span>
              </div>
              <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                <p>Created: {new Date(selectedExchange.created_at).toLocaleDateString()}</p>
                <p>Updated: {new Date(selectedExchange.updated_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Book Offered */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Book Offered</p>
                <p className="font-medium text-gray-900 text-sm">{selectedExchange.book_offered.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{selectedExchange.book_offered.author}</p>
                <p className="text-xs text-gray-500 mt-1">Condition: {selectedExchange.book_offered.condition}</p>
              </div>
              {/* Book Requested */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Book Requested</p>
                <p className="font-medium text-gray-900 text-sm">{selectedExchange.book_requested.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{selectedExchange.book_requested.author}</p>
                <p className="text-xs text-gray-500 mt-1">Condition: {selectedExchange.book_requested.condition}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                  {selectedExchange.initiator.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedExchange.initiator.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Initiator · ★ {selectedExchange.initiator.rating}</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedExchange.recipient.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Recipient · ★ {selectedExchange.recipient.rating}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white text-xs font-medium">
                  {selectedExchange.recipient.name.charAt(0)}
                </div>
              </div>
            </div>

            {selectedExchange.meeting_spot && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{selectedExchange.meeting_spot.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{selectedExchange.meeting_spot.address}</p>
                  {selectedExchange.meeting_time && (
                    <p className="text-xs text-purple-600 mt-1">
                      {new Date(selectedExchange.meeting_time).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Event Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Timeline Events</h3>
              <button
                onClick={() => setShowEventFilter(!showEventFilter)}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                {showEventFilter ? 'Hide Filters' : 'Filter Events'}
              </button>
            </div>

            {showEventFilter && (
              <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                {eventTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleEventTypeFilter(type)}
                    className={`px-3 py-1 text-xs rounded-full ${
                      eventTypeFilter.includes(type) || eventTypeFilter.length === 0
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-200 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
                {eventTypeFilter.length > 0 && (
                  <button
                    onClick={() => setEventTypeFilter([])}
                    className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-300"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {filteredTimeline.length > 0 ? (
                  filteredTimeline.map((event, index) => (
                    <div key={event.id} className="relative flex gap-4 ml-0">
                      <div className="relative z-10">
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">{event.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs ${
                                event.actor.role === 'system' ? 'text-gray-400 dark:text-gray-500' :
                                event.actor.role === 'admin' ? 'text-orange-600' : 'text-indigo-600'
                              }`}>
                                {event.actor.name}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date(event.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          {event.metadata?.rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(event.metadata.rating as number)].map((_, i) => (
                                <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>No timeline events for this exchange</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Admin Actions</h3>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                Add Note
              </button>
              <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 dark:bg-gray-900">
                Contact Users
              </button>
              <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 dark:bg-gray-900">
                View Full Audit Log
              </button>
              {selectedExchange.status !== 'completed' && selectedExchange.status !== 'cancelled' && (
                <>
                  <button className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                    Force Complete
                  </button>
                  <button className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                    Cancel Exchange
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
