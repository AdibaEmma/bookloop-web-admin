'use client';

import { useState, useMemo } from 'react';
import type { ModerationItem, Report } from '@/types/admin';

// Extended types
interface ModerationQueueItem extends ModerationItem {
  content_preview: string;
  reporter_name?: string;
  target_user: string;
  flags: string[];
}

// Mock Data
const mockModerationItems: ModerationQueueItem[] = [
  {
    id: 'mod-1',
    type: 'listing',
    priority: 'urgent',
    status: 'pending',
    reason: 'Suspected counterfeit book',
    content: { title: 'Harry Potter First Edition', price: 'GH₵50' },
    content_preview: 'Harry Potter First Edition - Listed at unusually low price for claimed edition',
    flagged_by: 'user-123',
    reporter_name: 'Ama Serwaa',
    auto_flagged: false,
    target_user: 'Kofi Mensah',
    flags: ['price_anomaly', 'user_report'],
    created_at: '2024-06-02T10:30:00Z',
  },
  {
    id: 'mod-2',
    type: 'user',
    priority: 'high',
    status: 'pending',
    reason: 'Suspicious activity pattern',
    content: { user_id: 'user-456', activity: 'Multiple failed exchanges' },
    content_preview: '5 cancelled exchanges in 24 hours, all initiated then abandoned',
    auto_flagged: true,
    target_user: 'Yaw Boateng',
    flags: ['system_flag', 'exchange_pattern'],
    created_at: '2024-06-02T09:15:00Z',
  },
  {
    id: 'mod-3',
    type: 'review',
    priority: 'medium',
    status: 'pending',
    reason: 'Potentially fake review',
    content: { review_text: 'Best seller ever! Perfect 10/10!', rating: 5 },
    content_preview: 'Review appears generic with no specific details about the exchange',
    flagged_by: 'user-789',
    reporter_name: 'Efua Darko',
    auto_flagged: true,
    target_user: 'Kwame Asante',
    flags: ['ai_detected', 'user_report'],
    created_at: '2024-06-02T08:45:00Z',
  },
  {
    id: 'mod-4',
    type: 'message',
    priority: 'high',
    status: 'pending',
    reason: 'Inappropriate content detected',
    content: { message: '[Content hidden for review]' },
    content_preview: 'Message contains potentially offensive language',
    auto_flagged: true,
    target_user: 'Anonymous User',
    flags: ['profanity_filter', 'harassment'],
    created_at: '2024-06-02T07:30:00Z',
  },
  {
    id: 'mod-5',
    type: 'listing',
    priority: 'low',
    status: 'pending',
    reason: 'Duplicate listing',
    content: { title: 'Things Fall Apart - Chinua Achebe' },
    content_preview: 'Same book listed twice by same user with different prices',
    auto_flagged: true,
    target_user: 'Akua Mensah',
    flags: ['duplicate_detection'],
    created_at: '2024-06-01T16:20:00Z',
  },
  {
    id: 'mod-6',
    type: 'listing',
    priority: 'medium',
    status: 'escalated',
    reason: 'Copyright concern',
    content: { title: 'PDF Collection - 100 Books' },
    content_preview: 'User attempting to sell digital copies instead of physical books',
    flagged_by: 'user-111',
    reporter_name: 'System Admin',
    auto_flagged: false,
    assigned_to: 'Senior Moderator',
    target_user: 'Kojo Appiah',
    flags: ['copyright', 'policy_violation'],
    created_at: '2024-06-01T14:10:00Z',
  },
];

const mockReports: Report[] = [
  {
    id: 'rep-1',
    type: 'user',
    target_id: 'user-456',
    reported_by: 'user-123',
    reporter_name: 'Ama Serwaa',
    reason: 'Scam attempt',
    category: 'fraud',
    description: 'User asked for payment outside the platform and never showed up',
    evidence: ['screenshot1.png', 'chat_log.txt'],
    status: 'investigating',
    created_at: '2024-06-02T11:00:00Z',
  },
  {
    id: 'rep-2',
    type: 'listing',
    target_id: 'listing-789',
    reported_by: 'user-234',
    reporter_name: 'Kofi Darko',
    reason: 'Fake book',
    category: 'fake',
    description: 'The book condition was described as "like new" but arrived damaged',
    status: 'open',
    created_at: '2024-06-01T15:30:00Z',
  },
];

export default function ModerationPage() {
  const [selectedItem, setSelectedItem] = useState<ModerationQueueItem | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [viewMode, setViewMode] = useState<'queue' | 'reports'>('queue');
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'escalate' | null>(null);

  const filteredItems = useMemo(() => {
    return mockModerationItems.filter((item) => {
      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesType && matchesPriority && matchesStatus;
    });
  }, [filterType, filterPriority, filterStatus]);

  const stats = useMemo(() => {
    const pending = mockModerationItems.filter((i) => i.status === 'pending').length;
    const urgent = mockModerationItems.filter((i) => i.priority === 'urgent').length;
    const escalated = mockModerationItems.filter((i) => i.status === 'escalated').length;
    const autoFlagged = mockModerationItems.filter((i) => i.auto_flagged).length;
    return { pending, urgent, escalated, autoFlagged };
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'listing':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'user':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'review':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'message':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleAction = (action: 'approve' | 'reject' | 'escalate') => {
    setActionType(action);
    setShowActionModal(true);
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffHrs >= 24) {
      return `${Math.floor(diffHrs / 24)}d ago`;
    } else if (diffHrs >= 1) {
      return `${diffHrs}h ago`;
    } else {
      return `${diffMins}m ago`;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Moderation Queue</h1>
          <p className="text-gray-600 mt-1">
            Review flagged content and user reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('queue')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'queue' ? 'bg-white shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Queue
            </button>
            <button
              onClick={() => setViewMode('reports')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'reports' ? 'bg-white shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Reports
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Urgent Items</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.urgent}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Escalated</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.escalated}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Auto-Flagged</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.autoFlagged}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queue List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Types</option>
                <option value="listing">Listings</option>
                <option value="user">Users</option>
                <option value="review">Reviews</option>
                <option value="message">Messages</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="escalated">Escalated</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Queue Items */}
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedItem?.id === item.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      item.type === 'listing' ? 'bg-blue-100 text-blue-600' :
                      item.type === 'user' ? 'bg-purple-100 text-purple-600' :
                      item.type === 'review' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">{item.type}</span>
                        {item.auto_flagged && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            AI Flagged
                          </span>
                        )}
                        <span className="text-xs text-gray-400 dark:text-gray-500">{getTimeSince(item.created_at)}</span>
                      </div>
                      <h3 className="font-medium text-gray-900 mt-1">{item.reason}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.content_preview}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Target: <span className="font-medium">{item.target_user}</span>
                        </span>
                        {item.reporter_name && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Reported by: <span className="font-medium">{item.reporter_name}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 mt-2">
                        {item.flags.map((flag) => (
                          <span key={flag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {flag.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="space-y-6">
            {selectedItem ? (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Item Details</h3>
                    <span className={`text-xs px-2 py-1 rounded-full border capitalize ${getPriorityColor(selectedItem.priority)}`}>
                      {selectedItem.priority}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Type</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{selectedItem.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reason</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedItem.reason}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Content</p>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedItem.content_preview}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Target User</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                          {selectedItem.target_user.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedItem.target_user}</span>
                      </div>
                    </div>
                    {selectedItem.reporter_name && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reported By</p>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedItem.reporter_name}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Flags</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedItem.flags.map((flag) => (
                          <span key={flag} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                            {flag.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAction('approve')}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction('reject')}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject & Remove
                    </button>
                    <button
                      onClick={() => handleAction('escalate')}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      Escalate
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Notes</h3>
                  <textarea
                    placeholder="Add notes for this review..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                    Save Note
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-2">Select an item to review</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'reports' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User Reports</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {mockReports.map((report) => (
              <div key={report.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      report.category === 'fraud' ? 'bg-red-100 text-red-600' :
                      report.category === 'fake' ? 'bg-yellow-100 text-yellow-600' :
                      report.category === 'harassment' ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-100 text-gray-600 dark:text-gray-400'
                    }`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{report.reason}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                          report.status === 'open' ? 'bg-blue-100 text-blue-700' :
                          report.status === 'investigating' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Type: <span className="font-medium capitalize">{report.type}</span></span>
                        <span>Category: <span className="font-medium capitalize">{report.category}</span></span>
                        <span>By: <span className="font-medium">{report.reporter_name}</span></span>
                        <span>{getTimeSince(report.created_at)}</span>
                      </div>
                      {report.evidence && report.evidence.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{report.evidence.length} attachment(s)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                      Investigate
                    </button>
                    <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-900">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {actionType === 'approve' && 'Approve Content'}
              {actionType === 'reject' && 'Reject & Remove Content'}
              {actionType === 'escalate' && 'Escalate to Senior Moderator'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {actionType === 'escalate' ? 'Reason for escalation' : 'Action notes'}
                </label>
                <textarea
                  placeholder={actionType === 'escalate' ? 'Why does this need senior review?' : 'Add notes about this decision...'}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              {actionType === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional action
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Warn user</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Suspend user temporarily</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Ban user permanently</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowActionModal(false)}
                className={`flex-1 px-4 py-2 text-white rounded-lg ${
                  actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                Confirm {actionType === 'approve' ? 'Approval' : actionType === 'reject' ? 'Rejection' : 'Escalation'}
              </button>
              <button
                onClick={() => setShowActionModal(false)}
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
