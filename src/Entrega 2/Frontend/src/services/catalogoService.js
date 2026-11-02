import api, { extrairLista } from './api';

export async function listarTags() {
  const resposta = await api.get('/tags');
  return extrairLista(resposta.data);
}

export async function listarDisciplinas() {
  const resposta = await api.get('/disciplinas');
  return extrairLista(resposta.data);
}

export async function listarTurmas() {
  const resposta = await api.get('/turmas');
  return extrairLista(resposta.data);
}

export async function listarBimestres() {
  const resposta = await api.get('/bimestres');
  return extrairLista(resposta.data);
}