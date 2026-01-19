/**
 * Normalizes a string by removing accents and special characters.
 * Converts to ASCII-compatible format (American standard).
 * 
 * Examples:
 * - "Tábua" -> "Tabua"
 * - "Cerâmico" -> "Ceramico"
 * - "Acrílica" -> "Acrilica"
 * - "Construções" -> "Construcoes"
 * - "Galpão" -> "Galpao"
 */
export function normalizeString(str: string): string {
  return str
    .normalize('NFD') // Decompose characters (é -> e + ´)
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
    .replace(/[Ç]/g, 'C') // Replace Ç with C
    .replace(/[ç]/g, 'c') // Replace ç with c
    .replace(/[ñÑ]/g, 'N') // Replace Ñ with N
    .replace(/[ñ]/g, 'n') // Replace ñ with n
    .trim();
}

