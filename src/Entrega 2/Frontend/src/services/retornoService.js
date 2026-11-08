import api, { extrairLista } from './api';

<<<<<<< HEAD
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
=======
// Ciências e observações dos responsáveis.
// Professor recebe as dos registros dele; admin recebe todas; responsável, as que ele deu.
// filtros opcionais: { idBimestre, idAcompanhamento }
export async function listarRetornos(filtros = {}) {
  const resposta = await api.get('/retornos', { params: filtros });
  return extrairLista(resposta.data);
}

// Usada pelo responsável. dados: { observacao } (opcional)
export async function registrarCiencia(idAcompanhamento, dados = {}) {
  const resposta = await api.post(`/acompanhamentos/${idAcompanhamento}/ciencia`, dados);
>>>>>>> main
  return resposta.data;
}