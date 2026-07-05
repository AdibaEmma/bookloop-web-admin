'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  BookOpen,
  Clock,
  Target,
  Brain,
  BarChart3,
  LineChart as LineChartIcon,
  RefreshCw,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { CustomTooltip, useChartColors } from '@/components/charts/ChartComponents';

// Types
interface ChurnPrediction {
  userId: string;
  userName: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
  recommendedActions: string[];
  lastActive: string;
  totalExchanges: number;
}

interface CategoryPrediction {
  category: string;
  currentDemand: number;
  predictedDemand: number;
  trend: 'rising' | 'stable' | 'declining';
  confidence: number;
}

interface PeakTimePrediction {
  day: string;
  hour: number;
  predictedActivity: number;
}

interface RevenueForecast {
  month: string;
  actual?: number;
  predicted: number;
  lowerBound: number;
  upperBound: number;
}

// Mock data
const churnPredictions: ChurnPrediction[] = [
  {
    userId: '1',
    userName: 'Kwame Mensah',
    riskScore: 85,
    riskLevel: 'high',
    factors: ['No activity for 30 days', 'Incomplete profile', 'No recent listings'],
    recommendedActions: ['Send re-engagement email', 'Offer listing promotion', 'Personal outreach'],
    lastActive: '2025-01-01',
    totalExchanges: 3,
  },
  {
    userId: '2',
    userName: 'Ama Darko',
    riskScore: 72,
    riskLevel: 'high',
    factors: ['Decreased activity', 'Multiple cancelled exchanges', 'Negative reviews'],
    recommendedActions: ['Customer satisfaction survey', 'Offer support', 'Review dispute resolution'],
    lastActive: '2025-01-15',
    totalExchanges: 8,
  },
  {
    userId: '3',
    userName: 'Kofi Asante',
    riskScore: 55,
    riskLevel: 'medium',
    factors: ['Slowing engagement', 'Few listings views'],
    recommendedActions: ['Feature their listings', 'Send personalized recommendations'],
    lastActive: '2025-01-20',
    totalExchanges: 12,
  },
  {
    userId: '4',
    userName: 'Akua Boateng',
    riskScore: 45,
    riskLevel: 'medium',
    factors: ['Irregular login pattern', 'No new listings in 2 weeks'],
    recommendedActions: ['Gentle reminder email', 'Showcase new features'],
    lastActive: '2025-01-22',
    totalExchanges: 5,
  },
  {
    userId: '5',
    userName: 'Yaw Agyei',
    riskScore: 25,
    riskLevel: 'low',
    factors: ['Slight decrease in activity'],
    recommendedActions: ['Monitor', 'Include in weekly digest'],
    lastActive: '2025-01-25',
    totalExchanges: 20,
  },
];

const categoryPredictions: CategoryPrediction[] = [
  { category: 'African Literature', currentDemand: 85, predictedDemand: 95, trend: 'rising', confidence: 89 },
  { category: 'Academic Textbooks', currentDemand: 70, predictedDemand: 82, trend: 'rising', confidence: 85 },
  { category: 'Self-Help', currentDemand: 60, predictedDemand: 58, trend: 'stable', confidence: 78 },
  { category: 'Fiction', currentDemand: 75, predictedDemand: 72, trend: 'stable', confidence: 82 },
  { category: 'Children\'s Books', currentDemand: 55, predictedDemand: 65, trend: 'rising', confidence: 75 },
  { category: 'Business', currentDemand: 45, predictedDemand: 40, trend: 'declining', confidence: 72 },
  { category: 'Romance', currentDemand: 50, predictedDemand: 48, trend: 'stable', confidence: 80 },
  { category: 'Science & Tech', currentDemand: 40, predictedDemand: 52, trend: 'rising', confidence: 77 },
];

const peakTimeData: PeakTimePrediction[] = [
  { day: 'Mon', hour: 9, predictedActivity: 45 },
  { day: 'Mon', hour: 12, predictedActivity: 65 },
  { day: 'Mon', hour: 18, predictedActivity: 85 },
  { day: 'Tue', hour: 9, predictedActivity: 50 },
  { day: 'Tue', hour: 12, predictedActivity: 70 },
  { day: 'Tue', hour: 18, predictedActivity: 90 },
  { day: 'Wed', hour: 9, predictedActivity: 48 },
  { day: 'Wed', hour: 12, predictedActivity: 68 },
  { day: 'Wed', hour: 18, predictedActivity: 82 },
  { day: 'Thu', hour: 9, predictedActivity: 52 },
  { day: 'Thu', hour: 12, predictedActivity: 72 },
  { day: 'Thu', hour: 18, predictedActivity: 88 },
  { day: 'Fri', hour: 9, predictedActivity: 55 },
  { day: 'Fri', hour: 12, predictedActivity: 75 },
  { day: 'Fri', hour: 18, predictedActivity: 95 },
  { day: 'Sat', hour: 10, predictedActivity: 80 },
  { day: 'Sat', hour: 14, predictedActivity: 92 },
  { day: 'Sat', hour: 17, predictedActivity: 85 },
  { day: 'Sun', hour: 11, predictedActivity: 70 },
  { day: 'Sun', hour: 15, predictedActivity: 78 },
  { day: 'Sun', hour: 18, predictedActivity: 65 },
];

const revenueForecast: RevenueForecast[] = [
  { month: 'Jan', actual: 12450, predicted: 12000, lowerBound: 11000, upperBound: 13000 },
  { month: 'Feb', actual: 14200, predicted: 13500, lowerBound: 12500, upperBound: 14500 },
  { month: 'Mar', actual: 15800, predicted: 15200, lowerBound: 14000, upperBound: 16500 },
  { month: 'Apr', predicted: 17500, lowerBound: 16000, upperBound: 19000 },
  { month: 'May', predicted: 19200, lowerBound: 17500, upperBound: 21000 },
  { month: 'Jun', predicted: 21000, lowerBound: 19000, upperBound: 23000 },
];

// Heatmap data for peak times
const heatmapData = [
  { day: 'Mon', '6am': 20, '9am': 45, '12pm': 65, '3pm': 55, '6pm': 85, '9pm': 40 },
  { day: 'Tue', '6am': 22, '9am': 50, '12pm': 70, '3pm': 58, '6pm': 90, '9pm': 42 },
  { day: 'Wed', '6am': 18, '9am': 48, '12pm': 68, '3pm': 52, '6pm': 82, '9pm': 38 },
  { day: 'Thu', '6am': 25, '9am': 52, '12pm': 72, '3pm': 60, '6pm': 88, '9pm': 45 },
  { day: 'Fri', '6am': 28, '9am': 55, '12pm': 75, '3pm': 65, '6pm': 95, '9pm': 50 },
  { day: 'Sat', '6am': 15, '9am': 60, '12pm': 85, '3pm': 92, '6pm': 80, '9pm': 55 },
  { day: 'Sun', '6am': 12, '9am': 45, '12pm': 70, '3pm': 78, '6pm': 65, '9pm': 35 },
];

// Components
function ChurnRiskCard({ prediction }: { prediction: ChurnPrediction }) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-[#F1ECE3] text-foreground';
    }
  };

  return (
    <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-sm">
            {prediction.userName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h4 className="font-medium text-foreground">
              {prediction.userName}
            </h4>
            <p className="text-xs text-muted-foreground">
              {prediction.totalExchanges} exchanges
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(prediction.riskLevel)}`}>
          {prediction.riskLevel.toUpperCase()} RISK
        </span>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-muted-foreground">Risk Score</span>
          <span className="font-medium text-foreground">{prediction.riskScore}%</span>
        </div>
        <div className="h-2 bg-[#ECE6DC] dark:bg-[#2a2118] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              prediction.riskScore >= 70
                ? 'bg-red-500'
                : prediction.riskScore >= 40
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${prediction.riskScore}%` }}
          />
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs font-medium text-muted-foreground mb-1">Risk Factors:</p>
        <ul className="space-y-1">
          {prediction.factors.map((factor, i) => (
            <li key={i} className="text-xs text-muted-foreground dark:text-foreground flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              {factor}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-[#ECE6DC] dark:border-[#33291f] pt-3">
        <p className="text-xs font-medium text-muted-foreground mb-2">Recommended Actions:</p>
        <div className="flex flex-wrap gap-1">
          {prediction.recommendedActions.map((action, i) => (
            <button
              key={i}
              className="text-xs px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryTrendCard({ category }: { category: CategoryPrediction }) {
  const getTrendIcon = () => {
    switch (category.trend) {
      case 'rising':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <BarChart3 className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (category.trend) {
      case 'rising':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const change = category.predictedDemand - category.currentDemand;
  const changePercent = ((change / category.currentDemand) * 100).toFixed(1);

  return (
    <div className="flex items-center justify-between p-3 bg-background dark:bg-[#2a2118]/50 rounded-lg">
      <div className="flex items-center gap-3">
        <BookOpen className="w-5 h-5 text-amber-500" />
        <div>
          <p className="font-medium text-foreground">{category.category}</p>
          <p className="text-xs text-muted-foreground">
            Confidence: {category.confidence}%
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Current</p>
          <p className="font-medium text-foreground">{category.currentDemand}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Predicted</p>
          <p className="font-medium text-foreground">{category.predictedDemand}</p>
        </div>
        <div className={`flex items-center gap-1 ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="text-sm font-medium">
            {change >= 0 ? '+' : ''}{changePercent}%
          </span>
        </div>
      </div>
    </div>
  );
}

function HeatmapCell({ value }: { value: number }) {
  const getColor = () => {
    if (value >= 80) return 'bg-red-500';
    if (value >= 60) return 'bg-orange-500';
    if (value >= 40) return 'bg-yellow-500';
    if (value >= 20) return 'bg-green-400';
    return 'bg-green-200';
  };

  return (
    <div
      className={`w-10 h-10 rounded flex items-center justify-center text-xs font-medium text-white ${getColor()}`}
      title={`Activity: ${value}`}
    >
      {value}
    </div>
  );
}

export default function PredictiveAnalyticsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('6months');

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-500" />
            Predictive Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            ML-powered predictions for user behavior, demand trends, and platform growth
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Refresh Predictions
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-muted-foreground">
              High Churn Risk
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {churnPredictions.filter(p => p.riskLevel === 'high').length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            users need attention
          </p>
        </div>

        <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-muted-foreground">
              Rising Categories
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {categoryPredictions.filter(c => c.trend === 'rising').length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            categories trending up
          </p>
        </div>

        <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-muted-foreground">
              Peak Activity
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            Fri 6PM
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            predicted busiest time
          </p>
        </div>

        <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-muted-foreground">
              Revenue Forecast
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            GH₵21K
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            predicted for Jun
          </p>
        </div>
      </div>

      {/* Revenue Forecast Chart */}
      <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Revenue Forecast
            </h3>
            <p className="text-sm text-muted-foreground">
              Predicted revenue with confidence intervals
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Based on historical data and seasonal patterns
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueForecast}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [`GH₵${value.toLocaleString()}`, '']}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="transparent"
              fill="#f59e0b"
              fillOpacity={0.1}
              name="Upper Bound"
            />
            <Area
              type="monotone"
              dataKey="lowerBound"
              stroke="transparent"
              fill="#f59e0b"
              fillOpacity={0.1}
              name="Lower Bound"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981' }}
              name="Actual"
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#f59e0b' }}
              name="Predicted"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Churn Risk Analysis */}
      <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              User Churn Risk Analysis
            </h3>
            <p className="text-sm text-muted-foreground">
              Users at risk of becoming inactive based on behavioral patterns
            </p>
          </div>
          <select className="px-3 py-2 border border-[#E4DED2] dark:border-[#33291f] rounded-lg bg-white dark:bg-[#2a2118] text-sm">
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk Only</option>
            <option value="medium">Medium Risk Only</option>
            <option value="low">Low Risk Only</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {churnPredictions.map((prediction) => (
            <ChurnRiskCard key={prediction.userId} prediction={prediction} />
          ))}
        </div>
      </div>

      {/* Category Demand Predictions */}
      <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Category Demand Predictions
            </h3>
            <p className="text-sm text-muted-foreground">
              Predicted demand trends for book categories
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {categoryPredictions.map((category) => (
            <CategoryTrendCard key={category.category} category={category} />
          ))}
        </div>
      </div>

      {/* Peak Activity Heatmap */}
      <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Peak Activity Times
            </h3>
            <p className="text-sm text-muted-foreground">
              Predicted platform activity levels by day and time
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-200" />
              <span className="text-xs text-muted-foreground">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-500" />
              <span className="text-xs text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-xs text-muted-foreground">High</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-sm font-medium text-muted-foreground pb-3">Day</th>
                <th className="text-center text-sm font-medium text-muted-foreground pb-3">6 AM</th>
                <th className="text-center text-sm font-medium text-muted-foreground pb-3">9 AM</th>
                <th className="text-center text-sm font-medium text-muted-foreground pb-3">12 PM</th>
                <th className="text-center text-sm font-medium text-muted-foreground pb-3">3 PM</th>
                <th className="text-center text-sm font-medium text-muted-foreground pb-3">6 PM</th>
                <th className="text-center text-sm font-medium text-muted-foreground pb-3">9 PM</th>
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((row) => (
                <tr key={row.day}>
                  <td className="py-2 text-sm font-medium text-foreground">{row.day}</td>
                  <td className="py-2 text-center"><HeatmapCell value={row['6am']} /></td>
                  <td className="py-2 text-center"><HeatmapCell value={row['9am']} /></td>
                  <td className="py-2 text-center"><HeatmapCell value={row['12pm']} /></td>
                  <td className="py-2 text-center"><HeatmapCell value={row['3pm']} /></td>
                  <td className="py-2 text-center"><HeatmapCell value={row['6pm']} /></td>
                  <td className="py-2 text-center"><HeatmapCell value={row['9pm']} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Model Accuracy
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={[
              { metric: 'Churn', accuracy: 87 },
              { metric: 'Demand', accuracy: 82 },
              { metric: 'Peak Times', accuracy: 91 },
              { metric: 'Revenue', accuracy: 85 },
              { metric: 'Matching', accuracy: 78 },
            ]}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Accuracy"
                dataKey="accuracy"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-[#241c16] rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Prediction Insights
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-300">Growth Opportunity</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400">
                African Literature category showing 12% week-over-week growth. Consider featuring these listings prominently.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800 dark:text-yellow-300">Attention Needed</span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                2 high-value users at risk of churning. Immediate re-engagement recommended.
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-300">Optimal Timing</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Best time to send promotional emails: Friday 5-6 PM (highest engagement predicted).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
