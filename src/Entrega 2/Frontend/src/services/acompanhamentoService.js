import api, { extrairLista } from './api';

export async function listarAcompanhamentos() {
  const resposta = await api.get('/acompanhamentos');
  return extrairLista(resposta.data);
}