import { hasPermission, type Permission } from "../constants/permissions";
import type { Role } from "../types/entities";
import { recordAuditEvent } from "./auditLog";

/**
 * Middleware de checagem de RBAC (seção 4.3.3 / ADR-004). Toda operação
 * sensível deve chamar `assertPermission` antes de executar; tentativas
 * negadas geram evento de auditoria `access.denied`.
 */

export class PermissionDeniedError extends Error {
  constructor(role: Role, permission: Permission) {
    super(`Papel "${role}" não tem permissão para "${permission}"`);
    this.name = "PermissionDeniedError";
  }
}

export function assertPermission(
  userId: string,
  role: Role,
  permission: Permission,
  context: { entityType: "patient" | "carePlanTask" | "indicatorAssessment" | "clinicalNote" | "user"; entityId: string },
): void {
  if (!hasPermission(role, permission)) {
    recordAuditEvent({
      userId,
      action: "access.denied",
      entityType: context.entityType,
      entityId: context.entityId,
      after: { deniedPermission: permission, role },
    });
    throw new PermissionDeniedError(role, permission);
  }
}
