# DECISIONS.md — Registro de Decisões de Arquitetura (ADRs)

## ADR-001: Estado global com Zustand + persist + Immer

**Contexto:** necessidade de estado global leve, com persistência entre
sessões para dados transientes (filtros, abas ativas, sessão do usuário) e
integração simples com React Native.

**Decisão:** Zustand como store global, middleware `persist` para
sobrevivência entre sessões e `immer` para atualizações imutáveis ergonômicas.
Dados clínicos críticos (pacientes, tarefas, indicadores, notas) residem em
SQLite (fonte de verdade), não no Zustand persist — o store mantém apenas
cache de leitura e estado de UI.

**Status:** Aceita.

## ADR-002: Persistência local — expo-sqlite puro (revisado)

**Contexto:** a v2 do prompt prescrevia "expo-sqlite com WatermelonDB",
combinação tecnicamente inconsistente: WatermelonDB usa adaptadores próprios
via JSI e exige development build, adicionando complexidade sem benefício
para um MVP com dados mock e dezenas de pacientes.

**Decisão:** `expo-sqlite` puro, com schema versionado e migrations manuais
(ver `src/services/db/migrations`). `Workbox` foi removido por ser exclusivo
de service worker web, não aplicável ao runtime nativo.

**Alternativa futura:** migração para WatermelonDB ou solução sync-native
fica registrada como opção caso o volume de dados ou a complexidade de
sincronização cresçam além do que expo-sqlite + fila de mutações própria
suportam confortavelmente.

**Status:** Aceita.

## ADR-003: Resolução de conflitos de sincronização — last-write-wins com metadata

**Contexto:** app offline-first; múltiplos dispositivos podem editar o mesmo
registro entre sincronizações.

**Decisão:** last-write-wins baseado em timestamp + deviceId + hash SHA-256
do payload, com registro de conflitos para revisão humana quando os hashes
divergem e os timestamps são ambíguos. CRDTs ficam fora do MVP por
complexidade desproporcional ao volume esperado.

**Status:** Aceita.

## ADR-004: RBAC validado por middleware central, não por checagem ad-hoc em tela

**Contexto:** atos privativos de enfermagem (avaliação de risco, prescrição
de plano de cuidados) exigem controle de acesso rigoroso e auditável.

**Decisão:** toda operação sensível passa por `hasPermission()` /
`isScopedPermission()` (`src/constants/permissions.ts`) antes de executar;
tentativas negadas geram evento de auditoria `access.denied`.

**Status:** Aceita.

## ADR-005: Formulário "Novo Paciente" — captura parcial na criação

**Contexto:** o prompt original assumia pacientes pré-existentes (mock de 20
pacientes); a Fase 2 introduziu um fluxo interativo de criação de paciente
(seção 2.1, botão "+ Novo") com um formulário contendo apenas os campos
solicitados: nome, CPF, data de nascimento, sexo, diagnóstico principal,
comorbidades, alergias e medicações ativas. O tipo `Patient` também exige
contato de emergência, cuidador responsável e consentimento LGPD (seção 2.2).

**Decisão:** o registro é criado com esses campos obrigatórios em branco
(strings vazias, `consentGiven: false`) e permanece editável posteriormente
via "Editar perfil" (ADMIN, seção 4.3.3). Nenhuma tarefa de Care Plan pode
ser concluída nem nota finalizada de forma que dependa desses campos vazios
no MVP atual. A ausência de consentimento registrado deve ser tratada como
pendência visível no perfil (não implementado nesta rodada — ver Fase 5).

**Ação de auditoria adicionada:** `patient.create` foi incluído no conjunto
fechado de `AuditAction` (seção 4.3.2), pois a lista original não previa
criação interativa de paciente pela UI.

**Status:** Aceita; revisar quando o fluxo de edição completa de perfil for
implementado.

## ADR-006: Gamificação redirecionada à equipe, nunca ao paciente

**Contexto:** o pedido de redesign v2 solicitava pontos/badges por
paciente, leaderboard mensal de "pacientes mais atendidos" e streaks de
atendimento. Ranquear pacientes de atenção domiciliar (muitos em cuidados
paliativos, sequelas neurológicas, idade avançada) como um leaderboard de
app de consumo cria incentivo perverso (correr atendimentos por pontos,
visitas desnecessárias para manter uma sequência) e é incompatível com o
princípio fundador do projeto (seção 1: "ferramenta clínica de alta
precisão, não CRUD genérico"; IEC 62366-1 trata de segurança de uso, não
engajamento).

**Decisão (aprovada pelo usuário):** gamificação mede a **consistência da
equipe assistencial** (enfermeiro/cuidador), não o paciente:
- Pontos (+10 tarefa concluída, +5 avaliação clínica) acumulam no
  profissional, não no paciente (`src/utils/teamAchievements.ts`).
- "Streak" = dias consecutivos em que a equipe concluiu todas as tarefas
  agendadas (consistência documental), não frequência de visita a um
  paciente específico.
- Nenhum leaderboard de pacientes. Nenhuma pontuação ou ranking de
  paciente.
- No perfil do paciente, "badges desbloqueadas" viraram indicadores
  binários de completude documental (`src/utils/patientProgress.ts`:
  "Plano de cuidados em dia", "Avaliações completas") — refletem qualidade
  do cuidado registrado, não competição entre pacientes.

**Status:** Aceita.

## ADR-007: Kanban do Care Plan — arrastar reordena, nunca conclui

**Contexto:** o pedido original permitia marcar tarefa como concluída ao
arrastar o card para a coluna "Completo". Isso contorna o timestamp
automático, o bloqueio de edição de 4h e a trilha de auditoria exigidos na
seção 2.3/4.3.2, além de ser fácil de disparar sem querer (luvas, seção
4.1) — um registro de conclusão falso é um risco de segurança do paciente,
não um detalhe de UX.

**Decisão (aprovada pelo usuário):** as colunas Pendente/Hoje/Completo são
um agrupamento visual por status real da tarefa. Arrastar um card **só
reordena a prioridade dentro da coluna** (`priorityOrder`,
`reorderTasks()` em `carePlanStore.ts`); mover para "Completo" continua
exigindo o gesto explícito de swipe-to-confirm, que já gera timestamp e
evento de auditoria.

**Status:** Aceita.

## Pendências documentadas (aguardando decisão do usuário)

Nenhuma pendência aberta no momento. Qualquer ambiguidade de interpretação
clínica identificada durante a implementação será registrada aqui antes de
prosseguir.
