import api, { extrairLista } from './api';

// Contrato proposto: { id, numero: 1-4, anoLetivo, dataAbertura, dataEncerramento, aberto }
export async function listarBimestres(anoLetivo) {
  const resposta = await api.get('/bimestres', { params: { anoLetivo } });
  return extrairLista(resposta.data);
}

// dados: { dataAbertura: "2026-08-01T00:00", dataEncerramento: "2026-10-15T23:59" }
export async function atualizarBimestre(id, dados) {
  const resposta = await api.put(`/bimestres/${id}`, dados);
  return resposta.data;
}