import api, { extrairLista } from './api';

// Contrato proposto:
//   área:       { id, nome }
//   disciplina: { id, nome, codigo, idArea, area }

export async function listarAreas() {
  const resposta = await api.get('/areas');
  return extrairLista(resposta.data);
}

export async function criarArea(dados) {
  const resposta = await api.post('/areas', dados);
  return resposta.data;
}

export async function listarDisciplinas() {
  const resposta = await api.get('/disciplinas');
  return extrairLista(resposta.data);
}

export async function criarDisciplina(dados) {
  const resposta = await api.post('/disciplinas', dados);
  return resposta.data;
}

export async function atualizarDisciplina(id, dados) {
  const resposta = await api.put(`/disciplinas/${id}`, dados);
  return resposta.data;
}

export async function excluirDisciplina(id) {
  const resposta = await api.delete(`/disciplinas/${id}`);
  return resposta.data;
}