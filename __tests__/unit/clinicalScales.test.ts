import {
  BRADEN_SCORE_MAX,
  BRADEN_SCORE_MIN,
  calculateBradenScore,
  calculateMorseScore,
  classifyBradenScore,
  classifyMorseScore,
  classifyTec,
  getBradenSubscaleLevel,
  hasDeviceInjuryAlert,
  requiresTecCoordinatorAlert,
} from "../../src/constants/clinicalScales";
import {
  BRADEN_FIXTURE_HIGH_RISK,
  BRADEN_FIXTURE_HIGH_RISK_EXPECTED_LABEL,
  BRADEN_FIXTURE_HIGH_RISK_EXPECTED_SCORE,
  MORSE_FIXTURE_HIGH_RISK,
  MORSE_FIXTURE_HIGH_RISK_EXPECTED_LABEL,
  MORSE_FIXTURE_HIGH_RISK_EXPECTED_SCORE,
  TEC_FIXTURE_ALTERED_EXPECTED_LABEL,
  TEC_FIXTURE_ALTERED_SECONDS,
} from "../fixtures/clinicalFixtures";

describe("Escala de Braden", () => {
  it("fixture obrigatória: escore 10 classifica como Risco alto", () => {
    const score = calculateBradenScore(BRADEN_FIXTURE_HIGH_RISK);
    expect(score).toBe(BRADEN_FIXTURE_HIGH_RISK_EXPECTED_SCORE);
    expect(classifyBradenScore(score)).toBe(BRADEN_FIXTURE_HIGH_RISK_EXPECTED_LABEL);
  });

  it.each([
    [23, "Sem risco"],
    [19, "Sem risco"],
    [18, "Risco baixo"],
    [15, "Risco baixo"],
    [14, "Risco moderado"],
    [13, "Risco moderado"],
    [12, "Risco alto"],
    [10, "Risco alto"],
    [9, "Risco muito alto"],
    [6, "Risco muito alto"],
  ])("classifica escore %i como %s", (score, expected) => {
    expect(classifyBradenScore(score)).toBe(expected);
  });

  it("rejeita escore fora do intervalo válido (6-23)", () => {
    expect(() => classifyBradenScore(BRADEN_SCORE_MIN - 1)).toThrow();
    expect(() => classifyBradenScore(BRADEN_SCORE_MAX + 1)).toThrow();
  });

  it("soma corretamente as seis subescalas (mínimo e máximo)", () => {
    const min = calculateBradenScore({
      percepcaoSensorial: 1,
      umidade: 1,
      atividade: 1,
      mobilidade: 1,
      nutricao: 1,
      friccaoCisalhamento: 1,
    });
    expect(min).toBe(BRADEN_SCORE_MIN);

    const max = calculateBradenScore({
      percepcaoSensorial: 4,
      umidade: 4,
      atividade: 4,
      mobilidade: 4,
      nutricao: 4,
      friccaoCisalhamento: 3,
    });
    expect(max).toBe(BRADEN_SCORE_MAX);
  });

  it("retorna o nível textual e a orientação clínica correta por subescala", () => {
    const level = getBradenSubscaleLevel("umidade", 2);
    expect(level.label).toBe("Muito úmida");
    expect(level.orientacaoClinica.length).toBeGreaterThan(0);
  });

  it("rejeita nível inválido para uma subescala (fricção só tem 1-3)", () => {
    expect(() => getBradenSubscaleLevel("friccaoCisalhamento", 4)).toThrow();
  });
});

describe("Tempo de Enchimento Capilar (TEC)", () => {
  it("fixture obrigatória: 3,5s classifica como Alterado", () => {
    const result = classifyTec(TEC_FIXTURE_ALTERED_SECONDS);
    expect(result.label).toBe(TEC_FIXTURE_ALTERED_EXPECTED_LABEL);
    expect(result.color).toBe("vermelho");
  });

  it.each([
    [0, "Normal", "verde"],
    [2, "Normal", "verde"],
    [2.5, "Limítrofe (atenção)", "amarelo"],
    [3, "Limítrofe (atenção)", "amarelo"],
    [3.5, "Alterado", "vermelho"],
    [10, "Alterado", "vermelho"],
  ])("classifica %fs como %s (%s)", (seconds, label, color) => {
    const result = classifyTec(seconds as number);
    expect(result.label).toBe(label);
    expect(result.color).toBe(color);
  });

  it("normal vai até 2s inclusive, não até 3s (correção da v3 sobre a v2)", () => {
    expect(classifyTec(2).label).toBe("Normal");
    expect(classifyTec(2.01).label).not.toBe("Normal");
  });

  it("rejeita valores fora da faixa 0-10s", () => {
    expect(() => classifyTec(-1)).toThrow();
    expect(() => classifyTec(10.5)).toThrow();
  });

  it("gera alerta ao coordenador quando TEC > 3s sem fator contextual", () => {
    expect(requiresTecCoordinatorAlert(3.5, false)).toBe(true);
    expect(requiresTecCoordinatorAlert(3.5, true)).toBe(false);
    expect(requiresTecCoordinatorAlert(3, false)).toBe(false);
  });
});

describe("Escala de Morse (risco de queda)", () => {
  it("fixture obrigatória: escore 50 classifica como Risco elevado", () => {
    const score = calculateMorseScore(MORSE_FIXTURE_HIGH_RISK);
    expect(score).toBe(MORSE_FIXTURE_HIGH_RISK_EXPECTED_SCORE);
    expect(classifyMorseScore(score)).toBe(MORSE_FIXTURE_HIGH_RISK_EXPECTED_LABEL);
  });

  it.each([
    [0, "Risco baixo"],
    [24, "Risco baixo"],
    [25, "Risco moderado"],
    [44, "Risco moderado"],
    [45, "Risco elevado"],
    [125, "Risco elevado"],
  ])("classifica escore %i como %s", (score, expected) => {
    expect(classifyMorseScore(score)).toBe(expected);
  });

  it("soma corretamente todos os itens no pior cenário (escore máximo 125)", () => {
    const score = calculateMorseScore({
      historicoQuedas: 25,
      diagnosticoSecundario: 15,
      auxilioDeambulacao: 30,
      terapiaEndovenosa: 20,
      marcha: 20,
      estadoMental: 15,
    });
    expect(score).toBe(125);
    expect(classifyMorseScore(score)).toBe("Risco elevado");
  });
});

describe("Risco de Lesão por Dispositivos Médicos", () => {
  it("gera alerta quando qualquer item está inadequado", () => {
    expect(
      hasDeviceInjuryAlert({
        sonda: "adequado",
        cateter: "inadequado",
        talaImobilizador: "adequado",
        ortese: "adequado",
        tuboDreno: "adequado",
      }),
    ).toBe(true);
  });

  it("não gera alerta quando todos os itens estão adequados", () => {
    expect(
      hasDeviceInjuryAlert({
        sonda: "adequado",
        cateter: "adequado",
        talaImobilizador: "adequado",
        ortese: "adequado",
        tuboDreno: "adequado",
      }),
    ).toBe(false);
  });
});
