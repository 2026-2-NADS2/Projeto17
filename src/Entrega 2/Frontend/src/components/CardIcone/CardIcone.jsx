import './CardIcone.css';

function CardIcone({ Icone, titulo, children }) {
  return (
    <article className="card card-icone">
      <span className="card-icone-simbolo">
        <Icone size={18} />
      </span>
      <h2 className="card-icone-titulo">{titulo}</h2>
      {children}
    </article>
  );
}

export default CardIcone;