import { Link } from 'react-router-dom';
import './SidebarAdmin.css';

// Itens do menu. Só "Visão geral" existe por enquanto; os outros aparecem como "em breve".
const itensMenu = [
  { rotulo: 'Visão geral', ativo: true },
  { rotulo: 'Acompanhamentos', emBreve: true },
  { rotulo: 'Alunos', emBreve: true },
  { rotulo: 'Professores', emBreve: true },
];

function SidebarAdmin() {
  return (
    <aside className="sidebar-admin">
      <div className="sidebar-admin__topo">
        <span className="sidebar-admin__marca">ClassSync</span>
        <span className="sidebar-admin__perfil">Administração</span>
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

      <Link to="/" className="sidebar-admin__sair">Sair</Link>
    </aside>
  );
}

export default SidebarAdmin;