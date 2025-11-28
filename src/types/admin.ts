// Shared types for admin dashboard

// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login_at?: string;
  location?: {
    city: string;
    region: string;
  };
  stats?: {
    total_listings: number;
    total_exchanges: number;
    successful_exchanges: number;
    rating: number;
  };
}

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  user_count: number;
  created_at: string;
}

export interface SegmentCriteria {
  activity_level?: 'high' | 'medium' | 'low' | 'inactive';
  regions?: string[];
  categories?: string[];
  min_exchanges?: number;
  max_exchanges?: number;
  registered_after?: string;
  registered_before?: string;
}

// Reputation types
export interface UserReputation {
  user_id: string;
  trust_score: number;
  badges: Badge[];
  reviews: Review[];
  violations: Violation[];
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
  category: 'achievement' | 'milestone' | 'special';
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  exchange_id: string;
  created_at: string;
}

export interface Violation {
  id: string;
  type: 'warning' | 'suspension' | 'ban';
  reason: string;
  issued_by: string;
  issued_at: string;
  expires_at?: string;
  resolved_at?: string;
}

// Exchange types
export interface Exchange {
  id: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  exchange_type: 'swap' | 'purchase';
  initiator: User;
  recipient: User;
  initiator_listing: Listing;
  recipient_listing?: Listing;
  price?: number;
  meetup_spot?: MeetupSpot;
  scheduled_date?: string;
  completed_at?: string;
  cancelled_at?: string;
  dispute_reason?: string;
  timeline?: TimelineEvent[];
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  type: 'created' | 'confirmed' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'disputed' | 'resolved' | 'message';
  description: string;
  actor_id: string;
  actor_name: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// Listing types
export interface Listing {
  id: string;
  book_title: string;
  book_author: string;
  isbn?: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  description: string;
  images: string[];
  category: string;
  price?: number;
  exchange_type: 'swap' | 'sell' | 'both';
  status: 'active' | 'pending' | 'sold' | 'removed' | 'flagged';
  owner: User;
  created_at: string;
  views: number;
  interested_count: number;
}

// Meetup Spot types
export interface MeetupSpot {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  region: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  category: 'library' | 'community_center' | 'cafe' | 'public_space' | 'educational' | 'other';
  is_active: boolean;
  is_verified: boolean;
  is_community_suggested?: boolean;
  suggested_by?: string;
  safety_rating?: number;
  usage_count?: number;
  incidents?: SafetyIncident[];
  busy_times?: BusyTime[];
  created_at: string;
}

export interface SafetyIncident {
  id: string;
  spot_id: string;
  type: 'theft' | 'harassment' | 'no_show' | 'safety_concern' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reported_by: string;
  exchange_id?: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  resolution?: string;
  created_at: string;
  resolved_at?: string;
}

export interface BusyTime {
  day: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  activity_level: 'low' | 'moderate' | 'busy' | 'very_busy';
}

// Moderation types
export interface ModerationItem {
  id: string;
  type: 'listing' | 'user' | 'review' | 'message';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  reason: string;
  content: any;
  flagged_by?: string;
  auto_flagged?: boolean;
  assigned_to?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
  created_at: string;
}

export interface Report {
  id: string;
  type: 'user' | 'listing' | 'exchange' | 'message' | 'spot';
  target_id: string;
  reported_by: string;
  reporter_name: string;
  reason: string;
  category: 'spam' | 'inappropriate' | 'fraud' | 'harassment' | 'fake' | 'other';
  description: string;
  evidence?: string[];
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  resolution?: string;
  resolved_by?: string;
  created_at: string;
  resolved_at?: string;
}

// Dispute types
export interface Dispute {
  id: string;
  exchange_id: string;
  exchange: Exchange;
  initiated_by: string;
  initiator_name: string;
  reason: string;
  category: 'item_not_as_described' | 'no_show' | 'wrong_item' | 'damaged_item' | 'payment_issue' | 'other';
  description: string;
  evidence: Evidence[];
  status: 'open' | 'investigating' | 'awaiting_response' | 'mediation' | 'resolved' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  resolution?: {
    type: 'refund' | 'exchange_cancelled' | 'in_favor_initiator' | 'in_favor_recipient' | 'mutual_agreement' | 'no_action';
    description: string;
    resolved_by: string;
    resolved_at: string;
  };
  messages: DisputeMessage[];
  created_at: string;
}

export interface Evidence {
  id: string;
  type: 'image' | 'document' | 'screenshot';
  url: string;
  description?: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface DisputeMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'initiator' | 'recipient' | 'admin';
  message: string;
  attachments?: string[];
  created_at: string;
}

// Payment types
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: 'momo' | 'card' | 'cash';
  exchange_id: string;
  payer: User;
  payee: User;
  platform_fee?: number;
  transaction_reference?: string;
  created_at: string;
  completed_at?: string;
}

export interface Payout {
  id: string;
  user_id: string;
  user: User;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'momo' | 'bank_transfer';
  account_details: {
    provider?: string;
    account_number: string;
    account_name: string;
  };
  reference?: string;
  created_at: string;
  processed_at?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_listing' | 'free_exchange';
  value: number;
  description: string;
  usage_limit?: number;
  usage_count: number;
  min_transaction?: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  applicable_to: 'all' | 'new_users' | 'specific_users';
  user_ids?: string[];
  created_by: string;
  created_at: string;
}

// Analytics types
export interface RealTimeStats {
  active_users: number;
  active_exchanges: number;
  new_registrations_today: number;
  new_listings_today: number;
  transactions_today: number;
  revenue_today: number;
}

export interface PredictiveAnalytics {
  churn_risk: ChurnPrediction[];
  popular_categories: CategoryPrediction[];
  peak_times: PeakTimePrediction[];
  revenue_forecast: RevenueForecast[];
}

export interface ChurnPrediction {
  user_id: string;
  user_name: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
  factors: string[];
  recommended_actions: string[];
}

export interface CategoryPrediction {
  category: string;
  current_demand: number;
  predicted_demand: number;
  trend: 'rising' | 'stable' | 'declining';
  confidence: number;
}

export interface PeakTimePrediction {
  day: string;
  hour: number;
  predicted_activity: number;
  confidence: number;
}

export interface RevenueForecast {
  month: string;
  predicted_revenue: number;
  lower_bound: number;
  upper_bound: number;
  confidence: number;
}

export interface GeoHeatMapData {
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  exchange_count: number;
  user_count: number;
  listing_count: number;
  intensity: number;
}

export interface FunnelData {
  stage: string;
  count: number;
  conversion_rate: number;
  drop_off_rate: number;
}

// System types
export interface AuditLog {
  id: string;
  action: string;
  category: 'user' | 'listing' | 'exchange' | 'payment' | 'system' | 'moderation';
  actor_id: string;
  actor_name: string;
  actor_role: string;
  target_type?: string;
  target_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  user_count: number;
  created_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: AdminRole;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  api_latency: number;
  error_rate: number;
  active_connections: number;
  memory_usage: number;
  cpu_usage: number;
  services: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  last_check: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  is_enabled: boolean;
  rollout_percentage: number;
  target_users?: string[];
  target_segments?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Gamification types
export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  user_name: string;
  avatar_url?: string;
  score: number;
  metric: string;
  change: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'exchange' | 'listing' | 'community' | 'special';
  criteria: {
    type: string;
    threshold: number;
  };
  points: number;
  is_active: boolean;
  earned_count: number;
  created_at: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'exchange' | 'listing' | 'referral' | 'engagement';
  goal: number;
  reward: {
    type: 'badge' | 'points' | 'promo_code' | 'feature_unlock';
    value: string | number;
  };
  start_date: string;
  end_date: string;
  is_active: boolean;
  participants: number;
  completions: number;
  created_by: string;
  created_at: string;
}
