import type { Role } from "../types/entities";

/**
 * Matriz papel x permissão (seção 4.3.3 do PROMPT DE EXECUÇÃO v3.0).
 *
 * Fundamento: a avaliação de risco com instrumentos preditivos e a
 * prescrição do plano de cuidados de enfermagem integram o Processo de
 * Enfermagem, privativo do enfermeiro (Resolução COFEN 736/2024); o
 * técnico executa e registra ações delegadas.
 *
 * Esta matriz deve ser validada por middleware antes de cada operação
 * (ver src/services/permissionGuard.ts), com log de tentativas negadas
 * (audit action "access.denied").
 */

export type Permission =
  | "dashboard.view"
  | "patient.viewProfile"
  | "patient.editProfile"
  | "carePlan.createOrEdit"
  | "carePlan.completeTask"
  | "indicator.assessBradenMorseTec"
  | "vitals.record"
  | "note.create"
  | "note.finalize"
  | "admin.manageUsersAndIndicators";

const ALL_ROLES: readonly Role[] = [
  "ADMIN",
  "NURSE",
  "NURSING_TECH",
  "PHYSICIAN",
  "PHYSIO",
  "CAREGIVER",
];

/**
 * true = permitido irrestrito; "scoped" = permitido com restrição de escopo
 * (ex.: CAREGIVER vê perfil restrito; PHYSIO edita plano no escopo próprio).
 */
export type PermissionGrant = boolean | "scoped";

export const PERMISSION_MATRIX: Record<Permission, Record<Role, PermissionGrant>> = {
  "dashboard.view": {
    ADMIN: true,
    NURSE: true,
    NURSING_TECH: true,
    PHYSICIAN: true,
    PHYSIO: true,
    CAREGIVER: "scoped",
  },
  "patient.viewProfile": {
    ADMIN: true,
    NURSE: true,
    NURSING_TECH: true,
    PHYSICIAN: true,
    PHYSIO: true,
    CAREGIVER: "scoped",
  },
  "patient.editProfile": {
    ADMIN: true,
    NURSE: false,
    NURSING_TECH: false,
    PHYSICIAN: false,
    PHYSIO: false,
    CAREGIVER: false,
  },
  "carePlan.createOrEdit": {
    ADMIN: true,
    NURSE: true,
    NURSING_TECH: false,
    PHYSICIAN: true,
    PHYSIO: "scoped",
    CAREGIVER: false,
  },
  "carePlan.completeTask": {
    ADMIN: true,
    NURSE: true,
    NURSING_TECH: true,
    PHYSICIAN: true,
    PHYSIO: true,
    CAREGIVER: false,
  },
  "indicator.assessBradenMorseTec": {
    ADMIN: false,
    NURSE: true,
    NURSING_TECH: false,
    PHYSICIAN: true,
    PHYSIO: false,
    CAREGIVER: false,
  },
  "vitals.record": {
    ADMIN: true,
    NURSE: true,
    NURSING_TECH: true,
    PHYSICIAN: true,
    PHYSIO: true,
    CAREGIVER: false,
  },
  "note.create": {
    ADMIN: false,
    NURSE: true,
    NURSING_TECH: true,
    PHYSICIAN: true,
    PHYSIO: true,
    CAREGIVER: false,
  },
  "note.finalize": {
    ADMIN: false,
    NURSE: true,
    NURSING_TECH: false,
    PHYSICIAN: true,
    PHYSIO: true,
    CAREGIVER: false,
  },
  "admin.manageUsersAndIndicators": {
    ADMIN: true,
    NURSE: false,
    NURSING_TECH: false,
    PHYSICIAN: false,
    PHYSIO: false,
    CAREGIVER: false,
  },
};

export function getPermissionGrant(role: Role, permission: Permission): PermissionGrant {
  return PERMISSION_MATRIX[permission][role];
}

/** Verificação booleana simples: trata "scoped" como permitido (o chamador deve aplicar o filtro de escopo). */
export function hasPermission(role: Role, permission: Permission): boolean {
  return getPermissionGrant(role, permission) !== false;
}

export function isScopedPermission(role: Role, permission: Permission): boolean {
  return getPermissionGrant(role, permission) === "scoped";
}

export { ALL_ROLES };
