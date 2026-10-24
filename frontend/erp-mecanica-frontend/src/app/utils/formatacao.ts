/** Minúsculas e sem acentos, para buscas tolerantes ("joao" encontra "João"). */
export const semAcento = (v: string): string =>
  (v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const digitos = (v: string): string => (v || '').replace(/\D/g, '');

export function maskCpf(v: string): string {
  const d = digitos(v).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

export function maskTelefone(v: string): string {
  const d = digitos(v).slice(0, 11);
  if (d.length <= 2) return d.length ? '(' + d : '';
  if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
  if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
  return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
}

/** Contato aceita telefone (com máscara) ou e-mail: se houver letra ou @, é e-mail. */
export const ehEmail = (v: string): boolean => /[a-z@]/i.test(v);

export const maskContato = (v: string): string => (ehEmail(v) ? v : maskTelefone(v));

export function cpfValido(v: string): boolean {
  const d = digitos(v);
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const dv = (n: number) => {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += +d[i] * (n + 1 - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dv(9) === +d[9] && dv(10) === +d[10];
}

/** Máscara de placa: Mercosul (AAA1A23) ou tradicional (AAA-1234). */
export function maskPlaca(v: string): string {
  const r = (v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  return /^[A-Z]{3}\d{4}$/.test(r) ? r.slice(0, 3) + '-' + r.slice(3) : r;
}

export const placaValida = (p: string): boolean =>
  /^[A-Z]{3}-\d{4}$/.test(p) || /^[A-Z]{3}\d[A-Z]\d{2}$/.test(p);

export const normalizarPlaca = (p: string): string => (p || '').replace('-', '').toUpperCase();

export const numero2 = (n: number): string =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const moeda = (n: number): string =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Máscara monetária decimal: "125000" -> "1.250,00". */
export function maskMoeda(v: string): string {
  const d = digitos(v).replace(/^0+/, '').slice(0, 9);
  return d ? numero2(parseInt(d, 10) / 100) : '';
}

export const lerMoeda = (v: string): number =>
  parseFloat((v || '0').replace(/\./g, '').replace(',', '.')) || 0;

/** "2026-10-06" -> "06/10/2026". */
export const dataBr = (iso: string | null): string => (iso ? iso.split('-').reverse().join('/') : '');

export function hojeIso(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}
