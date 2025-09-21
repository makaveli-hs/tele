'use client';

// Application Constants
export const APP_NAME = 'Telemarketing Platform';
export const APP_VERSION = '1.0.0';

// Navigation Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LEADS: '/leads',
  CAMPAIGNS: '/campaigns',
  SCRIPTS: '/scripts',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  LEADS: '/api/leads',
  CAMPAIGNS: '/api/campaigns',
  SCRIPTS: '/api/scripts',
  CALL_LOGS: '/api/call-logs',
  OUTCOMES: '/api/outcomes',
  EMPLOYEES: '/api/employees',
} as const;

// Call Outcome Types
export const CALL_OUTCOMES = {
  SUCCESS: 'success',
  NO_ANSWER: 'no_answer',
  BUSY: 'busy',
  CALLBACK: 'callback',
  NOT_INTERESTED: 'not_interested',
  WRONG_NUMBER: 'wrong_number',
} as const;

// Lead Status Types
export const LEAD_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  CONVERTED: 'converted',
  LOST: 'lost',
} as const;

// Campaign Status Types
export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
} as const;

// Employee Roles
export const EMPLOYEE_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  AGENT: 'agent',
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PHONE_INVALID: 'Please enter a valid phone number',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  PASSWORD_MISMATCH: 'Passwords do not match',
} as const;

export type RouteType = typeof ROUTES[keyof typeof ROUTES];
export type CallOutcomeType = typeof CALL_OUTCOMES[keyof typeof CALL_OUTCOMES];
export type LeadStatusType = typeof LEAD_STATUS[keyof typeof LEAD_STATUS];
export type CampaignStatusType = typeof CAMPAIGN_STATUS[keyof typeof CAMPAIGN_STATUS];
export type EmployeeRoleType = typeof EMPLOYEE_ROLES[keyof typeof EMPLOYEE_ROLES];