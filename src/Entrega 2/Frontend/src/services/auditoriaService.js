import api, { extrairLista } from './api';

// Contrato PROPOSTO (o backend ainda não tem):
// GET /auditoria → { id, dataHora, usuario, acao, entidade, idEntidade, descricao, antes, depois }
// acao: CRIAR | EDITAR | ENVIAR | PUBLICAR | DEVOLVER | CANCELAR | EXCLUIR
export async function listarAuditoria(filtros = {}) {
  const resposta = await api.get('/auditoria', { params: filtros });
  return extrairLista(resposta.data);
}