import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EstadoRequisicao from '../DashboardResponsavel/components/EstadoRequisicao/EstadoRequisicao';
import {
  buscarAlunos,
  buscarRelatoriosPublicados,
  mensagemDeErro,
} from '../../services/responsavelService';
import { pegarIniciais, pertenceAoAluno } from '../../utils/relatorios';
import './MeusAlunosResponsavel.css';

function MeusAlunosResponsavel() {
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState([]);
  const [relatorios, setRelatorios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [tentativa, setTentativa] = useState(0);

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

  return (
    <div className="meus-alunos">
      <h1 className="meus-alunos__titulo">Meus alunos</h1>
      <p className="meus-alunos__subtitulo">Alunos vinculados ao seu cadastro pela escola</p>

      {carregando && <EstadoRequisicao tipo="carregando" mensagem="Carregando alunos…" />}
      {!carregando && erro && (
        <EstadoRequisicao tipo="erro" mensagem={erro} onTentarDeNovo={tentarDeNovo} />
      )}
      {!carregando && !erro && alunos.length === 0 && (
        <EstadoRequisicao tipo="vazio" mensagem="Nenhum aluno vinculado ao seu cadastro ainda." />
      )}

      {!carregando && !erro && alunos.length > 0 && (
        <div className="meus-alunos__grade">
          {alunos.map((aluno) => {
            const doAluno = relatorios.filter((r) => pertenceAoAluno(r, aluno));
            // Só mostra "aguardando ciência" se a API já mandar esse campo
            const pendentes = doAluno.filter((r) => r.cienciaRegistrada === false).length;
            return (
              <article key={aluno.id} className="meus-alunos__card">
                <div className="meus-alunos__topo">
                  <div className="meus-alunos__avatar" aria-hidden="true">
                    {pegarIniciais(aluno.nome)}
                  </div>
                  <div>
                    <h2 className="meus-alunos__nome">{aluno.nome}</h2>
                    <p className="meus-alunos__info">{aluno.turma ?? `Turma ${aluno.idTurma ?? '—'}`}</p>
                  </div>
                </div>
                <div className="meus-alunos__selos">
                  <span className="meus-alunos__selo meus-alunos__selo--azul">
                    {doAluno.length} publicado(s)
                  </span>
                  {pendentes > 0 && (
                    <span className="meus-alunos__selo meus-alunos__selo--amarelo">
                      {pendentes} aguardando ciência
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="meus-alunos__botao"
                  onClick={() => navigate(`/responsavel/relatorios?aluno=${aluno.id}`)}
                >
                  Ver relatórios
                </button>
              </article>
            );
          })}
        </div>
      )}

      <aside className="meus-alunos__aviso">
        <strong>Não encontrou um aluno?</strong>
        <p>Os vínculos são feitos pela secretaria da escola. Entre em contato para incluir ou corrigir um aluno.</p>
      </aside>
    </div>
  );
}

export default MeusAlunosResponsavel;