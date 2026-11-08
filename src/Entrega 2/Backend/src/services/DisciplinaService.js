const DisciplinaRepository = require("../repositories/DisciplinaRepository");
const ErroApp = require("../errors/ErroApp");

class DisciplinaService {
  // ----- Áreas -----
  async listarAreas() {
    return await DisciplinaRepository.listarAreas();
  }

  async criarArea(dados = {}) {
    const nome = String(dados.nome ?? "").trim();
    if (!nome || nome.length > 80) {
      throw new ErroApp("Informe o nome da área (até 80 caracteres).");
    }

    try {
      const id = await DisciplinaRepository.criarArea(nome);
      return { id, nome };
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") throw new ErroApp(`A área ${nome} já existe.`, 409);
      throw error;
    }
  }

  // ----- Disciplinas -----
  async listarDisciplinas() {
    return await DisciplinaRepository.listar();
  }

  async criarDisciplina(dados) {
    const disciplina = await this.#validar(dados);
    try {
      const id = await DisciplinaRepository.criar(disciplina);
      return await DisciplinaRepository.buscarPorId(id);
    } catch (error) {
      throw this.#traduzirErroDoBanco(error, disciplina);
    }
  }

  async atualizarDisciplina(id, dados) {
    await this.#garantirExiste(id);
    const disciplina = await this.#validar(dados);
    try {
      await DisciplinaRepository.atualizar(Number(id), disciplina);
      return await DisciplinaRepository.buscarPorId(Number(id));
    } catch (error) {
      throw this.#traduzirErroDoBanco(error, disciplina);
    }
  }

  async excluirDisciplina(id) {
    const disciplina = await this.#garantirExiste(id);
    const { vinculos, acompanhamentos } = await DisciplinaRepository.contarDependencias(disciplina.id);

    if (vinculos > 0 || acompanhamentos > 0) {
      throw new ErroApp(
        `Não é possível excluir ${disciplina.nome}: ela tem ${vinculos} vínculo(s) de professor e ` +
          `${acompanhamentos} acompanhamento(s) registrados.`,
        409
      );
    }
    await DisciplinaRepository.excluir(disciplina.id);
  }

  async #garantirExiste(id) {
    const disciplina = Number.isInteger(Number(id)) ? await DisciplinaRepository.buscarPorId(Number(id)) : null;
    if (!disciplina) throw new ErroApp("Disciplina não encontrada.", 404);
    return disciplina;
  }

  // async porque precisa consultar o banco para saber se a área existe
  async #validar(dados = {}) {
    const nome = String(dados.nome ?? "").trim();
    const codigo = String(dados.codigo ?? "").trim().toUpperCase();
    const idArea = Number(dados.idArea);

    if (!nome || nome.length > 80) {
      throw new ErroApp("Informe o nome da disciplina (até 80 caracteres).");
    }
    if (!/^[A-Z0-9]{2,10}$/.test(codigo)) {
      throw new ErroApp("O código deve ter de 2 a 10 letras ou números, sem espaços (ex.: MAT).");
    }
    if (!Number.isInteger(idArea) || !(await DisciplinaRepository.buscarArea(idArea))) {
      throw new ErroApp("Escolha uma área válida.");
    }
    return { nome, codigo, idArea };
  }

  // A tabela tem dois UNIQUE (nome e codigo): a mensagem do MySQL diz qual deles repetiu
  #traduzirErroDoBanco(error, disciplina) {
    if (error.code !== "ER_DUP_ENTRY") return error;
    if (error.sqlMessage?.includes("codigo")) {
      return new ErroApp(`Já existe uma disciplina com o código ${disciplina.codigo}.`, 409);
    }
    return new ErroApp(`Já existe a disciplina ${disciplina.nome}.`, 409);
  }
}

module.exports = new DisciplinaService();