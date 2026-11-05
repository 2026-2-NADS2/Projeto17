import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';
import EstadoCarregando from '../../components/EstadoCarregando/EstadoCarregando';
import EstadoErro from '../../components/EstadoErro/EstadoErro';
import {
  buscarAcompanhamento,
  publicarAcompanhamento,
  devolverAcompanhamento,
} from '../../services/acompanhamentoService';
import { filaExemploAtual, removerDoExemplo } from '../RevisaoAdmin/dadosExemplo';
import { nomeDe, formatarMedia } from '../RevisaoAdmin/formatadores';
import './DetalheRevisao.css';

// Mensagem do backend (contrato: error.response.data.erro) ou uma padrão
function mensagemDoErro(e, padrao) {
  return e.response?.data?.erro ?? padrao;
}

function DetalheRevisao() {
  const { id } = useParams(); // o número que está na URL: /admin/revisao/41 → "41"
  const navigate = useNavigate();
  const location = useLocation();
  const veioDoExemplo = location.state?.exemplo === true;

  // Dados da página
  const [item, setItem] = useState(veioDoExemplo ? location.state.item : null);
  const [carregando, setCarregando] = useState(!veioDoExemplo);
  const [erro, setErro] = useState(null);
  const [modoExemplo, setModoExemplo] = useState(veioDoExemplo);
  const [tentativa, setTentativa] = useState(0);

  // Janela de confirmação: null (fechada), 'publicar' ou 'devolver'
  const [modal, setModal] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [erroModal, setErroModal] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Busca o acompanhamento na API (GET /acompanhamentos/:id)
  useEffect(() => {
    if (modoExemplo) return;

    let ativo = true;

    async function buscar() {
      try {
        const dados = await buscarAcompanhamento(id);
        if (ativo) setItem(dados);
      } catch (e) {
        if (ativo) setErro(mensagemDoErro(e, 'Não foi possível carregar este acompanhamento.'));
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    buscar();
    return () => { ativo = false; };
  }, [id, tentativa, modoExemplo]);

  // Tecla Esc fecha a janela (se não estiver enviando)
  useEffect(() => {
    if (!modal) return;

    function aoTeclar(e) {
      if (e.key === 'Escape' && !enviando) setModal(null);
    }

    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [modal, enviando]);

  function tentarNovamente() {
    setCarregando(true);
    setErro(null);
    setModoExemplo(false);
    setTentativa((t) => t + 1);
  }

  function usarDadosExemplo() {
    const encontrado = filaExemploAtual().find((i) => String(i.id) === id);
    if (!encontrado) {
      setErro('Este acompanhamento não existe nos dados de exemplo.');
      return;
    }
    setItem(encontrado);
    setErro(null);
    setModoExemplo(true);
  }

  function abrirModal(tipo) {
    setModal(tipo);
    setMotivo('');
    setErroModal(null);
  }

  function fecharModal() {
    if (!enviando) setModal(null);
  }

  async function confirmar() {
    // Devolver exige motivo (o professor precisa saber o que corrigir)
    if (modal === 'devolver' && motivo.trim() === '') {
      setErroModal('Informe o motivo da devolução. O professor vai ver esse texto.');
      return;
    }

    setEnviando(true);
    setErroModal(null);

    try {
      if (modoExemplo) {
        removerDoExemplo(item.id); // só simula, não chama a API
      } else if (modal === 'publicar') {
        await publicarAcompanhamento(item.id);
      } else {
        await devolverAcompanhamento(item.id, motivo.trim());
      }

      const aluno = nomeDe(item.aluno);
      const aviso = modal === 'publicar'
        ? `Acompanhamento de ${aluno} publicado para a família.`
        : `Acompanhamento de ${aluno} devolvido ao professor.`;

      // Volta para a fila. Na API real, o item já não é mais ENVIADO, então não aparece.
      navigate('/admin/revisao', { state: { aviso, exemplo: modoExemplo } });
    } catch (e) {
      setErroModal(mensagemDoErro(e, 'Não foi possível concluir a ação. Tente novamente.'));
      setEnviando(false);
    }
  }

  function renderizarConteudo() {
    if (carregando) return <EstadoCarregando mensagem="Carregando acompanhamento..." />;
    if (erro) {
      return <EstadoErro mensagem={erro} onTentarNovamente={tentarNovamente} onUsarExemplo={usarDadosExemplo} />;
    }
    if (!item) return null;

    const aguardandoRevisao = item.status === 'ENVIADO';
    const tags = item.tags ?? [];

    return (
      <div className="detalhe-revisao__grade">
        <div className="detalhe-revisao__coluna">
          <section className="detalhe-revisao__card detalhe-revisao__info">
            <div>
              <span className="detalhe-revisao__rotulo">Professor</span>
              <strong>{nomeDe(item.professor)}</strong>
            </div>
            <div>
              <span className="detalhe-revisao__rotulo">Disciplina</span>
              <strong>{nomeDe(item.disciplina)}</strong>
            </div>
            <div>
              <span className="detalhe-revisao__rotulo">Período</span>
              <strong>{item.bimestre}º bimestre · {item.anoLetivo}</strong>
            </div>
          </section>

          <section className="detalhe-revisao__card" aria-labelledby="titulo-conteudo">
            <h2 id="titulo-conteudo">Conteúdo do acompanhamento</h2>

            <span className="detalhe-revisao__rotulo">Descrição</span>
            <p className="detalhe-revisao__descricao">{item.descricao || 'Sem descrição.'}</p>

            <div className="detalhe-revisao__linha">
              <div>
                <span className="detalhe-revisao__rotulo">Média do bimestre</span>
                <span className="detalhe-revisao__media">{formatarMedia(item.media)}</span>
              </div>
              <div>
                <span className="detalhe-revisao__rotulo">Tags</span>
                {tags.length === 0 ? (
                  <span className="detalhe-revisao__sem-tags">Nenhuma tag</span>
                ) : (
                  <ul className="detalhe-revisao__tags">
                    {tags.map((tag) => <li key={nomeDe(tag)}>{nomeDe(tag)}</li>)}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </div>

        <aside className="detalhe-revisao__card detalhe-revisao__decisao" aria-labelledby="titulo-decisao">
          <h2 id="titulo-decisao">Decisão</h2>
          {aguardandoRevisao ? (
            <>
              <button
                type="button"
                className="detalhe-revisao__botao detalhe-revisao__botao--primario"
                onClick={() => abrirModal('publicar')}
              >
                Publicar para a família
              </button>
              <button
                type="button"
                className="detalhe-revisao__botao detalhe-revisao__botao--perigo"
                onClick={() => abrirModal('devolver')}
              >
                Devolver para ajustes
              </button>
            </>
          ) : (
            <p className="detalhe-revisao__sem-acao">
              Este acompanhamento não está aguardando revisão (status: {item.status}).
            </p>
          )}
        </aside>
      </div>
    );
  }

  const aluno = item ? nomeDe(item.aluno) : '';

  return (
    <div className="detalhe-revisao">
      <SidebarAdmin />

      <main className="detalhe-revisao__conteudo">
        <nav className="detalhe-revisao__breadcrumb" aria-label="Você está em">
          <Link to="/admin/revisao" state={{ exemplo: modoExemplo }}>Revisão e publicação</Link>
          <span aria-hidden="true">›</span>
          <span>#{id}</span>
        </nav>

        <header className="detalhe-revisao__topo">
          <h1>Revisar acompanhamento #{id}</h1>
          {item && (
            <p>{aluno} · {nomeDe(item.disciplina)} · {item.bimestre}º bimestre</p>
          )}
        </header>

        {modoExemplo && !carregando && (
          <p className="detalhe-revisao__aviso-exemplo" role="note">
            Dados de exemplo: as ações não são enviadas para a API.
          </p>
        )}

        {renderizarConteudo()}
      </main>

      {modal && (
        <div className="detalhe-revisao__overlay" onClick={fecharModal}>
          <div
            className="detalhe-revisao__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="titulo-modal">
              {modal === 'publicar' ? 'Publicar para a família?' : 'Devolver para ajustes?'}
            </h2>

            <p>
              {modal === 'publicar'
                ? `O acompanhamento de ${aluno} ficará visível para os responsáveis e sairá da fila de revisão.`
                : 'O acompanhamento volta para o professor corrigir. Explique o que precisa ser ajustado.'}
            </p>

            {modal === 'devolver' && (
              <label className="detalhe-revisao__campo">
                <span>Motivo da devolução (visível ao professor)</span>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={4}
                  autoFocus
                />
              </label>
            )}

            {erroModal && <p className="detalhe-revisao__erro-modal" role="alert">{erroModal}</p>}

            <div className="detalhe-revisao__acoes-modal">
              <button
                type="button"
                className="detalhe-revisao__botao detalhe-revisao__botao--secundario"
                onClick={fecharModal}
                disabled={enviando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={`detalhe-revisao__botao ${modal === 'publicar' ? 'detalhe-revisao__botao--primario' : 'detalhe-revisao__botao--perigo-cheio'}`}
                onClick={confirmar}
                disabled={enviando}
              >
                {enviando ? 'Enviando...' : modal === 'publicar' ? 'Publicar' : 'Devolver ao professor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetalheRevisao;