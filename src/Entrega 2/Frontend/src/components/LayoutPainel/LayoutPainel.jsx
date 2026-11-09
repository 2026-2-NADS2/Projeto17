import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { obterUsuario, sair } from '../../services/authService';
import logo from '../../assets/Logo_ClassSync_Branco.png';
import './LayoutPainel.css';

const NOMES_PERFIL = {
  ADMIN: 'Administrador',
  PROFESSOR: 'Professor',
  RESPONSAVEL: 'Responsável',
};

// "Ricardo Lima" → "RL"
function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

function LayoutPainel({ itens }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const usuario = obterUsuario();
  // Celular/tablet: o menu fica escondido e abre por cima da tela pelo botão ☰.
  // Guardamos EM QUAL PÁGINA o menu foi aberto: ao trocar de página,
  // a comparação dá falso e o menu fecha sozinho (sem precisar de useEffect).
  const [menuAbertoEm, setMenuAbertoEm] = useState(null);
  const menuAberto = menuAbertoEm === pathname;
  const nomePerfil = NOMES_PERFIL[usuario?.perfil] || '';

  function handleSair() {
    sair();
    navigate('/entrar', { replace: true });
  }

  return (
    <div className={`painel ${menuAberto ? 'painel--menu-aberto' : ''}`}>
      {/* Barra do topo: só aparece em telas pequenas (ver LayoutPainel.css) */}
      <header className="painel-topo">
        <button
          type="button"
          className="painel-topo-botao"
          onClick={() => setMenuAbertoEm(menuAberto ? null : pathname)}
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuAberto}
        >
          {menuAberto ? <X size={22} /> : <Menu size={22} />}
        </button>
        <img src={logo} alt="ClassSync" className="painel-topo-logo" />
        <span className="painel-perfil-tag">{nomePerfil.toUpperCase()}</span>
      </header>

      {/* Fundo escuro atrás do menu aberto: clicar fora fecha */}
      <div className="painel-fundo" onClick={() => setMenuAbertoEm(null)} aria-hidden="true" />

      <aside className="painel-sidebar">
        <div className="painel-marca">
          <img src={logo} alt="ClassSync" className="painel-logo" />
          <span className="painel-perfil-tag">{nomePerfil.toUpperCase()}</span>
        </div>

        <nav className="painel-menu">
          {itens.map(({ rota, rotulo, Icone, fim }) => (
            <NavLink key={rota} to={rota} end={fim} className="painel-item">
              <Icone size={20} strokeWidth={2} />
              <span>{rotulo}</span>
            </NavLink>
          ))}
        </nav>

        <div className="painel-rodape">
          <div className="painel-usuario">
            <span className="painel-avatar">{iniciais(usuario?.nome)}</span>
            <div>
              <p className="painel-usuario-nome">{usuario?.nome}</p>
              <p className="painel-usuario-perfil">{nomePerfil}</p>
            </div>
          </div>
          <button type="button" className="painel-sair" onClick={handleSair}>
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      <main className="painel-conteudo">
        <Outlet />
      </main>
    </div>
  );
}

export default LayoutPainel;