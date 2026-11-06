import { useEffect, useState } from 'react';
import { CheckCheck } from 'lucide-react';
import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';
import EstadoCarregando from '../../components/EstadoCarregando/EstadoCarregando';
import EstadoErro from '../../components/EstadoErro/EstadoErro';
import { listarRetornos, marcarRetornoComoLido } from '../../services/retornoService';
import { nomeDe } from '../RevisaoAdmin/formatadores';
import { formatarDataHora, tempoDe } from '../../utils/datas';
import { retornosExemplo } from './dadosExemplo';
import '../AlunosAdmin/AlunosAdmin.css';
import './RetornosAdmin.css';

const NOMES_TIPO = {
  CIENCIA: 'Ciência',
  OBSERVACAO: 'Observação',
};

function mensagemDoErro(e, padrao) {
  return e.response?.data?.erro ?? e.response?.data?.mensagem ?? padrao;
}

function RetornosAdmin() {
  const [retornos, setRetornos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modoExemplo, setModoExemplo] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  const [filtroTipo, setFiltroTipo] = useState('');
  const [soNovos, setSoNovos] = useState(false);

  const [marcando, setMarcando] = useState(null); // id do retorno sendo marcado
  const [erroAcao, setErroAcao] = useState(null);

  useEffect(() => {
    if (modoExemplo) return;

    let ativo = true;

    async function buscar() {
      try {
        const lista = await listarRetornos();
        if (ativo) setRetornos(lista);
      } catch (e) {
        if (ativo) setErro(mensagemDoErro(e, 'Não foi possível carregar os retornos das famílias.'));
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    buscar();
    return () => { ativo = false; };
  }, [tentativa, modoExemplo]);

  function tentarNovamente() {
    setCarregando(true);
    setErro(null);
    setModoExemplo(false);
    setTentativa((t) => t + 1);
  }

  function usarDadosExemplo() {
    setRetornos(retornosExemplo);
    setErro(null);
    setModoExemplo(true);
  }

  async function marcarComoLido(retorno) {
    setMarcando(retorno.id);
    setErroAcao(null);

    try {
      if (!modoExemplo) await marcarRetornoComoLido(retorno.id);
      setRetornos((lista) => lista.map((r) => (r.id === retorno.id ? { ...r, lido: true } : r)));
    } catch (e) {
      setErroAcao(mensagemDoErro(e, 'Não foi possível marcar como lido. Tente novamente.'));
    } finally {
      setMarcando(null);
    }
  }

  // Indicadores
  const novos = retornos.filter((r) => !r.lido).length;
  const ciencias = retornos.filter((r) => r.tipo === 'CIENCIA').length;
  const observacoes = retornos.filter((r) => r.tipo === 'OBSERVACAO').length;

  const visiveis = retornos
    .filter((r) => !filtroTipo || r.tipo === filtroTipo)
    .filter((r) => !soNovos || !r.lido)
    .sort((a, b) => tempoDe(b.criadoEm) - tempoDe(a.criadoEm)); // mais recentes primeiro

  function renderizarConteudo() {
    if (carregando) return <EstadoCarregando mensagem="Carregando retornos..." />;
    if (erro) {
      return (
        <EstadoErro
          titulo="Não foi possível carregar os retornos"
          mensagem={erro}
          onTentarNovamente={tentarNovamente}
          onUsarExemplo={usarDadosExemplo}
        />
      );
    }
    if (retornos.length === 0) {
      return (
        <p className="alunos-admin__vazio">
          Nenhuma família respondeu ainda. Os retornos aparecem aqui quando os responsáveis confirmam ciência ou deixam uma observação.
        </p>
      );
    }

    return (
      <>
        <div className="retornos-admin__indicadores">
          <div className="retornos-admin__indicador">
            <span>Novos</span>
            <strong>{novos}</strong>
          </div>
          <div className="retornos-admin__indicador">
            <span>Ciências registradas</span>
            <strong>{ciencias}</strong>
          </div>
          <div className="retornos-admin__indicador">
            <span>Observações</span>
            <strong>{observacoes}</strong>
          </div>
        </div>

        <div className="retornos-admin__filtros">
          <label className="alunos-admin__filtro">
            <span>Tipo</span>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="alunos-admin__select">
              <option value="">Todos</option>
              <option value="OBSERVACAO">Observações</option>
              <option value="CIENCIA">Ciências</option>
            </select>
          </label>

          <label className="retornos-admin__check">
            <input type="checkbox" checked={soNovos} onChange={(e) => setSoNovos(e.target.checked)} />
            Só os não lidos
          </label>
        </div>

        {erroAcao && <p className="alunos-admin__erro-modal" role="alert">{erroAcao}</p>}

        {visiveis.length === 0 ? (
          <p className="alunos-admin__vazio">Nenhum retorno com esses filtros. 🎉</p>
        ) : (
          <ul className="retornos-admin__lista">
            {visiveis.map((r) => (
              <li key={r.id} className={`retornos-admin__card ${!r.lido ? 'retornos-admin__card--novo' : ''}`}>
                <div className="retornos-admin__card-topo">
                  <span className={`retornos-admin__pilula retornos-admin__pilula--${String(r.tipo).toLowerCase()}`}>
                    {NOMES_TIPO[r.tipo] ?? r.tipo}
                  </span>
                  {!r.lido && <span className="retornos-admin__pilula retornos-admin__pilula--novo">Novo</span>}
                  <span className="retornos-admin__data">{formatarDataHora(r.criadoEm)}</span>
                </div>

                <p className="retornos-admin__quem">
                  <strong>{nomeDe(r.responsavel)}</strong>, responsável por <strong>{nomeDe(r.aluno)}</strong>
                </p>
                <p className="retornos-admin__contexto">
                  {nomeDe(r.disciplina)} · {r.bimestre}º bimestre · {r.anoLetivo}
                </p>

                {r.tipo === 'OBSERVACAO' && r.mensagem ? (
                  <p className="retornos-admin__mensagem">“{r.mensagem}”</p>
                ) : (
                  <p className="retornos-admin__contexto">Confirmou que leu o relatório.</p>
                )}

                {!r.lido && (
                  <div className="retornos-admin__acoes">
                    <button
                      type="button"
                      className="alunos-admin__botao alunos-admin__botao--secundario"
                      onClick={() => marcarComoLido(r)}
                      disabled={marcando === r.id}
                    >
                      <CheckCheck size={16} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 6 }} />
                      {marcando === r.id ? 'Marcando...' : 'Marcar como lido'}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </>
    );
  }

  return (
    <div className="alunos-admin">
      <SidebarAdmin />

      <main className="alunos-admin__conteudo">
        <header className="alunos-admin__topo">
          <div>
            <h1>Retornos das famílias</h1>
            <p>Ciências e observações que os responsáveis deixaram nos relatórios publicados.</p>
          </div>
        </header>

        {modoExemplo && (
          <p className="alunos-admin__aviso-exemplo" role="note">
            Dados de exemplo: marcar como lido aqui não vai para a API.
          </p>
        )}

        {renderizarConteudo()}
      </main>
    </div>
  );
}

export default RetornosAdmin;