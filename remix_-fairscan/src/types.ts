/**
 * FairScan Type Definitions
 */

export enum AuditStatus {
  QUEUED = "queued",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum ModelType {
  CLASSIFICATION = "classification",
  REGRESSION = "regression",
  RANKING = "ranking",
}

export enum UseCase {
  HIRING = "hiring",
  LENDING = "lending",
  CONTENT = "content",
  OTHER = "other",
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  organization: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  modelType: ModelType;
  useCase: UseCase;
  ownerId: string;
  createdAt: string;
  auditCount: number;
}

export interface BiasMetric {
  type: string;
  signalType: string;
  groupLabel: string;
  baselineLabel: string;
  value: number;
  passes: boolean;
  threshold: number;
}

export interface Recommendation {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  signal: string;
  message: string;
  fixType: "feature_removal" | "data_rebalancing" | "threshold_adjustment" | "retraining";
}

export interface AuditReport {
  overallAccuracy: number;
  summaryVerdict: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  metrics: Record<string, any>;
  proxySignalsDetected: Record<string, string[]>;
  recommendations: Recommendation[];
}

export interface AuditRun {
  id: string;
  projectId: string;
  status: AuditStatus;
  modelName: string;
  datasetRows: number;
  datasetColumns: number;
  labelColumn: string;
  predictionColumn: string;
  sensitiveFeatures: string[];
  decisionThreshold: number;
  report?: AuditReport;
  error?: string;
  createdAt: string;
  completedAt?: string;
}
