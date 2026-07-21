/**
 * Sessão mock para a Fase 2 (telas/navegação). RBAC real (login, troca de
 * papel, gate de permissão nas telas) fica para a Fase 5 — ver
 * `src/services/permissionGuard.ts` e `docs/DECISIONS.md`.
 */
export const MOCK_CURRENT_USER_ID = "user-nurse-01";
export const MOCK_CURRENT_USER_ROLE = "NURSE" as const;
