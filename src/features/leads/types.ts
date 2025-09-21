'use client';

import type { LeadStatusType } from '@/constants';

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company?: string;
  status: LeadStatusType;
  source: string;
  notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company?: string;
  source: string;
  notes?: string;
  assigned_to?: string;
}

export interface UpdateLeadData extends Partial<CreateLeadData> {
  status?: LeadStatusType;
}

export interface LeadsFilters {
  status?: LeadStatusType;
  assigned_to?: string;
  source?: string;
  search?: string;
}