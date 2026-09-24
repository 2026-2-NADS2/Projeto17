import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>A página que você tentou acessar não existe.</p>
      <Link to="/" className="not-found-link">Voltar para o início</Link>
    </div>
  );
}

export default NotFound;