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
];

interface ImpersonationSession {
  id: string;
  user_id: string;
  user_name: string;
  admin_id: string;
  admin_name: string;
  started_at: string;
  ended_at: string | null;
  reason: string;
  actions_performed: number;
  status: 'active' | 'ended';
}

const impersonationHistory: ImpersonationSession[] = [
  { id: 's1', user_id: 'u1', user_name: 'Kwame Mensah', admin_id: 'admin1', admin_name: 'Sarah Admin', started_at: '2024-06-02T14:30:00Z', ended_at: '2024-06-02T14:45:00Z', reason: 'Investigating payment issue', actions_performed: 12, status: 'ended' },
  { id: 's2', user_id: 'u2', user_name: 'Ama Darko', admin_id: 'admin2', admin_name: 'Michael Admin', started_at: '2024-06-01T10:00:00Z', ended_at: '2024-06-01T10:20:00Z', reason: 'User support request - listing not visible', actions_performed: 8, status: 'ended' },
  { id: 's3', user_id: 'u4', user_name: 'Efua Boateng', admin_id: 'admin1', admin_name: 'Sarah Admin', started_at: '2024-05-30T16:15:00Z', ended_at: '2024-05-30T16:35:00Z', reason: 'Verifying account setup', actions_performed: 5, status: 'ended' },
  { id: 's4', user_id: 'u3', user_name: 'Kofi Asante', admin_id: 'admin3', admin_name: 'David Admin', started_at: '2024-05-28T09:00:00Z', ended_at: null, reason: 'Debugging exchange flow', actions_performed: 3, status: 'active' },
];

export default function UserImpersonationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [impersonationReason, setImpersonationReason] = useState('');
  const [activeSession, setActiveSession] = useState<ImpersonationSession | null>(
    impersonationHistory.find(s => s.status === 'active') || null
  );
  const [historyFilter, setHistoryFilter] = useState<'all' | 'active' | 'ended'>('all');

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return mockUsers.filter(
      (user) =>
        user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredHistory = useMemo(() => {
    if (historyFilter === 'all') return impersonationHistory;
    return impersonationHistory.filter((s) => s.status === historyFilter);
  }, [historyFilter]);

  const handleStartImpersonation = () => {
    if (selectedUser && impersonationReason.trim()) {
      const newSession: ImpersonationSession = {
        id: `s${Date.now()}`,
        user_id: selectedUser.id,
        user_name: `${selectedUser.first_name} ${selectedUser.last_name}`,
        admin_id: 'current_admin',
        admin_name: 'Current Admin',
        started_at: new Date().toISOString(),
        ended_at: null,
        reason: impersonationReason,
        actions_performed: 0,
        status: 'active',
      };
      setActiveSession(newSession);
      setShowStartModal(false);
      setImpersonationReason('');
      setSelectedUser(null);
      setSearchQuery('');
    }
  };

  const handleEndImpersonation = () => {
    if (activeSession) {
      setActiveSession(null);
    }
  };

  const formatDuration = (start: string, end: string | null) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diffMs = endDate.getTime() - startDate.getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Impersonation</h1>
          <p className="text-muted-foreground mt-1">
            View the platform as a specific user for debugging and support
          </p>
        </div>
      </div>

      {/* Active Session Banner */}
      {activeSession && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-amber-900">Active Impersonation Session</p>
                <p className="text-sm text-amber-700">
                  Viewing as <span className="font-medium">{activeSession.user_name}</span> ·
                  Duration: {formatDuration(activeSession.started_at, null)}
                </p>
                <p className="text-xs text-primary mt-1">Reason: {activeSession.reason}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
              >
                Open User View
              </a>
              <button
                onClick={handleEndImpersonation}
                className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-100 text-sm font-medium"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Notice */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium text-red-800">Security Notice</p>
            <p className="text-sm text-red-600 mt-1">
              User impersonation is a sensitive feature. All impersonation sessions are logged and audited.
              Only use this feature for legitimate support and debugging purposes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Start Impersonation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
            <h3 className="font-semibold text-foreground mb-4">Start New Session</h3>

            {/* Search for User */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a user by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-[#E4DED2] rounded-lg pr-10"
              />
              <svg
                className="w-5 h-5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Search Results */}
            {filteredUsers.length > 0 && (
              <div className="mt-4 border border-[#ECE6DC] rounded-lg divide-y divide-[#F0EBE1] max-h-[300px] overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`p-4 flex items-center justify-between hover:bg-background cursor-pointer ${
                      selectedUser?.id === user.id ? 'bg-indigo-50' : ''
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-medium">
                        {user.first_name[0]}{user.last_name[0]}
                      </div>
                      <div>
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
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-700' : 'bg-[#F1ECE3] text-muted-foreground'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">{user.location?.city}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && filteredUsers.length === 0 && (
              <div className="mt-4 p-8 text-center text-muted-foreground border border-[#ECE6DC] rounded-lg">
                <svg className="w-12 h-12 text-muted-foreground mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No users found matching &quot;{searchQuery}&quot;</p>
              </div>
            )}

            {/* Selected User Card */}
            {selectedUser && (
              <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-lg">
                      {selectedUser.first_name[0]}{selectedUser.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {selectedUser.first_name} {selectedUser.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowStartModal(true)}
                    disabled={!!activeSession}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeSession
                        ? 'bg-[#F1ECE3] text-muted-foreground cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {activeSession ? 'Session Active' : 'Start Impersonation'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Impersonation History */}
          <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] dark:border-[#33291f]">
            <div className="p-4 border-b border-[#ECE6DC] flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Session History</h3>
              <div className="flex gap-2">
                {(['all', 'active', 'ended'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setHistoryFilter(filter)}
                    className={`px-3 py-1 text-sm rounded-lg ${
                      historyFilter === filter
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-muted-foreground hover:bg-[#F1ECE3] dark:bg-[#2a2118]'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-[#F0EBE1]">
              {filteredHistory.map((session) => (
                <div key={session.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        session.status === 'active' ? 'bg-amber-100' : 'bg-[#F1ECE3] dark:bg-[#2a2118]'
                      }`}>
                        <svg className={`w-5 h-5 ${
                          session.status === 'active' ? 'text-primary' : 'text-muted-foreground'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{session.user_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Impersonated by {session.admin_name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{session.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        session.status === 'active'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-[#F1ECE3] text-muted-foreground'
                      }`}>
                        {session.status === 'active' ? 'Active' : 'Ended'}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(session.started_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                        Duration: {formatDuration(session.started_at, session.ended_at)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {session.actions_performed} actions
                    </span>
                    <span>
                      Started: {new Date(session.started_at).toLocaleTimeString()}
                    </span>
                    {session.ended_at && (
                      <span>
                        Ended: {new Date(session.ended_at).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
            <h3 className="font-semibold text-foreground mb-4">Impersonation Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total Sessions (30d)</p>
                <p className="font-semibold text-foreground">47</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="font-semibold text-primary">1</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Avg. Duration</p>
                <p className="font-semibold text-foreground">18m</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Unique Admins</p>
                <p className="font-semibold text-foreground">5</p>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
            <h3 className="font-semibold text-foreground mb-4">Usage Guidelines</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Always provide a clear reason for impersonation
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                End sessions promptly after completing support
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Do not modify user data without consent
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Never share session details externally
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Avoid making purchases or financial actions
              </li>
            </ul>
          </div>

          {/* Top Admins */}
          <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
            <h3 className="font-semibold text-foreground mb-4">Top Admins (30d)</h3>
            <div className="space-y-3">
              {[
                { name: 'Sarah Admin', sessions: 18 },
                { name: 'Michael Admin', sessions: 15 },
                { name: 'David Admin', sessions: 9 },
                { name: 'Emma Admin', sessions: 5 },
              ].map((admin, index) => (
                <div key={admin.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                    <span className="text-sm text-foreground">{admin.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{admin.sessions} sessions</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Start Impersonation Modal */}
      {showStartModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#241c16] rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Start Impersonation</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedUser.first_name} {selectedUser.last_name}
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <p className="text-sm text-amber-700">
                You will view the platform exactly as this user sees it. All actions will be logged.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1">
                Reason for Impersonation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={impersonationReason}
                onChange={(e) => setImpersonationReason(e.target.value)}
                placeholder="e.g., Investigating user-reported issue with listing visibility..."
                rows={3}
                className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleStartImpersonation}
                disabled={!impersonationReason.trim()}
                className={`flex-1 px-4 py-2 rounded-lg text-white ${
                  impersonationReason.trim()
                    ? 'bg-primary hover:bg-primary/90'
                    : 'bg-[#E4DED2] cursor-not-allowed'
                }`}
              >
                Start Session
              </button>
              <button
                onClick={() => {
                  setShowStartModal(false);
                  setImpersonationReason('');
                }}
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
