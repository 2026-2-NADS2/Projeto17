import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Layers, TriangleAlert } from 'lucide-react';
import { listarVinculos } from '../../services/vinculoService';
import { listarAlunos } from '../../services/alunoService';
import { listarAcompanhamentos } from '../../services/acompanhamentoService';
import { listarBimestres } from '../../services/catalogoService';
import { mensagemDeErro } from '../../services/api';
import './TelaTurmas.css';

const TURNOS = { MANHA: 'Manhã', TARDE: 'Tarde', NOITE: 'Noite' };
const ENVIADOS = ['ENVIADO', 'EM_REVISAO', 'PUBLICADO'];

// Bimestre que a tela abre selecionado: o aberto; senão o último que já começou; senão o 1º
function bimestrePadrao(bimestres) {
  const agora = new Date();
  const aberto = bimestres.find((b) => b.aberto);
  if (aberto) return aberto;
  const jaComecaram = bimestres.filter((b) => new Date(b.dataAbertura) <= agora);
  return jaComecaram.at(-1) ?? bimestres[0];
}

// Números de um card: quantos alunos, quantos já enviados, rascunhos, devolvidos e sem registro
function resumir(vinculo, alunos, acompanhamentos, idBimestre) {
  const totalAlunos = alunos.filter((a) => a.idTurma === vinculo.idTurma).length;
  const registros = acompanhamentos.filter(
    (a) =>
      a.turma.id === vinculo.idTurma &&
      a.disciplina.id === vinculo.idDisciplina &&
      a.bimestre.id === idBimestre &&
      a.status !== 'CANCELADO'
  );
  const contar = (status) => registros.filter((r) => status.includes(r.status)).length;

  return {
    totalAlunos,
    enviados: contar(ENVIADOS),
    rascunhos: contar(['RASCUNHO']),
    devolvidos: contar(['DEVOLVIDO']),
    pendentes: Math.max(totalAlunos - registros.length, 0),
  };
}

function CardTurma({ vinculo, resumo, bimestre }) {
  const { totalAlunos, enviados, rascunhos, devolvidos, pendentes } = resumo;
  const progresso = totalAlunos > 0 ? (enviados / totalAlunos) * 100 : 0;

  return (
    <article className="card mt-card">
      <div className="mt-card-topo">
        <span className="mt-card-icone"><Layers size={18} /></span>
        <div>
          <h2>{vinculo.turma}</h2>
          <p>
            {vinculo.disciplina} · {totalAlunos} alunos · {TURNOS[vinculo.turno] ?? vinculo.turno}
          </p>
        </div>
      </div>

      <p className="mt-progresso-texto">
        {enviados}/{totalAlunos} enviados no {bimestre.numero}º bimestre
      </p>
      <div className="mt-progresso" aria-hidden="true">
        <span style={{ width: `${progresso}%` }} />
      </div>

      <div className="mt-chips">
        {rascunhos > 0 && <span className="mt-chip mt-chip--rascunho">{rascunhos} rascunho{rascunhos > 1 ? 's' : ''}</span>}
        {devolvidos > 0 && <span className="mt-chip mt-chip--devolvido">{devolvidos} devolvido{devolvidos > 1 ? 's' : ''}</span>}
        {pendentes > 0 && <span className="mt-chip mt-chip--pendente">{pendentes} pendente{pendentes > 1 ? 's' : ''}</span>}
        {rascunhos + devolvidos + pendentes === 0 && totalAlunos > 0 && (
          <span className="mt-chip mt-chip--completo">Tudo enviado</span>
        )}
      </div>

      <Link
        to={`/professor/turmas/${vinculo.idTurma}?disciplina=${vinculo.idDisciplina}&bimestre=${bimestre.id}`}
        className="botao botao--secundario mt-card-botao"
      >
        <ChevronRight size={16} /> Ver alunos
      </Link>
    </article>
  );
}

function TelaTurmas() {
  const [dados, setDados] = useState({ vinculos: [], alunos: [], acompanhamentos: [], bimestres: [] });
  const [idBimestre, setIdBimestre] = useState(null);
  const [agrupamento, setAgrupamento] = useState('turma');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Busca os dados na API. Os setState ficam dentro do .then/.catch/.finally,
  // ou seja, só rodam quando a resposta chega. Por isso ela pode ser chamada
  // direto no useEffect (regra react-hooks/set-state-in-effect do lint).
  function buscar() {
    // As 4 consultas não dependem uma da outra: vão juntas
    return Promise.all([listarVinculos(), listarAlunos(), listarAcompanhamentos(), listarBimestres()])
      .then(([vinculos, alunos, acompanhamentos, todosBimestres]) => {
        const anoAtual = new Date().getFullYear();
        const bimestres = todosBimestres
          .filter((b) => b.anoLetivo === anoAtual)
          .sort((a, b) => a.numero - b.numero);

        setDados({ vinculos, alunos, acompanhamentos, bimestres });
        setIdBimestre((atual) => atual ?? bimestrePadrao(bimestres)?.id ?? null);
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

  const bimestre = dados.bimestres.find((b) => b.id === idBimestre);

  // Cada vínculo (turma + disciplina) vira um card, já com os números calculados
  const cards = useMemo(() => {
    if (!bimestre) return [];
    return dados.vinculos
      .map((vinculo) => ({ vinculo, resumo: resumir(vinculo, dados.alunos, dados.acompanhamentos, bimestre.id) }))
      .sort(
        (a, b) =>
          a.vinculo.turma.localeCompare(b.vinculo.turma, 'pt-BR', { numeric: true }) ||
          a.vinculo.disciplina.localeCompare(b.vinculo.disciplina, 'pt-BR')
      );
  }, [dados, bimestre]);

  // "Por disciplina": um grupo para cada disciplina, cada um com seus cards
  const grupos = useMemo(() => {
    if (agrupamento === 'turma') return [{ titulo: null, cards }];
    const porDisciplina = new Map();
    for (const card of cards) {
      const nome = card.vinculo.disciplina;
      if (!porDisciplina.has(nome)) porDisciplina.set(nome, []);
      porDisciplina.get(nome).push(card);
    }
    return [...porDisciplina]
      .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
      .map(([titulo, lista]) => ({ titulo, cards: lista }));
  }, [cards, agrupamento]);

  function renderizarConteudo() {
    if (carregando) {
      return (
        <div className="mt-grade">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card mt-card">
              <span className="esqueleto" style={{ width: '50%' }} />
              <span className="esqueleto" style={{ width: '80%' }} />
              <span className="esqueleto" />
            </div>
          ))}
        </div>
      );
    }

    if (erro) {
      return (
        <div className="card estado">
          <span className="estado-icone estado-icone--erro"><TriangleAlert size={22} /></span>
          <h2>Não foi possível carregar suas turmas</h2>
          <p>{erro}</p>
          <button type="button" className="botao botao--secundario" onClick={carregar}>
            Tentar novamente
          </button>
        </div>
      );
    }

    if (dados.vinculos.length === 0) {
      return (
        <div className="card estado">
          <span className="estado-icone"><Layers size={22} /></span>
          <h2>Você ainda não tem turmas vinculadas</h2>
          <p>A administração da escola define quais turmas e disciplinas ficam com cada professor.</p>
        </div>
      );
    }

    if (!bimestre) {
      return (
        <div className="card estado">
          <h2>Nenhum bimestre cadastrado para este ano</h2>
          <p>Fale com a administração da escola.</p>
        </div>
      );
    }

    return grupos.map((grupo) => (
      <section key={grupo.titulo ?? 'todas'} className="mt-grupo">
        {grupo.titulo && <h2 className="mt-grupo-titulo">{grupo.titulo}</h2>}
        <div className="mt-grade">
          {grupo.cards.map(({ vinculo, resumo }) => (
            <CardTurma key={vinculo.id} vinculo={vinculo} resumo={resumo} bimestre={bimestre} />
          ))}
        </div>
      </section>
    ));
  }

  return (
    <div className="mt">
      <div className="mt-cabecalho">
        <div>
          <h1 className="mt-titulo">Minhas turmas</h1>
          <p className="mt-subtitulo">
            Turmas e disciplinas vinculadas a você no ano letivo {new Date().getFullYear()}
          </p>
        </div>

        {dados.bimestres.length > 0 && (
          <div className="campo mt-filtro">
            <label htmlFor="mt-bimestre" className="campo-rotulo">Bimestre</label>
            <select
              id="mt-bimestre"
              className="campo-entrada"
              value={idBimestre ?? ''}
              onChange={(e) => setIdBimestre(Number(e.target.value))}
            >
              {dados.bimestres.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.numero}º bimestre{b.aberto ? ' (aberto)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="abas" role="tablist">
        {[
          { valor: 'turma', rotulo: 'Por turma' },
          { valor: 'disciplina', rotulo: 'Por disciplina' },
        ].map((item) => (
          <button
            key={item.valor}
            type="button"
            role="tab"
            aria-selected={agrupamento === item.valor}
            className={`aba ${agrupamento === item.valor ? 'aba--ativa' : ''}`}
            onClick={() => setAgrupamento(item.valor)}
          >
            {item.rotulo}
          </button>
        ))}
      </div>

      {renderizarConteudo()}
    </div>
  );
}

export default TelaTurmas;