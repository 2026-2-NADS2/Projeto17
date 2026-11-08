import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, Eye, Pencil, Plus, TriangleAlert } from 'lucide-react';
import BadgeStatus from '../../components/BadgeStatus/BadgeStatus';
import { listarVinculos } from '../../services/vinculoService';
import { listarAlunos } from '../../services/alunoService';
import { listarAcompanhamentos } from '../../services/acompanhamentoService';
import { listarBimestres } from '../../services/catalogoService';
import { mensagemDeErro } from '../../services/api';
import { listarRetornos } from '../../services/retornoService';
import './HistoricoAluno.css';

const EDITAVEIS = ['RASCUNHO', 'DEVOLVIDO'];

// 8.5 → "8,5"
const formatarMedia = (media) => (media === null || media === undefined ? '—' : media.toFixed(1).replace('.', ','));

// "2026-04-30T19:12" → "30/04/2026"
function formatarData(dataHora) {
  const [ano, mes, dia] = dataHora.split('T')[0].split('-');
  return `${dia}/${mes}/${ano}`;
}

// Bimestre sem registro: o selo diz se ele ainda vai abrir, está aberto ou já passou
function situacaoSemRegistro(bimestre) {
  if (bimestre.aberto) return { rotulo: 'Aberto · sem registro', classe: 'aberto' };
  if (new Date(bimestre.dataAbertura) > new Date()) return { rotulo: 'Período agendado', classe: 'agendado' };
  return { rotulo: 'Sem registro', classe: 'vazio' };
}

function HistoricoAluno() {
  const idTurma = Number(useParams().idTurma);
  const idAluno = Number(useParams().idAluno);
  const [parametros] = useSearchParams();
  const idDisciplinaUrl = Number(parametros.get('disciplina'));

  const [dados, setDados] = useState({ vinculos: [], aluno: null, registros: [], bimestres: [], retornos: [] });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      const [vinculos, alunos, registros, todosBimestres, retornos] = await Promise.all([
        listarVinculos({ idTurma }),
        listarAlunos(),
        listarAcompanhamentos({ idAluno }), // o backend já filtra: só os registros deste professor
        listarBimestres(),
        listarRetornos(), // só os retornos dos registros deste professor
      ]);
      const anoAtual = new Date().getFullYear();
      setDados({
        vinculos,
        aluno: alunos.find((a) => a.id === idAluno && a.idTurma === idTurma) ?? null,
        registros: registros.filter((r) => r.status !== 'CANCELADO'),
        bimestres: todosBimestres.filter((b) => b.anoLetivo === anoAtual).sort((a, b) => a.numero - b.numero),
        retornos: retornos.filter((r) => r.aluno.id === idAluno),
      });
    } catch (error) {
      setErro(mensagemDeErro(error));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [idTurma, idAluno]);

  if (carregando) {
    return <div className="card estado">Carregando o histórico...</div>;
  }

  if (erro) {
    return (
      <div className="card estado">
        <span className="estado-icone estado-icone--erro"><TriangleAlert size={22} /></span>
        <h2>Não foi possível carregar o histórico</h2>
        <p>{erro}</p>
        <button type="button" className="botao botao--secundario" onClick={carregar}>
          Tentar novamente
        </button>
      </div>
    );
  }

  const vinculo = dados.vinculos.find((v) => v.idDisciplina === idDisciplinaUrl) ?? dados.vinculos[0];

  if (!vinculo || !dados.aluno) {
    return (
      <div className="card estado">
        <h2>Aluno não encontrado nas suas turmas</h2>
        <Link to="/professor/turmas" className="botao botao--secundario">Voltar para Minhas turmas</Link>
      </div>
    );
  }

  // Só os registros desta disciplina, do ano atual; um por bimestre
  const registroDo = (bimestre) =>
    dados.registros.find((r) => r.disciplina.id === vinculo.idDisciplina && r.bimestre.id === bimestre.id);

  const linhas = dados.bimestres
    .map((bimestre) => ({ bimestre, registro: registroDo(bimestre) }))
    .filter((l) => l.registro)
    .reverse(); // mais recente primeiro, como no Figma

  const bimestreAberto = dados.bimestres.find((b) => b.aberto);
  const podeRegistrar = bimestreAberto && !registroDo(bimestreAberto);
  const linkDaTurma = `/professor/turmas/${idTurma}?disciplina=${vinculo.idDisciplina}`;
  // Retornos da família sobre ESTE aluno nesta disciplina (o mais recente primeiro)
  const retornos = dados.retornos.filter((r) => r.disciplina.id === vinculo.idDisciplina);

  return (
    <div className="ha">
      <nav className="ha-trilha" aria-label="Você está em">
        <Link to="/professor/turmas">Minhas turmas</Link>
        <ChevronRight size={14} />
        <Link to={linkDaTurma}>{vinculo.turma}</Link>
        <ChevronRight size={14} />
        <span>{dados.aluno.nome}</span>
      </nav>

      <div className="ha-cabecalho">
        <div>
          <h1 className="ha-titulo">{dados.aluno.nome}</h1>
          <p className="ha-subtitulo">
            {vinculo.turma} · {vinculo.disciplina} · Ano letivo {vinculo.anoLetivo}
          </p>
        </div>
        {podeRegistrar && (
          <Link
            to={`/professor/criar-acompanhamento?turma=${idTurma}&aluno=${idAluno}&disciplina=${vinculo.idDisciplina}`}
            className="botao botao--primario ha-botao"
          >
            <Plus size={16} /> Novo acompanhamento
          </Link>
        )}
      </div>

      {/* Um card por bimestre: a média e a situação */}
      <div className="ha-bimestres">
        {dados.bimestres.map((bimestre) => {
          const registro = registroDo(bimestre);
          const semRegistro = !registro && situacaoSemRegistro(bimestre);
          return (
            <div key={bimestre.id} className="card ha-bimestre">
              <span className="ha-bimestre-nome">{bimestre.numero}º bimestre</span>
              <strong className={`ha-bimestre-media ${registro?.media === null || !registro ? 'ha-bimestre-media--vazia' : ''}`}>
                {registro ? formatarMedia(registro.media) : '—'}
              </strong>
              {registro ? (
                <BadgeStatus status={registro.status} />
              ) : (
                <span className={`ha-selo ha-selo--${semRegistro.classe}`}>{semRegistro.rotulo}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="ha-conteudo">
        <div>
          {linhas.length === 0 ? (
            <div className="card estado">
              <h2>Nenhum acompanhamento registrado ainda</h2>
              <p>Os registros de {dados.aluno.nome} em {vinculo.disciplina} aparecerão aqui, bimestre a bimestre.</p>
            </div>
          ) : (
            <div className="card tabela-caixa">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Bimestre</th>
                    <th>Descrição</th>
                    <th>Média</th>
                    <th>Status</th>
                    <th className="tabela-acoes">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map(({ bimestre, registro }) => {
                    const editavel = EDITAVEIS.includes(registro.status) && bimestre.aberto;
                    return (
                      <tr key={registro.id}>
                        <td className="tabela-forte">{bimestre.numero}º</td>
                        <td className="ha-descricao" title={registro.descricao ?? ''}>{registro.descricao || '—'}</td>
                        <td>{formatarMedia(registro.media)}</td>
                        <td><BadgeStatus status={registro.status} /></td>
                        <td className="tabela-acoes">
                          <Link
                            to={`/professor/acompanhamentos/${registro.id}${editavel ? '/editar' : ''}`}
                            className="botao-icone"
                            aria-label={editavel ? `Editar ${bimestre.numero}º bimestre` : `Ver ${bimestre.numero}º bimestre`}
                            title={editavel ? 'Editar' : 'Ver'}
                          >
                            {editavel ? <Pencil size={16} /> : <Eye size={16} />}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ----- Retornos do responsável (Figma T05) ----- */}
        <aside className="card ha-retornos" aria-labelledby="ha-titulo-retornos">
          <h2 id="ha-titulo-retornos">Retornos do responsável</h2>
          {retornos.length === 0 ? (
            <p className="ha-retornos-vazio">Nenhum retorno da família em {vinculo.disciplina} ainda.</p>
          ) : (
            <ul>
              {retornos.map((r) => (
                <li key={`${r.idAcompanhamento}-${r.responsavel.id}`} className="ha-retorno">
                  <strong>{r.responsavel.nome} · {r.bimestre.numero}º bimestre</strong>
                  {r.observacao ? (
                    <p>“{r.observacao}”</p>
                  ) : (
                    <p className="ha-retorno-ciencia">Ciência registrada em {formatarData(r.dataHora)}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}

export default HistoricoAluno;