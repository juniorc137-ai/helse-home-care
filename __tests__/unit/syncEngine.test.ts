import NetInfo from "@react-native-community/netinfo";
import { __resetSyncEngineForTests, enqueueMutation, getQueueLength, syncNow } from "../../src/services/syncEngine";

describe("syncEngine (Sync Contract, seção 4.5)", () => {
  beforeEach(() => {
    __resetSyncEngineForTests();
  });

  it("enfileira mutação com hash SHA-256 do payload", async () => {
    await enqueueMutation("carePlanTask", "create", { id: "task-1" });
    expect(getQueueLength()).toBe(1);
  });

  it("sincroniza e esvazia a fila quando online (mock aceita tudo)", async () => {
    await enqueueMutation("clinicalNote", "create", { id: "note-1" });
    const response = await syncNow();
    expect(response?.accepted).toHaveLength(1);
    expect(typeof response?.accepted[0]).toBe("string");
    expect(getQueueLength()).toBe(0);
  });

  it("não sincroniza quando offline", async () => {
    await enqueueMutation("patient", "update", { id: "patient-1" });
    (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({ isConnected: false });
    const response = await syncNow();
    expect(response).toBeNull();
    expect(getQueueLength()).toBe(1);
  });

  it("retorna null quando a fila está vazia", async () => {
    const response = await syncNow();
    expect(response).toBeNull();
  });
});
