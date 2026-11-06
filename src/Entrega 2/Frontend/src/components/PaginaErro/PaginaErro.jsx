import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './PaginaErro.css';

// Layout comum das páginas de erro (404, 403...). Cada página passa só o que muda.
function PaginaErro({ codigo, titulo, texto, destino, textoBotao, variante = 'info' }) {
  return (
    <section className="pagina-erro">
      <p className={`pagina-erro-codigo pagina-erro-codigo--${variante}`}>{codigo}</p>
      <h1>{titulo}</h1>
      <p className="pagina-erro-texto">{texto}</p>
      <Link to={destino} className="botao botao--link">
        <ArrowLeft size={16} />
        {textoBotao}
      </Link>
    </section>
  );
}

export default PaginaErro;