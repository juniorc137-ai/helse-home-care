import { formatCPF, isValidCPF, onlyDigits } from "../../src/utils/cpf";

describe("CPF — validação por dígito verificador (módulo 11)", () => {
  it("aceita CPF válido conhecido (com e sem máscara)", () => {
    expect(isValidCPF("111.444.777-35")).toBe(true);
    expect(isValidCPF("11144477735")).toBe(true);
  });

  it("rejeita CPF com dígitos verificadores incorretos", () => {
    expect(isValidCPF("111.444.777-36")).toBe(false);
  });

  it("rejeita CPF com todos os dígitos iguais", () => {
    expect(isValidCPF("111.111.111-11")).toBe(false);
    expect(isValidCPF("00000000000")).toBe(false);
  });

  it("rejeita CPF com quantidade de dígitos incorreta", () => {
    expect(isValidCPF("123456")).toBe(false);
    expect(isValidCPF("123456789012")).toBe(false);
  });

  it("onlyDigits remove qualquer caractere não numérico", () => {
    expect(onlyDigits("111.444.777-35")).toBe("11144477735");
  });

  it("formatCPF aplica a máscara padrão", () => {
    expect(formatCPF("11144477735")).toBe("111.444.777-35");
  });
});
