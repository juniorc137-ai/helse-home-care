const nodeCrypto = require("crypto");

/**
 * Mock de expo-crypto para o ambiente Jest (Node), já que o módulo nativo
 * não roda fora de um dispositivo/simulador. Usa o `crypto` nativo do Node
 * para gerar UUIDs e bytes aleatórios reais em teste (nunca `undefined`).
 */

module.exports = {
  randomUUID: () => nodeCrypto.randomUUID(),
  getRandomBytesAsync: async (byteCount) => new Uint8Array(nodeCrypto.randomBytes(byteCount)),
  getRandomBytes: (byteCount) => new Uint8Array(nodeCrypto.randomBytes(byteCount)),
  CryptoDigestAlgorithm: { SHA256: "SHA-256" },
  CryptoEncoding: { HEX: "hex", BASE64: "base64" },
  digestStringAsync: async (_algorithm, data, options) => {
    const encoding = options?.encoding === "base64" ? "base64" : "hex";
    return nodeCrypto.createHash("sha256").update(data).digest(encoding);
  },
};
