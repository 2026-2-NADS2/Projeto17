import axios from 'axios';

// Chaves usadas para guardar a sessão no navegador
export const CHAVE_TOKEN = 'classsync_token';
export const CHAVE_USUARIO = 'classsync_usuario';

// Instância única do axios: se a URL do backend mudar, muda só aqui.
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 8000, // depois de 8s sem resposta, a requisição falha (e mostramos o erro)
});

// Antes de toda requisição: se houver token salvo, envia no cabeçalho
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(CHAVE_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Depois de toda resposta: se o token expirou ou é inválido, encerra a sessão
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const status = erro.response?.status;
    const ehLogin = erro.config?.url?.includes('/auth/login');

    if (status === 401 && !ehLogin) {
      localStorage.removeItem(CHAVE_TOKEN);
      localStorage.removeItem(CHAVE_USUARIO);
      window.location.href = '/entrar';
    }

    return Promise.reject(erro);
  }
);

// Aceita tanto uma lista pura ([...]) quanto um objeto ({ dados: [...] })
export function extrairLista(dados) {
  if (Array.isArray(dados)) return dados;
  if (Array.isArray(dados?.dados)) return dados.dados;
  if (Array.isArray(dados?.data)) return dados.data;
  return [];
}

export default api;