const AuditoriaRepository = require("../repositories/AuditoriaRepository");

// Status novo → ação que a tela de Histórico entende
const ACAO_POR_STATUS = {
  ENVIADO: "ENVIAR",
  PUBLICADO: "PUBLICAR",
  DEVOLVIDO: "DEVOLVER",
  CANCELADO: "CANCELAR",
};

// Ação → como ela aparece na frase ("Enviou para revisão o acompanhamento de ...")
const VERBOS = {
  CRIAR: "Criou o",
  EDITAR: "Alterou o status do",
  ENVIAR: "Enviou para revisão o",
  PUBLICAR: "Publicou para a família o",
  DEVOLVER: "Devolveu ao professor o",
  CANCELAR: "Cancelou o",
};

class AuditoriaService {
  async listarAuditoria() {
    const historico = await AuditoriaRepository.listarHistorico();
    return historico.map((linha) => this.#paraRegistro(linha));
  }

  // Uma linha do histórico → um registro no formato da tela de Histórico e auditoria
  #paraRegistro(linha) {
    const acao = linha.status_anterior === null
      ? "CRIAR" // o trigger de INSERT grava "de nada para RASCUNHO"
      : ACAO_POR_STATUS[linha.status_novo] ?? "EDITAR";

    const contexto = `${linha.nome_aluno} (${linha.nome_disciplina}, ${linha.numero_bimestre}º bimestre)`;

    return {
      id: linha.id_historico,
      dataHora: linha.data_hora,
      usuario: linha.id_usuario ? { id: linha.id_usuario, nome: linha.nome_usuario } : "Sistema",
      acao,
      entidade: "ACOMPANHAMENTO",
      idEntidade: linha.id_acompanhamento,
      descricao: `${VERBOS[acao]} acompanhamento de ${contexto}.`,
      antes: linha.status_anterior ? { status: linha.status_anterior } : null,
      depois: { status: linha.status_novo },
    };
  }
}

module.exports = new AuditoriaService();