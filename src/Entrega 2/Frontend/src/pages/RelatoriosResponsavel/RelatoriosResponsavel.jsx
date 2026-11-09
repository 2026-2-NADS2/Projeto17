import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import EstadoRequisicao from '../DashboardResponsavel/components/EstadoRequisicao/EstadoRequisicao';
import {
  buscarAlunos,
  buscarRelatoriosPublicados,
  mensagemDeErro,
} from '../../services/responsavelService';
import {
  anoDe,
  bimestreDe,
  disciplinaDe,
  formatarMedia,
  pertenceAoAluno,
} from '../../utils/relatorios';
import './RelatoriosResponsavel.css';

function RelatoriosResponsavel() {
  const [params, setParams] = useSearchParams();
  const [alunos, setAlunos] = useState([]);
  const [relatorios, setRelatorios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [tentativa, setTentativa] = useState(0);
  const [ano, setAno] = useState('');
  const [bimestre, setBimestre] = useState('');
  const [disciplina, setDisciplina] = useState('');

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      try {
        const [todosAlunos, publicados] = await Promise.all([
          buscarAlunos(),
          buscarRelatoriosPublicados(),
        ]);
        if (!cancelado) {
          setAlunos(todosAlunos);
          setRelatorios(publicados);
        }
      } catch (e) {
        if (!cancelado) setErro(mensagemDeErro(e));
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }
    carregar();
    return () => {
      cancelado = true;
    };
  }, [tentativa]);

  function tentarDeNovo() {
    setErro(null);
    setCarregando(true);
    setTentativa((t) => t + 1);
  }

  function escolherAluno(id) {
    setParams({ aluno: String(id) });
    setAno('');
    setBimestre('');
    setDisciplina('');
  }

  const alunoAtual = alunos.find((a) => String(a.id) === params.get('aluno')) ?? alunos[0];
  const doAluno = alunoAtual ? relatorios.filter((r) => pertenceAoAluno(r, alunoAtual)) : [];

  // Opções dos filtros saem dos próprios relatórios do aluno
  const unicos = (fn) => [...new Set(doAluno.map(fn))].filter((v) => v !== '');
  const anos = unicos(anoDe).sort().reverse();
  const bimestres = unicos(bimestreDe).sort();
  const disciplinas = unicos(disciplinaDe).sort();

  const filtrados = doAluno.filter(
    (r) =>
      (!ano || String(anoDe(r)) === ano) &&
      (!bimestre || String(bimestreDe(r)) === bimestre) &&
      (!disciplina || disciplinaDe(r) === disciplina),
  );

  // Agrupa por bimestre (do mais recente para o mais antigo)
  const grupos = Object.entries(
    filtrados.reduce((acc, r) => {
      const chave = bimestreDe(r) || '—';
      (acc[chave] ||= []).push(r);
      return acc;
    }, {}),
  ).sort((a, b) => Number(b[0]) - Number(a[0]));

  return (
    <div className="rel-resp">
      <h1 className="rel-resp__titulo">Relatórios</h1>
      <p className="rel-resp__subtitulo">Somente relatórios publicados pela escola</p>

      {carregando && <EstadoRequisicao tipo="carregando" mensagem="Carregando relatórios…" />}
      {!carregando && erro && (
        <EstadoRequisicao tipo="erro" mensagem={erro} onTentarDeNovo={tentarDeNovo} />
      )}
      {!carregando && !erro && alunos.length === 0 && (
        <EstadoRequisicao tipo="vazio" mensagem="Nenhum aluno vinculado ao seu cadastro ainda." />
      )}

      {!carregando && !erro && alunoAtual && (
        <>
          <div className="rel-resp__abas" role="tablist">
            {alunos.map((a) => (
              <button
                key={a.id}
                type="button"
                role="tab"
                aria-selected={a.id === alunoAtual.id}
                className={`rel-resp__aba ${a.id === alunoAtual.id ? 'rel-resp__aba--ativa' : ''}`}
                onClick={() => escolherAluno(a.id)}
              >
                {a.nome}
              </button>
            ))}
          </div>

          <div className="rel-resp__filtros">
            <label>
              Ano letivo
              <select value={ano} onChange={(e) => setAno(e.target.value)}>
                <option value="">Todos</option>
                {anos.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
            <label>
              Bimestre
              <select value={bimestre} onChange={(e) => setBimestre(e.target.value)}>
                <option value="">Todos</option>
                {bimestres.map((v) => <option key={v} value={v}>{v}º bimestre</option>)}
              </select>
            </label>
            <label>
              Disciplina
              <select value={disciplina} onChange={(e) => setDisciplina(e.target.value)}>
                <option value="">Todas</option>
                {disciplinas.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
          </div>

          {filtrados.length === 0 ? (
            <EstadoRequisicao
              tipo="vazio"
              mensagem="Ainda não há relatórios publicados. Eles aparecem aqui depois que a escola revisar e publicar."
            />
          ) : (
            grupos.map(([numero, lista]) => (
              <section key={numero} className="rel-resp__grupo">
                <h2 className="rel-resp__grupo-titulo">{numero}º BIMESTRE</h2>
                <div className="rel-resp__grade">
                  {lista.map((r) => (
                    <article key={r.id} className="rel-resp__card">
                      <div className="rel-resp__card-topo">
                        <strong>{alunoAtual.nome}</strong>
                        {r.cienciaRegistrada === true && (
                          <span className="rel-resp__selo rel-resp__selo--ok">Ciência registrada</span>
                        )}
                        {r.cienciaRegistrada === false && (
                          <span className="rel-resp__selo rel-resp__selo--pendente">Ciência pendente</span>
                        )}
                      </div>
                      <p className="rel-resp__meta">
                        {disciplinaDe(r)} · {bimestreDe(r)}º bimestre
                        {r.professor ? ` · Prof. ${r.professor}` : ''}
                      </p>
                      {r.descricao && <p className="rel-resp__descricao">{r.descricao}</p>}
                      <div className="rel-resp__rodape">
                        <span>Média <strong>{formatarMedia(r.media)}</strong></span>
                        <Link to={`/responsavel/relatorio/${r.id}`} className="rel-resp__abrir">
                          Abrir relatório ›
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}
        </>
      )}
    </div>
  );
}

export default RelatoriosResponsavel;