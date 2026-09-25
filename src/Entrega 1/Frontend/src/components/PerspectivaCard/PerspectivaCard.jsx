import iconeModulo from '../../assets/Ícone_módulos.svg';
import './PerspectivaCard.css';

function PerspectivaCard({ titulo, descricao }) {
  return (
    <div className="perspectiva-card">
      <div className="perspectiva-card-icone">
        <img src={iconeModulo} alt="" />
      </div>
      <h3>{titulo}</h3>
      <p>{descricao}</p>
    </div>
  );
}

export default PerspectivaCard;