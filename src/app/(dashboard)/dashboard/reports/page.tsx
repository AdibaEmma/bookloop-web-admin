'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { CustomTooltip, useChartColors } from '@/components/charts/ChartComponents';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'user' | 'exchange' | 'operational' | 'custom';
  lastGenerated: string | null;
  schedule: 'daily' | 'weekly' | 'monthly' | 'on_demand' | null;
  format: 'pdf' | 'excel' | 'csv';
}

interface GeneratedReport {
  id: string;
  name: string;
  generatedAt: string;
  generatedBy: string;
  format: 'pdf' | 'excel' | 'csv';
  size: string;
  status: 'ready' | 'generating' | 'failed';
}

const reportTemplates: ReportTemplate[] = [
  {
    id: '1',
    name: 'Monthly Revenue Report',
    description: 'Comprehensive breakdown of all revenue streams, transaction volumes, and financial metrics',
    category: 'financial',
    lastGenerated: '2024-06-01T08:00:00',
    schedule: 'monthly',
    format: 'pdf',
  },
  {
    id: '2',
    name: 'User Growth Analysis',
    description: 'New user signups, retention rates, churn analysis, and demographic breakdown',
    category: 'user',
    lastGenerated: '2024-06-05T09:30:00',
    schedule: 'weekly',
    format: 'excel',
  },
  {
    id: '3',
    name: 'Exchange Activity Report',
    description: 'Daily exchange volumes, completion rates, popular books, and geographic distribution',
    category: 'exchange',
    lastGenerated: '2024-06-07T06:00:00',
    schedule: 'daily',
    format: 'pdf',
  },
  {
    id: '4',
    name: 'Operational Metrics',
    description: 'System performance, API response times, error rates, and uptime statistics',
    category: 'operational',
    lastGenerated: '2024-06-07T00:00:00',
    schedule: 'daily',
    format: 'csv',
  },
  {
    id: '5',
    name: 'Safety & Moderation Report',
    description: 'Reported content, incident tracking, resolution times, and safety metrics',
    category: 'operational',
    lastGenerated: '2024-06-03T10:00:00',
    schedule: 'weekly',
    format: 'pdf',
  },
  {
    id: '6',
    name: 'Top Books & Trends',
    description: 'Most exchanged books, trending genres, and user preference patterns',
    category: 'exchange',
    lastGenerated: null,
    schedule: 'on_demand',
    format: 'excel',
  },
];

const generatedReports: GeneratedReport[] = [
  {
    id: '1',
    name: 'Exchange Activity Report - June 7, 2024',
    generatedAt: '2024-06-07T06:00:00',
    generatedBy: 'System (Scheduled)',
    format: 'pdf',
    size: '2.4 MB',
    status: 'ready',
  },
  {
    id: '2',
    name: 'Operational Metrics - June 7, 2024',
    generatedAt: '2024-06-07T00:00:00',
    generatedBy: 'System (Scheduled)',
    format: 'csv',
    size: '856 KB',
    status: 'ready',
  },
  {
    id: '3',
    name: 'User Growth Analysis - Week 23',
    generatedAt: '2024-06-05T09:30:00',
    generatedBy: 'System (Scheduled)',
    format: 'excel',
    size: '1.8 MB',
    status: 'ready',
  },
  {
    id: '4',
    name: 'Custom Regional Report - Accra',
    generatedAt: '2024-06-06T14:22:00',
    generatedBy: 'Admin User',
    format: 'pdf',
    size: '3.1 MB',
    status: 'ready',
  },
  {
    id: '5',
    name: 'Monthly Revenue Report - May 2024',
    generatedAt: '2024-06-01T08:00:00',
    generatedBy: 'System (Scheduled)',
    format: 'pdf',
    size: '4.2 MB',
    status: 'ready',
  },
];

const reportMetrics = [
  { month: 'Jan', generated: 45, downloaded: 38 },
  { month: 'Feb', generated: 52, downloaded: 45 },
  { month: 'Mar', generated: 48, downloaded: 42 },
  { month: 'Apr', generated: 61, downloaded: 55 },
  { month: 'May', generated: 58, downloaded: 50 },
  { month: 'Jun', generated: 42, downloaded: 35 },
];

const reportsByCategory = [
  { name: 'Financial', value: 35, color: '#6366f1' },
  { name: 'User', value: 25, color: '#10b981' },
  { name: 'Exchange', value: 22, color: '#f59e0b' },
  { name: 'Operational', value: 18, color: '#8b5cf6' },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'generated' | 'scheduled'>('templates');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);

  const filteredTemplates = categoryFilter === 'all'
    ? reportTemplates
    : reportTemplates.filter((t) => t.category === categoryFilter);

  const getCategoryColor = (category: ReportTemplate['category']) => {
    switch (category) {
      case 'financial':
        return 'bg-indigo-100 text-indigo-700';
      case 'user':
        return 'bg-green-100 text-green-700';
      case 'exchange':
        return 'bg-yellow-100 text-yellow-700';
      case 'operational':
        return 'bg-purple-100 text-purple-700';
      case 'custom':
        return 'bg-[#F1ECE3] text-foreground';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return '📄';
      case 'excel':
        return '📊';
      case 'csv':
        return '📋';
      default:
        return '📁';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Generate, schedule, and download platform reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2 border border-[#E4DED2] text-foreground rounded-lg hover:bg-background flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Scheduled Reports
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
          <p className="text-sm text-muted-foreground">Reports Generated (MTD)</p>
          <p className="text-2xl font-bold text-foreground mt-1">42</p>
          <p className="text-xs text-green-600 mt-1">+8% vs last month</p>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
          <p className="text-sm text-muted-foreground">Downloaded</p>
          <p className="text-2xl font-bold text-foreground mt-1">35</p>
          <p className="text-xs text-muted-foreground mt-1">83% download rate</p>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
          <p className="text-sm text-muted-foreground">Scheduled Reports</p>
          <p className="text-2xl font-bold text-foreground mt-1">12</p>
          <p className="text-xs text-muted-foreground mt-1">Active schedules</p>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
          <p className="text-sm text-muted-foreground">Custom Reports</p>
          <p className="text-2xl font-bold text-foreground mt-1">8</p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#ECE6DC] p-6">
          <h3 className="font-semibold text-foreground mb-4">Report Generation Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={reportMetrics}>
              <defs>
                <linearGradient id="colorGenerated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="generated"
                name="Generated"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#colorGenerated)"
              />
              <Line
                type="monotone"
                dataKey="downloaded"
                name="Downloaded"
                stroke="#10b981"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
          <h3 className="font-semibold text-foreground mb-4">Reports by Category</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={reportsByCategory}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {reportsByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {reportsByCategory.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] dark:border-[#33291f]">
        <div className="border-b border-[#ECE6DC] dark:border-[#33291f]">
          <div className="flex">
            {[
              { id: 'templates', label: 'Report Templates' },
              { id: 'generated', label: 'Generated Reports' },
              { id: 'scheduled', label: 'Scheduled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'templates' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-[#E4DED2] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Categories</option>
                  <option value="financial">Financial</option>
                  <option value="user">User</option>
                  <option value="exchange">Exchange</option>
                  <option value="operational">Operational</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border border-[#ECE6DC] rounded-lg hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getFormatIcon(template.format)}</span>
                        <div>
                          <h4 className="font-medium text-foreground">{template.name}</h4>
                          <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${getCategoryColor(template.category)}`}>
                            {template.category}
                          </span>
                        </div>
                      </div>
                      {template.schedule && template.schedule !== 'on_demand' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {template.schedule}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {template.lastGenerated
                          ? `Last: ${new Date(template.lastGenerated).toLocaleDateString()}`
                          : 'Never generated'}
                      </p>
                      <button
                        onClick={() => setSelectedTemplate(template)}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'generated' && (
            <div className="space-y-3">
              {generatedReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border border-[#ECE6DC] rounded-lg hover:bg-background"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{getFormatIcon(report.format)}</span>
                    <div>
                      <h4 className="font-medium text-foreground">{report.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Generated by {report.generatedBy} • {new Date(report.generatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{report.size}</span>
                    {report.status === 'ready' ? (
                      <button className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </button>
                    ) : report.status === 'generating' ? (
                      <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 text-sm rounded-lg">
                        Generating...
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg">
                        Failed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'scheduled' && (
            <div className="space-y-3">
              {reportTemplates
                .filter((t) => t.schedule && t.schedule !== 'on_demand')
                .map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 border border-[#ECE6DC] rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        template.schedule === 'daily' ? 'bg-green-100' :
                        template.schedule === 'weekly' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        <svg className={`w-5 h-5 ${
                          template.schedule === 'daily' ? 'text-green-600' :
                          template.schedule === 'weekly' ? 'text-blue-600' : 'text-purple-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Runs {template.schedule} • Format: {template.format.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        template.schedule === 'daily' ? 'bg-green-100 text-green-700' :
                        template.schedule === 'weekly' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {template.schedule}
                      </span>
                      <button className="p-2 hover:bg-[#F1ECE3] rounded-lg">
                        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Generate Report Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#241c16] rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-foreground">Generate Report</h3>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-2 hover:bg-[#F1ECE3] rounded-lg"
              >
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="p-3 bg-background rounded-lg">
                <h4 className="font-medium text-foreground">{selectedTemplate.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{selectedTemplate.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
                <select className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>This Year</option>
                  <option>Custom Range...</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {['pdf', 'excel', 'csv'].map((format) => (
                    <button
                      key={format}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        selectedTemplate.format === format
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-[#ECE6DC] hover:border-indigo-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{getFormatIcon(format)}</span>
                      <span className="text-sm font-medium text-foreground uppercase">{format}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-[#E4DED2]" />
                  <span className="text-sm text-foreground">Email report when ready</span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t bg-background rounded-b-xl">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 text-foreground hover:bg-[#F1ECE3] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Report generation started! You will be notified when ready.');
                  setSelectedTemplate(null);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#241c16] rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-foreground">Create Custom Report</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-[#F1ECE3] rounded-lg"
              >
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Report Name</label>
                <input
                  type="text"
                  placeholder="Enter report name"
                  className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Data to Include</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-[#ECE6DC] rounded-lg p-3">
                  {[
                    'User Demographics',
                    'Exchange Statistics',
                    'Revenue Breakdown',
                    'Geographic Distribution',
                    'Book Categories',
                    'User Activity',
                    'Safety Metrics',
                    'System Performance',
                  ].map((item) => (
                    <label key={item} className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-[#E4DED2]" />
                      <span className="text-sm text-foreground">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Filters</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Region</label>
                    <select className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg text-sm">
                      <option>All Regions</option>
                      <option>Greater Accra</option>
                      <option>Ashanti</option>
                      <option>Western</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Date Range</label>
                    <select className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg text-sm">
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                      <option>This Year</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {['pdf', 'excel', 'csv'].map((format) => (
                    <button
                      key={format}
                      className="p-3 border border-[#ECE6DC] rounded-lg text-center hover:border-indigo-300 transition-colors"
                    >
                      <span className="text-2xl block mb-1">{getFormatIcon(format)}</span>
                      <span className="text-sm font-medium text-foreground uppercase">{format}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t bg-background">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-foreground hover:bg-[#F1ECE3] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Custom report created!');
                  setShowCreateModal(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#241c16] rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-foreground">Schedule Settings</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-2 hover:bg-[#F1ECE3] rounded-lg"
              >
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Report</label>
                <select className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg focus:ring-2 focus:ring-indigo-500">
                  {reportTemplates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Schedule</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Daily', 'Weekly', 'Monthly'].map((schedule) => (
                    <button
                      key={schedule}
                      className="p-2 border border-[#ECE6DC] rounded-lg text-sm hover:border-indigo-300"
                    >
                      {schedule}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Time</label>
                <input
                  type="time"
                  defaultValue="06:00"
                  className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email Recipients</label>
                <input
                  type="text"
                  placeholder="Enter email addresses (comma separated)"
                  className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t bg-background rounded-b-xl">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-foreground hover:bg-[#F1ECE3] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Schedule saved!');
                  setShowScheduleModal(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
