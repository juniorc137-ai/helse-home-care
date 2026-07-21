import { calculateConsistencyStreak, calculateTeamPoints, calculateTier, TIER_THRESHOLDS } from "../../src/utils/teamAchievements";
import type { CarePlanTask } from "../../src/types/entities";

function makeTask(dateIso: string, status: CarePlanTask["status"] = "concluida"): CarePlanTask {
  return {
    id: `t-${dateIso}-${Math.random()}`,
    patientId: "p1",
    descricao: "Tarefa",
    tipo: "medicacao",
    horarioAgendado: dateIso,
    profissionalResponsavel: "u1",
    status,
    timestampConclusao: status === "concluida" ? dateIso : null,
    notasDoProfissional: null,
    priorityOrder: 0,
    createdAt: dateIso,
    updatedAt: dateIso,
    deletedAt: null,
  };
}

describe("calculateTeamPoints (equipe, não paciente)", () => {
  it("soma pontos de tarefas e avaliações conforme a fixture (+10 / +5)", () => {
    expect(calculateTeamPoints(3, 2)).toBe(3 * 10 + 2 * 5);
  });

  it("retorna 0 sem nenhuma atividade", () => {
    expect(calculateTeamPoints(0, 0)).toBe(0);
  });
});

describe("calculateTier", () => {
  it("sem tier abaixo do limiar de bronze", () => {
    expect(calculateTier(TIER_THRESHOLDS.bronze - 1)).toBeNull();
  });

  it("bronze, prata e ouro nos limiares exatos", () => {
    expect(calculateTier(TIER_THRESHOLDS.bronze)).toBe("bronze");
    expect(calculateTier(TIER_THRESHOLDS.prata)).toBe("prata");
    expect(calculateTier(TIER_THRESHOLDS.ouro)).toBe("ouro");
  });
});

describe("calculateConsistencyStreak (consistência da equipe)", () => {
  const REFERENCE = new Date("2026-07-21T18:00:00.000Z"); // terça-feira

  it("retorna 0 sem nenhuma tarefa", () => {
    expect(calculateConsistencyStreak([], REFERENCE)).toBe(0);
  });

  it("conta dias consecutivos totalmente concluídos", () => {
    const tasks = [
      makeTask("2026-07-19T08:00:00.000Z", "concluida"),
      makeTask("2026-07-20T08:00:00.000Z", "concluida"),
      makeTask("2026-07-21T08:00:00.000Z", "concluida"),
    ];
    expect(calculateConsistencyStreak(tasks, REFERENCE)).toBe(3);
  });

  it("interrompe a sequência em um dia passado com tarefa pendente", () => {
    const tasks = [
      makeTask("2026-07-19T08:00:00.000Z", "pendente"),
      makeTask("2026-07-20T08:00:00.000Z", "concluida"),
      makeTask("2026-07-21T08:00:00.000Z", "concluida"),
    ];
    expect(calculateConsistencyStreak(tasks, REFERENCE)).toBe(2);
  });

  it("não quebra a sequência por causa de pendências do dia de hoje (dia ainda não terminou)", () => {
    const tasks = [
      makeTask("2026-07-20T08:00:00.000Z", "concluida"),
      makeTask("2026-07-21T08:00:00.000Z", "pendente"),
    ];
    expect(calculateConsistencyStreak(tasks, REFERENCE)).toBe(1);
  });

  it("dias sem nenhuma tarefa agendada não quebram a sequência", () => {
    const tasks = [makeTask("2026-07-18T08:00:00.000Z", "concluida"), makeTask("2026-07-21T08:00:00.000Z", "concluida")];
    // 19 e 20 não têm tarefas -> não contam, mas também não quebram
    expect(calculateConsistencyStreak(tasks, REFERENCE)).toBe(2);
  });
});
