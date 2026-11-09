import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EstadoRequisicao from './components/EstadoRequisicao/EstadoRequisicao';
import {
  buscarAlunos,
  buscarRelatoriosPublicados,
  mensagemDeErro,
} from '../../services/responsavelService';
import { obterUsuario } from '../../services/authService';
import {
  bimestreDe,
  disciplinaDe,
  formatarMedia,
  pegarIniciais,
  pertenceAoAluno,
} from '../../utils/relatorios';
import './DashboardResponsavel.css';

function DashboardResponsavel() {
  const navigate = useNavigate();
  const nomeCompleto = obterUsuario()?.nome ?? 'Responsável';
  const primeiroNome = nomeCompleto.split(' ')[0];

  const [alunos, setAlunos] = useState([]);
  const [relatorios, setRelatorios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  // Mudar este número faz o useEffect rodar de novo (botão "Tentar de novo")
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let cancelado = false;

    async function carregarDados() {
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

    carregarDados();
    return () => {
      cancelado = true;
    };
  }, [tentativa]);

  function tentarDeNovo() {
    setErro(null);
    setCarregando(true);
    setTentativa((t) => t + 1);
  }

  const pendentes = relatorios.filter((r) => r.cienciaRegistrada === false).length;
  const recentes = [...relatorios]
    .sort((a, b) => Number(bimestreDe(b)) - Number(bimestreDe(a)) || b.id - a.id)
    .slice(0, 5);

  function nomeDoAluno(r) {
    return r.aluno ?? alunos.find((a) => a.id === r.idAluno)?.nome ?? `Aluno ${r.idAluno}`;
  }

  return (
    <div className="inicio-resp">
      <h1 className="inicio-resp__saudacao">Olá, {primeiroNome}</h1>
      <p className="inicio-resp__subtitulo">
        Resumo do(s) aluno(s) vinculado(s) e relatórios publicados
      </p>

      {carregando && (
        <EstadoRequisicao tipo="carregando" mensagem="Carregando dados do(s) aluno(s)…" />
      )}
      {!carregando && erro && (
        <EstadoRequisicao tipo="erro" mensagem={erro} onTentarDeNovo={tentarDeNovo} />
      )}

      {!carregando && !erro && (
        <>
          <div className="inicio-resp__topo">
            <div className="inicio-resp__alunos">
              {alunos.length === 0 ? (
                <EstadoRequisicao tipo="vazio" mensagem="Nenhum aluno vinculado ao seu cadastro ainda." />
              ) : (
                alunos.map((aluno) => {
                  const total = relatorios.filter((r) => pertenceAoAluno(r, aluno)).length;
                  return (
                    <button
                      key={aluno.id}
                      type="button"
                      className="inicio-resp__aluno"
                      onClick={() => navigate(`/responsavel/relatorios?aluno=${aluno.id}`)}
                    >
                      <span className="inicio-resp__avatar" aria-hidden="true">
                        {pegarIniciais(aluno.nome)}
                      </span>
                      <span className="inicio-resp__aluno-texto">
                        <strong>{aluno.nome}</strong>
                        <small>
                          {aluno.turma ?? `Turma ${aluno.idTurma ?? '—'}`} · {total} relatórios publicados
                        </small>
                      </span>
                      <span aria-hidden="true">›</span>
                    </button>
                  );
                })
              )}
            </div>

            <aside className="inicio-resp__pendencias">
              <strong>{relatorios.length} relatórios publicados</strong>
              <span>
                {pendentes > 0 ? 'aguardando sua ciência' : 'nenhuma ciência pendente'}
              </span>
              <button
                type="button"
                className="inicio-resp__botao"
                onClick={() => navigate('/responsavel/relatorios')}
              >
                Ver e registrar ciência
              </button>
            </aside>
          </div>

          <h2 className="inicio-resp__titulo-secao">Acompanhamento</h2>
          <div className="inicio-resp__atalhos">
            <Link to="/responsavel/alunos" className="inicio-resp__atalho">
              <strong>Meus alunos</strong>
              <small>Lista de alunos vinculados → selecionar aluno</small>
            </Link>
            <Link to="/responsavel/relatorios" className="inicio-resp__atalho">
              <strong>
                Relatórios
                {pendentes > 0 && (
                  <span className="inicio-resp__selo-pendente">{pendentes} pendentes</span>
                )}
              </strong>
              <small>Por ano letivo, bimestre e disciplina · PDF e ciência</small>
            </Link>
            <Link to="/responsavel/perfil" className="inicio-resp__atalho">
              <strong>Meu perfil</strong>
              <small>Dados da conta → alterar senha</small>
            </Link>
          </div>

          <h2 className="inicio-resp__titulo-secao">Relatórios publicados recentes</h2>
          {recentes.length === 0 ? (
            <EstadoRequisicao tipo="vazio" mensagem="Nenhum relatório publicado até agora." />
          ) : (
            <ul className="inicio-resp__lista">
              {recentes.map((r) => (
                <li key={r.id} className="inicio-resp__item">
                  <div className="inicio-resp__item-topo">
                    <strong>{nomeDoAluno(r)}</strong>
                    {r.cienciaRegistrada === false && (
                      <span className="inicio-resp__selo inicio-resp__selo--pendente">Ciência pendente</span>
                    )}
                    {r.cienciaRegistrada === true && (
                      <span className="inicio-resp__selo inicio-resp__selo--ok">Ciência registrada</span>
                    )}
                  </div>
                  <p className="inicio-resp__meta">
                    {disciplinaDe(r)} · {bimestreDe(r)}º bimestre
                    {r.professor ? ` · Prof. ${r.professor}` : ''}
                  </p>
                  {r.descricao && <p className="inicio-resp__descricao">{r.descricao}</p>}
                  <div className="inicio-resp__item-rodape">
                    <span>Média <strong>{formatarMedia(r.media)}</strong></span>
                    <Link to={`/responsavel/relatorio/${r.id}`} className="inicio-resp__abrir">
                      Abrir relatório ›
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default DashboardResponsavel;