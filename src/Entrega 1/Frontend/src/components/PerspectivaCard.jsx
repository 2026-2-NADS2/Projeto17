import './PerspectivaCard.css';

function PerspectivaCard({ titulo, descricao }) {
  return (
    <div className="perspectiva-card">
      <div className="perspectiva-card-icone">
        <span>◆</span>
      </div>
      <h3>{titulo}</h3>
      <p>{descricao}</p>
    </div>
  );
}

export default PerspectivaCard;