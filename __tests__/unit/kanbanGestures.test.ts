import { computeReorderedIds, pixelsToRowDelta, shouldCompleteFromSwipe, SWIPE_COMPLETE_THRESHOLD_PX } from "../../src/utils/kanbanGestures";

describe("shouldCompleteFromSwipe (seção 2.3: gesto de confirmação)", () => {
  it("não conclui abaixo do limiar", () => {
    expect(shouldCompleteFromSwipe(SWIPE_COMPLETE_THRESHOLD_PX - 1)).toBe(false);
  });

  it("conclui acima do limiar", () => {
    expect(shouldCompleteFromSwipe(SWIPE_COMPLETE_THRESHOLD_PX + 1)).toBe(true);
  });
});

describe("pixelsToRowDelta", () => {
  it("converte deslocamento em linhas cruzadas, arredondando", () => {
    expect(pixelsToRowDelta(92, 92)).toBe(1);
    expect(pixelsToRowDelta(45, 92)).toBe(0);
    expect(pixelsToRowDelta(-92, 92)).toBe(-1);
  });
});

describe("computeReorderedIds (ADR-007: arrastar só reordena, nunca conclui)", () => {
  it("move um item para baixo", () => {
    expect(computeReorderedIds(["a", "b", "c"], 0, 1)).toEqual(["b", "a", "c"]);
  });

  it("move um item para cima", () => {
    expect(computeReorderedIds(["a", "b", "c"], 2, -1)).toEqual(["a", "c", "b"]);
  });

  it("satura no limite da lista (não estoura os índices)", () => {
    expect(computeReorderedIds(["a", "b", "c"], 0, -5)).toEqual(["a", "b", "c"]);
    expect(computeReorderedIds(["a", "b", "c"], 2, 5)).toEqual(["a", "b", "c"]);
  });

  it("retorna a mesma referência quando deltaRows é 0 (sem-op)", () => {
    const ids = ["a", "b"];
    expect(computeReorderedIds(ids, 0, 0)).toBe(ids);
  });

  it("retorna a mesma referência quando o índice é inválido", () => {
    const ids = ["a", "b"];
    expect(computeReorderedIds(ids, -1, 1)).toBe(ids);
    expect(computeReorderedIds(ids, 5, 1)).toBe(ids);
  });
});
