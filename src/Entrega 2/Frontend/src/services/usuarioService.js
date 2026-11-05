import api, { extrairLista } from './api';

export async function cadastrarUsuario(dados) {
  const resposta = await api.post('/auth/usuarios', dados);
  return resposta.data;
}

// Lista as contas. filtros: { perfil } (opcional) → GET /auth/usuarios?perfil=PROFESSOR
export async function listarUsuarios(filtros = {}) {
  const resposta = await api.get('/auth/usuarios', { params: filtros });
  return extrairLista(resposta.data);
}

// Cria uma conta (só ADMIN). dados: { nome, email, senha, perfil }
export async function criarUsuario(dados) {
  const resposta = await api.post('/auth/usuarios', dados);
  return resposta.data;
}