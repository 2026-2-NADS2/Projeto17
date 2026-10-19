import api, { extrairLista } from './api';

export async function listarAlunos() {
  const resposta = await api.get('/alunos');
  return extrairLista(resposta.data);
}