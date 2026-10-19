import logo from '../../../../assets/Logo_ClassSync.svg';
import './HeaderResponsavel.css';

function HeaderResponsavel({ nomeUsuario, onSair }) {
  return (
    <header className="header-resp">
      <div className="header-resp__logo">
        <img src={logo} alt="ClassSync" className="header-resp__logo-img" />
      </div>

      <span className="header-resp__perfil">PAI/RESPONSÁVEL</span>

      <div className="header-resp__usuario">
        <span className="header-resp__nome">{nomeUsuario}</span>
        <button type="button" className="header-resp__sair" onClick={onSair}>
          Sair
        </button>
      </div>
    </header>
  );
}

export default HeaderResponsavel;