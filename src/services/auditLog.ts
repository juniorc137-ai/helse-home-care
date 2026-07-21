import * as ExpoCrypto from "expo-crypto";
import type { AuditAction, AuditEntityType, AuditLogEntry } from "../types/entities";
import { useAuditStore } from "../store/auditStore";

/**
 * Registro de auditoria append-only (seção 4.3.2). Nenhuma função aqui
 * expõe update/delete: correções são sempre novos eventos.
 * Retenção mínima: 20 anos para eventos referenciando entidades
 * assistenciais (patient, carePlanTask, indicatorAssessment, clinicalNote).
 */

export interface RecordAuditEventInput {
  userId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export function recordAuditEvent(input: RecordAuditEventInput): AuditLogEntry {
  const entry: AuditLogEntry = {
    eventId: ExpoCrypto.randomUUID(),
    timestamp: new Date().toISOString(),
    userId: input.userId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    before: input.before ?? null,
    after: input.after ?? null,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
  };
  useAuditStore.getState().append(entry);
  return entry;
}
