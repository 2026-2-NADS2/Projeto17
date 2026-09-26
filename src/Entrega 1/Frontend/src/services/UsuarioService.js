import api from './api';

export async function cadastrarUsuario(dados) {
  const resposta = await api.post('/usuarios', dados);
  return resposta.data;
}