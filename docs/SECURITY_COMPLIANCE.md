# SECURITY_COMPLIANCE.md

## Criptografia em repouso

- Dados sensíveis (CPF, diagnósticos, medicações, contatos, notas, fotos):
  AES-256-GCM (NIST SP 800-38D).
- Derivação de chave: PBKDF2 com no mínimo 100.000 iterações (ou Argon2id
  quando disponível na plataforma).
- Chave mestra armazenada em `expo-secure-store` (iOS Keychain / Android
  Keystore) — nunca em AsyncStorage ou SharedPreferences.
- **Decisão registrada:** campos não sensíveis de exibição (nome, idade)
  permanecem em claro no SQLite para performance de listagem no dashboard.
  Justificativa: nome e idade isoladamente não constituem, no contexto deste
  MVP, dado que exija criptografia de campo para viabilizar navegação
  responsiva com centenas de registros; CPF, diagnóstico, medicações,
  contatos e conteúdo de notas são sempre criptografados.

## Trilha de auditoria imutável

- Schema: `eventId, timestamp (UTC), userId, action, entityType, entityId,
  before, after, ipAddress, userAgent`.
- Eventos append-only; nenhuma operação de UPDATE ou DELETE é exposta sobre a
  tabela de auditoria pela camada de aplicação. Correções geram novos
  eventos.
- **Retenção mínima: 20 anos** para registros assistenciais de prontuário,
  alinhada à lógica da Lei 13.787/2018 e da Resolução CFM 1.821/2007. A
  retenção de 2 anos aplica-se exclusivamente a logs técnicos não
  assistenciais (ex.: logs de performance de rede), nunca a eventos que
  referenciem entidades clínicas (paciente, tarefa, indicador, nota).
- Ações auditadas (lista fechada no MVP): criação/edição/conclusão/remoção
  de tarefa; avaliação de qualquer indicador; criação/finalização/adendo de
  nota; edição de perfil; tentativa de acesso negado; login/logout.

## RBAC

Ver `src/constants/permissions.ts` para a matriz completa e
`docs/CLINICAL_SPECS.md` / seção 4.3.3 do prompt para o fundamento clínico
(Resolução COFEN 736/2024 — Processo de Enfermagem).

## LGPD

- Modal de aceite de Política de Privacidade na primeira execução do
  profissional (evento de auditoria `auth.login` associado ao aceite).
- Consentimento do paciente: `consentGiven`, `consentTimestamp`,
  `consentVersion` no perfil (seção 2.2).
- **Direito de eliminação:** implementado como soft delete
  (`deletedAt` timestamp) com fluxo de revisão pelo ADMIN antes de qualquer
  purga física. Base legal para retenção apesar de pedido de eliminação:
  obrigação legal e tutela da saúde (LGPD, arts. 7º e 11), dado o dever de
  guarda de prontuário estabelecido pela Lei 13.787/2018 e pela Resolução
  CFM 1.821/2007. Nenhuma purga física de dado assistencial ocorre antes do
  fim do prazo de guarda legal, independentemente de solicitação do titular.

## Referências normativas (íntegra na seção 9 do prompt / CLINICAL_SPECS.md)

Lei 13.709/2018; Lei 13.787/2018; RDC ANVISA 502/2021; Resolução CFM
1.821/2007; Resoluções COFEN 429/2012 e 736/2024; Portaria GM/MS 825/2016;
ABNT NBR ISO/IEC 27001:2022; NIST SP 800-38D; IEC 62366-1.
