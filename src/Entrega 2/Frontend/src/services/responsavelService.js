import api, { extrairLista } from './api';

export async function buscarAlunos() {
  const resposta = await api.get('/alunos');
  return extrairLista(resposta.data);
}

export async function buscarRelatoriosPublicados() {
  const resposta = await api.get('/acompanhamentos');
  return extrairLista(resposta.data).filter((item) => item.status === 'PUBLICADO');
}

export function mensagemDeErro(error) {
  return 'Não foi possível carregar os dados. Verifique sua conexão com o servidor.';
}