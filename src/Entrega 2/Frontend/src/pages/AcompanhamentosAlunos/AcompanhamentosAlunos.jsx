import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Search, Pencil, Eye, ChevronLeft, ChevronRight, TriangleAlert, FileText } from 'lucide-react';
import BadgeStatus from '../../components/BadgeStatus/BadgeStatus';
import Toast from '../../components/Toast/Toast';
import { listarAcompanhamentos } from '../../services/acompanhamentoService';
import { mensagemDeErro } from '../../services/api';
import './AcompanhamentosAlunos.css';

const POR_PAGINA = 8;
const STATUS_EDITAVEIS = ['RASCUNHO', 'DEVOLVIDO'];

const ABAS = [
  { status: '', rotulo: 'Todos' },
  { status: 'RASCUNHO', rotulo: 'Rascunhos' },
  { status: 'ENVIADO', rotulo: 'Enviados' },
  { status: 'EM_REVISAO', rotulo: 'Em revisão' },
  { status: 'PUBLICADO', rotulo: 'Publicados' },
  { status: 'DEVOLVIDO', rotulo: 'Devolvidos' },
];

// 8.5 → "8,5" · null → "—"
function formatarMedia(valor) {
  return valor === null || valor === undefined ? '—' : valor.toFixed(1).replace('.', ',');
}

// Monta as opções dos filtros sem repetir: ex. as turmas que aparecem nos registros
function opcoesUnicas(registros, campo) {
  const mapa = new Map();
  registros.forEach((registro) => mapa.set(registro[campo].id, registro[campo]));
  return [...mapa.values()];
}

function AcompanhamentosAlunos() {
  const location = useLocation();

  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Filtros
  const [aba, setAba] = useState('');
  const [busca, setBusca] = useState('');
  const [idTurma, setIdTurma] = useState('');
  const [idDisciplina, setIdDisciplina] = useState('');
  const [idBimestre, setIdBimestre] = useState('');
  const [ordem, setOrdem] = useState('recentes');
  const [pagina, setPagina] = useState(1);

  // Mensagem vinda de outra tela (ex.: "Acompanhamento enviado para revisão.")
  const [toast, setToast] = useState(location.state?.mensagem || '');

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      setRegistros(await listarAcompanhamentos());
    } catch (error) {
      setErro(mensagemDeErro(error));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // Apaga a mensagem do histórico para ela não reaparecer ao atualizar a página
    window.history.replaceState({}, '');
  }, []);

  // Toda troca de filtro volta para a página 1
  function filtrar(setter) {
    return (valor) => {
      setter(valor);
      setPagina(1);
    };
  }

  function limparFiltros() {
    setBusca('');
    setIdTurma('');
    setIdDisciplina('');
    setIdBimestre('');
    setAba('');
    setPagina(1);
  }

  // ---------- Filtragem, contagem, ordenação e paginação ----------
  const termo = busca.trim().toLowerCase();

  const filtrados = registros.filter(
    (r) =>
      (!termo || r.aluno.nome.toLowerCase().includes(termo)) &&
      (!idTurma || r.turma.id === Number(idTurma)) &&
      (!idDisciplina || r.disciplina.id === Number(idDisciplina)) &&
      (!idBimestre || r.bimestre.id === Number(idBimestre))
  );

  function contar(status) {
    return status ? filtrados.filter((r) => r.status === status).length : filtrados.length;
  }

  const visiveis = filtrados
    .filter((r) => !aba || r.status === aba)
    .sort((a, b) =>
      ordem === 'aluno' ? a.aluno.nome.localeCompare(b.aluno.nome, 'pt-BR') : b.id - a.id
    );

  const totalPaginas = Math.max(1, Math.ceil(visiveis.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * POR_PAGINA;
  const daPagina = visiveis.slice(inicio, inicio + POR_PAGINA);

  const turmas = opcoesUnicas(registros, 'turma');
  const disciplinas = opcoesUnicas(registros, 'disciplina');
  const bimestres = opcoesUnicas(registros, 'bimestre').sort((a, b) => a.numero - b.numero);
  const temFiltro = termo || idTurma || idDisciplina || idBimestre || aba;

  // ---------- Partes da tela ----------
  function renderizarConteudo() {
    if (carregando) {
      return (
        <div className="card lista-esqueleto" aria-label="Carregando acompanhamentos">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="lista-esqueleto-linha">
              <span className="esqueleto" style={{ width: '30%' }} />
              <span className="esqueleto" style={{ width: '15%' }} />
              <span className="esqueleto" style={{ width: '10%' }} />
              <span className="esqueleto" style={{ width: '20%' }} />
            </div>
          ))}
        </div>
      );
    }

    if (erro) {
      return (
        <div className="card estado">
          <span className="estado-icone estado-icone--erro"><TriangleAlert size={22} /></span>
          <h2>Não foi possível carregar os dados</h2>
          <p>{erro}</p>
          <button type="button" className="botao botao--secundario" onClick={carregar}>
            Tentar novamente
          </button>
        </div>
      );
    }

    if (registros.length === 0) {
      return (
        <div className="card estado">
          <span className="estado-icone"><FileText size={22} /></span>
          <h2>Você ainda não registrou acompanhamentos</h2>
          <p>Quando você criar um registro, ele aparecerá aqui com o status da revisão.</p>
          <Link to="/professor/criar-acompanhamento" className="botao botao--primario">
            <Plus size={16} /> Novo acompanhamento
          </Link>
        </div>
      );
    }

    if (visiveis.length === 0) {
      return (
        <div className="card estado">
          <span className="estado-icone"><Search size={22} /></span>
          <h2>Nenhum acompanhamento encontrado</h2>
          <p>Nenhum registro corresponde aos filtros escolhidos.</p>
          <button type="button" className="botao botao--secundario" onClick={limparFiltros}>
            Limpar filtros
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="card tabela-caixa">
          <table className="tabela">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Turma</th>
                <th>Disciplina</th>
                <th>Bimestre</th>
                <th>Média</th>
                <th>Status</th>
                <th className="tabela-acoes">Ações</th>
              </tr>
            </thead>
            <tbody>
              {daPagina.map((r) => {
                const editavel = STATUS_EDITAVEIS.includes(r.status);
                return (
                  <tr key={r.id} className={r.status === 'DEVOLVIDO' ? 'tabela-destaque' : ''}>
                    <td className="tabela-forte">{r.aluno.nome}</td>
                    <td>{r.turma.nome}</td>
                    <td>{r.disciplina.nome}</td>
                    <td>{r.bimestre.numero}º</td>
                    <td>{formatarMedia(r.media)}</td>
                    <td><BadgeStatus status={r.status} /></td>
                    <td className="tabela-acoes">
                      {editavel ? (
                        <Link
                          to={`/professor/acompanhamentos/${r.id}/editar`}
                          className="botao-icone botao-icone--destaque"
                          aria-label={`Editar acompanhamento de ${r.aluno.nome}`}
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </Link>
                      ) : (
                        <Link
                          to={`/professor/acompanhamentos/${r.id}`}
                          className="botao-icone"
                          aria-label={`Visualizar acompanhamento de ${r.aluno.nome}`}
                          title="Visualizar"
                        >
                          <Eye size={16} />
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="paginacao">
          <span>
            Mostrando {inicio + 1}–{inicio + daPagina.length} de {visiveis.length} registros
          </span>
          {totalPaginas > 1 && (
            <div className="paginacao-botoes">
              <button
                type="button"
                className="paginacao-botao"
                onClick={() => setPagina(paginaAtual - 1)}
                disabled={paginaAtual === 1}
                aria-label="Página anterior"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
                <button
                  type="button"
                  key={numero}
                  className={`paginacao-botao ${numero === paginaAtual ? 'paginacao-botao--ativo' : ''}`}
                  onClick={() => setPagina(numero)}
                >
                  {numero}
                </button>
              ))}
              <button
                type="button"
                className="paginacao-botao"
                onClick={() => setPagina(paginaAtual + 1)}
                disabled={paginaAtual === totalPaginas}
                aria-label="Próxima página"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="lista">
      <Toast mensagem={toast} onFechar={() => setToast('')} />

      <div className="lista-cabecalho">
        <div>
          <h1 className="lista-titulo">Acompanhamentos</h1>
          <p className="lista-subtitulo">Todos os seus registros, com o status no fluxo de revisão</p>
        </div>
        <Link to="/professor/criar-acompanhamento" className="botao botao--primario">
          <Plus size={16} /> Novo acompanhamento
        </Link>
      </div>

      <div className="abas" role="tablist">
        {ABAS.map((item) => (
          <button
            type="button"
            role="tab"
            key={item.rotulo}
            aria-selected={aba === item.status}
            className={`aba ${aba === item.status ? 'aba--ativa' : ''}`}
            onClick={() => filtrar(setAba)(item.status)}
          >
            {item.rotulo} ({contar(item.status)})
          </button>
        ))}
      </div>

      <div className="lista-filtros">
        <div className="campo lista-busca">
          <label className="campo-rotulo" htmlFor="busca">Aluno</label>
          <Search size={16} className="lista-busca-icone" />
          <input
            id="busca"
            className="campo-entrada"
            placeholder="Buscar aluno..."
            value={busca}
            onChange={(e) => filtrar(setBusca)(e.target.value)}
          />
        </div>

        <div className="campo">
          <label className="campo-rotulo" htmlFor="filtro-turma">Turma</label>
          <select id="filtro-turma" className="campo-entrada" value={idTurma} onChange={(e) => filtrar(setIdTurma)(e.target.value)}>
            <option value="">Todas</option>
            {turmas.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </div>

        <div className="campo">
          <label className="campo-rotulo" htmlFor="filtro-disciplina">Disciplina</label>
          <select id="filtro-disciplina" className="campo-entrada" value={idDisciplina} onChange={(e) => filtrar(setIdDisciplina)(e.target.value)}>
            <option value="">Todas</option>
            {disciplinas.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
          </select>
        </div>

        <div className="campo">
          <label className="campo-rotulo" htmlFor="filtro-bimestre">Bimestre</label>
          <select id="filtro-bimestre" className="campo-entrada" value={idBimestre} onChange={(e) => filtrar(setIdBimestre)(e.target.value)}>
            <option value="">Todos</option>
            {bimestres.map((b) => <option key={b.id} value={b.id}>{b.numero}º bimestre</option>)}
          </select>
        </div>

        <div className="campo">
          <label className="campo-rotulo" htmlFor="ordem">Ordenar por</label>
          <select id="ordem" className="campo-entrada" value={ordem} onChange={(e) => setOrdem(e.target.value)}>
            <option value="recentes">Mais recentes</option>
            <option value="aluno">Aluno (A–Z)</option>
          </select>
        </div>
      </div>

      {temFiltro && !carregando && (
        <button type="button" className="botao botao--link lista-limpar" onClick={limparFiltros}>
          Limpar filtros
        </button>
      )}

      {renderizarConteudo()}
    </div>
  );
}

export default AcompanhamentosAlunos;
