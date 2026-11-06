import api, { extrairLista } from './api';

// Contrato proposto: { id, idTurma, idDisciplina, idProfessor, turma, disciplina, professor, anoLetivo }
export async function listarVinculos(filtros = {}) {
  const resposta = await api.get('/vinculos', { params: filtros });
  return extrairLista(resposta.data);
}

// dados: { idTurma, idDisciplina, idProfessor }
export async function criarVinculo(dados) {
  const resposta = await api.post('/vinculos', dados);
  return resposta.data;
}

export async function excluirVinculo(id) {
  const resposta = await api.delete(`/vinculos/${id}`);
  return resposta.data;
}