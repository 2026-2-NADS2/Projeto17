const BimestreRepository = require("../repositories/BimestreRepository");
const ErroApp = require("../errors/ErroApp");

// Aceita "2026-10-13T00:00" (o que o <input type="datetime-local"> manda)
const FORMATO_DATA_HORA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

// "2026-10-13T00:00" → "13/10/2026 00:00" (para as mensagens de erro)
function formatar(dataHora) {
  const [data, hora] = dataHora.split("T");
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano} ${hora}`;
}

function validarDataHora(valor, nomeCampo) {
  const texto = String(valor ?? "").trim().slice(0, 16);
  if (!FORMATO_DATA_HORA.test(texto) || Number.isNaN(new Date(texto).getTime())) {
    throw new ErroApp(`Informe a data de ${nomeCampo} no formato AAAA-MM-DDTHH:MM.`);
  }
  return texto;
}

class BimestreService {
  async listarBimestres(query = {}) {
    const anoLetivo = query.anoLetivo ? Number(query.anoLetivo) : null;
    if (query.anoLetivo && !Number.isInteger(anoLetivo)) {
      throw new ErroApp("Ano letivo inválido.");
    }
    return await BimestreRepository.listar(anoLetivo);
  }

  async atualizarPeriodo(id, dados = {}) {
    const bimestre = Number.isInteger(Number(id)) ? await BimestreRepository.buscarPorId(Number(id)) : null;
    if (!bimestre) throw new ErroApp("Bimestre não encontrado.", 404);

    const abertura = validarDataHora(dados.dataAbertura, "abertura");
    const encerramento = validarDataHora(dados.dataEncerramento, "encerramento");

    // Textos no mesmo formato podem ser comparados direto: "2026-10-13T00:00" < "2026-12-11T23:59"
    if (encerramento <= abertura) {
      throw new ErroApp("O encerramento precisa ser depois da abertura.");
    }

    // Os bimestres não podem se sobrepor e precisam seguir a ordem 1º → 4º
    const vizinhos = await BimestreRepository.listarVizinhos(bimestre.id);
    for (const outro of vizinhos) {
      if (outro.numero < bimestre.numero && abertura <= outro.dataEncerramento) {
        throw new ErroApp(
          `O ${bimestre.numero}º bimestre precisa começar depois do fim do ${outro.numero}º ` +
            `(${formatar(outro.dataEncerramento)}).`
        );
      }
      if (outro.numero > bimestre.numero && encerramento >= outro.dataAbertura) {
        throw new ErroApp(
          `O ${bimestre.numero}º bimestre precisa terminar antes do início do ${outro.numero}º ` +
            `(${formatar(outro.dataAbertura)}).`
        );
      }
    }

    // Abertura vale desde o segundo 00; encerramento vale até o segundo 59 do minuto escolhido
    await BimestreRepository.atualizarPeriodo(bimestre.id, `${abertura}:00`, `${encerramento}:59`);
    return await BimestreRepository.buscarPorId(bimestre.id);
  }
}

module.exports = new BimestreService();