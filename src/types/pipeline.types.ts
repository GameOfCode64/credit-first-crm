/* ================= PIPELINE TYPES ================= */

export type PipelineStage = "ACTIVE" | "CLOSED";

/* ================= REASONS ================= */

export interface CallOutcomeReason {
  id: string;
  label: string;
}

/* ================= OUTCOME ================= */

export interface CallOutcomeConfig {
  id: string;

  /** stable machine key (INTERESTED, WON, LOST, etc) */
  key: string;

  /** display label */
  name: string;

  stage: PipelineStage;

  /** UI color */
  color: string;

  isSystem: boolean;

  reasons: CallOutcomeReason[];
}

/* ================= API RESPONSE ================= */

export interface PipelineResponse {
  initialStage: string[]; // ["FRESH"]
  activeStage: CallOutcomeConfig[];
  closedStage: CallOutcomeConfig[];
}
