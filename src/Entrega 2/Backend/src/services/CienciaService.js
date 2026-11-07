const CienciaRepository = require("../repositories/CienciaRepository");
const AcompanhamentoRepository = require("../repositories/AcompanhamentoRepository");
const ErroApp = require("../errors/ErroApp");

class CienciaService {
  // Professor: retornos dos registros DELE. Responsável: os que ELE deu. Admin: todos.
  async listarRetornos(usuario, query = {}) {
    const filtros = {};
    if (query.idBimestre) filtros.idBimestre = Number(query.idBimestre);
    if (query.idAcompanhamento) filtros.idAcompanhamento = Number(query.idAcompanhamento);

    if (usuario.perfil === "PROFESSOR") filtros.idProfessor = usuario.id;
    if (usuario.perfil === "RESPONSAVEL") filtros.idResponsavel = usuario.id;

    return await CienciaRepository.listar(filtros);
  }

  // Regra: o responsável só registra ciência de relatório PUBLICADO de um aluno vinculado a ele
  async registrarCiencia(idAcompanhamento, dados = {}, usuario) {
    const id = Number(idAcompanhamento);
    const [relatorio] = Number.isInteger(id)
      ? await AcompanhamentoRepository.listar({ id, idResponsavel: usuario.id, status: "PUBLICADO" })
      : [];
    if (!relatorio) {
      throw new ErroApp("Relatório não encontrado.", 404);
    }

    const observacao = String(dados.observacao ?? "").trim();
    if (observacao.length > 1000) {
      throw new ErroApp("A observação pode ter até 1000 caracteres.");
    }

    try {
      await CienciaRepository.registrar(id, usuario.id, observacao || null);
    } catch (error) {
      // Chave primária (acompanhamento + responsável): uma ciência por pessoa
      if (error.code === "ER_DUP_ENTRY") {
        throw new ErroApp("Você já registrou ciência deste relatório.", 409);
      }
      throw error;
    }

    const [ciencia] = await CienciaRepository.listar({ idAcompanhamento: id, idResponsavel: usuario.id });
    return ciencia;
  }
}

module.exports = new CienciaService();