import api, { CHAVE_TOKEN, CHAVE_USUARIO } from './api';

export async function login(email, senha) {
  const resposta = await api.post('/auth/login', { email, senha });
  const { token, usuario } = resposta.data;

  localStorage.setItem(CHAVE_TOKEN, token);
  localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));

  return usuario;
}

export function obterUsuario() {
  try {
    const dados = localStorage.getItem(CHAVE_USUARIO);
    return dados ? JSON.parse(dados) : null;
  } catch {
    return null;
  }
}

export function estaLogado() {
  return Boolean(localStorage.getItem(CHAVE_TOKEN));
}

export function sair() {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_USUARIO);
}

export function rotaDoPerfil(perfil) {
  const rotas = {
    ADMIN: '/admin',
    PROFESSOR: '/professor',
    RESPONSAVEL: '/responsavel',
  };
  return rotas[perfil] || '/entrar';
}