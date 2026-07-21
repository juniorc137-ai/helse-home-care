# ARCHITECTURE.md — Sistema Home Care (Helse Solutions)

Fase 1 — Fundação. Ver `docs/DECISIONS.md` para ADRs e
`docs/CLINICAL_SPECS.md` para as escalas clínicas (fonte única de verdade em
`src/constants/clinicalScales.ts`).

## Visão geral

Aplicativo clínico offline-first, codebase unificado (web/iOS/Android) via
React Native + Expo Router. MVP com dados mock (20 pacientes), sem backend
real — a camada de sincronização é implementada contra o Sync Contract
(seção 4.5 do prompt / `src/services/syncContract.ts`) para permitir
desenvolvimento paralelo de um backend futuro.

## Stack

```
Framework:          React Native (Expo SDK estável)
Linguagem:          TypeScript (strict: true)
Navegação:          Expo Router (file-based routing)
Estilização:        NativeWind (Tailwind)
Estado global:      Zustand + persist + Immer
Persistência local: expo-sqlite (schema versionado, migrations)
Chaves/segredos:    expo-secure-store
Sincronização:      syncEngine.ts (fila de mutações própria)
Componentes UI:     React Native Paper (Material 3)
Validação:          Zod + React Hook Form
Testes:             Jest + React Native Testing Library
```

## Estrutura de pastas

```
app/                          Expo Router (file-based routing)
  (tabs)/                     Dashboard e navegação principal
  patient/[id]/                Perfil do paciente, Care Plan, indicadores, notas
src/
  components/                 Componentes reutilizáveis (Card, Button, TextField, Toast...)
  constants/
    clinicalScales.ts          Fonte única de verdade: Braden, TEC, Morse, aspiração, dispositivos
    permissions.ts              Matriz RBAC
    theme.ts                     Paleta WCAG AA
  hooks/
    useResponsive.ts             Breakpoints desktop/mobile
  services/
    db/                          Schema SQLite + migrations
    syncContract.ts              Tipos do contrato de sincronização
    syncEngine.ts                Fila de mutações + resolução de conflitos
    permissionGuard.ts            Middleware de checagem de RBAC + auditoria
    auditLog.ts                   Registro append-only
    crypto.ts                     AES-256-GCM + PBKDF2 (chave via expo-secure-store)
  store/                        Stores Zustand (patients, carePlan, indicators, notes, session)
  types/
    entities.ts                   Tipos de domínio
    zodSchemas.ts                  Validação Zod por entidade (usada no Sync Contract)
  utils/
    mockData.ts                    20 pacientes mock
__tests__/
  unit/                          Lógica clínica pura (Braden, TEC, Morse, permissões)
  integration/                  Stores + SQLite
  fixtures/                      Fixtures clínicas de referência
docs/
  ARCHITECTURE.md, DECISIONS.md, CLINICAL_SPECS.md, SECURITY_COMPLIANCE.md
```

## Modelo de dados (schema SQL normalizado)

```sql
CREATE TABLE patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cpf_encrypted TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  sex TEXT NOT NULL,
  main_diagnosis_encrypted TEXT NOT NULL,
  cid10 TEXT,
  comorbidities_encrypted TEXT,      -- JSON criptografado
  allergies_encrypted TEXT,          -- JSON criptografado
  active_medications_encrypted TEXT, -- JSON criptografado
  primary_contact_encrypted TEXT NOT NULL,
  secondary_contact_encrypted TEXT,
  caregiver_encrypted TEXT NOT NULL,
  consent_given INTEGER NOT NULL DEFAULT 0,
  consent_timestamp TEXT,
  consent_version TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE care_plan_tasks (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('medicacao','curativo','mobilizacao','monitoramento','outro')),
  horario_agendado TEXT NOT NULL,
  profissional_responsavel TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pendente','concluida','adiada')),
  timestamp_conclusao TEXT,
  notas_do_profissional TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);
CREATE INDEX idx_care_plan_tasks_patient ON care_plan_tasks(patient_id);

CREATE TABLE indicator_assessments (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  assessed_by TEXT NOT NULL,
  assessed_at TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('braden','tec','morse','aspiracao','dispositivos','custom')),
  payload_json TEXT NOT NULL, -- payload tipado por type, validado via Zod antes de persistir
  created_at TEXT NOT NULL
);
CREATE INDEX idx_indicator_assessments_patient ON indicator_assessments(patient_id, type, assessed_at);

CREATE TABLE clinical_notes (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  data_hora TEXT NOT NULL,
  profissional_id TEXT NOT NULL,
  conteudo_texto_encrypted TEXT NOT NULL,
  sinais_vitais_json TEXT,
  foto_anexada_encrypted TEXT,
  status TEXT NOT NULL CHECK (status IN ('rascunho','finalizada')),
  addendum_to_note_id TEXT REFERENCES clinical_notes(id),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_clinical_notes_patient ON clinical_notes(patient_id, data_hora);

CREATE TABLE audit_log (
  event_id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  before_json TEXT,
  after_json TEXT,
  ip_address TEXT,
  user_agent TEXT
);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);

CREATE TABLE schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);
```

Campos marcados `_encrypted` armazenam o resultado de AES-256-GCM (ver
`src/services/crypto.ts` e `docs/SECURITY_COMPLIANCE.md`); a tabela de
auditoria nunca é alvo de UPDATE/DELETE pela camada de aplicação.

## Fluxo de sincronização

1. Toda mutação local (criar/editar/concluir/remover) grava primeiro em
   SQLite e, na mesma transação lógica, enfileira um `SyncRecord`
   (`src/services/syncContract.ts`) com hash SHA-256 do payload.
2. `syncEngine.ts` observa conectividade via `NetInfo`; ao reconectar
   (debounce) ou a cada 30s de polling de fallback, envia `SyncPayload` em
   lote para `POST /sync/batch` (mock no MVP).
3. Resposta (`SyncResponse`) aplica: `accepted` remove da fila local;
   `conflicts` com resolução `server_wins` sobrescreve local, `manual_review`
   fica pendente de revisão humana; `newRecords` são aplicados localmente;
   `nextCursor` é persistido para a próxima sincronização incremental.
4. Nenhum fluxo do usuário é bloqueado por sincronização — apenas um banner
   de status é atualizado (degradação graciosa, seção 4.4).

## RBAC

Middleware `permissionGuard.ts` valida `hasPermission(role, permission)`
antes de qualquer mutação sensível; falhas geram evento de auditoria
`access.denied`. Matriz completa em `src/constants/permissions.ts`.

## Critérios de aprovação da Fase 1

- [x] ARCHITECTURE.md (este documento)
- [ ] Setup Expo + Expo Router funcionando
- [ ] tsconfig strict sem erros
- [ ] Estrutura de pastas conforme acima
- [ ] Mock de 20 pacientes
- [ ] DECISIONS.md inicial (ADR-001 a ADR-004)
