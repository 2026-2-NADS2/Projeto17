import { NavLink, useNavigate } from 'react-router-dom';
import {
  House,
  ClipboardCheck,
  MessageSquare,
  User,
  GraduationCap,
  Users,
  BookOpen,
  Layers,
  Tag,
  Link as IconeVinculo,
  Calendar,
  ChartColumn,
  History,
  CircleUser,
  LogOut,
} from 'lucide-react';
import { sair, obterUsuario } from '../../services/authService';
import './SidebarAdmin.css';

// Menu igual ao Figma (A01). Itens com "para" são links; os outros aparecem apagados até a tela existir.
// "exato": só destaca no endereço exato (senão "/admin" acenderia em todas as telas do admin).
const grupos = [
  {
    titulo: null,
    itens: [{ rotulo: 'Visão geral', para: '/admin', exato: true, Icone: House }],
  },
  {
    titulo: 'Acompanhamentos',
    itens: [
      { rotulo: 'Revisão e publicação', para: '/admin/revisao', Icone: ClipboardCheck },
      { rotulo: 'Retornos das famílias', Icone: MessageSquare },
    ],
  },
  {
    titulo: 'Cadastros',
    itens: [
      { rotulo: 'Usuários', para: '/admin/usuarios', Icone: User },
      { rotulo: 'Alunos', para: '/admin/alunos', Icone: GraduationCap },
      { rotulo: 'Responsáveis', para: '/admin/responsaveis', Icone: Users },
      { rotulo: 'Professores', para: '/admin/professores', Icone: BookOpen },
      { rotulo: 'Áreas e disciplinas', Icone: Layers },
      { rotulo: 'Turmas', Icone: Layers },
      { rotulo: 'Tags', Icone: Tag },
    ],
  },
  {
    titulo: 'Estrutura acadêmica',
    itens: [
      { rotulo: 'Vínculos acadêmicos', Icone: IconeVinculo },
      { rotulo: 'Períodos bimestrais', Icone: Calendar },
    ],
  },
  {
    titulo: 'Análise',
    itens: [
      { rotulo: 'Relatórios gerenciais', Icone: ChartColumn },
      { rotulo: 'Histórico e auditoria', Icone: History },
      { rotulo: 'Meu perfil', Icone: CircleUser },
    ],
  },
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
        {grupos.map((grupo) => (
          <div key={grupo.titulo ?? 'inicio'} className="sidebar-admin__grupo">
            {grupo.titulo && <span className="sidebar-admin__grupo-titulo">{grupo.titulo}</span>}

            <ul className="sidebar-admin__menu">
              {grupo.itens.map((item) => (
                <li key={item.rotulo}>
                  {item.para ? (
                    <NavLink
                      to={item.para}
                      end={item.exato}
                      className={({ isActive }) =>
                        `sidebar-admin__item ${isActive ? 'sidebar-admin__item--ativo' : ''}`
                      }
                    >
                      <item.Icone size={18} aria-hidden="true" />
                      <span>{item.rotulo}</span>
                    </NavLink>
                  ) : (
                    <span
                      className="sidebar-admin__item sidebar-admin__item--desativado"
                      aria-disabled="true"
                      title="Em breve"
                    >
                      <item.Icone size={18} aria-hidden="true" />
                      <span>{item.rotulo}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
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
          <LogOut size={16} aria-hidden="true" />
          Sair
        </button>
      </div>
    </aside>
  );
}

export default SidebarAdmin;