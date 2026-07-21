# Especificações Clínicas — Fonte Única de Verdade

Este documento espelha exatamente as escalas e pontos de corte definidos no
PROMPT DE EXECUÇÃO v3.0 (seções 2.4 e 9). Nenhum valor aqui pode ser alterado
sem aprovação humana explícita (regra de integridade referencial, seção 7).
A implementação executável vive em `src/constants/clinicalScales.ts`; este
documento é a referência de leitura humana e não deve divergir dele.

## 1. Escala de Braden (risco de lesão por pressão)

Seis subescalas, escore total = soma, intervalo 6–23 (menor escore = maior risco).

| Subescala | Níveis (pontos) |
|---|---|
| Percepção sensorial | 1 Totalmente limitada; 2 Muito limitada; 3 Levemente limitada; 4 Nenhuma limitação |
| Umidade | 1 Constantemente úmida; 2 Muito úmida; 3 Ocasionalmente úmida; 4 Raramente úmida |
| Atividade | 1 Acamado; 2 Confinado à cadeira; 3 Anda ocasionalmente; 4 Anda frequentemente |
| Mobilidade | 1 Totalmente imóvel; 2 Bastante limitada; 3 Levemente limitada; 4 Sem limitações |
| Nutrição | 1 Muito pobre; 2 Provavelmente inadequada; 3 Adequada; 4 Excelente |
| Fricção e cisalhamento | 1 Problema; 2 Problema potencial; 3 Nenhum problema aparente |

Classificação (validação brasileira, Paranhos e Santos, 1999):

| Escore total | Classificação |
|---|---|
| 19–23 | Sem risco |
| 15–18 | Risco baixo |
| 13–14 | Risco moderado |
| 10–12 | Risco alto |
| 6–9 | Risco muito alto |

**Fixture de referência (obrigatória):** Percepção=3, Umidade=2, Atividade=1,
Mobilidade=1, Nutrição=2, Fricção=1 → escore 10 → "Risco alto".

Reavaliação recomendada: a cada 7 dias em contexto domiciliar estável, ou a
cada mudança significativa do estado clínico.

## 2. Tempo de Enchimento Capilar (TEC)

Entrada em segundos, precisão 0,5s, faixa 0–10s.

| TEC | Classificação | Cor |
|---|---|---|
| ≤ 2s | Normal | Verde |
| > 2 e ≤ 3s | Limítrofe (atenção) | Amarelo |
| > 3s | Alterado (sugestivo de má perfusão) | Vermelho |

Normalidade usual ≤ 2s em adultos, sujeito a variação por idade, sexo e
temperatura ambiente. Usar como triagem, não como diagnóstico isolado de má
perfusão. TEC > 3s sem fator contextual registrado (hipotermia,
vasoconstritores) gera alerta automático ao coordenador.

**Fixture de referência (obrigatória):** TEC = 3,5s → "Alterado".

## 3. Escala de Morse (risco de queda, versão brasileira Urbanetto et al., 2013)

| Item | Pontuações possíveis |
|---|---|
| Histórico de quedas | 0 / 25 |
| Diagnóstico secundário | 0 / 15 |
| Auxílio na deambulação | 0 / 15 / 30 |
| Terapia endovenosa / dispositivo EV | 0 / 20 |
| Marcha | 0 / 10 / 20 |
| Estado mental | 0 / 15 |

Classificação:

| Escore | Classificação |
|---|---|
| 0–24 | Risco baixo |
| 25–44 | Risco moderado |
| ≥ 45 | Risco elevado |

**Fixture de referência (obrigatória):** soma = 50 → "Risco elevado".

## 4. Risco de Aspiração (MVP simplificado)

Classificação ternária (baixo | moderado | alto) atribuída pelo profissional,
com campo de justificativa clínica obrigatório e data de avaliação. Evolução
futura (COULD): instrumento validado de rastreio de disfagia — não
implementado no MVP.

## 5. Risco de Lesão por Dispositivos Médicos

Checklist binário de 5 itens: posicionamento de sonda; cateter;
tala/imobilizador; órtese; tubo/dreno. Qualquer item "inadequado" gera alerta
amarelo no card do paciente.

## 6. Extensibilidade (SHOULD)

`CustomIndicator`: nome, tipo de escala, faixas de corte, cores — cadastrado
pelo coordenador. Sem UI de administração no MVP; apenas estrutura de dados.

## Referências (seção 9 do prompt — íntegra)

- Braden, B.; Bergstrom, N. (1987); validação brasileira: Paranhos, W. Y.;
  Santos, V. L. C. G. (1999); EPUAP/NPIAP/PPPIA (2019).
- Morse, J. M. (1989); versão brasileira validada: Urbanetto, J. S. et al.,
  Rev. Esc. Enferm. USP (2013).
- TEC: parâmetro clínico de triagem, não diagnóstico isolado.
- Lei 13.709/2018 (LGPD); Lei 13.787/2018; RDC ANVISA 502/2021; Resolução
  CFM 1.821/2007; Resoluções COFEN 429/2012 e 736/2024; Portaria GM/MS
  825/2016; ABNT NBR ISO/IEC 27001:2022; NIST SP 800-38D; IEC 62366-1.

**Retificação:** "RES. ANVISA 380/2020" e "Resolução CFE 573/2004" (citadas
em versões anteriores) não correspondem a instrumentos normativos aplicáveis
e foram removidas.
