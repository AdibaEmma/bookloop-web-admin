'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import type { SystemHealth, ServiceHealth } from '@/types/admin';

// Mock data generators
const generateCPUData = () =>
  Array.from({ length: 60 }, (_, i) => ({
    time: `${59 - i}m`,
    value: Math.floor(Math.random() * 30) + 20,
  })).reverse();

const generateMemoryData = () =>
  Array.from({ length: 60 }, (_, i) => ({
    time: `${59 - i}m`,
    value: Math.floor(Math.random() * 20) + 55,
  })).reverse();

const generateResponseTimeData = () =>
  Array.from({ length: 24 }, (_, i) => ({
    hour: `${23 - i}:00`,
    api: Math.floor(Math.random() * 50) + 80,
    database: Math.floor(Math.random() * 30) + 20,
    cache: Math.floor(Math.random() * 10) + 5,
  })).reverse();

const generateErrorData = () =>
  Array.from({ length: 24 }, (_, i) => ({
    hour: `${23 - i}:00`,
    errors: Math.floor(Math.random() * 5),
    warnings: Math.floor(Math.random() * 15),
  })).reverse();

const mockServices: ServiceHealth[] = [
  { name: 'API Server', status: 'healthy', latency: 45, last_check: '2024-06-02T14:30:00Z' },
  { name: 'Database (PostgreSQL)', status: 'healthy', latency: 12, last_check: '2024-06-02T14:30:00Z' },
  { name: 'Redis Cache', status: 'healthy', latency: 3, last_check: '2024-06-02T14:30:00Z' },
  { name: 'File Storage (Cloudinary)', status: 'healthy', latency: 156, last_check: '2024-06-02T14:30:00Z' },
  { name: 'Email Service (SendGrid)', status: 'degraded', latency: 450, last_check: '2024-06-02T14:30:00Z' },
  { name: 'SMS Service (Twilio)', status: 'healthy', latency: 89, last_check: '2024-06-02T14:30:00Z' },
  { name: 'Payment Gateway (MTN MoMo)', status: 'healthy', latency: 234, last_check: '2024-06-02T14:30:00Z' },
  { name: 'Payment Gateway (Vodafone Cash)', status: 'healthy', latency: 198, last_check: '2024-06-02T14:30:00Z' },
  { name: 'Push Notifications', status: 'healthy', latency: 67, last_check: '2024-06-02T14:30:00Z' },
  { name: 'WebSocket Server', status: 'healthy', latency: 8, last_check: '2024-06-02T14:30:00Z' },
];

const recentIncidents = [
  {
    id: 'inc-1',
    title: 'Email delivery delays',
    status: 'investigating',
    severity: 'minor',
    started_at: '2024-06-02T13:45:00Z',
    services: ['Email Service'],
    updates: [
      { time: '2024-06-02T14:00:00Z', message: 'Investigating increased email delivery times' },
      { time: '2024-06-02T13:45:00Z', message: 'Email delivery times increased to 5+ minutes' },
    ],
  },
  {
    id: 'inc-2',
    title: 'Database connection spike',
    status: 'resolved',
    severity: 'minor',
    started_at: '2024-06-01T09:30:00Z',
    resolved_at: '2024-06-01T10:15:00Z',
    services: ['Database'],
    updates: [
      { time: '2024-06-01T10:15:00Z', message: 'Issue resolved. Connection pool size increased.' },
      { time: '2024-06-01T09:30:00Z', message: 'High database connection count detected' },
    ],
  },
];

export default function SystemHealthPage() {
  const [cpuData, setCpuData] = useState(generateCPUData());
  const [memoryData, setMemoryData] = useState(generateMemoryData());
  const [responseTimeData] = useState(generateResponseTimeData());
  const [errorData] = useState(generateErrorData());
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuData(generateCPUData());
      setMemoryData(generateMemoryData());
      setLastUpdate(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const systemHealth: SystemHealth = {
    status: 'healthy',
    uptime: 99.98,
    api_latency: 45,
    error_rate: 0.02,
    active_connections: 1234,
    memory_usage: 62,
    cpu_usage: 28,
    services: mockServices,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-700';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-700';
      case 'down':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700 dark:text-gray-300';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'major':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'minor':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 dark:text-gray-300';
    }
  };

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime);
    const hours = Math.floor((uptime - days) * 24);
    return `${days}d ${hours}h`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Health</h1>
          <p className="text-gray-600 mt-1">
            Monitor system performance and service status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value={10}>Refresh: 10s</option>
            <option value={30}>Refresh: 30s</option>
            <option value={60}>Refresh: 1m</option>
            <option value={300}>Refresh: 5m</option>
          </select>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            View Metrics
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`rounded-xl p-6 ${
        systemHealth.status === 'healthy' ? 'bg-green-50 border border-green-200' :
        systemHealth.status === 'degraded' ? 'bg-yellow-50 border border-yellow-200' :
        'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${getStatusColor(systemHealth.status)} animate-pulse`} />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                All Systems {systemHealth.status === 'healthy' ? 'Operational' : systemHealth.status}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {mockServices.filter(s => s.status === 'healthy').length}/{mockServices.length} services healthy
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{systemHealth.uptime}%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Uptime (30 days)</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">CPU Usage</p>
          <div className="flex items-end justify-between mt-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemHealth.cpu_usage}%</p>
            <div className="w-16 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cpuData.slice(-10)}>
                  <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Memory Usage</p>
          <div className="flex items-end justify-between mt-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemHealth.memory_usage}%</p>
            <div className="w-16 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={memoryData.slice(-10)}>
                  <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">API Latency</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{systemHealth.api_latency}ms</p>
          <p className="text-xs text-green-600 mt-1">Normal</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Error Rate</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{systemHealth.error_rate}%</p>
          <p className="text-xs text-green-600 mt-1">Below threshold</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Active Connections</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{systemHealth.active_connections.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">WebSocket + API</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU & Memory */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Resource Usage (Last Hour)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={cpuData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                name="CPU %"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Response Times */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Response Times (Last 24h)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="api" name="API" stroke="#6366f1" strokeWidth={2} />
              <Line type="monotone" dataKey="database" name="Database" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="cache" name="Cache" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services Status */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Service Status</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {mockServices.map((service) => (
              <div key={service.name} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{service.latency}ms</span>
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusBg(service.status)}`}>
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Incidents</h3>
          </div>
          <div className="p-4 space-y-4">
            {recentIncidents.map((incident) => (
              <div key={incident.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">{incident.title}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    incident.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    incident.status === 'investigating' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {incident.status}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    {new Date(incident.started_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  {incident.updates[0]?.message}
                </div>
                {incident.services.map((svc) => (
                  <span key={svc} className="inline-block mt-2 text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                    {svc}
                  </span>
                ))}
              </div>
            ))}

            <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 py-2">
              View all incidents
            </button>
          </div>
        </div>
      </div>

      {/* Error Rate Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Errors & Warnings (Last 24h)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={errorData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="errors"
              name="Errors"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="warnings"
              name="Warnings"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Database Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Database Size</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">2.4 GB</p>
          <p className="text-xs text-gray-500 mt-1">Of 10 GB allocated</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Active Queries</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">23</p>
          <p className="text-xs text-green-600 mt-1">Normal load</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Cache Hit Rate</p>
          <p className="text-2xl font-bold text-green-600 mt-1">94.5%</p>
          <p className="text-xs text-gray-500 mt-1">Redis cache</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Storage Used</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">45.6 GB</p>
          <p className="text-xs text-gray-500 mt-1">Media files</p>
        </div>
      </div>
    </div>
  );
}
