import { colors } from "../../src/constants/theme";
import { bradenToVisual, morseToVisual, tecToVisual } from "../../src/utils/indicatorVisuals";
import { BRADEN_FIXTURE_HIGH_RISK, MORSE_FIXTURE_HIGH_RISK, TEC_FIXTURE_ALTERED_SECONDS } from "../fixtures/clinicalFixtures";

describe("indicatorVisuals (mapeamento clínico -> anel do health card)", () => {
  it("Braden fixture (escore 10, Risco alto) mapeia para cor de perigo e severidade alta", () => {
    const visual = bradenToVisual({ type: "braden", scores: BRADEN_FIXTURE_HIGH_RISK });
    expect(visual.value).toBe("10");
    expect(visual.sublabel).toBe("Risco alto");
    expect(visual.color).toBe(colors.statusDanger);
    expect(visual.percent).toBeGreaterThan(50); // escore baixo -> anel mais cheio (mais severo)
  });

  it("Braden sem risco mapeia para cor segura e severidade baixa", () => {
    const visual = bradenToVisual({
      type: "braden",
      scores: { percepcaoSensorial: 4, umidade: 4, atividade: 4, mobilidade: 4, nutricao: 4, friccaoCisalhamento: 3 },
    });
    expect(visual.sublabel).toBe("Sem risco");
    expect(visual.color).toBe(colors.statusOk);
    expect(visual.percent).toBeLessThan(20);
  });

  it("TEC fixture (3,5s, Alterado) mapeia para cor de perigo", () => {
    const visual = tecToVisual({ type: "tec", seconds: TEC_FIXTURE_ALTERED_SECONDS, hasContextualFactor: false });
    expect(visual.value).toBe("3.5s");
    expect(visual.sublabel).toBe("Alterado");
    expect(visual.color).toBe(colors.statusDanger);
  });

  it("Morse fixture (escore 50, Risco elevado) mapeia para cor de perigo", () => {
    const visual = morseToVisual({ type: "morse", scores: MORSE_FIXTURE_HIGH_RISK });
    expect(visual.value).toBe("50");
    expect(visual.sublabel).toBe("Risco elevado");
    expect(visual.color).toBe(colors.statusDanger);
  });

  it("percentuais sempre ficam no intervalo 0-100", () => {
    expect(bradenToVisual({ type: "braden", scores: BRADEN_FIXTURE_HIGH_RISK }).percent).toBeLessThanOrEqual(100);
    expect(morseToVisual({ type: "morse", scores: MORSE_FIXTURE_HIGH_RISK }).percent).toBeLessThanOrEqual(100);
    expect(tecToVisual({ type: "tec", seconds: 10, hasContextualFactor: false }).percent).toBeLessThanOrEqual(100);
  });
});
