import { getPermissionGrant, hasPermission, isScopedPermission } from "../../src/constants/permissions";

describe("Matriz RBAC (seção 4.3.3)", () => {
  it("apenas ADMIN pode editar perfil do paciente", () => {
    expect(hasPermission("ADMIN", "patient.editProfile")).toBe(true);
    expect(hasPermission("NURSE", "patient.editProfile")).toBe(false);
    expect(hasPermission("PHYSICIAN", "patient.editProfile")).toBe(false);
    expect(hasPermission("CAREGIVER", "patient.editProfile")).toBe(false);
  });

  it("apenas NURSE e PHYSICIAN avaliam Braden/Morse/TEC (Processo de Enfermagem, COFEN 736/2024)", () => {
    expect(hasPermission("NURSE", "indicator.assessBradenMorseTec")).toBe(true);
    expect(hasPermission("PHYSICIAN", "indicator.assessBradenMorseTec")).toBe(true);
    expect(hasPermission("NURSING_TECH", "indicator.assessBradenMorseTec")).toBe(false);
    expect(hasPermission("ADMIN", "indicator.assessBradenMorseTec")).toBe(false);
    expect(hasPermission("PHYSIO", "indicator.assessBradenMorseTec")).toBe(false);
    expect(hasPermission("CAREGIVER", "indicator.assessBradenMorseTec")).toBe(false);
  });

  it("CAREGIVER só tem acesso restrito (escopo) ao dashboard e ao perfil", () => {
    expect(isScopedPermission("CAREGIVER", "dashboard.view")).toBe(true);
    expect(isScopedPermission("CAREGIVER", "patient.viewProfile")).toBe(true);
    expect(hasPermission("CAREGIVER", "carePlan.completeTask")).toBe(false);
  });

  it("PHYSIO cria/edita plano de cuidados apenas em escopo próprio", () => {
    expect(isScopedPermission("PHYSIO", "carePlan.createOrEdit")).toBe(true);
    expect(getPermissionGrant("NURSE", "carePlan.createOrEdit")).toBe(true);
  });

  it("qualquer papel operacional pode concluir tarefa delegável, exceto CAREGIVER", () => {
    (["ADMIN", "NURSE", "NURSING_TECH", "PHYSICIAN", "PHYSIO"] as const).forEach((role) => {
      expect(hasPermission(role, "carePlan.completeTask")).toBe(true);
    });
    expect(hasPermission("CAREGIVER", "carePlan.completeTask")).toBe(false);
  });

  it("apenas ADMIN gerencia usuários e indicadores customizados", () => {
    expect(hasPermission("ADMIN", "admin.manageUsersAndIndicators")).toBe(true);
    (["NURSE", "NURSING_TECH", "PHYSICIAN", "PHYSIO", "CAREGIVER"] as const).forEach((role) => {
      expect(hasPermission(role, "admin.manageUsersAndIndicators")).toBe(false);
    });
  });

  it("apenas NURSE e PHYSICIAN podem finalizar/assinar nota de evolução", () => {
    expect(hasPermission("NURSE", "note.finalize")).toBe(true);
    expect(hasPermission("PHYSICIAN", "note.finalize")).toBe(true);
    expect(hasPermission("PHYSIO", "note.finalize")).toBe(true);
    expect(hasPermission("NURSING_TECH", "note.finalize")).toBe(false);
    expect(hasPermission("ADMIN", "note.finalize")).toBe(false);
  });
});
