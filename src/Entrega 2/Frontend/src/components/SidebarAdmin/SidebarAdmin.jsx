{ rotulo: 'Usuários', para: '/admin/usuarios' },
import { NavLink, useNavigate } from 'react-router-dom';
import { sair, obterUsuario } from '../../services/authService';
import './SidebarAdmin.css';

// Itens com "para" viram links; os outros aparecem como "em breve" até a tela existir.
// "exato": só destaca no endereço exato (senão "/admin" acenderia em todas as telas do admin).
const itensMenu = [
  { rotulo: 'Visão geral', para: '/admin', exato: true },
  { rotulo: 'Revisão e publicação', para: '/admin/revisao' },
  { rotulo: 'Usuários', emBreve: true },
  { rotulo: 'Alunos', emBreve: true },
  { rotulo: 'Professores', emBreve: true },
];

// "Ana Ribeiro" → "AR" · "Mel" → "M"
function obterIniciais(nome) {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

function SidebarAdmin() {
  const navigate = useNavigate();
  const usuario = obterUsuario();
  const nome = usuario?.nome ?? 'Administrador';

  function handleSair() {
    sair();              // 1. apaga token e usuário do localStorage
    navigate('/entrar'); // 2. leva para a tela de login
  }

  return (
    <aside className="sidebar-admin">
      <div className="sidebar-admin__topo">
        <span className="sidebar-admin__marca">ClassSync</span>
        <span className="sidebar-admin__perfil">Administração</span>
      </div>

      <nav className="sidebar-admin__nav" aria-label="Menu do administrador">
        <ul className="sidebar-admin__menu">
          {itensMenu.map((item) => (
            <li key={item.rotulo}>
              {item.para ? (
                <NavLink
                  to={item.para}
                  end={item.exato}
                  className={({ isActive }) =>
                    `sidebar-admin__item ${isActive ? 'sidebar-admin__item--ativo' : ''}`
                  }
                >
                  {item.rotulo}
                </NavLink>
              ) : (
                <span className="sidebar-admin__item">
                  {item.rotulo}
                  <span className="sidebar-admin__tag">em breve</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-admin__rodape">
        <div className="sidebar-admin__usuario">
          <span className="sidebar-admin__avatar" aria-hidden="true">
            {obterIniciais(nome)}
          </span>
          <div className="sidebar-admin__usuario-info">
            <span className="sidebar-admin__usuario-nome">{nome}</span>
            <span className="sidebar-admin__usuario-cargo">Administrador</span>
          </div>
        </div>

        <button type="button" className="sidebar-admin__sair" onClick={handleSair}>
          Sair
        </button>
      </div>
    </aside>
  );
}

export default SidebarAdmin;