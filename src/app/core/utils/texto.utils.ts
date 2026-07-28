/**
 * Normaliza un texto para búsquedas: quita tildes/diacríticos y
 * pasa todo a minúsculas. Así "cientifico" encuentra "Científico",
 * "genetica" encuentra "Genética", etc.
 *
 * Cómo funciona: normalize('NFD') separa cada letra acentuada en
 * la letra base + su acento como caracteres independientes (é -> e + ́),
 * y el regex elimina esos acentos sueltos (rango Unicode de marcas
 * diacríticas combinantes).
 */
export function normalizarTexto(texto: string | null | undefined): string {
  if (!texto) return '';
  return texto
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Compara si `texto` contiene `busqueda`, ignorando tildes y mayúsculas.
 */
export function coincideBusqueda(texto: string | null | undefined, busqueda: string): boolean {
  if (!busqueda) return true;
  return normalizarTexto(texto).includes(normalizarTexto(busqueda));
}