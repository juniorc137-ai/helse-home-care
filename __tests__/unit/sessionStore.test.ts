import { CURRENT_PRIVACY_POLICY_VERSION, currentRole, useSessionStore } from "../../src/store/sessionStore";

describe("useSessionStore", () => {
  beforeEach(() => {
    useSessionStore.setState({ currentUser: null, privacyPolicyAccepted: false, privacyPolicyVersion: null });
  });

  it("realiza login e expõe o papel atual", () => {
    useSessionStore.getState().login({ id: "user-1", name: "Enfermeira Ana", role: "NURSE" });
    expect(currentRole()).toBe("NURSE");
  });

  it("realiza logout limpando o usuário atual", () => {
    useSessionStore.getState().login({ id: "user-1", name: "Enfermeira Ana", role: "NURSE" });
    useSessionStore.getState().logout();
    expect(currentRole()).toBeNull();
  });

  it("registra aceite da política de privacidade (LGPD, seção 4.3.4)", () => {
    useSessionStore.getState().acceptPrivacyPolicy(CURRENT_PRIVACY_POLICY_VERSION);
    expect(useSessionStore.getState().privacyPolicyAccepted).toBe(true);
    expect(useSessionStore.getState().privacyPolicyVersion).toBe(CURRENT_PRIVACY_POLICY_VERSION);
  });
});
