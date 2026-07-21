import { decryptField, deriveKey, encryptField, PBKDF2_MIN_ITERATIONS, sha256Hex } from "../../src/services/crypto";

describe("Criptografia em repouso — AES-256-GCM (seção 4.3.1)", () => {
  it("encripta e decripta corretamente (round-trip)", async () => {
    const plaintext = "123.456.789-00";
    const secret = "chave-mestra-de-teste";
    const encrypted = await encryptField(plaintext, secret);
    expect(encrypted.ciphertext).not.toBe(plaintext);
    const decrypted = decryptField(encrypted, secret);
    expect(decrypted).toBe(plaintext);
  });

  it("rejeita decriptação com segredo incorreto", async () => {
    const encrypted = await encryptField("dado sensível", "segredo-correto");
    expect(() => decryptField(encrypted, "segredo-errado")).toThrow();
  });

  it("deriva chaves de 32 bytes (AES-256)", () => {
    const key = deriveKey("segredo", new Uint8Array(16), PBKDF2_MIN_ITERATIONS);
    expect(key.length).toBe(32);
  });

  it("rejeita menos que o mínimo de iterações do PBKDF2", () => {
    expect(() => deriveKey("segredo", new Uint8Array(16), PBKDF2_MIN_ITERATIONS - 1)).toThrow();
  });

  it("gera hash SHA-256 determinístico em hexadecimal", async () => {
    const hash1 = await sha256Hex("conteudo");
    const hash2 = await sha256Hex("conteudo");
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);
  });
});
