import './EmBreveCard.css';

function EmBreveCard({ texto }) {
  return (
    <div className="em-breve-card">
      <span className="em-breve-tag">EM BREVE</span>
      <p>{texto}</p>
    </div>
  );
}

export default EmBreveCard;