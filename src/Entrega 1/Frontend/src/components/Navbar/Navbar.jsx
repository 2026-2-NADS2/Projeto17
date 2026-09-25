import { Link } from 'react-router-dom';
import logo from '../../assets/Logo_ClassSync.svg';
import './Navbar.css';

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="ClassSync" />
      </Link>

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