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