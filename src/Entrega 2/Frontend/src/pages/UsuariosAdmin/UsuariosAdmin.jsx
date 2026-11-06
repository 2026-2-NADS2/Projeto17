import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';
import EstadoCarregando from '../../components/EstadoCarregando/EstadoCarregando';
import EstadoErro from '../../components/EstadoErro/EstadoErro';
import { listarUsuarios } from '../../services/usuarioService';
import { usuariosExemplo } from './dadosExemplo';
import { NOMES_PERFIL, OPCOES_PERFIL, estaAtivo } from './perfis';
import './UsuariosAdmin.css';

function UsuariosAdmin() {
  const location = useLocation();
  const aviso = location.state?.aviso ?? null; // vem do formulário depois de criar

  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modoExemplo, setModoExemplo] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  const [filtroPerfil, setFiltroPerfil] = useState(''); // '' = todos
  const [busca, setBusca] = useState('');

  // Busca na API sempre que abrir a tela, tentar de novo ou trocar o perfil
  useEffect(() => {
    if (modoExemplo) return;

    let ativo = true;

    async function buscar() {
      try {
        const filtros = filtroPerfil ? { perfil: filtroPerfil } : {};
        const lista = await listarUsuarios(filtros);
        if (ativo) setUsuarios(lista);
      } catch (e) {
        if (ativo) {
          setErro(e.response?.data?.erro ?? e.response?.data?.mensagem ?? 'Não foi possível carregar os usuários.');
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    buscar();
    return () => { ativo = false; };
  }, [tentativa, modoExemplo, filtroPerfil]);

  function tentarNovamente() {
    setCarregando(true);
    setErro(null);
    setModoExemplo(false);
    setTentativa((t) => t + 1);
  }

  function usarDadosExemplo() {
    setUsuarios(usuariosExemplo);
    setErro(null);
    setModoExemplo(true);
  }

  function trocarPerfil(evento) {
    if (!modoExemplo) setCarregando(true);
    setFiltroPerfil(evento.target.value);
  }

  // Filtra também aqui na tela: garante o filtro no modo exemplo e faz a busca por nome/e-mail
  const termo = busca.trim().toLowerCase();
  const visiveis = usuarios.filter((u) => {
    if (filtroPerfil && u.perfil !== filtroPerfil) return false;
    if (!termo) return true;
    return u.nome?.toLowerCase().includes(termo) || u.email?.toLowerCase().includes(termo);
  });

  function renderizarConteudo() {
    if (carregando) return <EstadoCarregando mensagem="Carregando usuários..." />;
    if (erro) {
        return <EstadoErro titulo="Não foi possível carregar os usuários" mensagem={erro} onTentarNovamente={tentarNovamente} onUsarExemplo={usarDadosExemplo} />;
    }
    if (visiveis.length === 0) {
      return <p className="usuarios-admin__vazio">Nenhum usuário encontrado com esses filtros.</p>;
    }

    return (
      <div className="usuarios-admin__tabela-caixa">
        <table className="usuarios-admin__tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Acesso</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((u) => {
              const ativo = estaAtivo(u);
              return (
                <tr key={u.id}>
                  <td className="usuarios-admin__nome">{u.nome}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`usuarios-admin__badge usuarios-admin__badge--${(u.perfil ?? '').toLowerCase()}`}>
                      {NOMES_PERFIL[u.perfil] ?? u.perfil}
                    </span>
                  </td>
                  <td>
                    <span className={`usuarios-admin__badge ${ativo ? 'usuarios-admin__badge--ativo' : 'usuarios-admin__badge--inativo'}`}>
                      {ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="usuarios-admin">
      <SidebarAdmin />

      <main className="usuarios-admin__conteudo">
        <header className="usuarios-admin__topo">
          <div>
            <h1>Usuários</h1>
            <p>Contas de acesso de todos os perfis.</p>
          </div>
          <Link to="/admin/usuarios/novo" className="usuarios-admin__botao-novo">
            + Novo usuário
          </Link>
        </header>

        {aviso && <p className="usuarios-admin__aviso" role="status">{aviso}</p>}

        {modoExemplo && (
          <p className="usuarios-admin__aviso-exemplo" role="note">
            Você está vendo dados de exemplo porque a API não respondeu.
          </p>
        )}

        <div className="usuarios-admin__filtros">
          <label className="usuarios-admin__filtro usuarios-admin__filtro--busca">
            <span>Buscar</span>
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Nome ou e-mail"
            />
          </label>

          <label className="usuarios-admin__filtro">
            <span>Perfil</span>
            <select value={filtroPerfil} onChange={trocarPerfil}>
              <option value="">Todos</option>
              {OPCOES_PERFIL.map((op) => (
                <option key={op.valor} value={op.valor}>{op.rotulo}</option>
              ))}
            </select>
          </label>
        </div>

        {renderizarConteudo()}
      </main>
    </div>
  );
}

export default UsuariosAdmin;