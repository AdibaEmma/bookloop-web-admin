'use client';

import { useState, useMemo } from 'react';

type ContentType = 'listing' | 'review' | 'message' | 'profile' | 'comment';
type ReportReason = 'spam' | 'inappropriate' | 'harassment' | 'fraud' | 'counterfeit' | 'other';
type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed' | 'escalated';
type ReportPriority = 'low' | 'medium' | 'high' | 'critical';

interface ReportedContent {
  id: string;
  content_type: ContentType;
  content_id: string;
  content_preview: string;
  content_url?: string;
  reported_by: {
    id: string;
    name: string;
    email: string;
  };
  reported_user: {
    id: string;
    name: string;
    email: string;
    previous_reports: number;
  };
  reason: ReportReason;
  description: string;
  evidence_urls: string[];
  status: ReportStatus;
  priority: ReportPriority;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  resolution_notes?: string;
}

const mockReports: ReportedContent[] = [
  {
    id: 'r1',
    content_type: 'listing',
    content_id: 'l123',
    content_preview: 'First Edition Harry Potter Book - Rare Collector\'s Item',
    reported_by: { id: 'u1', name: 'Kwame Mensah', email: 'kwame@example.com' },
    reported_user: { id: 'u5', name: 'Yaw Owusu', email: 'yaw@example.com', previous_reports: 0 },
    reason: 'counterfeit',
    description: 'This appears to be a counterfeit copy. The binding and print quality don\'t match authentic first editions.',
    evidence_urls: ['/evidence/img1.jpg', '/evidence/img2.jpg'],
    status: 'pending',
    priority: 'high',
    created_at: '2024-06-02T14:30:00Z',
    updated_at: '2024-06-02T14:30:00Z',
  },
  {
    id: 'r2',
    content_type: 'review',
    content_id: 'rev456',
    content_preview: 'Terrible seller! Do not buy from them. They are...',
    reported_by: { id: 'u3', name: 'Kofi Asante', email: 'kofi@example.com' },
    reported_user: { id: 'u2', name: 'Ama Darko', email: 'ama@example.com', previous_reports: 2 },
    reason: 'harassment',
    description: 'This review contains personal attacks and offensive language.',
    evidence_urls: [],
    status: 'under_review',
    priority: 'medium',
    created_at: '2024-06-02T10:00:00Z',
    updated_at: '2024-06-02T12:00:00Z',
    assigned_to: 'Sarah Admin',
  },
  {
    id: 'r3',
    content_type: 'message',
    content_id: 'msg789',
    content_preview: 'Hey, if you want to buy this cheaper, just contact me directly at...',
    reported_by: { id: 'u4', name: 'Efua Boateng', email: 'efua@example.com' },
    reported_user: { id: 'u6', name: 'Akua Mensah', email: 'akua@example.com', previous_reports: 1 },
    reason: 'fraud',
    description: 'User is trying to conduct transactions outside the platform to avoid fees.',
    evidence_urls: ['/evidence/chat_screenshot.jpg'],
    status: 'escalated',
    priority: 'critical',
    created_at: '2024-06-01T16:00:00Z',
    updated_at: '2024-06-02T09:00:00Z',
    assigned_to: 'Michael Admin',
  },
  {
    id: 'r4',
    content_type: 'profile',
    content_id: 'prof101',
    content_preview: 'Profile bio contains promotional links to external marketplace',
    reported_by: { id: 'u7', name: 'Kojo Appiah', email: 'kojo@example.com' },
    reported_user: { id: 'u8', name: 'Abena Darko', email: 'abena@example.com', previous_reports: 0 },
    reason: 'spam',
    description: 'User profile is being used to advertise external services.',
    evidence_urls: [],
    status: 'resolved',
    priority: 'low',
    created_at: '2024-05-30T11:00:00Z',
    updated_at: '2024-05-31T14:00:00Z',
    assigned_to: 'David Admin',
    resolution_notes: 'Profile updated. Warning issued to user.',
  },
  {
    id: 'r5',
    content_type: 'listing',
    content_id: 'l456',
    content_preview: 'Vintage Ashanti Kente Cloth - Traditional Weave',
    reported_by: { id: 'u9', name: 'Nana Agyei', email: 'nana@example.com' },
    reported_user: { id: 'u10', name: 'Esi Mensah', email: 'esi@example.com', previous_reports: 3 },
    reason: 'inappropriate',
    description: 'Listing contains misleading cultural claims about the item\'s origin.',
    evidence_urls: ['/evidence/listing_detail.jpg'],
    status: 'pending',
    priority: 'medium',
    created_at: '2024-06-02T08:00:00Z',
    updated_at: '2024-06-02T08:00:00Z',
  },
  {
    id: 'r6',
    content_type: 'comment',
    content_id: 'cmt202',
    content_preview: 'This book is overpriced garbage. The seller is a...',
    reported_by: { id: 'u1', name: 'Kwame Mensah', email: 'kwame@example.com' },
    reported_user: { id: 'u7', name: 'Kojo Appiah', email: 'kojo@example.com', previous_reports: 0 },
    reason: 'harassment',
    description: 'Comment contains inappropriate language and personal attacks.',
    evidence_urls: [],
    status: 'dismissed',
    priority: 'low',
    created_at: '2024-05-28T15:00:00Z',
    updated_at: '2024-05-29T10:00:00Z',
    assigned_to: 'Emma Admin',
    resolution_notes: 'Comment reviewed. Language is strong but within guidelines.',
  },
];

export default function ReportedContentPage() {
  const [filterContentType, setFilterContentType] = useState<ContentType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<ReportPriority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<ReportedContent | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'resolve' | 'dismiss' | 'escalate' | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const filteredReports = useMemo(() => {
    return mockReports.filter((report) => {
      const matchesContentType = filterContentType === 'all' || report.content_type === filterContentType;
      const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || report.priority === filterPriority;
      const matchesSearch =
        !searchQuery ||
        report.content_preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reported_user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reported_by.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesContentType && matchesStatus && matchesPriority && matchesSearch;
    });
  }, [filterContentType, filterStatus, filterPriority, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: mockReports.length,
      pending: mockReports.filter((r) => r.status === 'pending').length,
      underReview: mockReports.filter((r) => r.status === 'under_review').length,
      escalated: mockReports.filter((r) => r.status === 'escalated').length,
      critical: mockReports.filter((r) => r.priority === 'critical').length,
    };
  }, []);

  const getContentTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'listing':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'review':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'message':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'profile':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'comment':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        );
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      under_review: 'bg-blue-100 text-blue-700',
      resolved: 'bg-green-100 text-green-700',
      dismissed: 'bg-gray-100 text-gray-600 dark:text-gray-400',
      escalated: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${styles[status]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority: ReportPriority) => {
    const styles = {
      low: 'bg-gray-100 text-gray-600 dark:text-gray-400',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${styles[priority]}`}>
        {priority}
      </span>
    );
  };

  const getReasonLabel = (reason: ReportReason) => {
    const labels: Record<ReportReason, string> = {
      spam: 'Spam',
      inappropriate: 'Inappropriate Content',
      harassment: 'Harassment',
      fraud: 'Fraud/Scam',
      counterfeit: 'Counterfeit Item',
      other: 'Other',
    };
    return labels[reason];
  };

  const handleAction = (report: ReportedContent, action: 'resolve' | 'dismiss' | 'escalate') => {
    setSelectedReport(report);
    setActionType(action);
    setShowActionModal(true);
  };

  const executeAction = () => {
    console.log(`Executing ${actionType} on report ${selectedReport?.id} with notes: ${resolutionNotes}`);
    setShowActionModal(false);
    setSelectedReport(null);
    setActionType(null);
    setResolutionNotes('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reported Content Center</h1>
          <p className="text-gray-600 mt-1">
            Review and moderate user-reported content across the platform
          </p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
          Export Reports
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Reports</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Under Review</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.underReview}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Escalated</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.escalated}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Critical Priority</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.critical}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <select
          value={filterContentType}
          onChange={(e) => setFilterContentType(e.target.value as ContentType | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Content Types</option>
          <option value="listing">Listings</option>
          <option value="review">Reviews</option>
          <option value="message">Messages</option>
          <option value="profile">Profiles</option>
          <option value="comment">Comments</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ReportStatus | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="escalated">Escalated</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as ReportPriority | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Priority</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Reports List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">{filteredReports.length} reports found</p>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredReports.map((report) => (
            <div key={report.id} className="p-4 hover:bg-gray-50 dark:bg-gray-900">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    report.priority === 'critical' ? 'bg-red-100 text-red-600' :
                    report.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-100 text-gray-600 dark:text-gray-400'
                  }`}>
                    {getContentTypeIcon(report.content_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900 truncate max-w-md">
                        {report.content_preview}
                      </p>
                      {getStatusBadge(report.status)}
                      {getPriorityBadge(report.priority)}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="capitalize">{report.content_type}</span>
                      <span>·</span>
                      <span>{getReasonLabel(report.reason)}</span>
                      <span>·</span>
                      <span>Reported by {report.reported_by.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{report.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(report.created_at).toLocaleDateString()}
                      </div>
                      {report.evidence_urls.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          {report.evidence_urls.length} attachment{report.evidence_urls.length !== 1 ? 's' : ''}
                        </div>
                      )}
                      {report.assigned_to && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Assigned to {report.assigned_to}
                        </div>
                      )}
                      {report.reported_user.previous_reports > 0 && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                          {report.reported_user.previous_reports} previous report{report.reported_user.previous_reports !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {(report.status === 'pending' || report.status === 'under_review') && (
                    <>
                      <button
                        onClick={() => handleAction(report, 'resolve')}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleAction(report, 'dismiss')}
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 dark:bg-gray-900"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleAction(report, 'escalate')}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                      >
                        Escalate
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-400"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Resolution Notes */}
              {report.resolution_notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Resolution Notes:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{report.resolution_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Report Detail Sidebar */}
      {selectedReport && !showActionModal && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-xl z-40 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
            <h3 className="font-semibold text-gray-900 dark:text-white">Report Details</h3>
            <button
              onClick={() => setSelectedReport(null)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 space-y-6">
            {/* Content Info */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Reported Content</p>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-8 h-8 rounded flex items-center justify-center ${
                    selectedReport.priority === 'critical' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600 dark:text-gray-400'
                  }`}>
                    {getContentTypeIcon(selectedReport.content_type)}
                  </span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {selectedReport.content_type}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedReport.content_preview}</p>
              </div>
            </div>

            {/* Report Info */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Report Information</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  {getStatusBadge(selectedReport.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Priority</span>
                  {getPriorityBadge(selectedReport.priority)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Reason</span>
                  <span className="text-sm text-gray-900 dark:text-white">{getReasonLabel(selectedReport.reason)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(selectedReport.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Description</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{selectedReport.description}</p>
            </div>

            {/* Reporter */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Reported By</p>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-medium">
                  {selectedReport.reported_by.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedReport.reported_by.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedReport.reported_by.email}</p>
                </div>
              </div>
            </div>

            {/* Reported User */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Reported User</p>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-medium">
                  {selectedReport.reported_user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedReport.reported_user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedReport.reported_user.email}</p>
                </div>
                {selectedReport.reported_user.previous_reports > 0 && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                    {selectedReport.reported_user.previous_reports} prior
                  </span>
                )}
              </div>
            </div>

            {/* Evidence */}
            {selectedReport.evidence_urls.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Evidence</p>
                <div className="space-y-2">
                  {selectedReport.evidence_urls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="text-sm text-indigo-600 truncate">{url.split('/').pop()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {(selectedReport.status === 'pending' || selectedReport.status === 'under_review') && (
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleAction(selectedReport, 'resolve')}
                  className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                >
                  Resolve
                </button>
                <button
                  onClick={() => handleAction(selectedReport, 'dismiss')}
                  className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 dark:bg-gray-900"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => handleAction(selectedReport, 'escalate')}
                  className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                >
                  Escalate
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedReport && actionType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {actionType === 'resolve' && 'Resolve Report'}
              {actionType === 'dismiss' && 'Dismiss Report'}
              {actionType === 'escalate' && 'Escalate Report'}
            </h2>

            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm text-gray-700 font-medium">{selectedReport.content_preview}</p>
              <p className="text-xs text-gray-500 mt-1">
                Reported by {selectedReport.reported_by.name} · {getReasonLabel(selectedReport.reason)}
              </p>
            </div>

            {actionType === 'escalate' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-sm text-red-700">
                  This will escalate the report to senior moderators for immediate review.
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {actionType === 'resolve' ? 'Resolution Notes' :
                 actionType === 'dismiss' ? 'Reason for Dismissal' :
                 'Escalation Notes'}
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder={
                  actionType === 'resolve' ? 'Describe the action taken...' :
                  actionType === 'dismiss' ? 'Explain why this report is being dismissed...' :
                  'Explain why this needs escalation...'
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={executeAction}
                className={`flex-1 px-4 py-2 text-white rounded-lg ${
                  actionType === 'resolve' ? 'bg-green-600 hover:bg-green-700' :
                  actionType === 'dismiss' ? 'bg-gray-600 hover:bg-gray-700' :
                  'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setActionType(null);
                  setResolutionNotes('');
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
