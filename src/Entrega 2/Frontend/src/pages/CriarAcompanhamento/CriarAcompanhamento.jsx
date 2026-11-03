import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Info, TriangleAlert, CircleCheck, CircleX, X } from 'lucide-react';
import BadgeStatus from '../../components/BadgeStatus/BadgeStatus';
import { listarAlunos } from '../../services/alunoService';
import { listarTurmas, listarDisciplinas, listarBimestres, listarTags } from '../../services/catalogoService';
import { criarAcompanhamento, atualizarAcompanhamento } from '../../services/acompanhamentoService';
import { mensagemDeErro } from '../../services/api';
import './CriarAcompanhamento.css';

const LIMITE_DESCRICAO = 1000;

function formatarData(valor) {
  if (!valor) return '';
  return new Date(valor).toLocaleDateString('pt-BR');
}

function formatarHora(data) {
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// "8,5" → 8.5 · "" → null · "abc" → NaN
function converterMedia(texto) {
  const limpo = texto.trim().replace(',', '.');
  if (limpo === '') return null;
  return Number(limpo);
}

function CriarAcompanhamento() {
  const navigate = useNavigate();

  // Listas que vêm do backend
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [bimestres, setBimestres] = useState([]);
  const [tags, setTags] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState('');

  // Campos do formulário
  const [idTurma, setIdTurma] = useState('');
  const [idAluno, setIdAluno] = useState('');
  const [idDisciplina, setIdDisciplina] = useState('');
  const [descricao, setDescricao] = useState('');
  const [media, setMedia] = useState('');
  const [tagsSelecionadas, setTagsSelecionadas] = useState([]);

  // Situação do registro
  const [acompanhamento, setAcompanhamento] = useState(null); // preenchido após o 1º salvamento
  const [salvoEm, setSalvoEm] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState(null); // { tipo: 'sucesso' | 'erro', texto }

  async function carregarDados() {
    setCarregando(true);
    setErroCarregamento('');
    try {
      const [listaTurmas, listaAlunos, listaDisciplinas, listaBimestres, listaTags] = await Promise.all([
        listarTurmas(),
        listarAlunos(),
        listarDisciplinas(),
        listarBimestres(),
        listarTags(),
      ]);
      setTurmas(listaTurmas);
      setAlunos(listaAlunos);
      setDisciplinas(listaDisciplinas);
      setBimestres(listaBimestres);
      setTags(listaTags);
    } catch (error) {
      setErroCarregamento(mensagemDeErro(error));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  // Valores calculados a partir do estado
  const bimestreAberto = bimestres.find((b) => b.aberto);
  const alunosDaTurma = alunos.filter((a) => a.idTurma === Number(idTurma));
  const tagsEscolhidas = tags.filter((t) => tagsSelecionadas.includes(t.id));
  const tagsSugeridas = tags.filter((t) => !tagsSelecionadas.includes(t.id));
  const jaSalvo = acompanhamento !== null;

  function trocarTurma(valor) {
    setIdTurma(valor);
    setIdAluno(''); // o aluno escolhido era da turma anterior
  }

  function alternarTag(idTag) {
    setTagsSelecionadas((atuais) =>
      atuais.includes(idTag) ? atuais.filter((id) => id !== idTag) : [...atuais, idTag]
    );
  }

  async function salvarRascunho() {
    setAviso(null);

    if (!idAluno || !idDisciplina) {
      setAviso({ tipo: 'erro', texto: 'Escolha a turma, o aluno e a disciplina antes de salvar.' });
      return;
    }

    const mediaNumero = converterMedia(media);
    if (Number.isNaN(mediaNumero)) {
      setAviso({ tipo: 'erro', texto: 'A média deve ser um número, como 8,5.' });
      return;
    }

    const dados = {
      media: mediaNumero,
      descricao: descricao.trim() || null,
      tags: tagsSelecionadas,
    };

    setSalvando(true);
    try {
      const resultado = jaSalvo
        ? await atualizarAcompanhamento(acompanhamento.id, dados)
        : await criarAcompanhamento({
            ...dados,
            idAluno: Number(idAluno),
            idDisciplina: Number(idDisciplina),
            idBimestre: bimestreAberto.id,
          });
      setAcompanhamento(resultado);
      setSalvoEm(new Date());
      setAviso({ tipo: 'sucesso', texto: 'Rascunho salvo.' });
    } catch (error) {
      setAviso({ tipo: 'erro', texto: mensagemDeErro(error) });
    } finally {
      setSalvando(false);
    }
  }

  const cabecalho = (
    <>
      <nav className="ca-trilha">
        <Link to="/professor/acompanhamentos">Acompanhamentos</Link>
        <ChevronRight size={14} />
        <span>Novo</span>
      </nav>
      <h1 className="ca-titulo">Novo acompanhamento</h1>
      <p className="ca-subtitulo">Registre a descrição, a média e as tags do aluno no bimestre aberto.</p>
    </>
  );

  if (carregando) {
    return (
      <div className="ca">
        {cabecalho}
        <div className="card ca-estado">Carregando formulário...</div>
      </div>
    );
  }

  if (erroCarregamento) {
    return (
      <div className="ca">
        {cabecalho}
        <div className="card ca-estado">
          <span className="ca-estado-icone"><TriangleAlert size={22} /></span>
          <h2>Não foi possível carregar os dados</h2>
          <p>{erroCarregamento}</p>
          <button type="button" className="botao botao--secundario" onClick={carregarDados}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ca">
      {cabecalho}

      <div className="ca-grade">
        <div className="ca-principal">
          {!bimestreAberto && (
            <div className="alerta alerta--aviso">
              <TriangleAlert size={18} />
              <div>
                <p className="alerta-titulo">Nenhum período de digitação aberto</p>
                <p>Não é possível registrar acompanhamentos agora. Fale com a administração.</p>
              </div>
            </div>
          )}

          {aviso && (
            <div className={`alerta alerta--${aviso.tipo}`}>
              {aviso.tipo === 'sucesso' ? <CircleCheck size={18} /> : <CircleX size={18} />}
              <p className="alerta-titulo">{aviso.texto}</p>
            </div>
          )}

          <section className="card">
            <h2 className="ca-card-titulo">1. Para quem é o registro</h2>
            <div className="ca-campos">
              <div className="campo">
                <label className="campo-rotulo" htmlFor="turma">Turma</label>
                <select
                  id="turma"
                  className="campo-entrada"
                  value={idTurma}
                  onChange={(e) => trocarTurma(e.target.value)}
                  disabled={jaSalvo}
                >
                  <option value="">Selecione a turma</option>
                  {turmas.map((t) => (
                    <option key={t.id} value={t.id}>{t.nome}</option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label className="campo-rotulo" htmlFor="disciplina">Disciplina</label>
                <select
                  id="disciplina"
                  className="campo-entrada"
                  value={idDisciplina}
                  onChange={(e) => setIdDisciplina(e.target.value)}
                  disabled={jaSalvo}
                >
                  <option value="">Selecione a disciplina</option>
                  {disciplinas.map((d) => (
                    <option key={d.id} value={d.id}>{d.nome}</option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label className="campo-rotulo" htmlFor="aluno">Aluno</label>
                <select
                  id="aluno"
                  className="campo-entrada"
                  value={idAluno}
                  onChange={(e) => setIdAluno(e.target.value)}
                  disabled={!idTurma || jaSalvo}
                >
                  <option value="">{idTurma ? 'Selecione o aluno' : 'Escolha a turma primeiro'}</option>
                  {alunosDaTurma.map((a) => (
                    <option key={a.id} value={a.id}>{a.nome}</option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label className="campo-rotulo" htmlFor="bimestre">Bimestre / ano letivo</label>
                <input
                  id="bimestre"
                  className="campo-entrada"
                  value={
                    bimestreAberto
                      ? `${bimestreAberto.numero}º bimestre · ${bimestreAberto.anoLetivo}`
                      : 'Nenhum período aberto'
                  }
                  disabled
                />
                <span className="campo-ajuda">Definido pelo período aberto</span>
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="ca-card-titulo">2. Acompanhamento</h2>

            <div className="campo">
              <label className="campo-rotulo" htmlFor="descricao">Descrição do acompanhamento</label>
              <textarea
                id="descricao"
                className="campo-entrada"
                placeholder="Descreva o desenvolvimento do aluno no bimestre..."
                maxLength={LIMITE_DESCRICAO}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
              <span className="campo-ajuda">{descricao.length}/{LIMITE_DESCRICAO} caracteres</span>
            </div>

            <div className="ca-linha">
              <div className="campo">
                <label className="campo-rotulo" htmlFor="media">Média do bimestre</label>
                <input
                  id="media"
                  className="campo-entrada"
                  inputMode="decimal"
                  placeholder="Ex.: 8,5"
                  value={media}
                  onChange={(e) => setMedia(e.target.value)}
                />
                <span className="campo-ajuda">Escala de 0,0 a 10,0 · uma casa decimal</span>
              </div>

              <div className="campo">
                <span className="campo-rotulo">Tags do acompanhamento</span>
                <div className="ca-tags-caixa">
                  {tagsEscolhidas.length === 0 && (
                    <span className="ca-tags-vazio">Nenhuma tag selecionada</span>
                  )}
                  {tagsEscolhidas.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      className="ca-tag ca-tag--selecionada"
                      onClick={() => alternarTag(t.id)}
                      aria-label={`Remover tag ${t.nome}`}
                    >
                      {t.nome}
                      <X size={14} />
                    </button>
                  ))}
                </div>

                {tagsSugeridas.length > 0 && (
                  <div className="ca-tags-sugestoes">
                    <span className="campo-ajuda">Sugestões:</span>
                    {tagsSugeridas.map((t) => (
                      <button type="button" key={t.id} className="ca-tag" onClick={() => alternarTag(t.id)}>
                        {t.nome}
                      </button>
                    ))}
                  </div>
                )}
                <span className="campo-ajuda">Tags cadastradas pela administração · selecione uma ou mais</span>
              </div>
            </div>
          </section>

          <div className="ca-acoes">
            <button
              type="button"
              className="botao botao--link"
              onClick={() => navigate('/professor/acompanhamentos')}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="botao botao--secundario"
              onClick={salvarRascunho}
              disabled={salvando || !bimestreAberto}
            >
              {salvando ? 'Salvando...' : 'Salvar rascunho'}
            </button>
          </div>
        </div>

        <aside className="ca-lateral">
          <section className="card">
            <div className="ca-status-topo">
              <h2 className="ca-card-titulo ca-sem-margem">Status</h2>
              <BadgeStatus status={acompanhamento?.status || 'RASCUNHO'} />
            </div>
            <div className="ca-status-linha">
              <span>Registro</span>
              <strong>{jaSalvo ? `Nº ${acompanhamento.id}` : '—'}</strong>
            </div>
            <div className="ca-status-linha">
              <span>Rascunho salvo</span>
              <strong>{salvoEm ? `às ${formatarHora(salvoEm)}` : '—'}</strong>
            </div>
          </section>

          <section className="ca-regras">
            <h2 className="ca-card-titulo">Regras do registro</h2>
            <ul>
              <li><Info size={16} />Um registro por aluno, disciplina, bimestre e ano letivo.</li>
              <li>
                <Info size={16} />
                Edição permitida somente com o período aberto
                {bimestreAberto ? ` (até ${formatarData(bimestreAberto.dataEncerramento)})` : ''}.
              </li>
              <li><Info size={16} />Após o envio, o registro fica bloqueado até a revisão.</li>
              <li><Info size={16} />A família só vê o conteúdo depois de publicado.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default CriarAcompanhamento;