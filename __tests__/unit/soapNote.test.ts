import { extractSoapSections, formatSoapNote, isSoapNoteEmpty } from "../../src/utils/soapNote";

describe("formatSoapNote", () => {
  it("monta as 4 seções com prefixo S/O/A/P", () => {
    const text = formatSoapNote({ subjetivo: "Dor lombar", objetivo: "PA 130x80", avaliacao: "Estável", plano: "Reavaliar em 24h" });
    expect(text).toBe("S: Dor lombar\nO: PA 130x80\nA: Estável\nP: Reavaliar em 24h");
  });

  it("omite seções vazias", () => {
    const text = formatSoapNote({ subjetivo: "Dor lombar", objetivo: "", avaliacao: "", plano: "" });
    expect(text).toBe("S: Dor lombar");
  });
});

describe("isSoapNoteEmpty", () => {
  it("detecta quando todos os campos estão vazios", () => {
    expect(isSoapNoteEmpty({ subjetivo: "", objetivo: "  ", avaliacao: "", plano: "" })).toBe(true);
  });

  it("detecta quando há pelo menos um campo preenchido", () => {
    expect(isSoapNoteEmpty({ subjetivo: "", objetivo: "PA 130x80", avaliacao: "", plano: "" })).toBe(false);
  });
});

describe("extractSoapSections", () => {
  it("identifica todas as seções presentes", () => {
    expect(extractSoapSections("S: dor\nO: PA 130x80\nA: estável\nP: reavaliar")).toEqual(["S", "O", "A", "P"]);
  });

  it("identifica apenas as seções presentes", () => {
    expect(extractSoapSections("S: dor")).toEqual(["S"]);
  });

  it("retorna vazio para texto sem marcadores SOAP (ex.: adendo livre)", () => {
    expect(extractSoapSections("Correção de PA")).toEqual([]);
  });
});
