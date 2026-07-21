/** Converte um campo de texto separado por vírgulas em uma lista de itens não vazios e sem espaços nas pontas. */
export function parseCommaSeparatedList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
