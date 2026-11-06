// "2026-11-04T18:20" ou "2026-11-04 18:20:00" ou ISO com Z → "04/11/2026 18:20"
export function formatarDataHora(valor) {
  if (!valor) return '—';
  const data = new Date(String(valor).replace(' ', 'T'));
  if (Number.isNaN(data.getTime())) return String(valor);
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Dia local no formato "2026-11-04" (pra comparar com <input type="date">)
export function diaLocal(valor) {
  if (!valor) return '';
  const data = new Date(String(valor).replace(' ', 'T'));
  if (Number.isNaN(data.getTime())) return '';
  return data.toLocaleDateString('sv-SE');
}

// Para ordenar do mais novo para o mais antigo
export function tempoDe(valor) {
  const data = new Date(String(valor ?? '').replace(' ', 'T'));
  return Number.isNaN(data.getTime()) ? 0 : data.getTime();
}