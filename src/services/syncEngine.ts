import NetInfo from "@react-native-community/netinfo";
import * as ExpoCrypto from "expo-crypto";
import { sha256Hex } from "./crypto";
import type { SyncEntity, SyncPayload, SyncRecord, SyncResponse } from "./syncContract";

/**
 * Fila de mutações própria + sincronização contra o Sync Contract (seção
 * 4.5). No MVP, `postSyncBatch` é um mock local (sem backend real) — a
 * interface é a mesma que será usada quando o backend existir.
 */

const APP_VERSION = "0.1.0";
const RECONNECT_POLL_INTERVAL_MS = 30_000;

let queue: SyncRecord[] = [];
let lastSyncCursor: string | null = null;
let deviceId: string | null = null;
let syncing = false;

export type SyncStatus = "idle" | "syncing" | "success" | "error" | "offline";
let statusListeners: Array<(status: SyncStatus) => void> = [];

function setStatus(status: SyncStatus) {
  statusListeners.forEach((listener) => listener(status));
}

export function onSyncStatusChange(listener: (status: SyncStatus) => void): () => void {
  statusListeners.push(listener);
  return () => {
    statusListeners = statusListeners.filter((l) => l !== listener);
  };
}

async function getDeviceId(): Promise<string> {
  if (!deviceId) deviceId = ExpoCrypto.randomUUID();
  return deviceId;
}

export async function enqueueMutation(entity: SyncEntity, action: SyncRecord["action"], data: unknown): Promise<void> {
  const serialized = JSON.stringify(data);
  const hash = await sha256Hex(serialized);
  queue.push({
    id: ExpoCrypto.randomUUID(),
    entity,
    action,
    timestamp: new Date().toISOString(),
    data,
    hash,
  });
}

export function getQueueLength(): number {
  return queue.length;
}

/**
 * Mock local do endpoint POST /sync/batch. Sempre aceita os registros
 * enviados e não retorna conflitos nem novos registros — substituir por
 * chamada HTTP real quando o backend existir, mantendo a mesma interface.
 */
async function postSyncBatchMock(payload: SyncPayload): Promise<SyncResponse> {
  return {
    accepted: payload.records.map((r) => r.id),
    conflicts: [],
    newRecords: [],
    nextCursor: new Date().toISOString(),
  };
}

export async function syncNow(): Promise<SyncResponse | null> {
  if (syncing || queue.length === 0) return null;
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    setStatus("offline");
    return null;
  }

  syncing = true;
  setStatus("syncing");
  try {
    const payload: SyncPayload = {
      records: [...queue],
      deviceId: await getDeviceId(),
      appVersion: APP_VERSION,
      lastSyncCursor,
    };
    const response = await postSyncBatchMock(payload);

    queue = queue.filter((r) => !response.accepted.includes(r.id));
    lastSyncCursor = response.nextCursor;
    setStatus("success");
    return response;
  } catch (error) {
    setStatus("error");
    throw error;
  } finally {
    syncing = false;
  }
}

let reconnectUnsubscribe: (() => void) | null = null;
let pollIntervalId: ReturnType<typeof setInterval> | null = null;

/** Reconexão: listener de NetInfo (debounce simples) + fallback de polling a cada 30s (seção 4.2). */
export function startSyncEngine(): void {
  if (reconnectUnsubscribe) return; // já iniciado

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  reconnectUnsubscribe = NetInfo.addEventListener((state) => {
    if (!state.isConnected) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      syncNow().catch(() => undefined);
    }, 500);
  });

  pollIntervalId = setInterval(() => {
    syncNow().catch(() => undefined);
  }, RECONNECT_POLL_INTERVAL_MS);
}

export function stopSyncEngine(): void {
  reconnectUnsubscribe?.();
  reconnectUnsubscribe = null;
  if (pollIntervalId) clearInterval(pollIntervalId);
  pollIntervalId = null;
}

/** Utilitário de teste: reseta o estado interno da fila entre casos de teste. */
export function __resetSyncEngineForTests(): void {
  queue = [];
  lastSyncCursor = null;
  deviceId = null;
  syncing = false;
}
