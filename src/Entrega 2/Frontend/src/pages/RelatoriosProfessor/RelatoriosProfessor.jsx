import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, TriangleAlert } from 'lucide-react';
import { listarVinculos } from '../../services/vinculoService';
import { listarAlunos } from '../../services/alunoService';
import { listarAcompanhamentos } from '../../services/acompanhamentoService';
import { listarBimestres } from '../../services/catalogoService';
import { listarRetornos } from '../../services/retornoService';
import { mensagemDeErro } from '../../services/api';
import './RelatoriosProfessor.css';

const ENVIADOS = ['ENVIADO', 'EM_REVISAO', 'PUBLICADO'];

// ---------- Formatação ----------
const formatarMedia = (valor) => (valor === null ? '—' : valor.toFixed(1).replace('.', ','));
const formatarPorcentagem = (valor) => (valor === null ? '—' : `${Math.round(valor * 100)}%`);

// "2026-07-20T19:12" → "20/07"
function formatarDia(dataHora) {
  if (!dataHora) return '';
  const [ano, mes, dia] = dataHora.split('T')[0].split('-');
  return `${dia}/${mes}`;
}

// "Carla Souza" → "CS"
function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes.at(-1)[0] : '')).toUpperCase();
}

// ---------- Contas ----------
// Média de uma lista de registros (ignora os sem média). null se não houver nenhuma.
function mediaDe(registros) {
  const medias = registros.map((r) => r.media).filter((m) => m !== null && m !== undefined);
  return medias.length > 0 ? medias.reduce((soma, m) => soma + m, 0) / medias.length : null;
}

// Tag que mais aparece nos registros (Map: nome → quantidade)
function tagMaisUsada(registros) {
  const contagem = new Map();
  for (const registro of registros) {
    for (const tag of registro.tags ?? []) {
      contagem.set(tag.nome, (contagem.get(tag.nome) ?? 0) + 1);
    }
  }
  let maisUsada = null;
  for (const [nome, quantidade] of contagem) {
    if (!maisUsada || quantidade > maisUsada.quantidade) maisUsada = { nome, quantidade };
  }
  return maisUsada?.nome ?? null;
}

// Fração dos publicados que já têm ciência de algum responsável. null se não houver publicados.
function fracaoComCiencia(registros, idsComCiencia) {
  const publicados = registros.filter((r) => r.status === 'PUBLICADO');
  if (publicados.length === 0) return null;
  return publicados.filter((r) => idsComCiencia.has(r.id)).length / publicados.length;
}

function bimestrePadrao(bimestres) {
  const agora = new Date();
  return (
    bimestres.find((b) => b.aberto) ??
    bimestres.filter((b) => new Date(b.dataAbertura) <= agora).at(-1) ??
    bimestres[0]
  );
}

// ---------- Componentes da tela ----------
function ItemRetorno({ retorno }) {
  return (
    <li>
      <Link to={`/professor/acompanhamentos/${retorno.idAcompanhamento}`} className="rp-retorno">
        <span className="rp-avatar" aria-hidden="true">{iniciais(retorno.responsavel.nome)}</span>
        <div className="rp-retorno-texto">
          <strong>
            {retorno.responsavel.nome} · {retorno.aluno.nome} · {retorno.bimestre.numero}º bim.
          </strong>
          <span className="rp-retorno-contexto">{retorno.turma.nome} · {retorno.disciplina.nome}</span>
          <p>{retorno.observacao ? `“${retorno.observacao}”` : 'Registrou ciência'}</p>
        </div>
        <time className="rp-retorno-data" dateTime={retorno.dataHora}>{formatarDia(retorno.dataHora)}</time>
      </Link>
    </li>
  );
}

function RelatoriosProfessor() {
  const [dados, setDados] = useState({ vinculos: [], alunos: [], acompanhamentos: [], bimestres: [], retornos: [] });
  const [idBimestre, setIdBimestre] = useState(null);
  const [aba, setAba] = useState('registros');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      const [vinculos, alunos, acompanhamentos, todosBimestres, retornos] = await Promise.all([
        listarVinculos(),
        listarAlunos(),
        listarAcompanhamentos(),
        listarBimestres(),
        listarRetornos(), // o backend devolve só os retornos dos registros deste professor
      ]);
      const anoAtual = new Date().getFullYear();
      const bimestres = todosBimestres.filter((b) => b.anoLetivo === anoAtual).sort((a, b) => a.numero - b.numero);

      setDados({
        vinculos,
        alunos,
        acompanhamentos: acompanhamentos.filter((a) => a.status !== 'CANCELADO'),
        bimestres,
        retornos,
      });
      setIdBimestre((atual) => atual ?? bimestrePadrao(bimestres)?.id ?? null);
    } catch (error) {
      setErro(mensagemDeErro(error));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const bimestre = dados.bimestres.find((b) => b.id === idBimestre);

  // Set com os ids dos acompanhamentos que têm ciência: consulta rápida com .has()
  const idsComCiencia = useMemo(
    () => new Set(dados.retornos.map((r) => r.idAcompanhamento)),
    [dados.retornos]
  );

  // Uma linha por vínculo (turma + disciplina), com as contas do bimestre escolhido
  const linhas = useMemo(() => {
    if (!bimestre) return [];
    return dados.vinculos
      .map((vinculo) => {
        const registros = dados.acompanhamentos.filter(
          (a) =>
            a.turma.id === vinculo.idTurma &&
            a.disciplina.id === vinculo.idDisciplina &&
            a.bimestre.id === bimestre.id
        );
        const contar = (status) => registros.filter((r) => status.includes(r.status)).length;
        return {
          vinculo,
          registros,
          alunos: dados.alunos.filter((a) => a.idTurma === vinculo.idTurma).length,
          rascunhos: contar(['RASCUNHO', 'DEVOLVIDO']), // os dois estão com o professor
          aguardando: contar(['ENVIADO', 'EM_REVISAO']),
          publicados: contar(['PUBLICADO']),
          media: mediaDe(registros),
          tag: tagMaisUsada(registros),
          ciencia: fracaoComCiencia(registros, idsComCiencia),
        };
      })
      .sort(
        (a, b) =>
          a.vinculo.turma.localeCompare(b.vinculo.turma, 'pt-BR', { numeric: true }) ||
          a.vinculo.disciplina.localeCompare(b.vinculo.disciplina, 'pt-BR')
      );
  }, [dados, bimestre, idsComCiencia]);

  // Os 4 números do topo, somando todas as linhas
  const todosRegistros = linhas.flatMap((l) => l.registros);
  const indicadores = {
    enviados: todosRegistros.filter((r) => ENVIADOS.includes(r.status)).length,
    esperados: linhas.reduce((soma, l) => soma + l.alunos, 0),
    publicados: linhas.reduce((soma, l) => soma + l.publicados, 0),
    media: mediaDe(todosRegistros),
    ciencia: fracaoComCiencia(todosRegistros, idsComCiencia),
  };

  function renderizarRegistros() {
    if (dados.vinculos.length === 0) {
      return (
        <div className="card estado">
          <h2>Você ainda não tem turmas vinculadas</h2>
          <p>A administração da escola define quais turmas e disciplinas ficam com cada professor.</p>
        </div>
      );
    }

    return (
      <>
        <div className="rp-indicadores">
          <div className="card rp-indicador">
            <strong>{indicadores.enviados}/{indicadores.esperados}</strong>
            <span>registros enviados</span>
          </div>
          <div className="card rp-indicador">
            <strong>{indicadores.publicados}</strong>
            <span>publicados às famílias</span>
          </div>
          <div className="card rp-indicador">
            <strong>{formatarMedia(indicadores.media)}</strong>
            <span>média geral das turmas</span>
          </div>
          <div className="card rp-indicador">
            <strong>{formatarPorcentagem(indicadores.ciencia)}</strong>
            <span>ciência registrada pelos responsáveis</span>
          </div>
        </div>

        <div className="card tabela-caixa rp-tabela">
          <table className="tabela">
            <thead>
              <tr>
                <th>Turma · Disciplina</th>
                <th>Alunos</th>
                <th>Em edição</th>
                <th>Aguardando revisão</th>
                <th>Publicados</th>
                <th>Média</th>
                <th>Tag mais usada</th>
                <th>Ciência</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.vinculo.id}>
                  <td className="tabela-forte">
                    <Link
                      to={`/professor/turmas/${l.vinculo.idTurma}?disciplina=${l.vinculo.idDisciplina}&bimestre=${bimestre.id}`}
                      className="rp-link"
                    >
                      {l.vinculo.turma} · {l.vinculo.disciplina}
                    </Link>
                  </td>
                  <td>{l.alunos}</td>
                  <td>{l.rascunhos}</td>
                  <td>{l.aguardando}</td>
                  <td>{l.publicados}</td>
                  <td>{formatarMedia(l.media)}</td>
                  <td>{l.tag ? <span className="rp-tag">{l.tag}</span> : '—'}</td>
                  <td>{formatarPorcentagem(l.ciencia)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="card rp-recentes" aria-labelledby="rp-titulo-recentes">
          <div className="rp-recentes-topo">
            <h2 id="rp-titulo-recentes">Retornos recentes</h2>
            {dados.retornos.length > 3 && (
              <button type="button" className="botao botao--link" onClick={() => setAba('retornos')}>
                Ver todos
              </button>
            )}
          </div>
          {dados.retornos.length === 0 ? (
            <p className="rp-vazio">Nenhum responsável registrou ciência ainda.</p>
          ) : (
            <ul className="rp-retornos">
              {dados.retornos.slice(0, 3).map((r) => (
                <ItemRetorno key={`${r.idAcompanhamento}-${r.responsavel.id}`} retorno={r} />
              ))}
            </ul>
          )}
        </section>
      </>
    );
  }

  function renderizarRetornos() {
    if (dados.retornos.length === 0) {
      return (
        <div className="card estado">
          <span className="estado-icone"><MessageSquare size={22} /></span>
          <h2>Nenhum retorno ainda</h2>
          <p>Quando um responsável registrar ciência de um relatório seu, ele aparecerá aqui.</p>
        </div>
      );
    }
    return (
      <section className="card rp-recentes">
        <ul className="rp-retornos">
          {dados.retornos.map((r) => (
            <ItemRetorno key={`${r.idAcompanhamento}-${r.responsavel.id}`} retorno={r} />
          ))}
        </ul>
      </section>
    );
  }

  function renderizarConteudo() {
    if (carregando) return <div className="card estado">Carregando relatórios...</div>;
    if (erro) {
      return (
        <div className="card estado">
          <span className="estado-icone estado-icone--erro"><TriangleAlert size={22} /></span>
          <h2>Não foi possível carregar os relatórios</h2>
          <p>{erro}</p>
          <button type="button" className="botao botao--secundario" onClick={carregar}>
            Tentar novamente
          </button>
        </div>
      );
    }
    if (aba === 'retornos') return renderizarRetornos();
    if (!bimestre) {
      return (
        <div className="card estado">
          <h2>Nenhum bimestre cadastrado para este ano</h2>
        </div>
      );
    }
    return renderizarRegistros();
  }

  return (
    <div className="rp">
      <div className="rp-cabecalho">
        <div>
          <h1 className="rp-titulo">Relatórios e retornos</h1>
          <p className="rp-subtitulo">Consolidado dos seus registros e dos retornos das famílias</p>
        </div>

        {aba === 'registros' && dados.bimestres.length > 0 && (
          <div className="campo rp-filtro">
            <label htmlFor="rp-bimestre" className="campo-rotulo">Bimestre</label>
            <select
              id="rp-bimestre"
              className="campo-entrada"
              value={idBimestre ?? ''}
              onChange={(e) => setIdBimestre(Number(e.target.value))}
            >
              {dados.bimestres.map((b) => (
                <option key={b.id} value={b.id}>{b.numero}º bimestre{b.aberto ? ' (aberto)' : ''}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="abas" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={aba === 'registros'}
          className={`aba ${aba === 'registros' ? 'aba--ativa' : ''}`}
          onClick={() => setAba('registros')}
        >
          Registros por turma
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={aba === 'retornos'}
          className={`aba ${aba === 'retornos' ? 'aba--ativa' : ''}`}
          onClick={() => setAba('retornos')}
        >
          Retornos dos responsáveis ({dados.retornos.length})
        </button>
      </div>

      {renderizarConteudo()}
    </div>
  );
}

export default RelatoriosProfessor;