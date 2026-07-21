# Helse Home Care

Aplicativo clínico offline-first para operações de atenção domiciliar da
Helse Solutions — Saúde & Biotecnologia. React Native + Expo (codebase
unificado web/iOS/Android), TypeScript strict.

Ver `docs/ARCHITECTURE.md` para a arquitetura completa, `docs/DECISIONS.md`
para os ADRs, `docs/CLINICAL_SPECS.md` para as escalas clínicas (fonte única
de verdade em `src/constants/clinicalScales.ts`) e
`docs/SECURITY_COMPLIANCE.md` para criptografia, auditoria, RBAC e LGPD.

## Stack

Expo Router, Zustand + Immer, expo-sqlite, expo-secure-store, NativeWind,
React Native Paper, Zod + React Hook Form, Jest + React Native Testing
Library.

## Rodando o projeto

```bash
npm install
npm start        # expo start
npm test         # suíte Jest
npm run test:coverage
```

## Testes

Suíte com fixtures clínicas de referência obrigatórias (Escala de Braden,
Tempo de Enchimento Capilar, Escala de Morse) e cenário E2E mockado "Day in
the Life" (`__tests__/integration/dayInTheLife.test.ts`).
