import { describe, it, expect } from 'vitest';
import { normalizeString } from '../stringNormalizer.js';

describe('normalizeString', () => {
  it('should remove accents from Portuguese characters', () => {
    expect(normalizeString('Tábua')).toBe('Tabua');
    expect(normalizeString('Cerâmico')).toBe('Ceramico');
    expect(normalizeString('Acrílica')).toBe('Acrilica');
    expect(normalizeString('Construções')).toBe('Construcoes');
    expect(normalizeString('Galpão')).toBe('Galpao');
    expect(normalizeString('Condomínio')).toBe('Condominio');
    expect(normalizeString('Logístico')).toBe('Logistico');
  });

  it('should replace ç with c', () => {
    expect(normalizeString('Açaí')).toBe('Acai');
    expect(normalizeString('Coração')).toBe('Coracao');
  });

  it('should replace ñ with n', () => {
    expect(normalizeString('España')).toBe('Espana');
    expect(normalizeString('Niño')).toBe('Nino');
  });

  it('should handle strings without accents', () => {
    expect(normalizeString('Cimento')).toBe('Cimento');
    expect(normalizeString('Ferro')).toBe('Ferro');
    expect(normalizeString('Tijolo')).toBe('Tijolo');
  });

  it('should trim whitespace', () => {
    expect(normalizeString('  Tabua  ')).toBe('Tabua');
    expect(normalizeString('  Tábua  ')).toBe('Tabua');
  });

  it('should handle empty strings', () => {
    expect(normalizeString('')).toBe('');
    expect(normalizeString('   ')).toBe('');
  });

  it('should handle mixed case', () => {
    expect(normalizeString('TÁBUA')).toBe('TABUA');
    expect(normalizeString('Cerâmico')).toBe('Ceramico');
  });

  it('should handle multiple accents in one string', () => {
    expect(normalizeString('Construções e Galpões')).toBe('Construcoes e Galpoes');
    expect(normalizeString('Tábua Cerâmica Acrílica')).toBe('Tabua Ceramica Acrilica');
  });
});

