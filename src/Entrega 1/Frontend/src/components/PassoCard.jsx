import './PassoCard.css';

function PassoCard({ numero, titulo, descricao }) {
  return (
    <div className="passo-card">
      <div className="passo-numero-linha">
        <div className="passo-numero">{numero}</div>
        <div className="passo-linha" />
      </div>
      <div className="passo-conteudo">
        <h4>{titulo}</h4>
        <p>{descricao}</p>
      </div>
    </div>
  );
}

export default PassoCard;