export type LeadStatus = string;

// ─────────────────────────────────────────────
// CallOutcome — also dynamic from DB
// ─────────────────────────────────────────────
export type CallOutcome = string;

// ─────────────────────────────────────────────
// Lead
// ─────────────────────────────────────────────
export interface Lead {
  id: string;
  companyName: string | null;
  personName: string | null;
  phone: string;
  status: LeadStatus;

  // assignedTo relation
  assignedToId?: string | null;
  assignedTo?: {
    id: string;
    name: string;
    email?: string;
  } | null;

  // campaign relation
  campaignId?: string | null;
  campaign?: {
    id: string;
    name: string;
  } | null;

  // dynamic fields from Excel import
  meta?: Record<string, any>;

  followUpAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

// ─────────────────────────────────────────────
// Paginated response from GET /leads
// ─────────────────────────────────────────────
export interface LeadsResponse {
  data: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// ─────────────────────────────────────────────
// Params for fetchLeads()
// Matches backend: search, statuses, assignees,
// campaignId, page, limit
// ─────────────────────────────────────────────
export interface FetchLeadsParams {
  search?: string;
  statuses?: string; // comma-separated e.g. "FRESH,ASSIGNED"
  assignees?: string; // comma-separated employee IDs
  campaignId?: string; // single campaign ID
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────
// Lead Activity
// ─────────────────────────────────────────────
export interface LeadActivity {
  id: string;
  leadId: string;
  userId: string;
  type: "CALL" | "ASSIGNED" | "REMARK" | "NOTE" | "STATUS_CHANGE";
  remark?: string | null;
  createdAt: string;

  user?: {
    id: string;
    name: string;
  };

  outcome?: {
    id: string;
    name: string;
    color?: string;
    stage?: string;
  } | null;

  outcomeReason?: {
    id: string;
    label: string;
  } | null;
}

// ─────────────────────────────────────────────
// Form Response
// ─────────────────────────────────────────────
export interface FormResponse {
  id: string;
  formId: string;
  leadId: string;
  userId: string;
  values: Record<string, any>;
  createdAt: string;

  form?: {
    id: string;
    name: string;
    description?: string;
    schema?: any[];
  };

  user?: {
    id: string;
    name: string;
  };
}

// ─────────────────────────────────────────────
// Pipeline
// ─────────────────────────────────────────────
export interface PipelineStage {
  id: string;
  name: string;
  color?: string;
  stage: "INITIAL" | "ACTIVE" | "CLOSED";
  key?: string;
  teamId?: string;
  isSystem?: boolean;
  createdAt?: string;
  reasons?: Array<{ id: string; label: string }>;
}

export interface Pipeline {
  id: string;
  teamId: string;
  initialStage?: string[];
  activeStage?: PipelineStage[];
  closedStage?: PipelineStage[];
}
