import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Info, TriangleAlert, CircleCheck, CircleX, X, Send, Undo2 } from 'lucide-react';
import BadgeStatus from '../../components/BadgeStatus/BadgeStatus';
import Modal from '../../components/Modal/Modal';
import { listarAlunos } from '../../services/alunoService';
import { listarTurmas, listarDisciplinas, listarBimestres, listarTags } from '../../services/catalogoService';
import {
  buscarAcompanhamento,
  criarAcompanhamento,
  atualizarAcompanhamento,
  enviarAcompanhamento,
} from '../../services/acompanhamentoService';
import { mensagemDeErro } from '../../services/api';
import './CriarAcompanhamento.css';

const LIMITE_DESCRICAO = 1000;
const MINIMO_DESCRICAO = 20;
const STATUS_EDITAVEIS = ['RASCUNHO', 'DEVOLVIDO'];

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

// 8.5 → "8,5" · null → ""
function mediaParaTexto(valor) {
  return valor === null || valor === undefined ? '' : String(valor).replace('.', ',');
}

function FormularioAcompanhamento({ idEdicao }) {
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
  const [acompanhamento, setAcompanhamento] = useState(null); // registro já salvo no banco
  const [salvoEm, setSalvoEm] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState(null); // { tipo, titulo, texto }
  const [erros, setErros] = useState({}); // { aluno, disciplina, descricao, media }
  const [modalAberto, setModalAberto] = useState(false);

  function preencherComRegistro(registro) {
    setAcompanhamento(registro);
    setIdTurma(String(registro.turma.id));
    setIdAluno(String(registro.aluno.id));
    setIdDisciplina(String(registro.disciplina.id));
    setDescricao(registro.descricao || '');
    setMedia(mediaParaTexto(registro.media));
    setTagsSelecionadas(registro.tags.map((t) => t.id));
  }

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

      if (idEdicao) {
        preencherComRegistro(await buscarAcompanhamento(idEdicao));
      }
    } catch (error) {
      setErroCarregamento(mensagemDeErro(error));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  // ---------- Valores calculados a partir do estado ----------
  const jaSalvo = acompanhamento !== null;
  const status = acompanhamento?.status || 'RASCUNHO';
  const devolvido = status === 'DEVOLVIDO';

  // Registro novo: bimestre aberto. Registro existente: o bimestre dele.
  const bimestreDoRegistro = jaSalvo
    ? bimestres.find((b) => b.id === acompanhamento.bimestre.id)
    : bimestres.find((b) => b.aberto);
  const periodoAberto = Boolean(bimestreDoRegistro?.aberto);
  const podeEditar = STATUS_EDITAVEIS.includes(status) && periodoAberto;

  const alunosDaTurma = alunos.filter((a) => a.idTurma === Number(idTurma));
  const tagsEscolhidas = tags.filter((t) => tagsSelecionadas.includes(t.id));
  const tagsSugeridas = tags.filter((t) => !tagsSelecionadas.includes(t.id));

  const nomeAluno = alunos.find((a) => a.id === Number(idAluno))?.nome || '';
  const nomeTurma = turmas.find((t) => t.id === Number(idTurma))?.nome || '';
  const nomeDisciplina = disciplinas.find((d) => d.id === Number(idDisciplina))?.nome || '';

  // ---------- Ações dos campos ----------
  function trocarTurma(valor) {
    setIdTurma(valor);
    setIdAluno(''); // o aluno escolhido era da turma anterior
  }

  function alternarTag(idTag) {
    setTagsSelecionadas((atuais) =>
      atuais.includes(idTag) ? atuais.filter((id) => id !== idTag) : [...atuais, idTag]
    );
  }

  // ---------- Validação ----------
  // modo "rascunho": só o mínimo · modo "envio": tudo que a regra exige
  function validar(modo) {
    const novosErros = {};

    if (!idAluno) novosErros.aluno = 'Escolha a turma e o aluno.';
    if (!idDisciplina) novosErros.disciplina = 'Escolha a disciplina.';

    const mediaNumero = converterMedia(media);
    const mediaInvalida =
      mediaNumero !== null &&
      (Number.isNaN(mediaNumero) ||
        mediaNumero < 0 ||
        mediaNumero > 10 ||
        Math.abs(mediaNumero * 10 - Math.round(mediaNumero * 10)) > 1e-9); // mais de 1 casa decimal

    if (mediaInvalida) {
      novosErros.media = 'Informe um valor entre 0,0 e 10,0, com no máximo uma casa decimal.';
    }

    if (modo === 'envio') {
      if (mediaNumero === null) novosErros.media = 'A média é obrigatória para enviar.';
      if (descricao.trim().length < MINIMO_DESCRICAO) {
        novosErros.descricao = `A descrição é obrigatória (mínimo de ${MINIMO_DESCRICAO} caracteres).`;
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  // ---------- Salvar (cria na 1ª vez, atualiza nas próximas) ----------
  async function salvar() {
    const dados = {
      media: converterMedia(media),
      descricao: descricao.trim() || null,
      tags: tagsSelecionadas,
    };

    const resultado = jaSalvo
      ? await atualizarAcompanhamento(acompanhamento.id, dados)
      : await criarAcompanhamento({
          ...dados,
          idAluno: Number(idAluno),
          idDisciplina: Number(idDisciplina),
          idBimestre: bimestreDoRegistro.id,
        });

    setAcompanhamento(resultado);
    setSalvoEm(new Date());
    return resultado;
  }

  async function salvarRascunho() {
    setAviso(null);
    if (!validar('rascunho')) return;

    setSalvando(true);
    try {
      await salvar();
      setAviso({ tipo: 'sucesso', titulo: 'Rascunho salvo.' });
    } catch (error) {
      setAviso({ tipo: 'erro', titulo: 'Não foi possível salvar', texto: mensagemDeErro(error) });
    } finally {
      setSalvando(false);
    }
  }

  function pedirEnvio() {
    setAviso(null);
    if (!validar('envio')) {
      setAviso({
        tipo: 'erro',
        titulo: 'Não foi possível enviar',
        texto: 'Corrija os campos destacados. O rascunho foi mantido.',
      });
      return;
    }
    setModalAberto(true);
  }

  async function confirmarEnvio() {
    setSalvando(true);
    try {
      const salvo = await salvar(); // garante que o texto mais recente vai junto
      await enviarAcompanhamento(salvo.id);
      navigate('/professor/acompanhamentos', {
        state: { mensagem: 'Acompanhamento enviado para revisão.' },
      });
    } catch (error) {
      setModalAberto(false);
      setAviso({ tipo: 'erro', titulo: 'Não foi possível enviar', texto: mensagemDeErro(error) });
    } finally {
      setSalvando(false);
    }
  }

  // ---------- Tela ----------
  const titulo = !jaSalvo ? 'Novo acompanhamento' : devolvido ? 'Corrigir acompanhamento' : 'Editar acompanhamento';

  const cabecalho = (
    <>
      <nav className="ca-trilha">
        <Link to="/professor/acompanhamentos">Acompanhamentos</Link>
        <ChevronRight size={14} />
        <span>{idEdicao ? nomeAluno || 'Registro' : 'Novo'}</span>
      </nav>
      <h1 className="ca-titulo">{titulo}</h1>
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
          {devolvido && acompanhamento.motivoDevolucao && (
            <div className="ca-motivo">
              <p className="ca-motivo-rotulo"><Undo2 size={14} /> Motivo da devolução (administração)</p>
              <p>“{acompanhamento.motivoDevolucao}”</p>
            </div>
          )}

          {!periodoAberto && (
            <div className="alerta alerta--aviso">
              <TriangleAlert size={18} />
              <div>
                <p className="alerta-titulo">Período de digitação encerrado</p>
                <p>Este registro não pode ser criado ou alterado agora. Fale com a administração caso precise de reabertura.</p>
              </div>
            </div>
          )}

          {jaSalvo && !STATUS_EDITAVEIS.includes(status) && (
            <div className="alerta alerta--info">
              <Info size={18} />
              <div>
                <p className="alerta-titulo">Registro bloqueado para edição</p>
                <p>Só é possível editar acompanhamentos em rascunho ou devolvidos.</p>
              </div>
            </div>
          )}

          {aviso && (
            <div className={`alerta alerta--${aviso.tipo}`}>
              {aviso.tipo === 'sucesso' ? <CircleCheck size={18} /> : <CircleX size={18} />}
              <div>
                <p className="alerta-titulo">{aviso.titulo}</p>
                {aviso.texto && <p>{aviso.texto}</p>}
              </div>
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
                  className={`campo-entrada ${erros.disciplina ? 'campo-entrada--erro' : ''}`}
                  value={idDisciplina}
                  onChange={(e) => setIdDisciplina(e.target.value)}
                  disabled={jaSalvo}
                >
                  <option value="">Selecione a disciplina</option>
                  {disciplinas.map((d) => (
                    <option key={d.id} value={d.id}>{d.nome}</option>
                  ))}
                </select>
                {erros.disciplina && <span className="campo-erro">{erros.disciplina}</span>}
              </div>

              <div className="campo">
                <label className="campo-rotulo" htmlFor="aluno">Aluno</label>
                <select
                  id="aluno"
                  className={`campo-entrada ${erros.aluno ? 'campo-entrada--erro' : ''}`}
                  value={idAluno}
                  onChange={(e) => setIdAluno(e.target.value)}
                  disabled={!idTurma || jaSalvo}
                >
                  <option value="">{idTurma ? 'Selecione o aluno' : 'Escolha a turma primeiro'}</option>
                  {alunosDaTurma.map((a) => (
                    <option key={a.id} value={a.id}>{a.nome}</option>
                  ))}
                </select>
                {erros.aluno && <span className="campo-erro">{erros.aluno}</span>}
              </div>

              <div className="campo">
                <label className="campo-rotulo" htmlFor="bimestre">Bimestre / ano letivo</label>
                <input
                  id="bimestre"
                  className="campo-entrada"
                  value={
                    bimestreDoRegistro
                      ? `${bimestreDoRegistro.numero}º bimestre · ${bimestreDoRegistro.anoLetivo}`
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
                className={`campo-entrada ${erros.descricao ? 'campo-entrada--erro' : ''}`}
                placeholder="Descreva o desenvolvimento do aluno no bimestre..."
                maxLength={LIMITE_DESCRICAO}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                disabled={!podeEditar}
              />
              {erros.descricao ? (
                <span className="campo-erro">{erros.descricao}</span>
              ) : (
                <span className="campo-ajuda">{descricao.length}/{LIMITE_DESCRICAO} caracteres</span>
              )}
            </div>

            <div className="ca-linha">
              <div className="campo">
                <label className="campo-rotulo" htmlFor="media">Média do bimestre</label>
                <input
                  id="media"
                  className={`campo-entrada ${erros.media ? 'campo-entrada--erro' : ''}`}
                  inputMode="decimal"
                  placeholder="Ex.: 8,5"
                  value={media}
                  onChange={(e) => setMedia(e.target.value)}
                  disabled={!podeEditar}
                />
                {erros.media ? (
                  <span className="campo-erro">{erros.media}</span>
                ) : (
                  <span className="campo-ajuda">Escala de 0,0 a 10,0 · uma casa decimal</span>
                )}
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
                      disabled={!podeEditar}
                      aria-label={`Remover tag ${t.nome}`}
                    >
                      {t.nome}
                      <X size={14} />
                    </button>
                  ))}
                </div>

                {podeEditar && tagsSugeridas.length > 0 && (
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
              {podeEditar ? 'Cancelar' : 'Voltar para a lista'}
            </button>

            {podeEditar && (
              <div className="ca-acoes-direita">
                <button
                  type="button"
                  className="botao botao--secundario"
                  onClick={salvarRascunho}
                  disabled={salvando}
                >
                  {salvando ? 'Salvando...' : 'Salvar rascunho'}
                </button>
                <button
                  type="button"
                  className="botao botao--primario"
                  onClick={pedirEnvio}
                  disabled={salvando}
                >
                  <Send size={16} />
                  {devolvido ? 'Reenviar para revisão' : 'Enviar para revisão'}
                </button>
              </div>
            )}
          </div>
        </div>

        <aside className="ca-lateral">
          <section className="card">
            <div className="ca-status-topo">
              <h2 className="ca-card-titulo ca-sem-margem">Status</h2>
              <BadgeStatus status={status} />
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
                {periodoAberto ? ` (até ${formatarData(bimestreDoRegistro.dataEncerramento)})` : ''}.
              </li>
              <li><Info size={16} />Após o envio, o registro fica bloqueado até a revisão.</li>
              <li><Info size={16} />A família só vê o conteúdo depois de publicado.</li>
            </ul>
          </section>
        </aside>
      </div>

      <Modal
        aberto={modalAberto}
        titulo={devolvido ? 'Reenviar para revisão?' : 'Enviar para revisão?'}
        onFechar={() => setModalAberto(false)}
      >
        <p className="ca-modal-texto">
          Após o envio, o registro não poderá ser editado até que a administração o revise ou devolva para ajustes.
        </p>
        <div className="ca-modal-resumo">
          <strong>{nomeAluno} · {nomeTurma} · {nomeDisciplina} · {bimestreDoRegistro?.numero}º bimestre</strong>
          <span>Média {media || '—'} · {tagsSelecionadas.length} {tagsSelecionadas.length === 1 ? 'tag' : 'tags'}</span>
        </div>
        <div className="ca-modal-acoes">
          <button
            type="button"
            className="botao botao--secundario"
            onClick={() => setModalAberto(false)}
            disabled={salvando}
          >
            Cancelar
          </button>
          <button type="button" className="botao botao--primario" onClick={confirmarEnvio} disabled={salvando}>
            {salvando ? 'Enviando...' : 'Confirmar envio'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

// O "key" força o React a criar um formulário novo (estado limpo)
// sempre que mudamos de "novo" para "editar" ou de um registro para outro.
function CriarAcompanhamento() {
  const { id } = useParams();
  return <FormularioAcompanhamento key={id || 'novo'} idEdicao={id} />;
}

export default CriarAcompanhamento;
