import api, { extrairLista } from './api';

// Contrato PROPOSTO (o backend ainda não tem):
// GET /retornos → { id, tipo: 'CIENCIA' | 'OBSERVACAO', mensagem, lido, criadoEm,
//                   responsavel, aluno, disciplina, bimestre, anoLetivo, idAcompanhamento }
export async function listarRetornos() {
  const resposta = await api.get('/retornos');
  return extrairLista(resposta.data);
}

// PATCH /retornos/:id/lido
export async function marcarRetornoComoLido(id) {
  const resposta = await api.patch(`/retornos/${id}/lido`);
  return resposta.data;
}