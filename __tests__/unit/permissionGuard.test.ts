import { useAuditStore } from "../../src/store/auditStore";
import { assertPermission, PermissionDeniedError } from "../../src/services/permissionGuard";

describe("permissionGuard (middleware RBAC, ADR-004)", () => {
  beforeEach(() => {
    useAuditStore.setState({ events: [] });
  });

  it("permite operação quando o papel tem a permissão", () => {
    expect(() =>
      assertPermission("user-nurse-01", "NURSE", "indicator.assessBradenMorseTec", {
        entityType: "indicatorAssessment",
        entityId: "assessment-1",
      }),
    ).not.toThrow();
  });

  it("nega operação e registra evento de auditoria access.denied", () => {
    expect(() =>
      assertPermission("user-tech-01", "NURSING_TECH", "indicator.assessBradenMorseTec", {
        entityType: "indicatorAssessment",
        entityId: "assessment-2",
      }),
    ).toThrow(PermissionDeniedError);

    const events = useAuditStore.getState().events;
    expect(events).toHaveLength(1);
    expect(events[0].action).toBe("access.denied");
    expect(events[0].userId).toBe("user-tech-01");
  });
});
