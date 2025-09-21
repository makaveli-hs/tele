'use client';

export interface DashboardStats {
  total_leads: number;
  new_leads: number;
  contacted_leads: number;
  qualified_leads: number;
  converted_leads: number;
  total_calls: number;
  successful_calls: number;
  active_campaigns: number;
}

export interface RecentActivity {
  id: string;
  type: 'lead_created' | 'call_made' | 'lead_converted' | 'campaign_started';
  description: string;
  timestamp: string;
  user_name: string;
}

export interface CallVolumeData {
  date: string;
  calls: number;
  successful_calls: number;
}

export interface LeadConversionData {
  date: string;
  new_leads: number;
  converted_leads: number;
  conversion_rate: number;
}