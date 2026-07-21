import { gcm } from "@noble/ciphers/aes";
import { pbkdf2 } from "@noble/hashes/pbkdf2";
import { sha256 } from "@noble/hashes/sha256";
import * as ExpoCrypto from "expo-crypto";

/**
 * AES-256-GCM em repouso (NIST SP 800-38D) com derivação de chave via
 * PBKDF2-SHA256, mínimo 100.000 iterações (seção 4.3.1). Implementação
 * puramente JS (@noble/ciphers e @noble/hashes, auditados) para evitar
 * dependência de módulo nativo adicional no MVP; a chave mestra em si é
 * armazenada em expo-secure-store (ver secureKeyStore.ts), nunca em
 * AsyncStorage/SharedPreferences.
 */

export const PBKDF2_MIN_ITERATIONS = 100_000;
export const AES_KEY_LENGTH_BYTES = 32; // 256 bits
const GCM_NONCE_LENGTH_BYTES = 12;
const SALT_LENGTH_BYTES = 16;

export interface EncryptedPayload {
  ciphertext: string; // base64
  nonce: string; // base64
  salt: string; // base64
}

// btoa/atob são globais garantidos tanto em React Native (polyfill nativo)
// quanto no runtime web; evitamos depender de Buffer (API exclusiva de Node).
function toBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function randomBytes(length: number): Promise<Uint8Array> {
  return await ExpoCrypto.getRandomBytesAsync(length);
}

/** Deriva uma chave AES-256 a partir de uma senha/segredo mestre e salt. */
export function deriveKey(masterSecret: string, salt: Uint8Array, iterations: number = PBKDF2_MIN_ITERATIONS): Uint8Array {
  if (iterations < PBKDF2_MIN_ITERATIONS) {
    throw new Error(`PBKDF2 exige no mínimo ${PBKDF2_MIN_ITERATIONS} iterações (recebido: ${iterations})`);
  }
  const passwordBytes = new TextEncoder().encode(masterSecret);
  return pbkdf2(sha256, passwordBytes, salt, { c: iterations, dkLen: AES_KEY_LENGTH_BYTES });
}

export async function encryptField(plaintext: string, masterSecret: string): Promise<EncryptedPayload> {
  const salt = await randomBytes(SALT_LENGTH_BYTES);
  const nonce = await randomBytes(GCM_NONCE_LENGTH_BYTES);
  const key = deriveKey(masterSecret, salt);
  const cipher = gcm(key, nonce);
  const ciphertextBytes = cipher.encrypt(new TextEncoder().encode(plaintext));
  return {
    ciphertext: toBase64(ciphertextBytes),
    nonce: toBase64(nonce),
    salt: toBase64(salt),
  };
}

export function decryptField(payload: EncryptedPayload, masterSecret: string): string {
  const salt = fromBase64(payload.salt);
  const nonce = fromBase64(payload.nonce);
  const key = deriveKey(masterSecret, salt);
  const cipher = gcm(key, nonce);
  const plaintextBytes = cipher.decrypt(fromBase64(payload.ciphertext));
  return new TextDecoder().decode(plaintextBytes);
}

export async function sha256Hex(data: string): Promise<string> {
  return await ExpoCrypto.digestStringAsync(ExpoCrypto.CryptoDigestAlgorithm.SHA256, data, {
    encoding: ExpoCrypto.CryptoEncoding.HEX,
  });
}
