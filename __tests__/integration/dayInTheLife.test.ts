import {
  calculateBradenScore,
  classifyBradenScore,
  classifyTec,
  requiresTecCoordinatorAlert,
} from "../../src/constants/clinicalScales";
import { useAuditStore } from "../../src/store/auditStore";
import { useCarePlanStore } from "../../src/store/carePlanStore";
import { useIndicatorStore } from "../../src/store/indicatorStore";
import { useNotesStore } from "../../src/store/notesStore";
import { usePatientStore } from "../../src/store/patientStore";
import { __resetSyncEngineForTests, enqueueMutation, getQueueLength, syncNow } from "../../src/services/syncEngine";
import { MOCK_PATIENT_ID } from "../../src/data/mockPatients";
import { BRADEN_FIXTURE_HIGH_RISK } from "../fixtures/clinicalFixtures";

/**
 * Cenário de referência "Day in the Life" (seção 5 do PROMPT DE EXECUÇÃO
 * v3.0): suíte E2E mockada exigida na Fase 6. Exercita a jornada completa
 * de uma enfermeira offline, ao nível de stores/serviços (sem renderização
 * de UI), validando que os requisitos clínicos e de auditoria do fluxo se
 * comportam de ponta a ponta.
 */
describe("Cenário E2E: Day in the Life (seção 5)", () => {
  const NURSE_ID = "user-nurse-01";
  const PATIENT_ID = MOCK_PATIENT_ID;

  beforeEach(() => {
    usePatientStore.setState({ patients: [], hydrated: false });
    useCarePlanStore.setState({ tasksByPatient: {} });
    useIndicatorStore.setState({ assessmentsByPatient: {}, pendingCoordinatorAlerts: [] });
    useNotesStore.setState({ notesByPatient: {} });
    useAuditStore.setState({ events: [] });
    __resetSyncEngineForTests();
  });

  it("executa a jornada completa: dashboard → Braden → TEC → tarefa → nota → sincronização", async () => {
    // 1. Enfermeira abre o app (offline) e vê o dashboard com os pacientes.
    usePatientStore.getState().hydrateMock();
    const patient = usePatientStore.getState().getById(PATIENT_ID);
    expect(patient).toBeDefined();

    useCarePlanStore.getState().addTask(NURSE_ID, PATIENT_ID, {
      descricao: "Administrar medicação X às 14h",
      tipo: "medicacao",
      horarioAgendado: "2026-07-21T14:00:00.000Z",
      profissionalResponsavel: NURSE_ID,
    });

    // 2. Avalia risco de LPP com a Escala de Braden (fixture obrigatória: escore 10, "Risco alto").
    const bradenAssessment = useIndicatorStore.getState().addAssessment(NURSE_ID, PATIENT_ID, {
      type: "braden",
      scores: BRADEN_FIXTURE_HIGH_RISK,
    });
    const bradenScore = calculateBradenScore(BRADEN_FIXTURE_HIGH_RISK);
    expect(bradenScore).toBe(10);
    expect(classifyBradenScore(bradenScore)).toBe("Risco alto");
    await enqueueMutation("indicatorAssessment", "create", bradenAssessment);

    // 3. Mede TEC com o timer visual: 3,5s → "Alterado"; alerta pendente ao coordenador.
    const tecAssessment = useIndicatorStore.getState().addAssessment(NURSE_ID, PATIENT_ID, {
      type: "tec",
      seconds: 3.5,
      hasContextualFactor: false,
    });
    expect(classifyTec(3.5).label).toBe("Alterado");
    expect(requiresTecCoordinatorAlert(3.5, false)).toBe(true);
    expect(useIndicatorStore.getState().pendingCoordinatorAlerts).toContain(tecAssessment.id);
    await enqueueMutation("indicatorAssessment", "create", tecAssessment);

    // 4. Conclui a tarefa "Administrar medicação X às 14h" por swipe; timestamp + auditoria.
    const task = useCarePlanStore.getState().tasksByPatient[PATIENT_ID][0];
    useCarePlanStore.getState().completeTask(NURSE_ID, PATIENT_ID, task.id);
    const completedTask = useCarePlanStore.getState().tasksByPatient[PATIENT_ID][0];
    expect(completedTask.status).toBe("concluida");
    expect(completedTask.timestampConclusao).not.toBeNull();
    await enqueueMutation("carePlanTask", "update", completedTask);

    // 5. Redige nota de evolução SOAP com sinais vitais e finaliza; torna-se imutável.
    const note = useNotesStore.getState().createDraft(NURSE_ID, PATIENT_ID, {
      conteudoTexto:
        "S: paciente refere leve desconforto lombar. O: TEC 3,5s, Braden 10. A: risco alto de LPP e perfusão alterada. P: reposicionamento a cada 2h, reavaliação em 24h.",
      sinaisVitais: { heartRate: 88, spo2: 95, temperature: 36.2 },
    });
    useNotesStore.getState().finalizeNote(NURSE_ID, PATIENT_ID, note.id);
    const finalizedNote = useNotesStore.getState().notesByPatient[PATIENT_ID][0];
    expect(finalizedNote.status).toBe("finalizada");
    await enqueueMutation("clinicalNote", "create", finalizedNote);

    // 6. Dispositivo recupera sinal; a fila sincroniza em background (banner de sucesso).
    expect(getQueueLength()).toBeGreaterThan(0);
    const syncResponse = await syncNow();
    expect(syncResponse).not.toBeNull();
    expect(getQueueLength()).toBe(0);

    // Trilha de auditoria: todas as ações do fluxo foram registradas (append-only).
    const auditActions = useAuditStore.getState().events.map((e) => e.action);
    expect(auditActions).toEqual(
      expect.arrayContaining(["task.create", "indicator.assess", "task.complete", "note.create", "note.finalize"]),
    );
  });
});
