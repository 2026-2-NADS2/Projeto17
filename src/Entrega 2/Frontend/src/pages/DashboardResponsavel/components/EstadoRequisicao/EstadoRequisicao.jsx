import './EstadoRequisicao.css';

// Um componente só para os 3 estados de uma requisição:
// "carregando", "erro" e "vazio".
function EstadoRequisicao({ tipo, mensagem, onTentarDeNovo }) {
  return (
    <div
      className={`estado-req estado-req--${tipo}`}
      role={tipo === 'erro' ? 'alert' : 'status'}
    >
      {tipo === 'carregando' && <span className="estado-req__spinner" aria-hidden="true" />}
      {tipo === 'erro' && <strong className="estado-req__titulo">Falha ao carregar os dados</strong>}
      <p className="estado-req__mensagem">{mensagem}</p>
      {tipo === 'erro' && onTentarDeNovo && (
        <button type="button" className="estado-req__botao" onClick={onTentarDeNovo}>
          Tentar de novo
        </button>
      )}
    </div>
  );
}

export default EstadoRequisicao;
