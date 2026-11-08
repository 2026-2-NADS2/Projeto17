import api, { extrairLista } from './api';

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
  return resposta.data;
}