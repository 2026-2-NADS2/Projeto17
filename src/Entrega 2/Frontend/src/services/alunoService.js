import api, { extrairLista } from './api';

export async function listarAlunos() {
  const resposta = await api.get('/alunos');
  return extrairLista(resposta.data);
}

// dados: { nome, dataNascimento: "2012-03-14", idTurma: 1 }
export async function criarAluno(dados) {
  const resposta = await api.post('/alunos', dados);
  return resposta.data;
}

export async function atualizarAluno(id, dados) {
  const resposta = await api.put(`/alunos/${id}`, dados);
  return resposta.data;
}

export async function excluirAluno(id) {
  const resposta = await api.delete(`/alunos/${id}`);
  return resposta.data;
}