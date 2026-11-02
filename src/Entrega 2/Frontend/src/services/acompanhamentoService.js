import api, { extrairLista } from './api';

// filtros: { status, idAluno } (todos opcionais)
export async function listarAcompanhamentos(filtros = {}) {
  const resposta = await api.get('/acompanhamentos', { params: filtros });
  return extrairLista(resposta.data);
}

export async function buscarAcompanhamento(id) {
  const resposta = await api.get(`/acompanhamentos/${id}`);
  return resposta.data;
}

export async function criarAcompanhamento(dados) {
  const resposta = await api.post('/acompanhamentos', dados);
  return resposta.data;
}

export async function atualizarAcompanhamento(id, dados) {
  const resposta = await api.put(`/acompanhamentos/${id}`, dados);
  return resposta.data;
}

export async function enviarAcompanhamento(id) {
  const resposta = await api.patch(`/acompanhamentos/${id}/enviar`);
  return resposta.data;
}

export async function devolverAcompanhamento(id, motivo) {
  const resposta = await api.patch(`/acompanhamentos/${id}/devolver`, { motivo });
  return resposta.data;
}

export async function publicarAcompanhamento(id) {
  const resposta = await api.patch(`/acompanhamentos/${id}/publicar`);
  return resposta.data;
}