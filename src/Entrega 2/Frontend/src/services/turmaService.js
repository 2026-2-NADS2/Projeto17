import api, { extrairLista } from './api';

// Contrato proposto: { id, nome: "6º A", serie: "6º ano", turno: "MANHA" | "TARDE" | "NOITE", anoLetivo: 2026 }
export async function listarTurmas() {
  const resposta = await api.get('/turmas');
  return extrairLista(resposta.data);
}

export async function criarTurma(dados) {
  const resposta = await api.post('/turmas', dados);
  return resposta.data;
}

export async function atualizarTurma(id, dados) {
  const resposta = await api.put(`/turmas/${id}`, dados);
  return resposta.data;
}

export async function excluirTurma(id) {
  const resposta = await api.delete(`/turmas/${id}`);
  return resposta.data;
}