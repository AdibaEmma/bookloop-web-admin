'use client';

import { useState, useMemo } from 'react';
import type { Dispute, DisputeMessage, Evidence } from '@/types/admin';

// Extended types for display
interface DisputeWithDetails extends Omit<Dispute, 'exchange'> {
  initiator_avatar?: string;
  recipient_name: string;
  recipient_avatar?: string;
  book_title: string;
  exchange_type: 'swap' | 'purchase';
  exchange_amount?: number;
}

// Mock Data
const mockDisputes: DisputeWithDetails[] = [
  {
    id: 'disp-1',
    exchange_id: 'exc-123',
    initiated_by: 'user-1',
    initiator_name: 'Kwame Mensah',
    recipient_name: 'Ama Darko',
    reason: 'Book condition not as described',
    category: 'item_not_as_described',
    description: 'The book was listed as "Like New" but arrived with torn pages and water damage. The spine is also broken.',
    evidence: [
      { id: 'ev-1', type: 'image', url: '/evidence/photo1.jpg', description: 'Damaged cover', uploaded_by: 'user-1', uploaded_at: '2024-06-01T10:30:00Z' },
      { id: 'ev-2', type: 'image', url: '/evidence/photo2.jpg', description: 'Torn pages', uploaded_by: 'user-1', uploaded_at: '2024-06-01T10:31:00Z' },
    ],
    status: 'investigating',
    priority: 'high',
    assigned_to: 'Admin Sarah',
    messages: [
      { id: 'msg-1', sender_id: 'user-1', sender_name: 'Kwame Mensah', sender_role: 'initiator', message: 'I received the book today and it\'s nothing like the photos showed. There is significant damage.', created_at: '2024-06-01T10:35:00Z' },
      { id: 'msg-2', sender_id: 'admin-1', sender_name: 'Admin Sarah', sender_role: 'admin', message: 'Thank you for reporting this. We\'re reviewing the evidence you provided. We\'ll contact the other party.', created_at: '2024-06-01T11:00:00Z' },
      { id: 'msg-3', sender_id: 'user-2', sender_name: 'Ama Darko', sender_role: 'recipient', message: 'The book was in good condition when I shipped it. It must have been damaged during transit.', created_at: '2024-06-01T14:20:00Z' },
    ],
    created_at: '2024-06-01T10:30:00Z',
    book_title: 'Things Fall Apart - Chinua Achebe',
    exchange_type: 'purchase',
    exchange_amount: 35,
  },
  {
    id: 'disp-2',
    exchange_id: 'exc-124',
    initiated_by: 'user-3',
    initiator_name: 'Kofi Asante',
    recipient_name: 'Yaw Boateng',
    reason: 'No show at scheduled meetup',
    category: 'no_show',
    description: 'We agreed to meet at Accra Mall at 2pm. I waited for 2 hours but the other person never showed up and stopped responding to messages.',
    evidence: [
      { id: 'ev-3', type: 'screenshot', url: '/evidence/chat1.jpg', description: 'Chat confirmation', uploaded_by: 'user-3', uploaded_at: '2024-05-30T16:00:00Z' },
    ],
    status: 'awaiting_response',
    priority: 'medium',
    messages: [
      { id: 'msg-4', sender_id: 'user-3', sender_name: 'Kofi Asante', sender_role: 'initiator', message: 'I traveled from Kumasi specifically for this exchange and he didn\'t show up. This cost me money for transport.', created_at: '2024-05-30T16:05:00Z' },
    ],
    created_at: '2024-05-30T16:00:00Z',
    book_title: 'Half of a Yellow Sun',
    exchange_type: 'swap',
  },
  {
    id: 'disp-3',
    exchange_id: 'exc-125',
    initiated_by: 'user-4',
    initiator_name: 'Efua Mensah',
    recipient_name: 'Akua Owusu',
    reason: 'Wrong book received',
    category: 'wrong_item',
    description: 'I ordered "Purple Hibiscus" but received "Americanah" instead. Both are good books but this is not what I agreed to exchange.',
    evidence: [
      { id: 'ev-4', type: 'image', url: '/evidence/wrong_book.jpg', description: 'Wrong book received', uploaded_by: 'user-4', uploaded_at: '2024-05-28T09:00:00Z' },
    ],
    status: 'open',
    priority: 'low',
    messages: [],
    created_at: '2024-05-28T09:00:00Z',
    book_title: 'Purple Hibiscus',
    exchange_type: 'swap',
  },
  {
    id: 'disp-4',
    exchange_id: 'exc-126',
    initiated_by: 'user-5',
    initiator_name: 'Kojo Appiah',
    recipient_name: 'Abena Darko',
    reason: 'Payment not received',
    category: 'payment_issue',
    description: 'The buyer received my book but claims the mobile money payment failed. I have not received any payment.',
    evidence: [
      { id: 'ev-5', type: 'screenshot', url: '/evidence/payment.jpg', description: 'Payment confirmation from buyer', uploaded_by: 'user-5', uploaded_at: '2024-06-02T08:00:00Z' },
    ],
    status: 'mediation',
    priority: 'urgent',
    assigned_to: 'Admin Michael',
    messages: [
      { id: 'msg-5', sender_id: 'user-5', sender_name: 'Kojo Appiah', sender_role: 'initiator', message: 'I shipped the book and the buyer confirmed receipt but I haven\'t received my GH₵45.', created_at: '2024-06-02T08:05:00Z' },
      { id: 'msg-6', sender_id: 'user-6', sender_name: 'Abena Darko', sender_role: 'recipient', message: 'I sent the money via MTN MoMo. Here is my transaction ID: MTN123456789', created_at: '2024-06-02T09:00:00Z' },
      { id: 'msg-7', sender_id: 'admin-2', sender_name: 'Admin Michael', sender_role: 'admin', message: 'We are contacting MTN to verify this transaction. Please allow 24-48 hours for resolution.', created_at: '2024-06-02T10:30:00Z' },
    ],
    created_at: '2024-06-02T08:00:00Z',
    book_title: 'Ghana Must Go',
    exchange_type: 'purchase',
    exchange_amount: 45,
  },
  {
    id: 'disp-5',
    exchange_id: 'exc-127',
    initiated_by: 'user-7',
    initiator_name: 'Nana Agyei',
    recipient_name: 'Esi Mensah',
    reason: 'Item damaged during exchange',
    category: 'damaged_item',
    description: 'During the meetup, the other person accidentally dropped my book in a puddle. Now it\'s water damaged.',
    evidence: [],
    status: 'resolved',
    priority: 'medium',
    resolution: {
      type: 'mutual_agreement',
      description: 'Both parties agreed that the recipient would pay GH₵15 compensation for the damage.',
      resolved_by: 'Admin Sarah',
      resolved_at: '2024-05-25T16:00:00Z',
    },
    messages: [
      { id: 'msg-8', sender_id: 'user-7', sender_name: 'Nana Agyei', sender_role: 'initiator', message: 'It was an accident but my book is ruined now.', created_at: '2024-05-24T14:00:00Z' },
      { id: 'msg-9', sender_id: 'user-8', sender_name: 'Esi Mensah', sender_role: 'recipient', message: 'I\'m so sorry! I\'m willing to compensate you for the damage.', created_at: '2024-05-24T15:00:00Z' },
    ],
    created_at: '2024-05-24T14:00:00Z',
    book_title: 'Homegoing',
    exchange_type: 'swap',
  },
];

const disputeStats = {
  open: mockDisputes.filter((d) => d.status === 'open').length,
  investigating: mockDisputes.filter((d) => d.status === 'investigating').length,
  mediation: mockDisputes.filter((d) => d.status === 'mediation').length,
  resolved: mockDisputes.filter((d) => d.status === 'resolved').length,
  avgResolutionTime: '2.3 days',
  satisfactionRate: 87,
};

export default function DisputesPage() {
  const [selectedDispute, setSelectedDispute] = useState<DisputeWithDetails | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [newMessage, setNewMessage] = useState('');
  const [showResolutionModal, setShowResolutionModal] = useState(false);

  const filteredDisputes = useMemo(() => {
    return mockDisputes.filter((dispute) => {
      const matchesStatus = filterStatus === 'all' || dispute.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || dispute.category === filterCategory;
      const matchesPriority = filterPriority === 'all' || dispute.priority === filterPriority;
      return matchesStatus && matchesCategory && matchesPriority;
    });
  }, [filterStatus, filterCategory, filterPriority]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-700';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-700';
      case 'awaiting_response':
        return 'bg-purple-100 text-purple-700';
      case 'mediation':
        return 'bg-orange-100 text-orange-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'escalated':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700 dark:text-gray-300';
    }
  };

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'item_not_as_described':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'no_show':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'wrong_item':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'payment_issue':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'damaged_item':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else {
      return `${diffHrs}h ago`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dispute Resolution Center</h1>
          <p className="text-gray-600 mt-1">
            Manage and resolve user disputes fairly and efficiently
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Open</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{disputeStats.open}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Investigating</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{disputeStats.investigating}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">In Mediation</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{disputeStats.mediation}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Resolved</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{disputeStats.resolved}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Avg Resolution</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{disputeStats.avgResolutionTime}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Satisfaction</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{disputeStats.satisfactionRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disputes List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="awaiting_response">Awaiting Response</option>
              <option value="mediation">In Mediation</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Categories</option>
              <option value="item_not_as_described">Item Not As Described</option>
              <option value="no_show">No Show</option>
              <option value="wrong_item">Wrong Item</option>
              <option value="payment_issue">Payment Issue</option>
              <option value="damaged_item">Damaged Item</option>
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
          </div>

          {/* Dispute Cards */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredDisputes.map((dispute) => (
              <button
                key={dispute.id}
                onClick={() => setSelectedDispute(dispute)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedDispute?.id === dispute.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(dispute.status)}`}>
                    {dispute.status.replace('_', ' ')}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(dispute.priority)}`}>
                    {dispute.priority}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 text-sm">{dispute.reason}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{dispute.description}</p>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-400 dark:text-gray-500">
                  <span>{dispute.initiator_name}</span>
                  <span>{getTimeSince(dispute.created_at)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dispute Detail */}
        <div className="lg:col-span-2">
          {selectedDispute ? (
            <div className="space-y-6">
              {/* Dispute Header */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedDispute.category === 'payment_issue' ? 'bg-red-100 text-red-600' :
                      selectedDispute.category === 'no_show' ? 'bg-orange-100 text-orange-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {getCategoryIcon(selectedDispute.category)}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedDispute.reason}</h2>
                      <p className="text-sm text-gray-500 capitalize">
                        {selectedDispute.category.replace(/_/g, ' ')} · {selectedDispute.book_title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedDispute.status)}`}>
                      {selectedDispute.status.replace('_', ' ')}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(selectedDispute.priority)}`}>
                      {selectedDispute.priority}
                    </span>
                  </div>
                </div>

                {/* Parties Involved */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Initiator</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                        {selectedDispute.initiator_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedDispute.initiator_name}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Recipient</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-medium">
                        {selectedDispute.recipient_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedDispute.recipient_name}</span>
                    </div>
                  </div>
                </div>

                {/* Exchange Details */}
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Exchange Details</p>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{selectedDispute.book_title}</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {selectedDispute.exchange_type}
                        {selectedDispute.exchange_amount && ` · GH₵${selectedDispute.exchange_amount}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Description</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedDispute.description}</p>
                </div>

                {/* Evidence */}
                {selectedDispute.evidence.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Evidence ({selectedDispute.evidence.length})</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedDispute.evidence.map((ev) => (
                        <div key={ev.id} className="relative group">
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
                            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate w-20">{ev.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolution (if resolved) */}
                {selectedDispute.resolution && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-green-800">Resolved</span>
                    </div>
                    <p className="text-sm text-green-700">{selectedDispute.resolution.description}</p>
                    <p className="text-xs text-green-600 mt-2">
                      Resolved by {selectedDispute.resolution.resolved_by} on{' '}
                      {new Date(selectedDispute.resolution.resolved_at).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {selectedDispute.status !== 'resolved' && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setShowResolutionModal(true)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Resolve Dispute
                    </button>
                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                      Escalate
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-900">
                      Assign
                    </button>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Communication History</h3>
                </div>
                <div className="p-4 max-h-80 overflow-y-auto space-y-4">
                  {selectedDispute.messages.length > 0 ? (
                    selectedDispute.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.sender_role === 'admin' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 ${
                          msg.sender_role === 'admin' ? 'bg-indigo-500' :
                          msg.sender_role === 'initiator' ? 'bg-blue-500' :
                          'bg-purple-500'
                        }`}>
                          {msg.sender_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className={`flex-1 ${msg.sender_role === 'admin' ? 'text-right' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{msg.sender_name}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              msg.sender_role === 'admin' ? 'bg-indigo-100 text-indigo-700' :
                              msg.sender_role === 'initiator' ? 'bg-blue-100 text-blue-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {msg.sender_role}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(msg.created_at)}</span>
                          </div>
                          <p className={`text-sm text-gray-700 p-3 rounded-lg inline-block ${
                            msg.sender_role === 'admin' ? 'bg-indigo-50' : 'bg-gray-50 dark:bg-gray-900'
                          }`}>
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">No messages yet</p>
                  )}
                </div>
                {selectedDispute.status !== 'resolved' && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-12">
              <div className="text-center text-gray-500 dark:text-gray-400 dark:text-gray-500">
                <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-4 text-lg font-medium">Select a dispute to view details</p>
                <p className="mt-1 text-sm">Choose from the list on the left to see the full dispute information</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resolution Modal */}
      {showResolutionModal && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resolve Dispute</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="refund">Full Refund to Initiator</option>
                  <option value="exchange_cancelled">Cancel Exchange</option>
                  <option value="in_favor_initiator">In Favor of Initiator</option>
                  <option value="in_favor_recipient">In Favor of Recipient</option>
                  <option value="mutual_agreement">Mutual Agreement</option>
                  <option value="no_action">No Action Required</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Details</label>
                <textarea
                  placeholder="Describe the resolution and any actions taken..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Actions</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Notify both parties</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Issue warning to violating party</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Update trust scores</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowResolutionModal(false)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Confirm Resolution
              </button>
              <button
                onClick={() => setShowResolutionModal(false)}
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
