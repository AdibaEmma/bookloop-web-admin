'use client';

import { useState, useMemo } from 'react';

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  condition: string;
  owner: {
    id: string;
    name: string;
    location: string;
    rating: number;
  };
}

interface MatchSuggestion {
  id: string;
  book_a: Book;
  book_b: Book;
  match_score: number;
  match_reasons: string[];
  distance_km: number;
  status: 'pending' | 'sent' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  sent_at?: string;
}

interface MatchingConfig {
  min_score: number;
  max_distance: number;
  same_genre_weight: number;
  rating_weight: number;
  condition_weight: number;
  auto_send_threshold: number;
  enabled: boolean;
}

const mockSuggestions: MatchSuggestion[] = [
  {
    id: 'm1',
    book_a: { id: 'b1', title: 'Things Fall Apart', author: 'Chinua Achebe', genre: 'African Literature', condition: 'Like New', owner: { id: 'u1', name: 'Kwame Mensah', location: 'Accra', rating: 4.9 } },
    book_b: { id: 'b2', title: 'No Longer at Ease', author: 'Chinua Achebe', genre: 'African Literature', condition: 'Good', owner: { id: 'u2', name: 'Ama Darko', location: 'Accra', rating: 4.7 } },
    match_score: 95,
    match_reasons: ['Same author', 'Same genre', 'Same city', 'Both highly rated'],
    distance_km: 5.2,
    status: 'pending',
    created_at: '2024-06-02T10:00:00Z',
  },
  {
    id: 'm2',
    book_a: { id: 'b3', title: 'Half of a Yellow Sun', author: 'Chimamanda Ngozi Adichie', genre: 'Historical Fiction', condition: 'Good', owner: { id: 'u3', name: 'Kofi Asante', location: 'Kumasi', rating: 4.2 } },
    book_b: { id: 'b4', title: 'Americanah', author: 'Chimamanda Ngozi Adichie', genre: 'Contemporary Fiction', condition: 'Like New', owner: { id: 'u4', name: 'Efua Boateng', location: 'Kumasi', rating: 4.5 } },
    match_score: 88,
    match_reasons: ['Same author', 'Similar genres', 'Same city'],
    distance_km: 3.1,
    status: 'sent',
    created_at: '2024-06-02T08:00:00Z',
    sent_at: '2024-06-02T09:00:00Z',
  },
  {
    id: 'm3',
    book_a: { id: 'b5', title: 'Homegoing', author: 'Yaa Gyasi', genre: 'Historical Fiction', condition: 'New', owner: { id: 'u5', name: 'Yaw Owusu', location: 'Takoradi', rating: 4.6 } },
    book_b: { id: 'b6', title: 'Transcendent Kingdom', author: 'Yaa Gyasi', genre: 'Literary Fiction', condition: 'Good', owner: { id: 'u6', name: 'Akua Mensah', location: 'Cape Coast', rating: 4.4 } },
    match_score: 82,
    match_reasons: ['Same author', 'Nearby locations'],
    distance_km: 45.0,
    status: 'accepted',
    created_at: '2024-06-01T14:00:00Z',
    sent_at: '2024-06-01T15:00:00Z',
  },
  {
    id: 'm4',
    book_a: { id: 'b7', title: 'The Beautyful Ones Are Not Yet Born', author: 'Ayi Kwei Armah', genre: 'African Literature', condition: 'Fair', owner: { id: 'u7', name: 'Kojo Appiah', location: 'Ho', rating: 4.0 } },
    book_b: { id: 'b8', title: 'Fragments', author: 'Ayi Kwei Armah', genre: 'African Literature', condition: 'Good', owner: { id: 'u8', name: 'Abena Darko', location: 'Volta Region', rating: 4.8 } },
    match_score: 78,
    match_reasons: ['Same author', 'Same genre'],
    distance_km: 28.5,
    status: 'declined',
    created_at: '2024-05-30T11:00:00Z',
    sent_at: '2024-05-30T12:00:00Z',
  },
  {
    id: 'm5',
    book_a: { id: 'b9', title: 'Purple Hibiscus', author: 'Chimamanda Ngozi Adichie', genre: 'Coming of Age', condition: 'Like New', owner: { id: 'u9', name: 'Nana Agyei', location: 'Sunyani', rating: 4.7 } },
    book_b: { id: 'b10', title: 'We Need New Names', author: 'NoViolet Bulawayo', genre: 'Coming of Age', condition: 'Good', owner: { id: 'u10', name: 'Esi Mensah', location: 'Bolgatanga', rating: 4.3 } },
    match_score: 72,
    match_reasons: ['Same genre', 'Similar themes'],
    distance_km: 150.0,
    status: 'expired',
    created_at: '2024-05-25T09:00:00Z',
    sent_at: '2024-05-25T10:00:00Z',
  },
];

export default function SmartMatchingPage() {
  const [suggestions, setSuggestions] = useState(mockSuggestions);
  const [filterStatus, setFilterStatus] = useState<MatchSuggestion['status'] | 'all'>('all');
  const [minScore, setMinScore] = useState(0);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [config, setConfig] = useState<MatchingConfig>({
    min_score: 70,
    max_distance: 100,
    same_genre_weight: 25,
    rating_weight: 20,
    condition_weight: 15,
    auto_send_threshold: 90,
    enabled: true,
  });

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((s) => {
      const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
      const matchesScore = s.match_score >= minScore;
      return matchesStatus && matchesScore;
    });
  }, [suggestions, filterStatus, minScore]);

  const stats = useMemo(() => {
    return {
      total: suggestions.length,
      pending: suggestions.filter((s) => s.status === 'pending').length,
      sent: suggestions.filter((s) => s.status === 'sent').length,
      accepted: suggestions.filter((s) => s.status === 'accepted').length,
      declined: suggestions.filter((s) => s.status === 'declined').length,
      avgScore: Math.round(suggestions.reduce((acc, s) => acc + s.match_score, 0) / suggestions.length),
      conversionRate: Math.round((suggestions.filter((s) => s.status === 'accepted').length / suggestions.filter((s) => s.status !== 'pending').length) * 100) || 0,
    };
  }, [suggestions]);

  const getStatusBadge = (status: MatchSuggestion['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      sent: 'bg-blue-100 text-blue-700',
      accepted: 'bg-green-100 text-green-700',
      declined: 'bg-red-100 text-red-700',
      expired: 'bg-gray-100 text-gray-600 dark:text-gray-400 dark:text-gray-500',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSendSuggestion = (id: string) => {
    setSuggestions(suggestions.map((s) =>
      s.id === id ? { ...s, status: 'sent' as const, sent_at: new Date().toISOString() } : s
    ));
  };

  const handleRunMatching = () => {
    console.log('Running matching algorithm with config:', config);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Matching</h1>
          <p className="text-gray-600 mt-1">
            AI-powered book exchange suggestions based on user preferences and location
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configure
          </button>
          <button
            onClick={handleRunMatching}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Run Matching
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Total Suggestions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Sent</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.sent}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Accepted</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.accepted}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Declined</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.declined}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Avg. Score</p>
          <p className={`text-2xl font-bold mt-1 ${getScoreColor(stats.avgScore)}`}>{stats.avgScore}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Conversion Rate</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.conversionRate}%</p>
        </div>
      </div>

      {/* Algorithm Status */}
      <div className={`rounded-xl border p-4 flex items-center justify-between ${config.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 dark:border-gray-700'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.enabled ? 'bg-green-100' : 'bg-gray-200'}`}>
            <svg className={`w-5 h-5 ${config.enabled ? 'text-green-600' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <p className={`font-medium ${config.enabled ? 'text-green-800' : 'text-gray-700 dark:text-gray-300'}`}>
              {config.enabled ? 'Smart Matching Active' : 'Smart Matching Disabled'}
            </p>
            <p className={`text-sm ${config.enabled ? 'text-green-600' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
              Min score: {config.min_score}% · Max distance: {config.max_distance}km · Auto-send at {config.auto_send_threshold}%
            </p>
          </div>
        </div>
        <button
          onClick={() => setConfig({ ...config, enabled: !config.enabled })}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            config.enabled
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          {config.enabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as MatchSuggestion['status'] | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
          <option value="expired">Expired</option>
        </select>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Min Score:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={minScore}
            onChange={(e) => setMinScore(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="text-sm font-medium text-gray-900 dark:text-white">{minScore}%</span>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {filteredSuggestions.map((suggestion) => (
          <div key={suggestion.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg ${
                  suggestion.match_score >= 90 ? 'bg-green-100 text-green-600' :
                  suggestion.match_score >= 75 ? 'bg-blue-100 text-blue-600' :
                  suggestion.match_score >= 60 ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {suggestion.match_score}%
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{suggestion.id}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(suggestion.status)}
                    <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                      {suggestion.distance_km}km apart
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {suggestion.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleSendSuggestion(suggestion.id)}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                    >
                      Send Suggestion
                    </button>
                    <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 dark:bg-gray-900">
                      Dismiss
                    </button>
                  </>
                )}
                <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Book A */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    A
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{suggestion.book_a.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">{suggestion.book_a.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{suggestion.book_a.condition}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{suggestion.book_a.genre}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-medium">
                        {suggestion.book_a.owner.name.charAt(0)}
                      </div>
                      <span className="text-xs text-gray-700 dark:text-gray-300">{suggestion.book_a.owner.name}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">★ {suggestion.book_a.owner.rating}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{suggestion.book_a.owner.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Book B */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    B
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{suggestion.book_b.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">{suggestion.book_b.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{suggestion.book_b.condition}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{suggestion.book_b.genre}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 text-xs font-medium">
                        {suggestion.book_b.owner.name.charAt(0)}
                      </div>
                      <span className="text-xs text-gray-700 dark:text-gray-300">{suggestion.book_b.owner.name}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">★ {suggestion.book_b.owner.rating}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{suggestion.book_b.owner.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Match Reasons */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Match reasons:</span>
              {suggestion.match_reasons.map((reason, index) => (
                <span key={index} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full">
                  {reason}
                </span>
              ))}
            </div>

            {/* Timestamps */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
              <span>Created: {new Date(suggestion.created_at).toLocaleString()}</span>
              {suggestion.sent_at && (
                <span>Sent: {new Date(suggestion.sent_at).toLocaleString()}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Matching Algorithm Configuration</h2>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Thresholds */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Thresholds</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Minimum Match Score</label>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{config.min_score}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={config.min_score}
                      onChange={(e) => setConfig({ ...config, min_score: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Maximum Distance (km)</label>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{config.max_distance}km</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="500"
                      value={config.max_distance}
                      onChange={(e) => setConfig({ ...config, max_distance: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Auto-Send Threshold</label>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{config.auto_send_threshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="80"
                      max="100"
                      value={config.auto_send_threshold}
                      onChange={(e) => setConfig({ ...config, auto_send_threshold: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Suggestions above this score will be sent automatically
                    </p>
                  </div>
                </div>
              </div>

              {/* Weights */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Scoring Weights</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Same Genre Weight</label>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{config.same_genre_weight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={config.same_genre_weight}
                      onChange={(e) => setConfig({ ...config, same_genre_weight: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">User Rating Weight</label>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{config.rating_weight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={config.rating_weight}
                      onChange={(e) => setConfig({ ...config, rating_weight: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Condition Match Weight</label>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{config.condition_weight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={config.condition_weight}
                      onChange={(e) => setConfig({ ...config, condition_weight: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Configuration
              </button>
              <button
                onClick={() => setShowConfigModal(false)}
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
