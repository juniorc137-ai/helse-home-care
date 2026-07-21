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

## Pendências documentadas (aguardando decisão do usuário)

Nenhuma pendência aberta no momento. Qualquer ambiguidade de interpretação
clínica identificada durante a implementação será registrada aqui antes de
prosseguir.
