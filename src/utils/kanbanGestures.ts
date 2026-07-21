/**
 * Lógica pura por trás dos gestos do Kanban (seção "Care Plan" do
 * redesign v2), separada dos gestos em si (react-native-gesture-handler)
 * para permitir teste unitário direto sem depender de simulação de
 * gestos nativos.
 */

export const SWIPE_COMPLETE_THRESHOLD_PX = 96;

/** Swipe horizontal além do limiar conclui a tarefa (seção 2.3: gesto de confirmação). */
export function shouldCompleteFromSwipe(translationX: number): boolean {
  return translationX > SWIPE_COMPLETE_THRESHOLD_PX;
}

/**
 * Reordena uma lista de ids deslocando o item em `fromIndex` por
 * `deltaRows` posições (ADR-007: arrastar só reordena prioridade dentro
 * da coluna, nunca altera status). Retorna a mesma referência se nada
 * muda.
 */
export function computeReorderedIds(ids: string[], fromIndex: number, deltaRows: number): string[] {
  if (fromIndex < 0 || fromIndex >= ids.length || deltaRows === 0) return ids;
  const targetIndex = Math.max(0, Math.min(ids.length - 1, fromIndex + deltaRows));
  if (targetIndex === fromIndex) return ids;

  const reordered = [...ids];
  const [movedId] = reordered.splice(fromIndex, 1);
  reordered.splice(targetIndex, 0, movedId);
  return reordered;
}

/** Converte um deslocamento vertical em pixels no número de linhas cruzadas (arredondado). */
export function pixelsToRowDelta(translationYPx: number, rowHeightPx: number): number {
  return Math.round(translationYPx / rowHeightPx);
}
