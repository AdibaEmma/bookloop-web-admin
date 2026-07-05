'use client';

import { useState, useMemo } from 'react';
import type { User } from '@/types/admin';

// Mock Users Data
const mockUsers: User[] = [
  { id: 'u1', email: 'kwame.mensah@gmail.com', first_name: 'Kwame', last_name: 'Mensah', is_active: true, is_verified: true, created_at: '2023-06-15', last_login_at: '2024-06-02', location: { city: 'Accra', region: 'Greater Accra' }, stats: { total_listings: 24, total_exchanges: 45, successful_exchanges: 42, rating: 4.9 } },
  { id: 'u2', email: 'ama.darko@yahoo.com', first_name: 'Ama', last_name: 'Darko', is_active: true, is_verified: true, created_at: '2023-09-20', last_login_at: '2024-06-01', location: { city: 'Kumasi', region: 'Ashanti' }, stats: { total_listings: 18, total_exchanges: 32, successful_exchanges: 30, rating: 4.7 } },
  { id: 'u3', email: 'kofi.asante@outlook.com', first_name: 'Kofi', last_name: 'Asante', is_active: false, is_verified: true, created_at: '2024-01-10', last_login_at: '2024-04-15', location: { city: 'Tamale', region: 'Northern' }, stats: { total_listings: 5, total_exchanges: 8, successful_exchanges: 6, rating: 4.2 } },
  { id: 'u4', email: 'efua.boateng@gmail.com', first_name: 'Efua', last_name: 'Boateng', is_active: true, is_verified: false, created_at: '2024-03-05', last_login_at: '2024-05-28', location: { city: 'Cape Coast', region: 'Central' }, stats: { total_listings: 12, total_exchanges: 15, successful_exchanges: 14, rating: 4.5 } },
  { id: 'u5', email: 'yaw.owusu@gmail.com', first_name: 'Yaw', last_name: 'Owusu', is_active: true, is_verified: true, created_at: '2023-11-20', last_login_at: '2024-06-02', location: { city: 'Takoradi', region: 'Western' }, stats: { total_listings: 20, total_exchanges: 28, successful_exchanges: 26, rating: 4.6 } },
  { id: 'u6', email: 'akua.mensah@hotmail.com', first_name: 'Akua', last_name: 'Mensah', is_active: true, is_verified: true, created_at: '2024-02-15', last_login_at: '2024-05-30', location: { city: 'Accra', region: 'Greater Accra' }, stats: { total_listings: 8, total_exchanges: 12, successful_exchanges: 11, rating: 4.4 } },
  { id: 'u7', email: 'kojo.appiah@gmail.com', first_name: 'Kojo', last_name: 'Appiah', is_active: false, is_verified: false, created_at: '2024-04-01', last_login_at: '2024-04-20', location: { city: 'Ho', region: 'Volta' }, stats: { total_listings: 2, total_exchanges: 1, successful_exchanges: 1, rating: 4.0 } },
  { id: 'u8', email: 'abena.darko@yahoo.com', first_name: 'Abena', last_name: 'Darko', is_active: true, is_verified: true, created_at: '2023-08-10', last_login_at: '2024-06-01', location: { city: 'Kumasi', region: 'Ashanti' }, stats: { total_listings: 15, total_exchanges: 22, successful_exchanges: 20, rating: 4.8 } },
  { id: 'u9', email: 'nana.agyei@gmail.com', first_name: 'Nana', last_name: 'Agyei', is_active: true, is_verified: true, created_at: '2023-07-25', last_login_at: '2024-05-29', location: { city: 'Sunyani', region: 'Bono' }, stats: { total_listings: 30, total_exchanges: 38, successful_exchanges: 35, rating: 4.7 } },
  { id: 'u10', email: 'esi.mensah@outlook.com', first_name: 'Esi', last_name: 'Mensah', is_active: true, is_verified: false, created_at: '2024-01-20', last_login_at: '2024-05-25', location: { city: 'Bolgatanga', region: 'Upper East' }, stats: { total_listings: 6, total_exchanges: 9, successful_exchanges: 8, rating: 4.3 } },
];

type BulkAction = 'activate' | 'deactivate' | 'verify' | 'send_email' | 'send_notification' | 'export' | 'delete' | 'add_to_segment';

interface ActionLog {
  id: string;
  action: string;
  users_affected: number;
  performed_by: string;
  performed_at: string;
  status: 'success' | 'failed' | 'partial';
}

const recentActions: ActionLog[] = [
  { id: 'a1', action: 'Bulk verify users', users_affected: 45, performed_by: 'Admin Sarah', performed_at: '2024-06-02T10:30:00Z', status: 'success' },
  { id: 'a2', action: 'Send promotional email', users_affected: 234, performed_by: 'Admin Michael', performed_at: '2024-06-01T15:00:00Z', status: 'success' },
  { id: 'a3', action: 'Deactivate inactive users', users_affected: 12, performed_by: 'Admin Sarah', performed_at: '2024-05-30T09:00:00Z', status: 'partial' },
];

export default function BulkActionsPage() {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<BulkAction | null>(null);
  const [actionMessage, setActionMessage] = useState('');

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const matchesSearch =
        user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = filterRegion === 'all' || user.location?.region === filterRegion;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && user.is_active) ||
        (filterStatus === 'inactive' && !user.is_active);
      const matchesVerified =
        filterVerified === 'all' ||
        (filterVerified === 'verified' && user.is_verified) ||
        (filterVerified === 'unverified' && !user.is_verified);
      return matchesSearch && matchesRegion && matchesStatus && matchesVerified;
    });
  }, [searchQuery, filterRegion, filterStatus, filterVerified]);

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleAction = (action: BulkAction) => {
    setSelectedAction(action);
    setShowActionModal(true);
  };

  const executeAction = () => {
    // In real implementation, this would call the API
    console.log(`Executing ${selectedAction} on ${selectedUsers.size} users`);
    setShowActionModal(false);
    setSelectedUsers(new Set());
  };

  const getActionDetails = (action: BulkAction) => {
    switch (action) {
      case 'activate':
        return { title: 'Activate Users', description: 'Activate selected user accounts', icon: 'check', color: 'green' };
      case 'deactivate':
        return { title: 'Deactivate Users', description: 'Deactivate selected user accounts', icon: 'x', color: 'red' };
      case 'verify':
        return { title: 'Verify Users', description: 'Mark selected users as verified', icon: 'shield', color: 'blue' };
      case 'send_email':
        return { title: 'Send Email', description: 'Send bulk email to selected users', icon: 'mail', color: 'indigo' };
      case 'send_notification':
        return { title: 'Send Notification', description: 'Send push notification to selected users', icon: 'bell', color: 'purple' };
      case 'export':
        return { title: 'Export Users', description: 'Export selected user data to CSV', icon: 'download', color: 'gray' };
      case 'delete':
        return { title: 'Delete Users', description: 'Permanently delete selected users', icon: 'trash', color: 'red' };
      case 'add_to_segment':
        return { title: 'Add to Segment', description: 'Add selected users to a segment', icon: 'users', color: 'orange' };
      default:
        return { title: 'Action', description: '', icon: 'cog', color: 'gray' };
    }
  };

  const regions = [...new Set(mockUsers.map((u) => u.location?.region).filter(Boolean))];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bulk User Actions</h1>
          <p className="text-muted-foreground mt-1">
            Select multiple users to perform batch operations
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-5">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold text-foreground mt-1">{mockUsers.length}</p>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-5">
          <p className="text-sm text-muted-foreground">Filtered Results</p>
          <p className="text-2xl font-bold text-foreground mt-1">{filteredUsers.length}</p>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-5">
          <p className="text-sm text-muted-foreground">Selected</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{selectedUsers.size}</p>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-5">
          <p className="text-sm text-muted-foreground">Active Users</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {mockUsers.filter((u) => u.is_active).length}
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      {selectedUsers.size > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-indigo-700 font-medium">
              {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleAction('activate')}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
              >
                Activate
              </button>
              <button
                onClick={() => handleAction('deactivate')}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleAction('verify')}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Verify
              </button>
              <button
                onClick={() => handleAction('send_email')}
                className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
              >
                Send Email
              </button>
              <button
                onClick={() => handleAction('send_notification')}
                className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
              >
                Send Notification
              </button>
              <button
                onClick={() => handleAction('add_to_segment')}
                className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700"
              >
                Add to Segment
              </button>
              <button
                onClick={() => handleAction('export')}
                className="px-3 py-1.5 border border-[#E4DED2] text-foreground text-sm rounded-lg hover:bg-background"
              >
                Export
              </button>
              <button
                onClick={() => handleAction('delete')}
                className="px-3 py-1.5 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-[#E4DED2] rounded-lg"
          />
        </div>
        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="px-3 py-2 border border-[#E4DED2] rounded-lg"
        >
          <option value="all">All Regions</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-[#E4DED2] rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={filterVerified}
          onChange={(e) => setFilterVerified(e.target.value)}
          className="px-3 py-2 border border-[#E4DED2] rounded-lg"
        >
          <option value="all">All Verification</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#ECE6DC] dark:border-[#33291f]">
          <div className="p-4 border-b border-[#ECE6DC] flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-[#E4DED2]"
              />
              <span className="text-sm text-foreground">Select all</span>
            </label>
            <span className="text-sm text-muted-foreground">{filteredUsers.length} users</span>
          </div>
          <div className="divide-y divide-[#F0EBE1] max-h-[500px] overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`p-4 flex items-center gap-4 hover:bg-background cursor-pointer ${
                  selectedUsers.has(user.id) ? 'bg-indigo-50' : ''
                }`}
                onClick={() => toggleUser(user.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.has(user.id)}
                  onChange={() => toggleUser(user.id)}
                  className="rounded border-[#E4DED2]"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-medium">
                  {user.first_name[0]}{user.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">
                      {user.first_name} {user.last_name}
                    </p>
                    {user.is_verified && (
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{user.location?.region}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    user.is_active ? 'bg-green-100 text-green-700' : 'bg-[#F1ECE3] text-muted-foreground'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Actions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
            <h3 className="font-semibold text-foreground mb-4">Recent Bulk Actions</h3>
            <div className="space-y-3">
              {recentActions.map((action) => (
                <div key={action.id} className="p-3 bg-background rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">{action.action}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      action.status === 'success' ? 'bg-green-100 text-green-700' :
                      action.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {action.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {action.users_affected} users · {action.performed_by}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(action.performed_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Filters</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setFilterStatus('inactive');
                  setFilterRegion('all');
                  setFilterVerified('all');
                }}
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-background rounded-lg"
              >
                Inactive users (30+ days)
              </button>
              <button
                onClick={() => {
                  setFilterVerified('unverified');
                  setFilterStatus('all');
                  setFilterRegion('all');
                }}
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-background rounded-lg"
              >
                Unverified users
              </button>
              <button
                onClick={() => {
                  setFilterStatus('active');
                  setFilterRegion('all');
                  setFilterVerified('all');
                }}
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-background rounded-lg"
              >
                Active users only
              </button>
              <button
                onClick={() => {
                  setFilterRegion('Greater Accra');
                  setFilterStatus('all');
                  setFilterVerified('all');
                }}
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-background rounded-lg"
              >
                Greater Accra region
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#241c16] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {getActionDetails(selectedAction).title}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {getActionDetails(selectedAction).description}
            </p>

            <div className="p-3 bg-background rounded-lg mb-4">
              <p className="text-sm text-foreground">
                This action will affect <span className="font-bold">{selectedUsers.size}</span> user{selectedUsers.size > 1 ? 's' : ''}
              </p>
            </div>

            {(selectedAction === 'send_email' || selectedAction === 'send_notification') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1">Message</label>
                <textarea
                  value={actionMessage}
                  onChange={(e) => setActionMessage(e.target.value)}
                  placeholder="Enter your message..."
                  rows={4}
                  className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg"
                />
              </div>
            )}

            {selectedAction === 'add_to_segment' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1">Select Segment</label>
                <select className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg">
                  <option value="">Choose a segment...</option>
                  <option value="power_traders">Power Traders</option>
                  <option value="new_enthusiasts">New Enthusiasts</option>
                  <option value="at_risk">At-Risk Users</option>
                  <option value="regional_champions">Regional Champions</option>
                </select>
              </div>
            )}

            {selectedAction === 'delete' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-sm text-red-700">
                  Warning: This action cannot be undone. All user data will be permanently deleted.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={executeAction}
                className={`flex-1 px-4 py-2 text-white rounded-lg ${
                  selectedAction === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                  selectedAction === 'deactivate' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                Confirm
              </button>
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 border border-[#E4DED2] text-foreground rounded-lg hover:bg-background"
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
