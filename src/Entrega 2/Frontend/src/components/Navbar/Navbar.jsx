import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../../assets/Logo_ClassSync_Branco.png';
import './Navbar.css';

function Navbar() {
  const { pathname } = useLocation();
  // Celular: os links ficam escondidos e abrem pelo botão ☰.
  // Guardamos EM QUAL PÁGINA o menu foi aberto: ao trocar de página,
  // a comparação dá falso e o menu fecha sozinho (sem precisar de useEffect).
  const [menuAbertoEm, setMenuAbertoEm] = useState(null);
  const menuAberto = menuAbertoEm === pathname;

  return (
    <header className={`navbar ${menuAberto ? 'navbar--aberta' : ''}`}>
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="ClassSync" />
      </Link>

      <nav className="navbar-links">
        <Link to="/servicos">Serviços</Link>
        <Link to="/institucional">Institucional</Link>
        <Link to="/contato">Contato</Link>
      </nav>

      <div className="navbar-acoes">
        <Link to="/entrar" className="navbar-btn-entrar">
          Entrar
        </Link>

        {/* Botão ☰: só aparece no celular (ver Navbar.css) */}
        <button
          type="button"
          className="navbar-menu-botao"
          onClick={() => setMenuAbertoEm(menuAberto ? null : pathname)}
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuAberto}
        >
          {menuAberto ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
