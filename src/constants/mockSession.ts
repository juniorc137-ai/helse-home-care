/**
 * Sessão mock para a Fase 2 (telas/navegação). RBAC real (login, troca de
 * papel, gate de permissão nas telas) fica para a Fase 5 — ver
 * `src/services/permissionGuard.ts` e `docs/DECISIONS.md`.
 */
export const MOCK_CURRENT_USER_ID = "user-nurse-01";
export const MOCK_CURRENT_USER_ROLE = "NURSE" as const;

/**
 * Identidade mock usada apenas para ações restritas a ADMIN (ex.: remover
 * paciente) enquanto não há login real (Fase 5). Representa "como se" um
 * coordenador estivesse operando aquela ação específica.
 */
export const MOCK_ADMIN_USER_ID = "user-admin-01";
export const MOCK_ADMIN_USER_ROLE = "ADMIN" as const;
