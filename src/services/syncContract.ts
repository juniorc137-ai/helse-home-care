/**
 * Contrato de sincronização (Sync Contract) — seção 4.5 do PROMPT DE EXECUÇÃO v3.0.
 *
 * Definido desde o MVP para permitir desenvolvimento paralelo do backend
 * futuro, mesmo operando hoje contra mocks locais (ver syncEngine.ts).
 */

export type SyncEntity =
  | "patient"
  | "carePlanTask"
  | "indicatorAssessment"
  | "clinicalNote"
  | "auditLog";

export type SyncAction = "create" | "update" | "softDelete";

export interface SyncRecord {
  id: string; // UUID v4
  entity: SyncEntity;
  action: SyncAction;
  timestamp: string; // ISO 8601 UTC
  data: unknown; // payload tipado por entity (Zod schemas em src/types)
  hash: string; // SHA-256 do data serializado
}

// POST /sync/batch
export interface SyncPayload {
  records: SyncRecord[];
  deviceId: string;
  appVersion: string;
  lastSyncCursor: string | null;
}

export type SyncConflictResolution = "server_wins" | "manual_review";

export interface SyncConflict {
  id: string;
  serverVersion: unknown;
  resolution: SyncConflictResolution;
}

export interface SyncResponse {
  accepted: string[];
  conflicts: SyncConflict[];
  newRecords: SyncRecord[];
  nextCursor: string;
}
