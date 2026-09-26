import axios from 'axios';

// Instância única do axios: se a URL do backend mudar, muda só aqui.
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 8000, // depois de 8s sem resposta, a requisição falha (e mostramos o erro)
});

// Aceita tanto uma lista pura ([...]) quanto um objeto ({ dados: [...] })
export function extrairLista(dados) {
  if (Array.isArray(dados)) return dados;
  if (Array.isArray(dados?.dados)) return dados.dados;
  if (Array.isArray(dados?.data)) return dados.data;
  return [];
}

export default api;