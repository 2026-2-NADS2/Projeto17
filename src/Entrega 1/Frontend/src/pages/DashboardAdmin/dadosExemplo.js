// Dados FICTÍCIOS, usados só quando a API não responde e o usuário
// clica em "Ver com dados de exemplo". O formato imita o que o backend devolve.

export const alunosExemplo = [
  { idAluno: 1, nome: 'Ana Beatriz Souza', dataNascimento: '2012-03-14', idTurma: 1 },
  { idAluno: 2, nome: 'Lucas Ferreira', dataNascimento: '2012-07-22', idTurma: 1 },
  { idAluno: 3, nome: 'Marina Oliveira', dataNascimento: '2011-11-05', idTurma: 2 },
  { idAluno: 4, nome: 'Pedro Henrique Lima', dataNascimento: '2011-09-30', idTurma: 2 },
  { idAluno: 5, nome: 'Júlia Santos', dataNascimento: '2012-01-18', idTurma: 1 },
];

export const acompanhamentosExemplo = [
  { idAcompanhamento: 1, idAluno: 1, idDisciplina: 1, idProfessor: 1, idBimestre: 1, media: 8.5, descricao: 'Participa bem das aulas e entrega as atividades no prazo.', status: 'PUBLICADO' },
  { idAcompanhamento: 2, idAluno: 2, idDisciplina: 1, idProfessor: 1, idBimestre: 1, media: 6.0, descricao: 'Precisa reforçar frações e porcentagem.', status: 'EM_REVISAO' },
  { idAcompanhamento: 3, idAluno: 3, idDisciplina: 2, idProfessor: 2, idBimestre: 1, media: 9.2, descricao: 'Excelente produção de texto.', status: 'PUBLICADO' },
  { idAcompanhamento: 4, idAluno: 4, idDisciplina: 2, idProfessor: 2, idBimestre: 1, media: 5.5, descricao: 'Faltou a duas avaliações; combinar recuperação.', status: 'ENVIADO' },
  { idAcompanhamento: 5, idAluno: 5, idDisciplina: 3, idProfessor: 3, idBimestre: 1, media: 7.8, descricao: '', status: 'RASCUNHO' },
  { idAcompanhamento: 6, idAluno: 1, idDisciplina: 3, idProfessor: 3, idBimestre: 1, media: 7.0, descricao: 'Descrição incompleta, devolvido ao professor.', status: 'DEVOLVIDO' },
  { idAcompanhamento: 7, idAluno: 2, idDisciplina: 2, idProfessor: 2, idBimestre: 1, media: null, descricao: 'Lançado em duplicidade.', status: 'CANCELADO' },
  { idAcompanhamento: 8, idAluno: 3, idDisciplina: 1, idProfessor: 1, idBimestre: 1, media: 8.0, descricao: 'Evoluiu bastante em relação ao diagnóstico inicial.', status: 'ENVIADO' },
];