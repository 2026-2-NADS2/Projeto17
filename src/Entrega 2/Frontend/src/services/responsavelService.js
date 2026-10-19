import axios from 'axios';

const API_URL = 'http://localhost:3000';

export async function buscarAlunos() {
  const resposta = await axios.get(`${API_URL}/api/alunos`);
  return resposta.data;
}

export async function buscarRelatoriosPublicados() {
  const resposta = await axios.get(`${API_URL}/api/acompanhamentos`);
  return resposta.data.filter((item) => item.status === 'PUBLICADO');
}

export function mensagemDeErro(error) {
  return 'Não foi possível carregar os dados. Verifique sua conexão com o servidor.';
}