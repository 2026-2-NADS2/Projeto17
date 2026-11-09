import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';
import EstadoRequisicao from '../DashboardResponsavel/components/EstadoRequisicao/EstadoRequisicao';
import { formatarMedia, normalizarRelatorio } from '../../utils/relatorios';
import { listarRetornos, registrarCiencia as registrarCienciaNaApi, atualizarObservacao } from '../../services/retornoService';
import { obterUsuario } from '../../services/authService';
import './DetalheRelatorioResponsavel.css';

function formatarData(valor) {
  if (!valor) return '—';
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? String(valor) : data.toLocaleDateString('pt-BR');
}

function DetalheRelatorioResponsavel() {
  const { id } = useParams();
  const [rel, setRel] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [tentativa, setTentativa] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [confirmou, setConfirmou] = useState(false);
  const [cienciaEm, setCienciaEm] = useState(null);
  const [observacao, setObservacao] = useState('');
  const [observacaoEnviada, setObservacaoEnviada] = useState(null);
    const [geradoEm, setGeradoEm] = useState('');
      const [aviso, setAviso] = useState('');

  useEffect(() => {
    if (!aviso) return undefined;
    const temporizador = setTimeout(() => setAviso(''), 4000);
    return () => clearTimeout(temporizador);
  }, [aviso]);


  function baixarPdf() {
    setGeradoEm(new Date().toLocaleString('pt-BR'));
    setTimeout(() => window.print(), 150);
  }

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      try {
        const [resposta, ciencias] = await Promise.all([
          api.get(`/acompanhamentos/${id}`),
          listarRetornos({ idAcompanhamento: id }), // o responsável só recebe as ciências que ele deu
        ]);
        if (cancelado) return;
        setRel(normalizarRelatorio(resposta.data?.dados ?? resposta.data));
        const minha = ciencias[0];
        if (minha) {
          setCienciaEm(new Date(minha.dataHora).toLocaleString('pt-BR'));
          setObservacaoEnviada(minha.observacao);
        }
      } catch {
        if (!cancelado) setErro('Não foi possível carregar o relatório.');
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }
    carregar();
    return () => {
      cancelado = true;
    };
  }, [id, tentativa]);

  function tentarDeNovo() {
    setErro(null);
    setCarregando(true);
    setTentativa((t) => t + 1);
  }

  async function registrarCiencia() {
    try {
      const ciencia = await registrarCienciaNaApi(id);
      setCienciaEm(new Date(ciencia.dataHora).toLocaleString('pt-BR'));
      setAviso('Ciência registrada. A escola e o professor foram informados.');
    } catch (e) {
      setAviso(e.response?.data?.erro ?? 'Não foi possível registrar a ciência.');
    } finally {
      setModalAberto(false);
      setConfirmou(false);
    }
  }

  // Sem ciência ainda: registra as duas coisas juntas. Com ciência: só atualiza a observação.
  async function enviarObservacao() {
    const texto = observacao.trim();
    if (!texto) return;
    try {
      const ciencia = jaTemCiencia
        ? await atualizarObservacao(id, texto)
        : await registrarCienciaNaApi(id, { observacao: texto });
      setCienciaEm(new Date(ciencia.dataHora).toLocaleString('pt-BR'));
      setObservacaoEnviada(ciencia.observacao);
      setObservacao('');
      setAviso('Observação enviada à escola.');
    } catch (e) {
      setAviso(e.response?.data?.erro ?? 'Não foi possível enviar a observação.');
    }
  }

  if (carregando) return <div className="det-rel"><EstadoRequisicao tipo="carregando" mensagem="Carregando relatório…" /></div>;
  if (erro) return <div className="det-rel"><EstadoRequisicao tipo="erro" mensagem={erro} onTentarDeNovo={tentarDeNovo} /></div>;
  if (!rel) return <div className="det-rel"><EstadoRequisicao tipo="vazio" mensagem="Relatório não encontrado." /></div>;

  const jaTemCiencia = rel.cienciaRegistrada === true || cienciaEm !== null;
  const tags = (rel.tags ?? []).map((t) => (typeof t === 'string' ? t : t.nome));

  return (
    <div className="det-rel">
      <nav className="det-rel__trilha">
        <Link to="/responsavel/relatorios">Relatórios</Link> › <span>{rel.aluno}</span> ›{' '}
        <span>{rel.disciplina} · {rel.bimestre}º bim.</span>
      </nav>

      <div className="det-rel__cabecalho">
        <div>
          <h1 className="det-rel__titulo">{rel.disciplina} · {rel.bimestre}º bimestre</h1>
          <p className="det-rel__sub">
            {rel.aluno} · {rel.turma ?? '—'} · ano letivo {rel.anoLetivo}
          </p>
        </div>
        <div className="det-rel__acoes">
                    <button type="button" className="det-rel__btn" onClick={baixarPdf}>
            Baixar PDF
          </button>
          {!jaTemCiencia && (
            <button type="button" className="det-rel__btn det-rel__btn--azul" onClick={() => setModalAberto(true)}>
              Registrar ciência
            </button>
          )}
        </div>
      </div>

      {jaTemCiencia && (
        <div className="det-rel__aviso-ok" role="status">
          <strong>Ciência registrada{cienciaEm ? ` em ${cienciaEm}` : ''}</strong>
          <span>Obrigado! A escola e o professor foram informados de que você leu o relatório.</span>
        </div>
      )}

      <div className="det-rel__grade">
        <section className="det-rel__card">
          <div className="det-rel__resumo">
            <div className="det-rel__media">
              <small>Média</small>
              <strong>{formatarMedia(rel.media)}</strong>
              <small>de 10,0</small>
            </div>
            <div><small>Professor</small><strong>{rel.professor ?? '—'}</strong></div>
            <div><small>Turma</small><strong>{rel.turma ?? '—'}</strong></div>
            <div><small>Publicado em</small><strong>{formatarData(rel.publicadoEm)}</strong></div>
          </div>
          <h2 className="det-rel__subtitulo">Descrição do acompanhamento</h2>
          <p className="det-rel__texto">{rel.descricao || 'Sem descrição.'}</p>
          {tags.length > 0 && (
            <>
              <small>Tags</small>
              <div className="det-rel__tags">
                {tags.map((t) => <span key={t} className="det-rel__tag">{t}</span>)}
              </div>
            </>
          )}
        </section>

        <aside className="det-rel__lateral">
          <section className="det-rel__card">
            <h2 className="det-rel__subtitulo">Ciência do relatório</h2>
            {jaTemCiencia ? (
              <span className="det-rel__selo-ok">Registrada{cienciaEm ? ` · ${cienciaEm}` : ''}</span>
            ) : (
              <>
                <p className="det-rel__texto">Confirme que você leu este relatório. A escola e o professor verão a data da sua ciência.</p>
                <button type="button" className="det-rel__btn det-rel__btn--azul det-rel__btn--cheio" onClick={() => setModalAberto(true)}>
                  Registrar ciência
                </button>
              </>
            )}
          </section>

          <section className="det-rel__card">
            <h2 className="det-rel__subtitulo">Observação para a escola</h2>
            {observacaoEnviada && (
              <p className="det-rel__obs">“{observacaoEnviada}”<small>Visível ao professor e à administração.</small></p>
            )}
            <label htmlFor="obs">Mensagem (opcional)</label>
            <textarea
              id="obs"
              maxLength={500}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Digite uma observação sobre este relatório..."
            />
            <small>{observacao.length}/500 caracteres</small>
            <button type="button" className="det-rel__btn det-rel__btn--cheio" onClick={enviarObservacao}>
              Enviar observação
            </button>
            <small>Visível ao professor e à administração.</small>
          </section>
        </aside>
      </div>

      {aviso && (
        <div className="det-rel__toast" role="status">
          <span>{aviso}</span>
          <button type="button" aria-label="Fechar aviso" onClick={() => setAviso('')}>×</button>
        </div>
      )}
      
      <section className="det-rel__folha" aria-hidden="true">
        <header className="folha__faixa">
          <strong className="folha__marca">Class<span>Sync</span></strong>
          <div className="folha__titulo">
            <strong>Relatório de acompanhamento bimestral</strong>
            <span>Escola Municipal Horizonte</span>
          </div>
        </header>

        <div className="folha__linha">
          <div><small>Aluno</small><strong>{rel.aluno}</strong></div>
          <div><small>Turma</small><strong>{rel.turma ?? '—'}</strong></div>
          <div><small>Ano letivo</small><strong>{rel.anoLetivo}</strong></div>
          <div><small>Bimestre</small><strong>{rel.bimestre}º</strong></div>
        </div>

        <div className="folha__linha">
          <div><small>Disciplina</small><strong>{rel.disciplina}</strong></div>
          <div><small>Professor(a)</small><strong>{rel.professor ?? '—'}</strong></div>
          <div><small>Média</small><strong className="folha__media">{formatarMedia(rel.media)}</strong></div>
        </div>

        <h2 className="folha__subtitulo">Descrição</h2>
        <p className="folha__texto">{rel.descricao || 'Sem descrição.'}</p>

        {tags.length > 0 && (
          <>
            <small className="folha__rotulo">Tags</small>
            <div className="folha__tags">
              {tags.map((t) => <span key={t}>{t}</span>)}
            </div>
          </>
        )}

        <footer className="folha__rodape">
          <p>
            Publicado pela administração em {formatarData(rel.publicadoEm)} · Ciência do responsável:{' '}
            {jaTemCiencia ? 'registrada' : 'pendente'}
          </p>
          <p>
            Gerado em {geradoEm} por {obterUsuario()?.nome ?? 'Responsável'} · Documento com dados
            pessoais de menor — uso restrito à família (LGPD).
          </p>
        </footer>
      </section>

      {modalAberto && (
        <div className="det-rel__fundo" role="dialog" aria-modal="true" aria-labelledby="titulo-modal">
          <div className="det-rel__modal">
            <h2 id="titulo-modal">Registrar ciência?</h2>
            <p className="det-rel__texto">
              Você confirma que leu o relatório de {rel.disciplina} do {rel.bimestre}º bimestre de {rel.aluno}. A data e o horário serão registrados.
            </p>
            <label className="det-rel__check">
              <input type="checkbox" checked={confirmou} onChange={(e) => setConfirmou(e.target.checked)} />
              Li e estou ciente do conteúdo deste relatório.
            </label>
            <div className="det-rel__modal-acoes">
              <button type="button" className="det-rel__btn" onClick={() => { setModalAberto(false); setConfirmou(false); }}>Cancelar</button>
              <button type="button" className="det-rel__btn det-rel__btn--azul" disabled={!confirmou} onClick={registrarCiencia}>Registrar ciência</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetalheRelatorioResponsavel;