const TurmaRepository = require("../repositories/TurmaRepository");
const ErroApp = require("../errors/ErroApp");

const TURNOS = ["MANHA", "TARDE", "NOITE"];

class TurmaService {
  async listarTurmas() {
    return await TurmaRepository.listar();
  }

  async criarTurma(dados) {
    const turma = this.#validar(dados);
    const idAnoLetivo = await TurmaRepository.obterIdAnoLetivo(turma.anoLetivo);

    try {
      const id = await TurmaRepository.criar({ ...turma, idAnoLetivo });
      return await TurmaRepository.buscarPorId(id);
    } catch (error) {
      throw this.#traduzirErroDoBanco(error, turma);
    }
  }

  async atualizarTurma(id, dados) {
    await this.#garantirExiste(id);
    const turma = this.#validar(dados);
    const idAnoLetivo = await TurmaRepository.obterIdAnoLetivo(turma.anoLetivo);

    try {
      await TurmaRepository.atualizar(Number(id), { ...turma, idAnoLetivo });
      return await TurmaRepository.buscarPorId(Number(id));
    } catch (error) {
      throw this.#traduzirErroDoBanco(error, turma);
    }
  }

  async excluirTurma(id) {
    const turma = await this.#garantirExiste(id);
    const { alunos, vinculos } = await TurmaRepository.contarDependencias(turma.id);

    if (alunos > 0 || vinculos > 0) {
      throw new ErroApp(
        `Não é possível excluir a turma ${turma.nome}: ela tem ${alunos} aluno(s) e ` +
          `${vinculos} vínculo(s) de professor. Transfira os alunos e remova os vínculos antes.`,
        409
      );
    }
    await TurmaRepository.excluir(turma.id);
  }

  async #garantirExiste(id) {
    const turma = Number.isInteger(Number(id)) ? await TurmaRepository.buscarPorId(Number(id)) : null;
    if (!turma) throw new ErroApp("Turma não encontrada.", 404);
    return turma;
  }

  // Confere os campos e devolve uma versão "limpa" (sem espaços sobrando, turno em maiúsculas)
  #validar(dados = {}) {
    const nome = String(dados.nome ?? "").trim();
    const serie = String(dados.serie ?? "").trim();
    const turno = String(dados.turno ?? "").trim().toUpperCase();
    const anoLetivo = Number(dados.anoLetivo);

    if (!nome || nome.length > 40) {
      throw new ErroApp("Informe o nome da turma (até 40 caracteres).");
    }
    if (!serie || serie.length > 20) {
      throw new ErroApp("Informe a série (até 20 caracteres).");
    }
    if (!TURNOS.includes(turno)) {
      throw new ErroApp("Turno inválido. Use MANHA, TARDE ou NOITE.");
    }
    if (!Number.isInteger(anoLetivo) || anoLetivo < 2000 || anoLetivo > 2100) {
      throw new ErroApp("Ano letivo inválido (ex.: 2026).");
    }
    return { nome, serie, turno, anoLetivo };
  }

  // UNIQUE (id_ano_letivo, nome) no banco → mensagem amigável com status 409
  #traduzirErroDoBanco(error, turma) {
    if (error.code === "ER_DUP_ENTRY") {
            return new ErroApp(`Já existe a turma ${turma.nome} no ano letivo ${turma.anoLetivo}. ` +`Para outro turno, use outro nome (ex.: ${turma.nome} – Tarde).`,409);
    }
    return error;
  }
}

module.exports = new TurmaService();