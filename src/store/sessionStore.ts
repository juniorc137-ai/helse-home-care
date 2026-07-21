import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Role, User } from "../types/entities";

/**
 * Estado transiente de sessão (usuário logado, aceite de política de
 * privacidade). Dados clínicos NÃO residem aqui — apenas o necessário para
 * a UI e RBAC (seção 4.2, ADR-001).
 */

interface SessionState {
  currentUser: User | null;
  privacyPolicyAccepted: boolean;
  privacyPolicyVersion: string | null;
  login: (user: User) => void;
  logout: () => void;
  acceptPrivacyPolicy: (version: string) => void;
}

export const CURRENT_PRIVACY_POLICY_VERSION = "1.0.0";

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      currentUser: null,
      privacyPolicyAccepted: false,
      privacyPolicyVersion: null,
      login: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
      acceptPrivacyPolicy: (version) => set({ privacyPolicyAccepted: true, privacyPolicyVersion: version }),
    }),
    {
      name: "home-care-session",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function currentRole(): Role | null {
  return useSessionStore.getState().currentUser?.role ?? null;
}
