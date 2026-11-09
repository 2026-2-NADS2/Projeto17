export function formatarMedia(media) {
  if (media === null || media === undefined || media === '') return '—';
  const numero = Number(media);
  return Number.isNaN(numero) ? String(media) : numero.toFixed(1).replace('.', ',');
}

export function pegarIniciais(nome = '') {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (partes[0][0] + ultima).toUpperCase();
}

// Aceita relatório com idAluno (formato atual) ou só com o nome (formato do contrato)
export function pertenceAoAluno(relatorio, aluno) {
  if (relatorio.idAluno !== undefined) return relatorio.idAluno === aluno.id;
  return relatorio.aluno === aluno.nome;
}

export const anoDe = (r) => r.anoLetivo ?? '';
export const bimestreDe = (r) => r.bimestre ?? r.idBimestre ?? '';
export const disciplinaDe = (r) =>
  r.disciplina ?? (r.idDisciplina ? `Disciplina ${r.idDisciplina}` : '—');
