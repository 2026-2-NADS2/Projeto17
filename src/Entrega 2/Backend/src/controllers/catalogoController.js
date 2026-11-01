const CatalogoRepository = require("../repositories/CatalogoRepository");

// Fábrica de handlers: recebe "como buscar" e devolve a função (req, res)
function criarHandler(buscar, mensagemErro) {
  return async (req, res) => {
    try {
      res.status(200).json(await buscar());
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: mensagemErro });
    }
  };
}

module.exports = {
  listarTags: criarHandler(() => CatalogoRepository.listarTags(), "Erro ao buscar tags."),
  listarDisciplinas: criarHandler(() => CatalogoRepository.listarDisciplinas(), "Erro ao buscar disciplinas."),
  listarTurmas: criarHandler(() => CatalogoRepository.listarTurmas(), "Erro ao buscar turmas."),
  listarBimestres: criarHandler(() => CatalogoRepository.listarBimestres(), "Erro ao buscar bimestres."),
};