'use client';

import { useState } from 'react';
import {
  MapPin,
  Users,
  BookOpen,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Eye,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Treemap,
} from 'recharts';

// Ghana regions data with coordinates and activity
interface RegionData {
  name: string;
  capital: string;
  latitude: number;
  longitude: number;
  users: number;
  listings: number;
  exchanges: number;
  revenue: number;
  growth: number;
  activeSpots: number;
}

const ghanaRegions: RegionData[] = [
  { name: 'Greater Accra', capital: 'Accra', latitude: 5.6037, longitude: -0.187, users: 4520, listings: 8934, exchanges: 2341, revenue: 45600, growth: 15.3, activeSpots: 45 },
  { name: 'Ashanti', capital: 'Kumasi', latitude: 6.6885, longitude: -1.6244, users: 3210, listings: 5678, exchanges: 1567, revenue: 31200, growth: 12.8, activeSpots: 32 },
  { name: 'Western', capital: 'Sekondi-Takoradi', latitude: 4.9346, longitude: -1.7137, users: 1890, listings: 3245, exchanges: 876, revenue: 18900, growth: 8.5, activeSpots: 18 },
  { name: 'Central', capital: 'Cape Coast', latitude: 5.1315, longitude: -1.2795, users: 1654, listings: 2987, exchanges: 765, revenue: 15400, growth: 10.2, activeSpots: 15 },
  { name: 'Eastern', capital: 'Koforidua', latitude: 6.0941, longitude: -0.2595, users: 1432, listings: 2543, exchanges: 654, revenue: 12300, growth: 7.6, activeSpots: 12 },
  { name: 'Volta', capital: 'Ho', latitude: 6.6011, longitude: 0.4697, users: 1123, listings: 1987, exchanges: 543, revenue: 9800, growth: 9.1, activeSpots: 10 },
  { name: 'Northern', capital: 'Tamale', latitude: 9.4034, longitude: -0.8424, users: 987, listings: 1765, exchanges: 432, revenue: 8700, growth: 14.5, activeSpots: 9 },
  { name: 'Upper East', capital: 'Bolgatanga', latitude: 10.7856, longitude: -0.8514, users: 756, listings: 1234, exchanges: 321, revenue: 6500, growth: 18.2, activeSpots: 7 },
  { name: 'Upper West', capital: 'Wa', latitude: 10.0601, longitude: -2.5099, users: 543, listings: 987, exchanges: 234, revenue: 4300, growth: 11.3, activeSpots: 5 },
  { name: 'Bono', capital: 'Sunyani', latitude: 7.3397, longitude: -2.3266, users: 876, listings: 1543, exchanges: 398, revenue: 7600, growth: 6.8, activeSpots: 8 },
  { name: 'Bono East', capital: 'Techiman', latitude: 7.5853, longitude: -1.9344, users: 654, listings: 1123, exchanges: 287, revenue: 5400, growth: 8.9, activeSpots: 6 },
  { name: 'Ahafo', capital: 'Goaso', latitude: 6.8041, longitude: -2.5237, users: 432, listings: 765, exchanges: 176, revenue: 3200, growth: 5.4, activeSpots: 4 },
  { name: 'Savannah', capital: 'Damongo', latitude: 9.0923, longitude: -1.8214, users: 321, listings: 543, exchanges: 123, revenue: 2100, growth: 12.1, activeSpots: 3 },
  { name: 'North East', capital: 'Nalerigu', latitude: 10.5274, longitude: -0.3656, users: 234, listings: 398, exchanges: 87, revenue: 1500, growth: 15.8, activeSpots: 2 },
  { name: 'Oti', capital: 'Dambai', latitude: 8.0699, longitude: 0.1815, users: 287, listings: 476, exchanges: 98, revenue: 1800, growth: 10.5, activeSpots: 3 },
  { name: 'Western North', capital: 'Sefwi Wiawso', latitude: 6.2098, longitude: -2.4926, users: 398, listings: 687, exchanges: 156, revenue: 2900, growth: 7.2, activeSpots: 4 },
];

// City-level data for selected regions
interface CityData {
  name: string;
  region: string;
  users: number;
  listings: number;
  exchanges: number;
}

const cityData: CityData[] = [
  { name: 'Accra Central', region: 'Greater Accra', users: 1234, listings: 2456, exchanges: 654 },
  { name: 'Tema', region: 'Greater Accra', users: 987, listings: 1876, exchanges: 487 },
  { name: 'Madina', region: 'Greater Accra', users: 765, listings: 1432, exchanges: 376 },
  { name: 'East Legon', region: 'Greater Accra', users: 654, listings: 1234, exchanges: 298 },
  { name: 'Kumasi Central', region: 'Ashanti', users: 876, listings: 1654, exchanges: 432 },
  { name: 'Adum', region: 'Ashanti', users: 654, listings: 1234, exchanges: 321 },
  { name: 'Bantama', region: 'Ashanti', users: 543, listings: 987, exchanges: 254 },
  { name: 'Takoradi', region: 'Western', users: 654, listings: 1123, exchanges: 298 },
  { name: 'Sekondi', region: 'Western', users: 432, listings: 765, exchanges: 187 },
  { name: 'Cape Coast', region: 'Central', users: 543, listings: 987, exchanges: 234 },
];

// Treemap data for visualization
const treemapData = ghanaRegions.map(region => ({
  name: region.name,
  size: region.exchanges,
  users: region.users,
  growth: region.growth,
}));

function RegionCard({ region, isSelected, onClick }: { region: RegionData; isSelected: boolean; onClick: () => void }) {
  const getIntensityColor = (exchanges: number) => {
    if (exchanges >= 2000) return 'bg-red-500';
    if (exchanges >= 1000) return 'bg-orange-500';
    if (exchanges >= 500) return 'bg-yellow-500';
    if (exchanges >= 200) return 'bg-green-400';
    return 'bg-green-200';
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500'
          : 'bg-white dark:bg-gray-800 border-2 border-transparent hover:border-amber-300'
      } shadow`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getIntensityColor(region.exchanges)}`} />
          <h4 className="font-medium text-gray-900 dark:text-white">{region.name}</h4>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded ${
          region.growth >= 10
            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
        }`}>
          {region.growth >= 0 ? '+' : ''}{region.growth}%
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Users</p>
          <p className="font-semibold text-gray-900 dark:text-white">{region.users.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Listings</p>
          <p className="font-semibold text-gray-900 dark:text-white">{region.listings.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Exchanges</p>
          <p className="font-semibold text-gray-900 dark:text-white">{region.exchanges.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function GhanaMapVisualization({ regions, selectedRegion, onRegionClick }: {
  regions: RegionData[];
  selectedRegion: string | null;
  onRegionClick: (region: string) => void;
}) {
  // Simple SVG-based map representation
  const maxExchanges = Math.max(...regions.map(r => r.exchanges));

  const getColor = (exchanges: number) => {
    const intensity = exchanges / maxExchanges;
    if (intensity >= 0.8) return '#ef4444';
    if (intensity >= 0.6) return '#f97316';
    if (intensity >= 0.4) return '#eab308';
    if (intensity >= 0.2) return '#22c55e';
    return '#86efac';
  };

  const getSize = (exchanges: number) => {
    const minSize = 20;
    const maxSize = 60;
    return minSize + (exchanges / maxExchanges) * (maxSize - minSize);
  };

  return (
    <div className="relative w-full h-[500px] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
      {/* Map background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 400 500" className="w-full h-full max-w-md">
          {/* Ghana outline (simplified) */}
          <path
            d="M200,50 L280,80 L300,150 L320,200 L300,280 L280,350 L240,400 L200,450 L160,400 L120,350 L100,280 L80,200 L100,150 L120,80 Z"
            fill="none"
            stroke="#d1d5db"
            strokeWidth="2"
            className="dark:stroke-gray-600"
          />

          {/* Region markers */}
          {regions.map((region, index) => {
            // Map lat/long to SVG coordinates (simplified mapping)
            const x = 200 + (region.longitude + 2) * 50;
            const y = 500 - (region.latitude - 4) * 60;
            const size = getSize(region.exchanges);

            return (
              <g key={region.name} onClick={() => onRegionClick(region.name)} className="cursor-pointer">
                <circle
                  cx={x}
                  cy={y}
                  r={size / 2}
                  fill={getColor(region.exchanges)}
                  opacity={selectedRegion === region.name ? 1 : 0.7}
                  stroke={selectedRegion === region.name ? '#f59e0b' : 'transparent'}
                  strokeWidth="3"
                  className="transition-all hover:opacity-100"
                />
                <text
                  x={x}
                  y={y + size / 2 + 15}
                  textAnchor="middle"
                  className="text-xs fill-gray-700 dark:fill-gray-300 pointer-events-none"
                >
                  {region.capital}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Exchange Activity</p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-200" />
            <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">High</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700">
          <Layers className="w-4 h-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
        </button>
        <button className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700">
          <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
        </button>
      </div>
    </div>
  );
}

export default function HeatMapsPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'map' | 'treemap' | 'list'>('map');
  const [metricType, setMetricType] = useState<'exchanges' | 'users' | 'listings' | 'revenue'>('exchanges');

  const selectedRegionData = selectedRegion
    ? ghanaRegions.find(r => r.name === selectedRegion)
    : null;

  const sortedRegions = [...ghanaRegions].sort((a, b) => b[metricType] - a[metricType]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <MapPin className="w-8 h-8 text-amber-500" />
            Geographic Heat Maps
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Visualize exchange activity and user distribution across Ghana
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={metricType}
            onChange={(e) => setMetricType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
          >
            <option value="exchanges">Exchanges</option>
            <option value="users">Users</option>
            <option value="listings">Listings</option>
            <option value="revenue">Revenue</option>
          </select>
          <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setViewType('map')}
              className={`px-3 py-2 text-sm ${
                viewType === 'map'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setViewType('treemap')}
              className={`px-3 py-2 text-sm ${
                viewType === 'treemap'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Treemap
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`px-3 py-2 text-sm ${
                viewType === 'list'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              List
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">Total Users</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {ghanaRegions.reduce((sum, r) => sum + r.users, 0).toLocaleString()}
          </p>
          <p className="text-sm text-green-600 mt-1">+12.5% from last month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">Total Listings</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {ghanaRegions.reduce((sum, r) => sum + r.listings, 0).toLocaleString()}
          </p>
          <p className="text-sm text-green-600 mt-1">+8.3% from last month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <RefreshCw className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">Total Exchanges</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {ghanaRegions.reduce((sum, r) => sum + r.exchanges, 0).toLocaleString()}
          </p>
          <p className="text-sm text-green-600 mt-1">+15.2% from last month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">Active Regions</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {ghanaRegions.length}
          </p>
          <p className="text-sm text-gray-500 mt-1">All regions active</p>
        </div>
      </div>

      {/* Main visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map/Treemap view */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {viewType === 'map' && 'Regional Activity Map'}
            {viewType === 'treemap' && 'Activity Distribution'}
            {viewType === 'list' && 'Region Rankings'}
          </h3>

          {viewType === 'map' && (
            <GhanaMapVisualization
              regions={ghanaRegions}
              selectedRegion={selectedRegion}
              onRegionClick={setSelectedRegion}
            />
          )}

          {viewType === 'treemap' && (
            <ResponsiveContainer width="100%" height={500}>
              <Treemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                fill="#f59e0b"
                content={({ x, y, width, height, name, size }: any) => (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      style={{
                        fill: `rgba(245, 158, 11, ${0.3 + (size / 2500) * 0.7})`,
                        stroke: '#fff',
                        strokeWidth: 2,
                      }}
                    />
                    {width > 60 && height > 30 && (
                      <>
                        <text
                          x={x + width / 2}
                          y={y + height / 2 - 8}
                          textAnchor="middle"
                          fill="#1f2937"
                          fontSize={12}
                          fontWeight="bold"
                        >
                          {name}
                        </text>
                        <text
                          x={x + width / 2}
                          y={y + height / 2 + 10}
                          textAnchor="middle"
                          fill="#6b7280"
                          fontSize={10}
                        >
                          {size} exchanges
                        </text>
                      </>
                    )}
                  </g>
                )}
              />
            </ResponsiveContainer>
          )}

          {viewType === 'list' && (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {sortedRegions.map((region, index) => (
                <div
                  key={region.name}
                  onClick={() => setSelectedRegion(region.name)}
                  className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedRegion === region.name
                      ? 'bg-amber-50 dark:bg-amber-900/20'
                      : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index < 3
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{region.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{region.capital}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                        {metricType.charAt(0).toUpperCase() + metricType.slice(1)}
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {metricType === 'revenue' ? `GH₵${region[metricType].toLocaleString()}` : region[metricType].toLocaleString()}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 ${region.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {region.growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="text-sm font-medium">{region.growth}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Region details sidebar */}
        <div className="space-y-6">
          {/* Selected region details */}
          {selectedRegionData ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {selectedRegionData.name}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Capital</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedRegionData.capital}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Users</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedRegionData.users.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Listings</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedRegionData.listings.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Exchanges</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedRegionData.exchanges.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Revenue</span>
                  <span className="font-medium text-gray-900 dark:text-white">GH₵{selectedRegionData.revenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Meetup Spots</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedRegionData.activeSpots}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Growth</span>
                  <span className={`font-medium ${selectedRegionData.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedRegionData.growth >= 0 ? '+' : ''}{selectedRegionData.growth}%
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Top Cities</h4>
                <div className="space-y-2">
                  {cityData
                    .filter(c => c.region === selectedRegionData.name)
                    .slice(0, 5)
                    .map(city => (
                      <div key={city.name} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">{city.name}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{city.exchanges} exchanges</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">
                Select a region to view details
              </p>
            </div>
          )}

          {/* Top regions list */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Performing Regions
            </h3>
            <div className="space-y-3">
              {sortedRegions.slice(0, 5).map((region, index) => (
                <div
                  key={region.name}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg"
                  onClick={() => setSelectedRegion(region.name)}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0
                      ? 'bg-amber-500 text-white'
                      : index === 1
                      ? 'bg-gray-400 text-white'
                      : index === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{region.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                      {region[metricType].toLocaleString()} {metricType}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Regional comparison chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Regional Comparison
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sortedRegions.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="users" fill="#3b82f6" name="Users" />
            <Bar dataKey="listings" fill="#f59e0b" name="Listings" />
            <Bar dataKey="exchanges" fill="#10b981" name="Exchanges" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
