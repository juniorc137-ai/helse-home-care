export interface SoapFields {
  subjetivo: string;
  objetivo: string;
  avaliacao: string;
  plano: string;
}

/** Monta o texto livre da nota com estrutura SOAP sugerida (seção 2.5). */
export function formatSoapNote(fields: SoapFields): string {
  const sections = [
    fields.subjetivo.trim() && `S: ${fields.subjetivo.trim()}`,
    fields.objetivo.trim() && `O: ${fields.objetivo.trim()}`,
    fields.avaliacao.trim() && `A: ${fields.avaliacao.trim()}`,
    fields.plano.trim() && `P: ${fields.plano.trim()}`,
  ].filter(Boolean);
  return sections.join("\n");
}

export function isSoapNoteEmpty(fields: SoapFields): boolean {
  return !fields.subjetivo.trim() && !fields.objetivo.trim() && !fields.avaliacao.trim() && !fields.plano.trim();
}

export type SoapSection = "S" | "O" | "A" | "P";

/** Extrai quais seções SOAP (S/O/A/P) estão presentes no texto de uma nota (timeline compacta do dashboard). */
export function extractSoapSections(conteudoTexto: string): SoapSection[] {
  const sections: SoapSection[] = [];
  (["S", "O", "A", "P"] as const).forEach((marker) => {
    if (new RegExp(`(^|\\n)${marker}:`).test(conteudoTexto)) sections.push(marker);
  });
  return sections;
}
