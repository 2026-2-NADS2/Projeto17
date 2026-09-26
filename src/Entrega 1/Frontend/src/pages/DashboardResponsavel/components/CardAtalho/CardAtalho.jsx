import './CardAtalho.css';

function CardAtalho({ titulo, descricao, selo }) {
  return (
    <article className="card-atalho">
      <div className="card-atalho__icone" aria-hidden="true">
        <span />
      </div>
      <h3 className="card-atalho__titulo">
        {titulo}
        {selo && <span className="card-atalho__selo">{selo}</span>}
      </h3>
      <p className="card-atalho__descricao">{descricao}</p>
    </article>
  );
}

export default CardAtalho;
