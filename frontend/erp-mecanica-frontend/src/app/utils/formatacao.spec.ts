import { describe, expect, it } from 'vitest';

import {
  cpfValido,
  dataBr,
  digitos,
  ehEmail,
  hojeIso,
  lerMoeda,
  maskContato,
  maskCpf,
  maskMoeda,
  maskPlaca,
  maskTelefone,
  normalizarPlaca,
  numero2,
  placaValida,
  semAcento,
} from './formatacao';

describe('formatacao', () => {
  it('semAcento remove acentos e normaliza caixa', () => {
    expect(semAcento('João D’Ávila')).toBe('joao d’avila');
    expect(semAcento('')).toBe('');
    expect(semAcento(undefined as unknown as string)).toBe('');
  });

  it('digitos mantém só números', () => {
    expect(digitos('123.456-78')).toBe('12345678');
    expect(digitos(undefined as unknown as string)).toBe('');
  });

  it('maskCpf aplica a máscara progressivamente', () => {
    expect(maskCpf('123')).toBe('123');
    expect(maskCpf('1234')).toBe('123.4');
    expect(maskCpf('1234567')).toBe('123.456.7');
    expect(maskCpf('12345678901')).toBe('123.456.789-01');
    expect(maskCpf('123456789012345')).toBe('123.456.789-01');
  });

  it('maskTelefone cobre fixo, celular e entradas curtas', () => {
    expect(maskTelefone('')).toBe('');
    expect(maskTelefone('1')).toBe('(1');
    expect(maskTelefone('11')).toBe('(11');
    expect(maskTelefone('11987')).toBe('(11) 987');
    expect(maskTelefone('1133334444')).toBe('(11) 3333-4444');
    expect(maskTelefone('11987654321')).toBe('(11) 98765-4321');
  });

  it('ehEmail e maskContato distinguem telefone de e-mail', () => {
    expect(ehEmail('a@b.com')).toBe(true);
    expect(ehEmail('11987654321')).toBe(false);
    expect(maskContato('a@b.com')).toBe('a@b.com');
    expect(maskContato('11987654321')).toBe('(11) 98765-4321');
  });

  it('cpfValido valida tamanho, repetidos e dígitos verificadores', () => {
    expect(cpfValido('529.982.247-25')).toBe(true);
    expect(cpfValido('52998224725')).toBe(true);
    expect(cpfValido('11111111111')).toBe(false);
    expect(cpfValido('123')).toBe(false);
    expect(cpfValido('52998224724')).toBe(false);
    expect(cpfValido('52998224715')).toBe(false);
    // Dígito verificador calculado como 10 vira 0.
    expect(cpfValido('10000000108')).toBe(true);
  });

  it('maskPlaca converte tradicional com hífen e mantém Mercosul', () => {
    expect(maskPlaca('abc1234')).toBe('ABC-1234');
    expect(maskPlaca('ABC-1234')).toBe('ABC-1234');
    expect(maskPlaca('abc1d23')).toBe('ABC1D23');
    expect(maskPlaca('abc1d23999')).toBe('ABC1D23');
    expect(maskPlaca(undefined as unknown as string)).toBe('');
  });

  it('placaValida aceita os dois formatos', () => {
    expect(placaValida('ABC-1234')).toBe(true);
    expect(placaValida('ABC1D23')).toBe(true);
    expect(placaValida('ABC1234')).toBe(false);
    expect(placaValida('12')).toBe(false);
  });

  it('normalizarPlaca remove hífen e põe em maiúsculas', () => {
    expect(normalizarPlaca('abc-1234')).toBe('ABC1234');
    expect(normalizarPlaca(undefined as unknown as string)).toBe('');
  });

  it('numero2 formata com duas casas no padrão pt-BR', () => {
    expect(numero2(1250)).toBe('1.250,00');
    expect(numero2(0.5)).toBe('0,50');
  });

  it('maskMoeda interpreta dígitos como centavos', () => {
    expect(maskMoeda('')).toBe('');
    expect(maskMoeda('0')).toBe('');
    expect(maskMoeda('5')).toBe('0,05');
    expect(maskMoeda('125000')).toBe('1.250,00');
    expect(maskMoeda('00125')).toBe('1,25');
  });

  it('lerMoeda converte texto pt-BR em número', () => {
    expect(lerMoeda('1.250,50')).toBe(1250.5);
    expect(lerMoeda('')).toBe(0);
    expect(lerMoeda(undefined as unknown as string)).toBe(0);
    expect(lerMoeda('abc')).toBe(0);
  });

  it('dataBr converte ISO em dd/mm/aaaa', () => {
    expect(dataBr('2026-10-06')).toBe('06/10/2026');
    expect(dataBr(null)).toBe('');
  });

  it('hojeIso devolve a data local no formato ISO', () => {
    const t = new Date();
    const esperado = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    expect(hojeIso()).toBe(esperado);
    expect(hojeIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
