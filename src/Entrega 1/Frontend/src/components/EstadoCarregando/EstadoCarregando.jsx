import './EstadoCarregando.css';

function EstadoCarregando({ mensagem = 'Carregando...' }) {
  return (
    <div className="estado-carregando" role="status" aria-live="polite">
      <span className="estado-carregando__spinner" aria-hidden="true" />
      <p>{mensagem}</p>
    </div>
  );
}

export default EstadoCarregando;