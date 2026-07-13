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
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { CustomTooltip, useChartColors } from '@/components/charts/ChartComponents';

interface MatchResult {
  id: string;
  requester: {
    name: string;
    avatar: string;
    bookWanted: string;
    bookOffered: string;
  };
  matched: {
    name: string;
    avatar: string;
    bookWanted: string;
    bookOffered: string;
  };
  matchScore: number;
  distance: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  factors: {
    bookMatch: number;
    proximity: number;
    userRating: number;
    responseRate: number;
  };
}

interface MatchingStats {
  label: string;
  value: number;
  change: number;
}

const matchResults: MatchResult[] = [
  {
    id: '1',
    requester: {
      name: 'Kofi Mensah',
      avatar: 'KM',
      bookWanted: 'Things Fall Apart',
      bookOffered: 'Purple Hibiscus',
    },
    matched: {
      name: 'Ama Serwaa',
      avatar: 'AS',
      bookWanted: 'Purple Hibiscus',
      bookOffered: 'Things Fall Apart',
    },
    matchScore: 98,
    distance: 2.3,
    status: 'accepted',
    createdAt: '2024-06-07T10:30:00',
    factors: { bookMatch: 100, proximity: 95, userRating: 98, responseRate: 92 },
  },
  {
    id: '2',
    requester: {
      name: 'Yaw Boateng',
      avatar: 'YB',
      bookWanted: 'Half of a Yellow Sun',
      bookOffered: 'Americanah',
    },
    matched: {
      name: 'Efua Owusu',
      avatar: 'EO',
      bookWanted: 'Americanah',
      bookOffered: 'Half of a Yellow Sun',
    },
    matchScore: 95,
    distance: 4.1,
    status: 'pending',
    createdAt: '2024-06-07T09:15:00',
    factors: { bookMatch: 100, proximity: 88, userRating: 95, responseRate: 89 },
  },
  {
    id: '3',
    requester: {
      name: 'Akua Darko',
      avatar: 'AD',
      bookWanted: 'The Beautyful Ones',
      bookOffered: 'No Longer at Ease',
    },
    matched: {
      name: 'Kweku Asante',
      avatar: 'KA',
      bookWanted: 'No Longer at Ease',
      bookOffered: 'The Beautyful Ones',
    },
    matchScore: 92,
    distance: 1.8,
    status: 'accepted',
    createdAt: '2024-06-07T08:45:00',
    factors: { bookMatch: 100, proximity: 97, userRating: 88, responseRate: 85 },
  },
  {
    id: '4',
    requester: {
      name: 'Nana Agyeman',
      avatar: 'NA',
      bookWanted: 'Wizard of the Crow',
      bookOffered: 'Petals of Blood',
    },
    matched: {
      name: 'Adjoa Mensah',
      avatar: 'AM',
      bookWanted: 'Petals of Blood',
      bookOffered: 'A Grain of Wheat',
    },
    matchScore: 78,
    distance: 6.5,
    status: 'declined',
    createdAt: '2024-06-06T16:20:00',
    factors: { bookMatch: 75, proximity: 72, userRating: 82, responseRate: 78 },
  },
  {
    id: '5',
    requester: {
      name: 'Kwame Ofori',
      avatar: 'KO',
      bookWanted: 'Born a Crime',
      bookOffered: 'Long Walk to Freedom',
    },
    matched: {
      name: 'Abena Kwarteng',
      avatar: 'AK',
      bookWanted: 'Long Walk to Freedom',
      bookOffered: 'Born a Crime',
    },
    matchScore: 96,
    distance: 3.2,
    status: 'expired',
    createdAt: '2024-06-05T11:00:00',
    factors: { bookMatch: 100, proximity: 90, userRating: 94, responseRate: 96 },
  },
];

const matchingStats: MatchingStats[] = [
  { label: 'Total Matches Today', value: 156, change: 12 },
  { label: 'Acceptance Rate', value: 78, change: 5 },
  { label: 'Avg Match Score', value: 87, change: 3 },
  { label: 'Avg Response Time', value: 2.4, change: -15 },
];

const matchTrendData = [
  { date: 'Mon', matches: 120, accepted: 95, declined: 15 },
  { date: 'Tue', matches: 145, accepted: 112, declined: 22 },
  { date: 'Wed', matches: 132, accepted: 105, declined: 18 },
  { date: 'Thu', matches: 168, accepted: 138, declined: 20 },
  { date: 'Fri', matches: 189, accepted: 152, declined: 25 },
  { date: 'Sat', matches: 210, accepted: 175, declined: 22 },
  { date: 'Sun', matches: 156, accepted: 128, declined: 18 },
];

const matchScoreDistribution = [
  { range: '90-100', count: 245, color: '#10b981' },
  { range: '80-89', count: 180, color: '#6366f1' },
  { range: '70-79', count: 95, color: '#f59e0b' },
  { range: '60-69', count: 45, color: '#ef4444' },
  { range: '<60', count: 20, color: '#6b7280' },
];

const matchReasonBreakdown = [
  { name: 'Perfect Book Match', value: 45, color: '#6366f1' },
  { name: 'High Proximity', value: 25, color: '#10b981' },
  { name: 'User Rating', value: 18, color: '#f59e0b' },
  { name: 'Response Rate', value: 12, color: '#8b5cf6' },
];

const algorithmWeights = [
  { factor: 'Book Match', weight: 40, description: 'Exact or similar book availability' },
  { factor: 'Proximity', weight: 25, description: 'Distance between users' },
  { factor: 'User Rating', weight: 20, description: 'Historical user ratings' },
  { factor: 'Response Rate', weight: 15, description: 'How quickly users respond' },
];

export default function MatchingPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [showAlgorithmSettings, setShowAlgorithmSettings] = useState(false);

  const filteredMatches = useMemo(() => {
    if (statusFilter === 'all') return matchResults;
    return matchResults.filter((m) => m.status === statusFilter);
  }, [statusFilter]);

  const getStatusColor = (status: MatchResult['status']) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'declined':
        return 'bg-red-100 text-red-700';
      case 'expired':
        return 'bg-[#F1ECE3] text-foreground';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-indigo-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Book Matching</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered matching system for book exchanges
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAlgorithmSettings(true)}
            className="px-4 py-2 border border-[#E4DED2] text-foreground rounded-lg hover:bg-background flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Algorithm Settings
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Run Matching
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {matchingStats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold text-foreground">
                {stat.label.includes('Rate') ? `${stat.value}%` :
                 stat.label.includes('Time') ? `${stat.value}h` : stat.value}
              </p>
              <span className={`text-sm ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change >= 0 ? '+' : ''}{stat.change}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#ECE6DC] p-6">
          <h3 className="font-semibold text-foreground mb-4">Match Trends (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={matchTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="matches" name="Total Matches" stroke="#6366f1" strokeWidth={2} />
              <Line type="monotone" dataKey="accepted" name="Accepted" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="declined" name="Declined" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
          <h3 className="font-semibold text-foreground mb-4">Match Score Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={matchScoreDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="range" type="category" tick={{ fontSize: 11 }} width={60} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {matchScoreDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-green-600">72%</span> of matches score above 80
            </p>
          </div>
        </div>
      </div>

      {/* Match Factors & Recent Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
          <h3 className="font-semibold text-foreground mb-4">Primary Match Factors</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={matchReasonBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {matchReasonBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${Number(value ?? 0)}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {matchReasonBreakdown.map((factor) => (
              <div key={factor.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: factor.color }} />
                  <span className="text-muted-foreground">{factor.name}</span>
                </div>
                <span className="font-medium text-foreground">{factor.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-[#ECE6DC] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Matches</h3>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-[#E4DED2] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredMatches.map((match) => (
              <div
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className="p-4 border border-[#ECE6DC] rounded-lg hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center -space-x-2">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-medium border-2 border-white">
                        {match.requester.avatar}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-medium border-2 border-white">
                        {match.matched.avatar}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {match.requester.name} ↔ {match.matched.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {match.requester.bookOffered} ⟷ {match.matched.bookOffered}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getScoreColor(match.matchScore)}`}>
                        {match.matchScore}%
                      </p>
                      <p className="text-xs text-muted-foreground">{match.distance} km</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(match.status)}`}>
                      {match.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#241c16] rounded-xl shadow-xl max-w-lg w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-foreground">Match Details</h3>
              <button
                onClick={() => setSelectedMatch(null)}
                className="p-2 hover:bg-[#F1ECE3] rounded-lg"
              >
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Users */}
              <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-medium mx-auto">
                    {selectedMatch.requester.avatar}
                  </div>
                  <p className="font-medium text-foreground mt-2">{selectedMatch.requester.name}</p>
                  <p className="text-xs text-muted-foreground">Wants: {selectedMatch.requester.bookWanted}</p>
                  <p className="text-xs text-muted-foreground">Offers: {selectedMatch.requester.bookOffered}</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`text-3xl font-bold ${getScoreColor(selectedMatch.matchScore)}`}>
                    {selectedMatch.matchScore}%
                  </div>
                  <span className="text-xs text-muted-foreground">Match Score</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-lg font-medium mx-auto">
                    {selectedMatch.matched.avatar}
                  </div>
                  <p className="font-medium text-foreground mt-2">{selectedMatch.matched.name}</p>
                  <p className="text-xs text-muted-foreground">Wants: {selectedMatch.matched.bookWanted}</p>
                  <p className="text-xs text-muted-foreground">Offers: {selectedMatch.matched.bookOffered}</p>
                </div>
              </div>

              {/* Score Breakdown */}
              <div>
                <h4 className="font-medium text-foreground mb-3">Score Breakdown</h4>
                <div className="space-y-3">
                  {Object.entries(selectedMatch.factors).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-sm font-medium text-foreground">{value}%</span>
                      </div>
                      <div className="h-2 bg-[#F1ECE3] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            value >= 90 ? 'bg-green-500' :
                            value >= 80 ? 'bg-indigo-500' :
                            value >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="font-medium text-foreground">{selectedMatch.distance} km apart</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(selectedMatch.status)}`}>
                    {selectedMatch.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium text-foreground">
                    {new Date(selectedMatch.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t bg-background rounded-b-xl">
              <button
                onClick={() => setSelectedMatch(null)}
                className="px-4 py-2 text-foreground hover:bg-[#F1ECE3] rounded-lg"
              >
                Close
              </button>
              {selectedMatch.status === 'pending' && (
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Nudge Users
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Algorithm Settings Modal */}
      {showAlgorithmSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#241c16] rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-foreground">Algorithm Settings</h3>
              <button
                onClick={() => setShowAlgorithmSettings(false)}
                className="p-2 hover:bg-[#F1ECE3] rounded-lg"
              >
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Adjust the weights for each matching factor. Total must equal 100%.
              </p>
              {algorithmWeights.map((item) => (
                <div key={item.factor}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{item.factor}</span>
                    <span className="text-sm text-foreground">{item.weight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue={item.weight}
                    className="w-full h-2 bg-[#ECE6DC] rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                </div>
              ))}
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Changes will affect future matches only. Existing matches won&apos;t be recalculated.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t bg-background rounded-b-xl">
              <button
                onClick={() => setShowAlgorithmSettings(false)}
                className="px-4 py-2 text-foreground hover:bg-[#F1ECE3] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Algorithm settings saved!');
                  setShowAlgorithmSettings(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
