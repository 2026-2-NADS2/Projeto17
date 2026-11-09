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

// A API manda { id, nome } e { id, numero }; as telas do responsável usam texto e número.
const nomeDe = (valor) => (valor && typeof valor === 'object' ? valor.nome : valor);

// "Achata" um relatório vindo da API, uma vez só, logo ao carregar
export function normalizarRelatorio(r) {
  return {
    ...r,
    idAluno: r.idAluno ?? r.aluno?.id,
    aluno: nomeDe(r.aluno),
    turma: nomeDe(r.turma),
    disciplina: nomeDe(r.disciplina),
    professor: nomeDe(r.professor),
    bimestre: r.bimestre && typeof r.bimestre === 'object' ? r.bimestre.numero : r.bimestre,
  };
}