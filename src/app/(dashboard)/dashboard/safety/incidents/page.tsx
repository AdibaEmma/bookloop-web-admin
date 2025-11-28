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
import { CustomTooltip, useChartColors } from '@/components/charts/ChartComponents';

type IncidentType = 'no_show' | 'theft' | 'fraud' | 'harassment' | 'property_damage' | 'impersonation' | 'other';
type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
type IncidentStatus = 'reported' | 'investigating' | 'resolved' | 'escalated' | 'closed';

interface SafetyIncident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  exchange_id?: string;
  spot_id?: string;
  spot_name?: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  reported_user?: {
    id: string;
    name: string;
    email: string;
    previous_incidents: number;
  };
  evidence_urls: string[];
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  resolution_notes?: string;
  actions_taken?: string[];
}

const mockIncidents: SafetyIncident[] = [
  {
    id: 'inc-1',
    type: 'no_show',
    severity: 'low',
    status: 'resolved',
    title: 'User did not show up for scheduled exchange',
    description: 'Waited 30 minutes at the agreed location but the other party never arrived and stopped responding to messages.',
    exchange_id: 'ex-456',
    spot_id: 'spot-1',
    spot_name: 'Accra Mall Bookstore Cafe',
    reporter: { id: 'u1', name: 'Kwame Mensah', email: 'kwame@example.com' },
    reported_user: { id: 'u3', name: 'Kofi Asante', email: 'kofi@example.com', previous_incidents: 0 },
    evidence_urls: ['/evidence/chat1.jpg'],
    created_at: '2024-06-01T16:00:00Z',
    updated_at: '2024-06-02T10:00:00Z',
    assigned_to: 'Admin Sarah',
    resolution_notes: 'Warning issued to user. First offense.',
    actions_taken: ['Warning issued', 'User contacted'],
  },
  {
    id: 'inc-2',
    type: 'fraud',
    severity: 'high',
    status: 'investigating',
    title: 'Book condition significantly misrepresented',
    description: 'The book was listed as "Like New" but arrived with torn pages, water damage, and missing cover. Seller refuses to acknowledge the issue.',
    exchange_id: 'ex-789',
    spot_id: 'spot-3',
    spot_name: 'KNUST Library Lobby',
    reporter: { id: 'u2', name: 'Ama Darko', email: 'ama@example.com' },
    reported_user: { id: 'u7', name: 'Kojo Appiah', email: 'kojo@example.com', previous_incidents: 2 },
    evidence_urls: ['/evidence/book1.jpg', '/evidence/book2.jpg', '/evidence/listing.jpg'],
    created_at: '2024-06-02T09:00:00Z',
    updated_at: '2024-06-02T14:00:00Z',
    assigned_to: 'Admin Michael',
  },
  {
    id: 'inc-3',
    type: 'harassment',
    severity: 'critical',
    status: 'escalated',
    title: 'Threatening messages after declined exchange',
    description: 'After I declined their exchange offer, they sent multiple threatening messages including threats of physical harm.',
    reporter: { id: 'u4', name: 'Efua Boateng', email: 'efua@example.com' },
    reported_user: { id: 'u8', name: 'Abena Darko', email: 'abena@example.com', previous_incidents: 1 },
    evidence_urls: ['/evidence/threat1.jpg', '/evidence/threat2.jpg', '/evidence/threat3.jpg'],
    created_at: '2024-06-02T11:00:00Z',
    updated_at: '2024-06-02T12:00:00Z',
    assigned_to: 'Admin Sarah',
    actions_taken: ['User account suspended', 'Law enforcement notified'],
  },
  {
    id: 'inc-4',
    type: 'theft',
    severity: 'critical',
    status: 'reported',
    title: 'Book taken without completing exchange',
    description: 'Met at the agreed location. They took my book to "inspect it" then ran away. Did not receive their book in exchange.',
    exchange_id: 'ex-101',
    spot_id: 'spot-5',
    spot_name: 'Marina Mall Food Court',
    reporter: { id: 'u5', name: 'Yaw Owusu', email: 'yaw@example.com' },
    reported_user: { id: 'u9', name: 'Nana Agyei', email: 'nana@example.com', previous_incidents: 0 },
    evidence_urls: ['/evidence/cctv.jpg'],
    created_at: '2024-06-02T15:00:00Z',
    updated_at: '2024-06-02T15:00:00Z',
  },
  {
    id: 'inc-5',
    type: 'impersonation',
    severity: 'medium',
    status: 'resolved',
    title: 'Someone else showed up for the exchange',
    description: 'The person who showed up was not the same as in the profile picture. They claimed to be picking up on behalf of the actual user.',
    exchange_id: 'ex-202',
    spot_id: 'spot-2',
    spot_name: 'EPP Bookshop - Accra Mall',
    reporter: { id: 'u6', name: 'Akua Mensah', email: 'akua@example.com' },
    reported_user: { id: 'u10', name: 'Esi Mensah', email: 'esi@example.com', previous_incidents: 0 },
    evidence_urls: [],
    created_at: '2024-05-28T14:00:00Z',
    updated_at: '2024-05-29T16:00:00Z',
    assigned_to: 'Admin Michael',
    resolution_notes: 'User confirmed they sent a family member. Policy updated to require prior notification for proxies.',
    actions_taken: ['User warned', 'Policy clarification sent'],
  },
];

const incidentTypeData = [
  { name: 'No Show', value: 35, color: '#fbbf24' },
  { name: 'Fraud', value: 25, color: '#ef4444' },
  { name: 'Harassment', value: 15, color: '#8b5cf6' },
  { name: 'Theft', value: 10, color: '#dc2626' },
  { name: 'Impersonation', value: 10, color: '#3b82f6' },
  { name: 'Other', value: 5, color: '#6b7280' },
];

const monthlyIncidents = [
  { month: 'Jan', incidents: 12, resolved: 10 },
  { month: 'Feb', incidents: 15, resolved: 13 },
  { month: 'Mar', incidents: 8, resolved: 8 },
  { month: 'Apr', incidents: 18, resolved: 15 },
  { month: 'May', incidents: 14, resolved: 12 },
  { month: 'Jun', incidents: 6, resolved: 2 },
];

export default function SafetyIncidentsPage() {
  const [filterType, setFilterType] = useState<IncidentType | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<IncidentSeverity | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<SafetyIncident | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const filteredIncidents = useMemo(() => {
    return mockIncidents.filter((incident) => {
      const matchesType = filterType === 'all' || incident.type === filterType;
      const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
      const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
      const matchesSearch =
        !searchQuery ||
        incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.reporter.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSeverity && matchesStatus && matchesSearch;
    });
  }, [filterType, filterSeverity, filterStatus, searchQuery]);

  const stats = useMemo(() => ({
    total: mockIncidents.length,
    open: mockIncidents.filter((i) => ['reported', 'investigating'].includes(i.status)).length,
    critical: mockIncidents.filter((i) => i.severity === 'critical').length,
    resolvedThisMonth: mockIncidents.filter((i) => i.status === 'resolved' && new Date(i.updated_at).getMonth() === new Date().getMonth()).length,
  }), []);

  const getSeverityBadge = (severity: IncidentSeverity) => {
    const styles = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${styles[severity]}`}>
        {severity}
      </span>
    );
  };

  const getStatusBadge = (status: IncidentStatus) => {
    const styles = {
      reported: 'bg-yellow-100 text-yellow-700',
      investigating: 'bg-blue-100 text-blue-700',
      resolved: 'bg-green-100 text-green-700',
      escalated: 'bg-red-100 text-red-700',
      closed: 'bg-gray-100 text-gray-600 dark:text-gray-400',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getTypeLabel = (type: IncidentType) => {
    const labels: Record<IncidentType, string> = {
      no_show: 'No Show',
      theft: 'Theft',
      fraud: 'Fraud',
      harassment: 'Harassment',
      property_damage: 'Property Damage',
      impersonation: 'Impersonation',
      other: 'Other',
    };
    return labels[type];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Safety Incident Tracking</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage safety incidents across the platform
          </p>
        </div>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Report Incident
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Incidents</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Open Cases</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.open}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Critical Severity</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.critical}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Resolved (This Month)</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.resolvedThisMonth}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Monthly Incidents</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyIncidents}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="incidents" name="Total" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">By Type</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={incidentTypeData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {incidentTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {incidentTypeData.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as IncidentType | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Types</option>
          <option value="no_show">No Show</option>
          <option value="theft">Theft</option>
          <option value="fraud">Fraud</option>
          <option value="harassment">Harassment</option>
          <option value="impersonation">Impersonation</option>
          <option value="other">Other</option>
        </select>
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value as IncidentSeverity | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Severity</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as IncidentStatus | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="reported">Reported</option>
          <option value="investigating">Investigating</option>
          <option value="escalated">Escalated</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Incidents List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="divide-y divide-gray-100">
          {filteredIncidents.map((incident) => (
            <div
              key={incident.id}
              onClick={() => setSelectedIncident(incident)}
              className={`p-4 hover:bg-gray-50 cursor-pointer ${
                selectedIncident?.id === incident.id ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    incident.severity === 'critical' ? 'bg-red-100 text-red-600' :
                    incident.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                    incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-gray-900 dark:text-white">{incident.title}</h3>
                      {getSeverityBadge(incident.severity)}
                      {getStatusBadge(incident.status)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{incident.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{getTypeLabel(incident.type)}</span>
                      {incident.spot_name && (
                        <>
                          <span>·</span>
                          <span>{incident.spot_name}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>Reported by {incident.reporter.name}</span>
                      <span>·</span>
                      <span>{new Date(incident.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {incident.reported_user && incident.reported_user.previous_incidents > 0 && (
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full">
                      {incident.reported_user.previous_incidents} prior
                    </span>
                  )}
                  {incident.evidence_urls.length > 0 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {incident.evidence_urls.length} evidence
                    </span>
                  )}
                </div>
              </div>

              {incident.actions_taken && incident.actions_taken.length > 0 && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Actions:</span>
                  {incident.actions_taken.map((action, index) => (
                    <span key={index} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full">
                      {action}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detail Sidebar */}
      {selectedIncident && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-xl z-40 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
            <h3 className="font-semibold text-gray-900 dark:text-white">Incident Details</h3>
            <button
              onClick={() => setSelectedIncident(null)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 space-y-6">
            {/* Status and Severity */}
            <div className="flex items-center gap-2">
              {getSeverityBadge(selectedIncident.severity)}
              {getStatusBadge(selectedIncident.status)}
              <span className="text-xs text-gray-500 ml-auto">{selectedIncident.id}</span>
            </div>

            {/* Title and Description */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{selectedIncident.title}</h4>
              <p className="text-sm text-gray-600 mt-2">{selectedIncident.description}</p>
            </div>

            {/* Type and Location */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Type</p>
                <p className="font-medium text-gray-900 dark:text-white">{getTypeLabel(selectedIncident.type)}</p>
              </div>
              {selectedIncident.spot_name && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Location</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedIncident.spot_name}</p>
                </div>
              )}
            </div>

            {/* Reporter */}
            <div>
              <p className="text-xs text-gray-500 uppercase mb-2">Reporter</p>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-medium text-sm">
                  {selectedIncident.reporter.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedIncident.reporter.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedIncident.reporter.email}</p>
                </div>
              </div>
            </div>

            {/* Reported User */}
            {selectedIncident.reported_user && (
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Reported User</p>
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-medium text-sm">
                    {selectedIncident.reported_user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedIncident.reported_user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedIncident.reported_user.email}</p>
                  </div>
                  {selectedIncident.reported_user.previous_incidents > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                      {selectedIncident.reported_user.previous_incidents} prior
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Evidence */}
            {selectedIncident.evidence_urls.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Evidence ({selectedIncident.evidence_urls.length})</p>
                <div className="space-y-2">
                  {selectedIncident.evidence_urls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-indigo-600">{url.split('/').pop()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution Notes */}
            {selectedIncident.resolution_notes && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700 font-medium mb-1">Resolution Notes</p>
                <p className="text-sm text-green-800">{selectedIncident.resolution_notes}</p>
              </div>
            )}

            {/* Actions */}
            {(selectedIncident.status === 'reported' || selectedIncident.status === 'investigating') && (
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowActionModal(true)}
                  className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                >
                  Take Action
                </button>
                <button className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                  Escalate
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
