const AcompanhamentoRepository = require("../repositories/AcompanhamentoRepository");
const Acompanhamento = require("../models/Acompanhamento");
const ErroApp = require("../errors/ErroApp");

const STATUS_VALIDOS = ["RASCUNHO", "ENVIADO", "EM_REVISAO", "PUBLICADO", "DEVOLVIDO", "CANCELADO"];

class AcompanhamentoService {
  // Cada perfil só enxerga a sua "fatia" dos dados
  #filtrosDoPerfil(usuario) {
    if (usuario.perfil === "PROFESSOR") return { idProfessor: usuario.id };
    if (usuario.perfil === "RESPONSAVEL") return { idResponsavel: usuario.id, status: "PUBLICADO" };
    return {}; // ADMIN vê tudo
  }

  async listarAcompanhamentos(usuario, query = {}) {
    const filtros = {};

    if (query.status) {
      if (!STATUS_VALIDOS.includes(query.status)) {
        throw new ErroApp("Status inválido.", 400);
      }
      filtros.status = query.status;
    }
    if (query.idAluno) filtros.idAluno = Number(query.idAluno);

    // O filtro do perfil vem POR ÚLTIMO: ele "vence" o que veio na URL
    return await AcompanhamentoRepository.listar({ ...filtros, ...this.#filtrosDoPerfil(usuario) });
  }

  async buscarAcompanhamento(id, usuario) {
    const [acompanhamento] = await AcompanhamentoRepository.listar({
      ...this.#filtrosDoPerfil(usuario),
      id: Number(id),
    });
    if (!acompanhamento) {
      throw new ErroApp("Acompanhamento não encontrado.", 404);
    }
    return acompanhamento;
  }

  async registrarAcompanhamento(dados, usuario) {
    const acompanhamento = new Acompanhamento(
      dados.idAluno,
      dados.idDisciplina,
      usuario.id, // o professor vem do TOKEN, não do corpo da requisição
      dados.idBimestre,
      dados.media ?? null,
      dados.descricao ?? null
    );
    acompanhamento.validar();

    const tags = await this.#validarTags(dados.tags);

    let id;
    try {
      id = await AcompanhamentoRepository.criar(acompanhamento);
    } catch (error) {
      this.#traduzirErroDoBanco(error);
    }

    await AcompanhamentoRepository.definirTags(id, tags ?? []);
    return await this.buscarAcompanhamento(id, usuario);
  }

  async atualizarAcompanhamento(id, dados, usuario) {
    const acompanhamento = await this.#buscarModelo(id);
    this.#garantirAutor(acompanhamento, usuario);

    acompanhamento.atualizarDados(dados.media ?? null, dados.descricao ?? null);
    const tags = await this.#validarTags(dados.tags);

    await AcompanhamentoRepository.atualizarDados(id, acompanhamento.media, acompanhamento.descricao);
    if (tags) await AcompanhamentoRepository.definirTags(id, tags);

    return await this.buscarAcompanhamento(id, usuario);
  }

  async enviarParaRevisao(id, usuario) {
    const acompanhamento = await this.#buscarModelo(id);
    this.#garantirAutor(acompanhamento, usuario);

    acompanhamento.enviarParaRevisao();
    await AcompanhamentoRepository.atualizarStatus(id, acompanhamento.status, acompanhamento.motivoDevolucao);
    return await this.buscarAcompanhamento(id, usuario);
  }

  async devolverAcompanhamento(id, motivo, usuario) {
    const acompanhamento = await this.#buscarModelo(id);

    acompanhamento.devolver(motivo);
    await AcompanhamentoRepository.atualizarStatus(id, acompanhamento.status, acompanhamento.motivoDevolucao);
    return await this.buscarAcompanhamento(id, usuario);
  }

  async publicarAcompanhamento(id, usuario) {
    const acompanhamento = await this.#buscarModelo(id);

    acompanhamento.publicar();
    await AcompanhamentoRepository.atualizarStatus(id, acompanhamento.status, null);
    return await this.buscarAcompanhamento(id, usuario);
  }

  async excluirAcompanhamento(id) {
    await this.#buscarModelo(id);
    await AcompanhamentoRepository.excluir(id);
    return true;
  }

  // ---------- métodos privados de apoio ----------

  async #buscarModelo(id) {
    const acompanhamento = await AcompanhamentoRepository.buscarPorId(id);
    if (!acompanhamento) {
      throw new ErroApp("Acompanhamento não encontrado.", 404);
    }
    return acompanhamento;
  }

  #garantirAutor(acompanhamento, usuario) {
    if (acompanhamento.idProfessor !== usuario.id) {
      throw new ErroApp("Você só pode alterar seus próprios acompanhamentos.", 403);
    }
  }

  // undefined = "não mexer nas tags"; array = "as tags passam a ser estas"
  async #validarTags(tags) {
    if (tags === undefined) return null;
    if (!Array.isArray(tags) || !tags.every(Number.isInteger)) {
      throw new ErroApp("As tags devem ser uma lista de IDs numéricos.", 400);
    }
    const semRepetir = [...new Set(tags)];
    if (!(await AcompanhamentoRepository.tagsExistem(semRepetir))) {
      throw new ErroApp("Uma ou mais tags não existem.", 400);
    }
    return semRepetir;
  }

  #traduzirErroDoBanco(error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new ErroApp("Já existe um acompanhamento para este aluno, disciplina e bimestre.", 409);
    }
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      throw new ErroApp("Aluno, disciplina ou bimestre não encontrado.", 400);
    }
    throw error; // erro inesperado: vira 500 no controller
  }
}

module.exports = new AcompanhamentoService();