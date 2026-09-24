import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-colunas">
        <div className="footer-coluna">
          <h4>PRODUTO</h4>
          <Link to="/servicos">Serviços</Link>
          <Link to="/entrar">Acessar plataforma</Link>
        </div>

        <div className="footer-coluna">
          <h4>EMPRESA</h4>
          <Link to="/institucional">Sobre a KFKA</Link>
          <Link to="/contato">Contato</Link>
        </div>

        <div className="footer-coluna">
          <h4>LEGAL</h4>
          <Link to="/politica-privacidade">Política de privacidade</Link>
          <Link to="/lgpd">Dados protegidos (LGPD)</Link>
        </div>
      </div>

      <hr className="footer-linha" />

      <p className="footer-copyright">
        © 2026 ClassSync — desenvolvido por KFKA Technology Consulting
      </p>
    </footer>
  );
}

export default Footer;