import type { CarePlanTask, Patient } from "../types/entities";

const FIRST_NAMES = [
  "Maria", "João", "Ana", "Pedro", "Francisca", "Carlos", "Antônia", "Paulo",
  "Adriana", "Marcos", "Juliana", "Lucas", "Fernanda", "Rafael", "Camila",
  "Bruno", "Patrícia", "Gustavo", "Beatriz", "Eduardo",
];
const LAST_NAMES = [
  "Silva", "Souza", "Oliveira", "Santos", "Pereira", "Costa", "Rodrigues",
  "Almeida", "Nascimento", "Lima", "Araújo", "Fernandes", "Carvalho", "Gomes",
  "Martins", "Rocha", "Ribeiro", "Alves", "Monteiro", "Cardoso",
];

const DIAGNOSES = [
  "Acidente Vascular Cerebral (sequela motora)",
  "Insuficiência Cardíaca Congestiva",
  "Doença Pulmonar Obstrutiva Crônica",
  "Diabetes Mellitus tipo 2 descompensado",
  "Fratura de fêmur em pós-operatório",
  "Doença de Alzheimer em estágio moderado",
  "Úlcera por pressão estágio III",
  "Doença Renal Crônica em diálise peritoneal",
  "Câncer de mama em cuidados paliativos",
  "Parkinson em estágio avançado",
];

function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648;
    return value / 2147483648;
  };
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function isoDate(daysAgoFromToday: number, base: Date): string {
  const d = new Date(base);
  d.setDate(d.getDate() - daysAgoFromToday);
  return d.toISOString();
}

/** Gera 20 pacientes mock determinísticos para desenvolvimento e demonstração. */
export function generateMockPatients(referenceDate: Date = new Date("2026-07-21T12:00:00Z")): Patient[] {
  const rand = seededRandom(42);
  const patients: Patient[] = [];

  for (let i = 0; i < 20; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const name = `${first} ${last}`;
    const birthYear = 1935 + Math.floor(rand() * 55); // 71–91 anos em 2026, faixa típica de home care
    const birthMonth = 1 + Math.floor(rand() * 12);
    const birthDay = 1 + Math.floor(rand() * 28);
    const cpf = `${String(10000000000 + Math.floor(rand() * 89999999999)).slice(0, 11)}`;

    const id = `patient-${pad(i + 1)}`;
    const createdAt = isoDate(180 + i, referenceDate);

    patients.push({
      id,
      name,
      cpf,
      birthDate: `${birthYear}-${pad(birthMonth)}-${pad(birthDay)}`,
      sex: i % 2 === 0 ? "feminino" : "masculino",
      mainDiagnosis: DIAGNOSES[i % DIAGNOSES.length],
      cid10: undefined,
      comorbidities: i % 3 === 0 ? ["Hipertensão Arterial Sistêmica"] : [],
      allergies: i % 5 === 0 ? ["Dipirona"] : [],
      activeMedications: ["Losartana 50mg 1x/dia", "AAS 100mg 1x/dia"],
      primaryEmergencyContact: {
        name: `${LAST_NAMES[(i + 1) % LAST_NAMES.length]} (filho(a))`,
        relationship: "Filho(a)",
        phone: `(11) 9${8000 + i}-${1000 + i}`,
      },
      responsibleCaregiver: {
        name: `Cuidador(a) de ${first}`,
        relationship: "Cuidador(a) contratado(a)",
        availability: "Diurno, segunda a sábado",
      },
      consent: {
        consentGiven: true,
        consentTimestamp: createdAt,
        consentVersion: "1.0.0",
      },
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    });
  }

  return patients;
}

/** Gera tarefas de Care Plan mock para um paciente, ancoradas na data de referência. */
export function generateMockCarePlanTasks(patientId: string, referenceDate: Date = new Date("2026-07-21T12:00:00Z")): CarePlanTask[] {
  const base = new Date(referenceDate);
  const tasks: Array<Pick<CarePlanTask, "descricao" | "tipo" | "status">> = [
    { descricao: "Administrar medicação anti-hipertensiva", tipo: "medicacao", status: "pendente" },
    { descricao: "Trocar curativo de lesão por pressão", tipo: "curativo", status: "pendente" },
    { descricao: "Auxiliar mobilização no leito", tipo: "mobilizacao", status: "concluida" },
    { descricao: "Monitorar sinais vitais", tipo: "monitoramento", status: "pendente" },
  ];

  return tasks.map((t, idx) => {
    const scheduled = new Date(base);
    scheduled.setHours(8 + idx * 3, 0, 0, 0);
    const nowIso = base.toISOString();
    return {
      id: `${patientId}-task-${idx + 1}`,
      patientId,
      descricao: t.descricao,
      tipo: t.tipo,
      horarioAgendado: scheduled.toISOString(),
      profissionalResponsavel: "user-nurse-01",
      status: t.status,
      timestampConclusao: t.status === "concluida" ? nowIso : null,
      notasDoProfissional: null,
      priorityOrder: idx,
      createdAt: nowIso,
      updatedAt: nowIso,
      deletedAt: null,
    };
  });
}
