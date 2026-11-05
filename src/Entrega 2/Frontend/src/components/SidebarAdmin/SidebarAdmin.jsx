import { useNavigate } from 'react-router-dom';
import { sair, obterUsuario } from '../../services/authService';
import './SidebarAdmin.css';

// Itens do menu. Só "Visão geral" existe por enquanto; os outros aparecem como "em breve".
const itensMenu = [
  { rotulo: 'Visão geral', ativo: true },
  { rotulo: 'Acompanhamentos', emBreve: true },
  { rotulo: 'Alunos', emBreve: true },
  { rotulo: 'Professores', emBreve: true },
];

function SidebarAdmin() {
  const navigate = useNavigate();
  const usuario = obterUsuario();

  function handleSair() {
    sair();              // 1. apaga token e usuário do localStorage
    navigate('/entrar'); // 2. leva para a tela de login
  }
  return (
    <aside className="sidebar-admin">
      <div className="sidebar-admin__topo">
        <span className="sidebar-admin__marca">ClassSync</span>
        <span className="sidebar-admin__perfil">Administração</span>
        <span className="sidebar-admin__usuario">{usuario?.nome ?? 'Administrador'}</span>
      </div>

      <nav className="sidebar-admin__nav" aria-label="Menu do administrador">
        <ul className="sidebar-admin__menu">
          {itensMenu.map((item) => (
            <li
              key={item.rotulo}
              className={`sidebar-admin__item ${item.ativo ? 'sidebar-admin__item--ativo' : ''}`}
              aria-current={item.ativo ? 'page' : undefined}
            >
              {item.rotulo}
              {item.emBreve && <span className="sidebar-admin__tag">em breve</span>}
            </li>
          ))}
        </ul>
      </nav>

      <button type="button" className="sidebar-admin__sair" onClick={handleSair}>
        Sair
      </button>
    </aside>
  );
}

export default SidebarAdmin;