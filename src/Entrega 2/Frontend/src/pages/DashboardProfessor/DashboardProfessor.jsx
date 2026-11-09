import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TriangleAlert, Pencil } from 'lucide-react';
import { obterUsuario } from '../../services/authService';
import { listarAcompanhamentos } from '../../services/acompanhamentoService';
import { listarBimestres } from '../../services/catalogoService';
import { listarAlunos } from '../../services/alunoService';
import { mensagemDeErro } from '../../services/api';
import './DashboardProfessor.css';

// Status que já saíram das mãos do professor
const JA_ENVIADOS = ['ENVIADO', 'EM_REVISAO', 'PUBLICADO'];

function formatarData(valor) {
  if (!valor) return '';
  return new Date(valor).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

// Situação de cada bimestre em relação a hoje
function situacaoDoPeriodo(bimestre) {
  if (bimestre.aberto) return { rotulo: 'Aberto', classe: 'aberto' };
  if (new Date(bimestre.dataAbertura) > new Date()) return { rotulo: 'Agendado', classe: 'agendado' };
  return { rotulo: 'Encerrado', classe: 'encerrado' };
}

// Agrupa os registros do bimestre por "turma · disciplina" e calcula o progresso
function montarPendencias(registrosDoBimestre, alunos) {
  const grupos = new Map();

  registrosDoBimestre.forEach((r) => {
    const chave = `${r.turma.id}-${r.disciplina.id}`;
    if (!grupos.has(chave)) {
      grupos.set(chave, {
        chave,
        turma: r.turma,
        disciplina: r.disciplina,
        enviados: 0,
        totalAlunos: alunos.filter((a) => a.idTurma === r.turma.id).length,
      });
    }
    if (JA_ENVIADOS.includes(r.status)) grupos.get(chave).enviados += 1;
  });

  return [...grupos.values()].sort((a, b) => a.turma.nome.localeCompare(b.turma.nome, 'pt-BR'));
}

function DashboardProfessor() {
  const usuario = obterUsuario();
  const primeiroNome = (usuario?.nome || 'Professor').split(' ')[0];

  const [registros, setRegistros] = useState([]);
  const [bimestres, setBimestres] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Busca os dados na API. Os setState ficam dentro do .then/.catch/.finally,
  // ou seja, só rodam quando a resposta chega. Por isso ela pode ser chamada
  // direto no useEffect (regra react-hooks/set-state-in-effect do lint).
  function buscar() {
    return Promise.all([listarAcompanhamentos(), listarBimestres(), listarAlunos()])
      .then(([listaRegistros, listaBimestres, listaAlunos]) => {
        setRegistros(listaRegistros);
        setBimestres(listaBimestres);
        setAlunos(listaAlunos);
      })
      .catch((error) => setErro(mensagemDeErro(error)))
      .finally(() => setCarregando(false));
  }

  // Botão "Tentar novamente": mostra o carregando de novo e refaz a busca
  function carregar() {
    setCarregando(true);
    setErro('');
    buscar();
  }

  useEffect(() => {
    buscar();
  }, []);

  // ---------- Números calculados a partir dos registros ----------
  const bimestreAberto = bimestres.find((b) => b.aberto);
  const devolvidos = registros.filter((r) => r.status === 'DEVOLVIDO');
  const rascunhos = registros.filter((r) => r.status === 'RASCUNHO');
  const aguardando = registros.filter((r) => r.status === 'ENVIADO' || r.status === 'EM_REVISAO');
  const turmasComRegistros = new Set(registros.map((r) => r.turma.id)).size;

  const registrosDoBimestre = bimestreAberto
    ? registros.filter((r) => r.bimestre.id === bimestreAberto.id)
    : [];
  const pendencias = montarPendencias(registrosDoBimestre, alunos);

  const indicadores = [
    { numero: turmasComRegistros, rotulo: 'turmas com registros' },
    { numero: aguardando.length, rotulo: 'aguardando revisão' },
    { numero: rascunhos.length, rotulo: 'rascunhos salvos' },
    { numero: devolvidos.length, rotulo: devolvidos.length === 1 ? 'registro devolvido' : 'registros devolvidos' },
  ];

  const subtitulo = bimestreAberto
    ? `Bimestre atual: ${bimestreAberto.numero}º bimestre ${bimestreAberto.anoLetivo} · período de digitação aberto até ${formatarData(bimestreAberto.dataEncerramento)}`
    : 'Nenhum período de digitação aberto no momento';

  const cabecalho = (
    <div className="dp-cabecalho">
      <div>
        <h1 className="dp-titulo">Olá, {primeiroNome}</h1>
        <p className="dp-subtitulo">{carregando ? 'Carregando...' : subtitulo}</p>
      </div>
      <Link to="/professor/criar-acompanhamento" className="botao botao--primario">
        <Plus size={16} /> Novo acompanhamento
      </Link>
    </div>
  );

  if (carregando) {
    return (
      <div className="dp">
        {cabecalho}
        <div className="dp-indicadores">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="card dp-indicador">
              <span className="esqueleto" style={{ width: 40, height: 28 }} />
              <span className="esqueleto" style={{ width: '70%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="dp">
        {cabecalho}
        <div className="card estado">
          <span className="estado-icone estado-icone--erro"><TriangleAlert size={22} /></span>
          <h2>Não foi possível carregar o resumo</h2>
          <p>{erro}</p>
          <button type="button" className="botao botao--secundario" onClick={carregar}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const primeiroDevolvido = devolvidos[0];

  return (
    <div className="dp">
      {cabecalho}

      {primeiroDevolvido && (
        <div className="alerta alerta--aviso dp-alerta">
          <TriangleAlert size={18} />
          <div>
            <p className="alerta-titulo">
              {devolvidos.length === 1
                ? '1 registro devolvido para ajustes'
                : `${devolvidos.length} registros devolvidos para ajustes`}
            </p>
            <p>
              {primeiroDevolvido.aluno.nome} · {primeiroDevolvido.turma.nome} · {primeiroDevolvido.disciplina.nome}
              {' — '}a administração pediu ajustes. Corrija e reenvie
              {bimestreAberto ? ` até ${formatarData(bimestreAberto.dataEncerramento)}` : ''}.
            </p>
          </div>
        </div>
      )}

      <div className="dp-indicadores">
        {indicadores.map((item) => (
          <div key={item.rotulo} className="card dp-indicador">
            <span className="dp-indicador-numero">{item.numero}</span>
            <span className="dp-indicador-rotulo">{item.rotulo}</span>
          </div>
        ))}
      </div>

      <div className="dp-grade">
        {/* ---------- Coluna principal ---------- */}
        <section className="card">
          <div className="dp-card-topo">
            <h2 className="dp-card-titulo">
              {bimestreAberto ? `Progresso do ${bimestreAberto.numero}º bimestre` : 'Progresso do bimestre'}
            </h2>
            <Link to="/professor/acompanhamentos" className="dp-link">Ver todos</Link>
          </div>

          {pendencias.length === 0 ? (
            <p className="dp-vazio">
              {bimestreAberto
                ? 'Você ainda não tem registros neste bimestre.'
                : 'Sem bimestre aberto para acompanhar.'}
            </p>
          ) : (
            <ul className="dp-pendencias">
              {pendencias.map((p) => {
                const faltam = Math.max(p.totalAlunos - p.enviados, 0);
                const porcentagem = p.totalAlunos ? Math.round((p.enviados / p.totalAlunos) * 100) : 0;
                return (
                  <li key={p.chave} className="dp-pendencia">
                    <div className="dp-pendencia-texto">
                      <strong>{p.turma.nome} · {p.disciplina.nome}</strong>
                      <span>
                        {p.enviados} de {p.totalAlunos} acompanhamentos enviados · {faltam}{' '}
                        {faltam === 1 ? 'pendente' : 'pendentes'}
                      </span>
                    </div>
                    <div className="dp-barra" aria-label={`${porcentagem}% enviados`}>
                      <span style={{ width: `${porcentagem}%` }} />
                    </div>
                    <Link to="/professor/criar-acompanhamento" className="botao botao--secundario dp-botao-pequeno">
                      Continuar
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ---------- Coluna lateral ---------- */}
        <div className="dp-lateral">
          {primeiroDevolvido && (
            <section className="card">
              <div className="dp-card-topo">
                <h2 className="dp-card-titulo">Devolvidos para ajuste</h2>
                <span className="dp-selo">{devolvidos.length} {devolvidos.length === 1 ? 'novo' : 'novos'}</span>
              </div>
              <div className="dp-devolvido">
                <strong>{primeiroDevolvido.aluno.nome} · {primeiroDevolvido.turma.nome}</strong>
                <p>“{primeiroDevolvido.motivoDevolucao}”</p>
                <Link
                  to={`/professor/acompanhamentos/${primeiroDevolvido.id}/editar`}
                  className="botao botao--primario dp-botao-pequeno"
                >
                  Corrigir e reenviar
                </Link>
              </div>
            </section>
          )}

          <section className="card">
            <h2 className="dp-card-titulo">Rascunhos salvos</h2>
            {rascunhos.length === 0 ? (
              <p className="dp-vazio">Nenhum rascunho no momento.</p>
            ) : (
              <ul className="dp-rascunhos">
                {rascunhos.slice(0, 4).map((r) => (
                  <li key={r.id}>
                    <Link to={`/professor/acompanhamentos/${r.id}/editar`} className="dp-rascunho">
                      <div>
                        <strong>{r.aluno.nome}</strong>
                        <span>{r.turma.nome} · {r.disciplina.nome}</span>
                      </div>
                      <Pencil size={16} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card">
            <h2 className="dp-card-titulo">Períodos de digitação</h2>
            <ul className="dp-periodos">
              {[...bimestres]
                .sort((a, b) => a.numero - b.numero)
                .map((b) => {
                  const situacao = situacaoDoPeriodo(b);
                  return (
                    <li key={b.id}>
                      <span>
                        {b.numero}º bimestre · {formatarData(b.dataAbertura)} – {formatarData(b.dataEncerramento)}
                      </span>
                      <span className={`dp-periodo dp-periodo--${situacao.classe}`}>{situacao.rotulo}</span>
                    </li>
                  );
                })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default DashboardProfessor;
