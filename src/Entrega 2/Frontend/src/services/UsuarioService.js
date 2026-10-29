import api from './api';

export async function cadastrarUsuario(dados) {
  const resposta = await api.post('/auth/usuarios', dados);
  return resposta.data;
}