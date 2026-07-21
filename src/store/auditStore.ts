import { create } from "zustand";
import type { AuditLogEntry } from "../types/entities";

/**
 * Cache em memória da trilha de auditoria (append-only). A fonte de
 * verdade persistente é a tabela SQLite `audit_log` (ver
 * src/services/db); este store expõe apenas leitura/append para a UI e
 * para auditLog.ts, nunca update/delete.
 */

interface AuditState {
  events: AuditLogEntry[];
  append: (entry: AuditLogEntry) => void;
}

export const useAuditStore = create<AuditState>((set) => ({
  events: [],
  append: (entry) => set((state) => ({ events: [...state.events, entry] })),
}));
