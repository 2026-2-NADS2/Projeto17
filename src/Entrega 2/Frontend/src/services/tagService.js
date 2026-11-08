import api, { extrairLista } from './api';

// Real hoje: GET /tags → { id, nome }
export async function listarTags() {
  const resposta = await api.get('/tags');
  return extrairLista(resposta.data);
}

// Propostos (o backend ainda não tem): { nome, descricao }
export async function criarTag(dados) {
  const resposta = await api.post('/tags', dados);
  return resposta.data;
}

export async function atualizarTag(id, dados) {
  const resposta = await api.put(`/tags/${id}`, dados);
  return resposta.data;
}

export async function excluirTag(id) {
  const resposta = await api.delete(`/tags/${id}`);
  return resposta.data;
}