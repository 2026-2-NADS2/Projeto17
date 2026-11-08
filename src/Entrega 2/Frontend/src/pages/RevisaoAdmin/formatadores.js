// Funciona se a API mandar "Lucas Ferreira" ou { id: 2, nome: "Lucas Ferreira" }
export function nomeDe(valor) {
    if (valor && typeof valor === 'object') return valor.nome;
    return valor ?? '—';
  }
  
  // 5.5 → "5,5" (vírgula, como no Brasil) · null → "—"
  export function formatarMedia(media) {
    if (media === null || media === undefined) return '—';
    return Number(media).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

// A API manda { id, numero }; os dados de exemplo mandam só o número
export function numeroDoBimestre(bimestre) {
  if (bimestre && typeof bimestre === 'object') return bimestre.numero;
  return bimestre;
}