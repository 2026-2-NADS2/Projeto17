import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, Download, Pencil, Plus, Search, TriangleAlert } from 'lucide-react';
import BadgeStatus from '../../components/BadgeStatus/BadgeStatus';
import { listarVinculos } from '../../services/vinculoService';
import { listarAlunos } from '../../services/alunoService';
import { listarAcompanhamentos } from '../../services/acompanhamentoService';
import { listarBimestres } from '../../services/catalogoService';
import { mensagemDeErro } from '../../services/api';
import { exportarCsv } from '../../utils/exportarCsv';
import './TurmaAlunos.css';

const SEM_REGISTRO = 'SEM_REGISTRO';
const ENVIADOS = ['ENVIADO', 'EM_REVISAO', 'PUBLICADO'];
const FILTROS_STATUS = [
  { valor: '', rotulo: 'Todos' },
  { valor: SEM_REGISTRO, rotulo: 'Sem registro' },
  { valor: 'RASCUNHO', rotulo: 'Rascunho' },
  { valor: 'ENVIADO', rotulo: 'Enviado' },
  { valor: 'EM_REVISAO', rotulo: 'Em revisão' },
  { valor: 'PUBLICADO', rotulo: 'Publicado' },
  { valor: 'DEVOLVIDO', rotulo: 'Devolvido' },
];

// 8.5 → "8,5"
const formatarMedia = (media) => (media === null || media === undefined ? '—' : media.toFixed(1).replace('.', ','));

// "2026-11-07T14:30" → "Hoje" ou "07/11"
function formatarAtualizado(dataHora) {
  if (!dataHora) return '—';
  const [data] = dataHora.split('T');
  const [ano, mes, dia] = data.split('-');
  const hoje = new Date();
  const ehHoje = Number(ano) === hoje.getFullYear() && Number(mes) === hoje.getMonth() + 1 && Number(dia) === hoje.getDate();
  return ehHoje ? 'Hoje' : `${dia}/${mes}`;
}

// O botão da última coluna depende da situação do registro
function Acao({ linha, turma, idDisciplina, periodoAberto }) {
  const { aluno, registro } = linha;

  if (!registro) {
    if (!periodoAberto) return <span className="ta-sem-acao">—</span>;
    return (
      <Link
        to={`/professor/criar-acompanhamento?turma=${turma}&aluno=${aluno.id}&disciplina=${idDisciplina}`}
        className="botao botao--primario ta-botao"
      >
        <Plus size={14} /> Registrar
      </Link>
    );
  }
  if (registro.status === 'DEVOLVIDO') {
    return (
      <Link to={`/professor/acompanhamentos/${registro.id}/editar`} className="botao botao--primario ta-botao">
        <Pencil size={14} /> Corrigir
      </Link>
    );
  }
  if (registro.status === 'RASCUNHO') {
    return (
      <Link to={`/professor/acompanhamentos/${registro.id}/editar`} className="botao botao--secundario ta-botao">
        <Pencil size={14} /> Editar
      </Link>
    );
  }
  return (
    <Link to={`/professor/acompanhamentos/${registro.id}`} className="botao botao--link">
      Ver
    </Link>
  );
}

// 1 → "1 devolvido" · 2 → "2 devolvidos"
const plural = (n, palavra) => `${n} ${palavra}${n === 1 ? '' : 's'}`;

function TurmaAlunos() {
  const idTurma = Number(useParams().idTurma);
  const [parametros, setParametros] = useSearchParams();

  const [dados, setDados] = useState({ vinculos: [], alunos: [], acompanhamentos: [], bimestres: [] });
  const [filtroStatus, setFiltroStatus] = useState('');
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      const [vinculos, alunos, acompanhamentos, todosBimestres] = await Promise.all([
        listarVinculos({ idTurma }),
        listarAlunos(),
        listarAcompanhamentos(),
        listarBimestres(),
      ]);
      const anoAtual = new Date().getFullYear();
      const bimestres = todosBimestres
        .filter((b) => b.anoLetivo === anoAtual)
        .sort((a, b) => a.numero - b.numero);
      setDados({ vinculos, alunos, acompanhamentos, bimestres });
    } catch (error) {
      setErro(mensagemDeErro(error));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [idTurma]);

  // Disciplina e bimestre ficam na URL (?disciplina=3&bimestre=4): o link do card já abre no lugar certo
  const vinculo =
    dados.vinculos.find((v) => v.idDisciplina === Number(parametros.get('disciplina'))) ?? dados.vinculos[0];
  const bimestre =
    dados.bimestres.find((b) => b.id === Number(parametros.get('bimestre'))) ??
    dados.bimestres.find((b) => b.aberto) ??
    dados.bimestres.at(-1);

  function trocarParametro(nome, valor) {
    const novos = new URLSearchParams(parametros);
    novos.set(nome, valor);
    setParametros(novos, { replace: true }); // replace: não enche o "voltar" do navegador
  }

  // Uma linha por aluno da turma, com o registro dele (se houver) na disciplina e bimestre escolhidos
  const linhas = useMemo(() => {
    if (!vinculo || !bimestre) return [];
    return dados.alunos
      .filter((aluno) => aluno.idTurma === idTurma)
      .map((aluno) => ({
        aluno,
        registro: dados.acompanhamentos.find(
          (a) =>
            a.aluno.id === aluno.id &&
            a.disciplina.id === vinculo.idDisciplina &&
            a.bimestre.id === bimestre.id &&
            a.status !== 'CANCELADO'
        ),
      }))
      .sort((a, b) => a.aluno.nome.localeCompare(b.aluno.nome, 'pt-BR'));
  }, [dados, vinculo, bimestre, idTurma]);

  const resumo = {
    enviados: linhas.filter((l) => ENVIADOS.includes(l.registro?.status)).length,
    rascunhos: linhas.filter((l) => l.registro?.status === 'RASCUNHO').length,
    devolvidos: linhas.filter((l) => l.registro?.status === 'DEVOLVIDO').length,
    semRegistro: linhas.filter((l) => !l.registro).length,
  };

  const termo = busca.trim().toLowerCase();
  const visiveis = linhas.filter((l) => {
    const status = l.registro?.status ?? SEM_REGISTRO;
    return (!filtroStatus || status === filtroStatus) && l.aluno.nome.toLowerCase().includes(termo);
  });

  function exportar() {
    exportarCsv(
      `${vinculo.turma} - ${vinculo.disciplina} - ${bimestre.numero}o bimestre`,
      [
        { titulo: 'Aluno', valor: (l) => l.aluno.nome },
        { titulo: 'Média', valor: (l) => formatarMedia(l.registro?.media) },
        { titulo: 'Tags', valor: (l) => (l.registro?.tags ?? []).map((t) => t.nome).join(', ') },
        { titulo: 'Status', valor: (l) => FILTROS_STATUS.find((f) => f.valor === (l.registro?.status ?? SEM_REGISTRO))?.rotulo },
      ],
      visiveis
    );
  }

  if (carregando) {
    return <div className="card estado">Carregando a turma...</div>;
  }

  if (erro) {
    return (
      <div className="card estado">
        <span className="estado-icone estado-icone--erro"><TriangleAlert size={22} /></span>
        <h2>Não foi possível carregar a turma</h2>
        <p>{erro}</p>
        <button type="button" className="botao botao--secundario" onClick={carregar}>
          Tentar novamente
        </button>
      </div>
    );
  }

  // Professor sem vínculo com esta turma (ex.: digitou outro id na URL)
  if (!vinculo) {
    return (
      <div className="card estado">
        <h2>Turma não encontrada entre as suas</h2>
        <p>Você só vê as turmas em que tem vínculo.</p>
        <Link to="/professor/turmas" className="botao botao--secundario">Voltar para Minhas turmas</Link>
      </div>
    );
  }

  return (
    <div className="ta">
      <nav className="ta-trilha" aria-label="Você está em">
        <Link to="/professor/turmas">Minhas turmas</Link>
        <ChevronRight size={14} />
        <span>{vinculo.turma}</span>
      </nav>

      <div className="ta-cabecalho">
        <div>
          <h1 className="ta-titulo">{vinculo.turma} · {vinculo.disciplina}</h1>
          {bimestre && (
            <p className="ta-subtitulo">
              {plural(linhas.length, 'aluno')} · {bimestre.numero}º bimestre · {plural(resumo.enviados, 'enviado')},{' '}
              {plural(resumo.rascunhos, 'rascunho')}, {plural(resumo.devolvidos, 'devolvido')},{' '}
              {resumo.semRegistro} sem registro
            </p>
          )}
        </div>
        <button type="button" className="botao botao--secundario ta-botao" onClick={exportar} disabled={visiveis.length === 0}>
          <Download size={16} /> Exportar lista
        </button>
      </div>

      <div className="ta-filtros">
        <div className="campo">
          <label htmlFor="ta-disciplina" className="campo-rotulo">Disciplina</label>
          <select
            id="ta-disciplina"
            className="campo-entrada"
            value={vinculo.idDisciplina}
            onChange={(e) => trocarParametro('disciplina', e.target.value)}
          >
            {dados.vinculos.map((v) => (
              <option key={v.id} value={v.idDisciplina}>{v.disciplina}</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="ta-bimestre" className="campo-rotulo">Bimestre</label>
          <select
            id="ta-bimestre"
            className="campo-entrada"
            value={bimestre?.id ?? ''}
            onChange={(e) => trocarParametro('bimestre', e.target.value)}
          >
            {dados.bimestres.map((b) => (
              <option key={b.id} value={b.id}>{b.numero}º bimestre{b.aberto ? ' (aberto)' : ''}</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="ta-status" className="campo-rotulo">Status</label>
          <select id="ta-status" className="campo-entrada" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            {FILTROS_STATUS.map((f) => (
              <option key={f.valor} value={f.valor}>{f.rotulo}</option>
            ))}
          </select>
        </div>

        <div className="ta-busca">
          <Search size={16} />
          <input
            type="search"
            className="campo-entrada"
            placeholder="Buscar aluno..."
            aria-label="Buscar aluno"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {bimestre && !bimestre.aberto && (
        <p className="alerta alerta--info ta-aviso">
          O {bimestre.numero}º bimestre não está aberto para digitação: aqui você só consulta os registros.
        </p>
      )}

      {visiveis.length === 0 ? (
        <div className="card estado">
          <h2>Nenhum aluno encontrado</h2>
          <p>Ajuste o status ou a busca.</p>
        </div>
      ) : (
        <div className="card tabela-caixa">
          <table className="tabela">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Média</th>
                <th>Tags</th>
                <th>Status</th>
                <th>Atualizado</th>
                <th className="tabela-acoes">Ação</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((linha) => {
                const { aluno, registro } = linha;
                return (
                  <tr key={aluno.id} className={registro?.status === 'DEVOLVIDO' ? 'tabela-destaque' : ''}>
                    <td className="tabela-forte">{aluno.nome}</td>
                    <td>{formatarMedia(registro?.media)}</td>
                    <td>
                      {registro?.tags?.length ? (
                        <div className="ta-tags">
                          {registro.tags.map((t) => <span key={t.id} className="ta-tag">{t.nome}</span>)}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {registro ? <BadgeStatus status={registro.status} /> : <span className="ta-sem-registro">Sem registro</span>}
                    </td>
                    <td>{formatarAtualizado(registro?.atualizadoEm)}</td>
                    <td className="tabela-acoes">
                      <Acao linha={linha} turma={idTurma} idDisciplina={vinculo.idDisciplina} periodoAberto={Boolean(bimestre?.aberto)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TurmaAlunos;