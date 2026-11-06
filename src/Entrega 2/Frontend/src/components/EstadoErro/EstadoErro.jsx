import './EstadoErro.css';

// "titulo" é opcional: quem não passar continua vendo o texto de antes
function EstadoErro({
  titulo = 'Não foi possível carregar os acompanhamentos',
  mensagem,
  onTentarNovamente,
  onUsarExemplo,
}) {
  return (
    <div className="estado-erro" role="alert">
      <span className="estado-erro__icone" aria-hidden="true">!</span>
      <h2>{titulo}</h2>
      <p>{mensagem}</p>

      <div className="estado-erro__acoes">
        {onTentarNovamente && (
          <button type="button" className="estado-erro__botao estado-erro__botao--primario" onClick={onTentarNovamente}>
            Tentar novamente
          </button>
        )}
        {onUsarExemplo && (
          <button type="button" className="estado-erro__botao estado-erro__botao--secundario" onClick={onUsarExemplo}>
            Ver com dados de exemplo
          </button>
        )}
      </div>
    </div>
  );
}

export default EstadoErro;