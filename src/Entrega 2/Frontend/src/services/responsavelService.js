import api, { extrairLista } from './api';
import { normalizarRelatorio } from '../utils/relatorios';

// A API de alunos manda só o idTurma; buscamos as turmas junto para mostrar o nome ("6º ano A")
export async function buscarAlunos() {
  const [alunos, turmas] = await Promise.all([api.get('/alunos'), api.get('/turmas')]);
  const nomeDaTurma = new Map(extrairLista(turmas.data).map((t) => [t.id, t.nome]));
  return extrairLista(alunos.data).map((a) => ({ ...a, turma: a.turma ?? nomeDaTurma.get(a.idTurma) }));
}

export async function buscarRelatoriosPublicados() {
  const resposta = await api.get('/acompanhamentos');
  return extrairLista(resposta.data)
    .filter((item) => item.status === 'PUBLICADO')
    .map(normalizarRelatorio);
}

export function mensagemDeErro(error) {
  return 'Não foi possível carregar os dados. Verifique sua conexão com o servidor.';
}