const TagRepository = require("../repositories/TagRepository");
const ErroApp = require("../errors/ErroApp");

class TagService {
  async listarTags() {
    return await TagRepository.listar();
  }

  async criarTag(dados) {
    const tag = this.#validar(dados);
    try {
      const id = await TagRepository.criar(tag);
      return await TagRepository.buscarPorId(id);
    } catch (error) {
      throw this.#traduzirErroDoBanco(error, tag);
    }
  }

  async atualizarTag(id, dados) {
    const existente = await this.#garantirExiste(id);
    const tag = this.#validar(dados);
    try {
      await TagRepository.atualizar(existente.id, tag);
      return await TagRepository.buscarPorId(existente.id);
    } catch (error) {
      throw this.#traduzirErroDoBanco(error, tag);
    }
  }

  // Tag já usada não pode sumir: os acompanhamentos antigos perderiam a informação
  async excluirTag(id) {
    const tag = await this.#garantirExiste(id);
    if (tag.usos > 0) {
      throw new ErroApp(
        `A tag ${tag.nome} já foi usada em ${tag.usos} acompanhamento(s) e não pode ser excluída. ` +
          "Você pode renomeá-la ou ajustar a descrição.",
        409
      );
    }
    await TagRepository.excluir(tag.id);
  }

  async #garantirExiste(id) {
    const tag = Number.isInteger(Number(id)) ? await TagRepository.buscarPorId(Number(id)) : null;
    if (!tag) throw new ErroApp("Tag não encontrada.", 404);
    return tag;
  }

  #validar(dados = {}) {
    const nome = String(dados.nome ?? "").trim();
    const descricao = String(dados.descricao ?? "").trim();

    if (!nome || nome.length > 40) {
      throw new ErroApp("Informe o nome da tag (até 40 caracteres).");
    }
    if (descricao.length > 200) {
      throw new ErroApp("A descrição pode ter até 200 caracteres.");
    }
    return { nome, descricao: descricao || null };
  }

  #traduzirErroDoBanco(error, tag) {
    if (error.code === "ER_DUP_ENTRY") {
      return new ErroApp(`Já existe a tag ${tag.nome}.`, 409);
    }
    return error;
  }
}

module.exports = new TagService();