import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-logo">
        <span className="navbar-logo-icon">◆</span>
        <span className="navbar-logo-texto">
          Class<span className="navbar-logo-sync">Sync</span>
        </span>
      </div>

      <nav className="navbar-links">
        <Link to="/servicos">Serviços</Link>
        <Link to="/institucional">Institucional</Link>
        <Link to="/contato">Contato</Link>
      </nav>

      <Link to="/entrar" className="navbar-btn-entrar">
        Entrar
      </Link>
    </header>
  );
}

export default Navbar;