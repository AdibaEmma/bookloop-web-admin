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
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { CustomTooltip, useChartColors } from '@/components/charts/ChartComponents';

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface TimeSlot {
  start: string;
  end: string;
  capacity: number;
  booked: number;
}

interface DaySchedule {
  is_open: boolean;
  slots: TimeSlot[];
}

interface Spot {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  type: 'cafe' | 'library' | 'bookstore' | 'mall' | 'community_center';
  max_capacity: number;
  current_occupancy: number;
  status: 'open' | 'closed' | 'busy' | 'at_capacity';
  schedule: Record<DayOfWeek, DaySchedule>;
  upcoming_exchanges: number;
  avg_duration_minutes: number;
  peak_hours: string[];
  rating: number;
  total_exchanges: number;
}

const mockSpots: Spot[] = [
  {
    id: 'spot-1',
    name: 'Accra Mall Bookstore Cafe',
    address: 'Accra Mall, Tetteh Quarshie',
    city: 'Accra',
    region: 'Greater Accra',
    type: 'bookstore',
    max_capacity: 15,
    current_occupancy: 8,
    status: 'open',
    schedule: {
      monday: { is_open: true, slots: [{ start: '09:00', end: '21:00', capacity: 15, booked: 5 }] },
      tuesday: { is_open: true, slots: [{ start: '09:00', end: '21:00', capacity: 15, booked: 7 }] },
      wednesday: { is_open: true, slots: [{ start: '09:00', end: '21:00', capacity: 15, booked: 6 }] },
      thursday: { is_open: true, slots: [{ start: '09:00', end: '21:00', capacity: 15, booked: 8 }] },
      friday: { is_open: true, slots: [{ start: '09:00', end: '22:00', capacity: 15, booked: 12 }] },
      saturday: { is_open: true, slots: [{ start: '10:00', end: '22:00', capacity: 15, booked: 14 }] },
      sunday: { is_open: true, slots: [{ start: '12:00', end: '18:00', capacity: 10, booked: 8 }] },
    },
    upcoming_exchanges: 12,
    avg_duration_minutes: 25,
    peak_hours: ['14:00', '15:00', '16:00'],
    rating: 4.8,
    total_exchanges: 456,
  },
  {
    id: 'spot-2',
    name: 'KNUST Library Lobby',
    address: 'KNUST Main Campus',
    city: 'Kumasi',
    region: 'Ashanti',
    type: 'library',
    max_capacity: 20,
    current_occupancy: 18,
    status: 'busy',
    schedule: {
      monday: { is_open: true, slots: [{ start: '08:00', end: '20:00', capacity: 20, booked: 15 }] },
      tuesday: { is_open: true, slots: [{ start: '08:00', end: '20:00', capacity: 20, booked: 16 }] },
      wednesday: { is_open: true, slots: [{ start: '08:00', end: '20:00', capacity: 20, booked: 14 }] },
      thursday: { is_open: true, slots: [{ start: '08:00', end: '20:00', capacity: 20, booked: 18 }] },
      friday: { is_open: true, slots: [{ start: '08:00', end: '18:00', capacity: 20, booked: 12 }] },
      saturday: { is_open: true, slots: [{ start: '09:00', end: '17:00', capacity: 15, booked: 10 }] },
      sunday: { is_open: false, slots: [] },
    },
    upcoming_exchanges: 8,
    avg_duration_minutes: 30,
    peak_hours: ['10:00', '11:00', '14:00'],
    rating: 4.6,
    total_exchanges: 892,
  },
  {
    id: 'spot-3',
    name: 'Marina Mall Food Court',
    address: 'Marina Mall, Community 4',
    city: 'Tema',
    region: 'Greater Accra',
    type: 'mall',
    max_capacity: 25,
    current_occupancy: 25,
    status: 'at_capacity',
    schedule: {
      monday: { is_open: true, slots: [{ start: '10:00', end: '22:00', capacity: 25, booked: 20 }] },
      tuesday: { is_open: true, slots: [{ start: '10:00', end: '22:00', capacity: 25, booked: 18 }] },
      wednesday: { is_open: true, slots: [{ start: '10:00', end: '22:00', capacity: 25, booked: 22 }] },
      thursday: { is_open: true, slots: [{ start: '10:00', end: '22:00', capacity: 25, booked: 19 }] },
      friday: { is_open: true, slots: [{ start: '10:00', end: '23:00', capacity: 25, booked: 25 }] },
      saturday: { is_open: true, slots: [{ start: '10:00', end: '23:00', capacity: 25, booked: 25 }] },
      sunday: { is_open: true, slots: [{ start: '12:00', end: '20:00', capacity: 20, booked: 18 }] },
    },
    upcoming_exchanges: 15,
    avg_duration_minutes: 20,
    peak_hours: ['12:00', '13:00', '18:00', '19:00'],
    rating: 4.4,
    total_exchanges: 1234,
  },
  {
    id: 'spot-4',
    name: 'Vida e Caffe - Osu',
    address: '12 Oxford Street, Osu',
    city: 'Accra',
    region: 'Greater Accra',
    type: 'cafe',
    max_capacity: 8,
    current_occupancy: 3,
    status: 'open',
    schedule: {
      monday: { is_open: true, slots: [{ start: '07:00', end: '21:00', capacity: 8, booked: 4 }] },
      tuesday: { is_open: true, slots: [{ start: '07:00', end: '21:00', capacity: 8, booked: 5 }] },
      wednesday: { is_open: true, slots: [{ start: '07:00', end: '21:00', capacity: 8, booked: 3 }] },
      thursday: { is_open: true, slots: [{ start: '07:00', end: '21:00', capacity: 8, booked: 6 }] },
      friday: { is_open: true, slots: [{ start: '07:00', end: '22:00', capacity: 8, booked: 7 }] },
      saturday: { is_open: true, slots: [{ start: '08:00', end: '22:00', capacity: 8, booked: 8 }] },
      sunday: { is_open: true, slots: [{ start: '08:00', end: '18:00', capacity: 6, booked: 4 }] },
    },
    upcoming_exchanges: 5,
    avg_duration_minutes: 35,
    peak_hours: ['10:00', '15:00', '16:00'],
    rating: 4.9,
    total_exchanges: 234,
  },
  {
    id: 'spot-5',
    name: 'Ho Public Library',
    address: 'Central Ho',
    city: 'Ho',
    region: 'Volta',
    type: 'library',
    max_capacity: 12,
    current_occupancy: 0,
    status: 'closed',
    schedule: {
      monday: { is_open: true, slots: [{ start: '09:00', end: '17:00', capacity: 12, booked: 2 }] },
      tuesday: { is_open: true, slots: [{ start: '09:00', end: '17:00', capacity: 12, booked: 3 }] },
      wednesday: { is_open: true, slots: [{ start: '09:00', end: '17:00', capacity: 12, booked: 2 }] },
      thursday: { is_open: true, slots: [{ start: '09:00', end: '17:00', capacity: 12, booked: 4 }] },
      friday: { is_open: true, slots: [{ start: '09:00', end: '16:00', capacity: 12, booked: 3 }] },
      saturday: { is_open: false, slots: [] },
      sunday: { is_open: false, slots: [] },
    },
    upcoming_exchanges: 2,
    avg_duration_minutes: 40,
    peak_hours: ['11:00', '14:00'],
    rating: 4.2,
    total_exchanges: 67,
  },
];

const hourlyUsageData = [
  { hour: '08:00', usage: 15 },
  { hour: '09:00', usage: 25 },
  { hour: '10:00', usage: 45 },
  { hour: '11:00', usage: 55 },
  { hour: '12:00', usage: 70 },
  { hour: '13:00', usage: 65 },
  { hour: '14:00', usage: 80 },
  { hour: '15:00', usage: 85 },
  { hour: '16:00', usage: 75 },
  { hour: '17:00', usage: 60 },
  { hour: '18:00', usage: 70 },
  { hour: '19:00', usage: 55 },
  { hour: '20:00', usage: 35 },
  { hour: '21:00', usage: 20 },
];

const weeklyCapacityData = [
  { day: 'Mon', capacity: 80, booked: 46, utilization: 58 },
  { day: 'Tue', capacity: 80, booked: 49, utilization: 61 },
  { day: 'Wed', capacity: 80, booked: 47, utilization: 59 },
  { day: 'Thu', capacity: 80, booked: 55, utilization: 69 },
  { day: 'Fri', capacity: 80, booked: 69, utilization: 86 },
  { day: 'Sat', capacity: 73, booked: 65, utilization: 89 },
  { day: 'Sun', capacity: 56, booked: 38, utilization: 68 },
];

export default function SpotCapacityPage() {
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [filterStatus, setFilterStatus] = useState<Spot['status'] | 'all'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredSpots = useMemo(() => {
    return mockSpots.filter((spot) => {
      const matchesStatus = filterStatus === 'all' || spot.status === filterStatus;
      const matchesType = filterType === 'all' || spot.type === filterType;
      const matchesRegion = filterRegion === 'all' || spot.region === filterRegion;
      return matchesStatus && matchesType && matchesRegion;
    });
  }, [filterStatus, filterType, filterRegion]);

  const stats = useMemo(() => {
    const totalCapacity = mockSpots.reduce((acc, s) => acc + s.max_capacity, 0);
    const totalOccupancy = mockSpots.reduce((acc, s) => acc + s.current_occupancy, 0);
    return {
      totalSpots: mockSpots.length,
      totalCapacity,
      currentOccupancy: totalOccupancy,
      utilization: Math.round((totalOccupancy / totalCapacity) * 100),
      atCapacity: mockSpots.filter((s) => s.status === 'at_capacity').length,
    };
  }, []);

  const regions = [...new Set(mockSpots.map((s) => s.region))];
  const types = [...new Set(mockSpots.map((s) => s.type))];

  const getStatusBadge = (status: Spot['status']) => {
    const styles = {
      open: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-600 dark:text-gray-400',
      busy: 'bg-yellow-100 text-yellow-700',
      at_capacity: 'bg-red-100 text-red-700',
    };
    const labels = {
      open: 'Open',
      closed: 'Closed',
      busy: 'Busy',
      at_capacity: 'At Capacity',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getOccupancyColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cafe':
        return '☕';
      case 'library':
        return '📚';
      case 'bookstore':
        return '📖';
      case 'mall':
        return '🏬';
      case 'community_center':
        return '🏛️';
      default:
        return '📍';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Spot Capacity & Availability</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage exchange spot capacity in real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
            Export Report
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
            Add New Spot
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Spots</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalSpots}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Capacity</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCapacity}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Current Occupancy</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.currentOccupancy}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Utilization</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.utilization}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">At Capacity</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.atCapacity}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Hourly Usage Pattern (Today)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={hourlyUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Line type="monotone" dataKey="usage" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Weekly Capacity Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyCapacityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="capacity" name="Capacity" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="booked" name="Booked" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as Spot['status'] | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="busy">Busy</option>
          <option value="at_capacity">At Capacity</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Types</option>
          {types.map((type) => (
            <option key={type} value={type}>{type.replace('_', ' ')}</option>
          ))}
        </select>
        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Regions</option>
          {regions.map((region) => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </div>

      {/* Spots Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredSpots.map((spot) => (
          <div
            key={spot.id}
            onClick={() => setSelectedSpot(spot)}
            className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedSpot?.id === spot.id ? 'border-indigo-500' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                  {getTypeIcon(spot.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{spot.name}</h3>
                    {getStatusBadge(spot.status)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{spot.city}, {spot.region}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {spot.current_occupancy}/{spot.max_capacity}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">occupancy</p>
              </div>
            </div>

            {/* Capacity Bar */}
            <div className="mb-3">
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getOccupancyColor(spot.current_occupancy, spot.max_capacity)}`}
                  style={{ width: `${(spot.current_occupancy / spot.max_capacity) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>{Math.round((spot.current_occupancy / spot.max_capacity) * 100)}% full</span>
                <span>{spot.max_capacity - spot.current_occupancy} available</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{spot.upcoming_exchanges}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Upcoming</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{spot.avg_duration_minutes}m</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Time</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900 dark:text-white">★ {spot.rating}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{spot.total_exchanges}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              </div>
            </div>

            {/* Peak Hours */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Peak:</span>
              {spot.peak_hours.map((hour) => (
                <span key={hour} className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                  {hour}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Sidebar */}
      {selectedSpot && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-xl z-40 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
            <h3 className="font-semibold text-gray-900 dark:text-white">Spot Details</h3>
            <button
              onClick={() => setSelectedSpot(null)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-3xl">
                {getTypeIcon(selectedSpot.type)}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mt-3">{selectedSpot.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{selectedSpot.address}</p>
              <div className="mt-2">{getStatusBadge(selectedSpot.status)}</div>
            </div>

            {/* Live Capacity */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Live Capacity</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedSpot.current_occupancy} / {selectedSpot.max_capacity}
                </span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getOccupancyColor(selectedSpot.current_occupancy, selectedSpot.max_capacity)}`}
                  style={{ width: `${(selectedSpot.current_occupancy / selectedSpot.max_capacity) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {selectedSpot.max_capacity - selectedSpot.current_occupancy} spots available
              </p>
            </div>

            {/* Schedule */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Weekly Schedule</h4>
              <div className="space-y-2">
                {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as DayOfWeek[]).map((day) => {
                  const schedule = selectedSpot.schedule[day];
                  return (
                    <div key={day} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 capitalize w-20">{day.slice(0, 3)}</span>
                      {schedule.is_open ? (
                        <>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {schedule.slots[0]?.start} - {schedule.slots[0]?.end}
                          </span>
                          <div className="flex items-center gap-1">
                            <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${(schedule.slots[0]?.booked / schedule.slots[0]?.capacity) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {schedule.slots[0]?.booked}/{schedule.slots[0]?.capacity}
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">Closed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-xl font-bold text-indigo-600">{selectedSpot.upcoming_exchanges}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Upcoming Exchanges</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedSpot.avg_duration_minutes}m</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Duration</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-xl font-bold text-yellow-600">★ {selectedSpot.rating}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">User Rating</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-xl font-bold text-green-600">{selectedSpot.total_exchanges}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Exchanges</p>
              </div>
            </div>

            {/* Peak Hours */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Peak Hours</h4>
              <div className="flex flex-wrap gap-2">
                {selectedSpot.peak_hours.map((hour) => (
                  <span key={hour} className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                    {hour}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
              >
                Edit Capacity
              </button>
              <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 dark:bg-gray-900">
                View History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
