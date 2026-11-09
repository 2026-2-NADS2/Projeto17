import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import logo from '../../assets/Logo_ClassSync.svg';
import { obterUsuario, sair } from '../../services/authService';
import { pegarIniciais } from '../../utils/relatorios';
import './LayoutResponsavel.css';

const ITENS = [
  { rotulo: 'Início', para: '/responsavel', exato: true },
  { rotulo: 'Meus alunos', para: '/responsavel/alunos' },
  { rotulo: 'Relatórios', para: '/responsavel/relatorios' },
  { rotulo: 'Meu perfil', para: '/responsavel/perfil' },
];

function LayoutResponsavel() {
  const navigate = useNavigate();
  const nome = obterUsuario()?.nome ?? 'Responsável';

  function handleSair() {
    sair();
    navigate('/entrar');
  }

  return (
    <div className="layout-resp">
      <aside className="layout-resp__menu">
        <div>
          <img src={logo} alt="ClassSync" className="layout-resp__logo" />
          <span className="layout-resp__perfil">PAI/RESPONSÁVEL</span>
          <nav className="layout-resp__nav" aria-label="Menu do responsável">
            {ITENS.map((item) => (
              <NavLink
                key={item.para}
                to={item.para}
                end={item.exato}
                className={({ isActive }) =>
                  `layout-resp__link ${isActive ? 'layout-resp__link--ativo' : ''}`
                }
              >
                {item.rotulo}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="layout-resp__usuario">
          <div className="layout-resp__usuario-linha">
            <span className="layout-resp__avatar" aria-hidden="true">{pegarIniciais(nome)}</span>
            <div>
              <strong className="layout-resp__nome">{nome}</strong>
              <span className="layout-resp__papel">Responsável</span>
            </div>
          </div>
          <button type="button" className="layout-resp__sair" onClick={handleSair}>
            Sair
          </button>
        </div>
      </aside>

      <main className="layout-resp__conteudo">
        <Outlet />
      </main>
    </div>
  );
}

export default LayoutResponsavel;