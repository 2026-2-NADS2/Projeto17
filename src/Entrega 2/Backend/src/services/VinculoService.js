const VinculoRepository = require("../repositories/VinculoRepository");
const ErroApp = require("../errors/ErroApp");

class VinculoService {
  // Professor só enxerga os próprios vínculos (são as "Minhas turmas" dele).
  // Admin vê todos e pode filtrar por turma ou professor.
  async listarVinculos(usuario, query = {}) {
    const filtros = {};
    if (query.idTurma) filtros.idTurma = Number(query.idTurma);
    if (query.idProfessor) filtros.idProfessor = Number(query.idProfessor);

    if (usuario.perfil === "PROFESSOR") filtros.idProfessor = usuario.id; // vem por último: vence a URL

    return await VinculoRepository.listar(filtros);
  }

  async criarVinculo(dados = {}) {
    const vinculo = {
      idTurma: Number(dados.idTurma),
      idDisciplina: Number(dados.idDisciplina),
      idProfessor: Number(dados.idProfessor),
    };
    if (!Object.values(vinculo).every(Number.isInteger)) {
      throw new ErroApp("Informe a turma, a disciplina e o professor.");
    }

    const existe = await VinculoRepository.conferirReferencias(vinculo);
    if (!existe.turma) throw new ErroApp("Turma não encontrada.");
    if (!existe.disciplina) throw new ErroApp("Disciplina não encontrada.");
    if (!existe.professor) throw new ErroApp("Professor não encontrado ou inativo.");

    try {
      const id = await VinculoRepository.criar(vinculo);
      return await VinculoRepository.buscarPorId(id);
    } catch (error) {
      // UNIQUE (id_turma, id_disciplina): cada disciplina tem UM professor por turma
      if (error.code === "ER_DUP_ENTRY") {
        throw new ErroApp(
          "Essa disciplina já tem um professor vinculado nessa turma. Exclua o vínculo atual antes.",
          409
        );
      }
      throw error;
    }
  }

  // Excluir o vínculo não apaga acompanhamentos já registrados:
  // o professor só deixa de poder registrar novos nessa turma e disciplina.
  async excluirVinculo(id) {
    const vinculo = Number.isInteger(Number(id)) ? await VinculoRepository.buscarPorId(Number(id)) : null;
    if (!vinculo) throw new ErroApp("Vínculo não encontrado.", 404);
    await VinculoRepository.excluir(vinculo.id);
  }
}

module.exports = new VinculoService();