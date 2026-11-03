import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, CircleCheck, Info, Pencil, TriangleAlert, CircleX } from 'lucide-react';
import BadgeStatus from '../../components/BadgeStatus/BadgeStatus';
import { buscarAcompanhamento } from '../../services/acompanhamentoService';
import { mensagemDeErro } from '../../services/api';
import './DetalheAcompanhamento.css';

const STATUS_EDITAVEIS = ['RASCUNHO', 'DEVOLVIDO'];

function formatarMedia(valor) {
  return valor === null || valor === undefined ? '—' : valor.toFixed(1).replace('.', ',');
}

function formatarDataHora(valor) {
  if (!valor) return '—';
  return new Date(valor).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

// Aviso do topo de acordo com o status
const AVISOS = {
  RASCUNHO: {
    tipo: 'info',
    Icone: Info,
    titulo: 'Rascunho ainda não enviado',
    texto: 'Só você vê este registro. Edite e envie para revisão quando estiver pronto.',
  },
  ENVIADO: {
    tipo: 'info',
    Icone: Info,
    titulo: 'Aguardando revisão da administração',
    texto: 'Este registro está bloqueado para edição. Você será avisado se ele for devolvido para ajustes.',
  },
  EM_REVISAO: {
    tipo: 'info',
    Icone: Info,
    titulo: 'Em revisão pela administração',
    texto: 'Este registro está bloqueado para edição enquanto é revisado.',
  },
  DEVOLVIDO: {
    tipo: 'aviso',
    Icone: TriangleAlert,
    titulo: 'Devolvido para ajustes',
    texto: 'Corrija o registro e reenvie para revisão dentro do período.',
  },
  PUBLICADO: {
    tipo: 'sucesso',
    Icone: CircleCheck,
    titulo: 'Publicado para a família',
    texto: 'O responsável já pode ver este acompanhamento.',
  },
  CANCELADO: {
    tipo: 'erro',
    Icone: CircleX,
    titulo: 'Registro cancelado',
    texto: 'Este registro foi cancelado pela administração e não será publicado.',
  },
};

// Etapas do fluxo, marcadas a partir do status atual (ainda sem datas)
function montarEtapas(status) {
  const enviado = ['ENVIADO', 'EM_REVISAO', 'PUBLICADO'].includes(status);
  const emRevisao = ['ENVIADO', 'EM_REVISAO'].includes(status);
  return [
    { titulo: 'Rascunho criado', situacao: 'feita' },
    {
      titulo: status === 'DEVOLVIDO' ? 'Devolvido para ajustes' : 'Enviado para revisão',
      situacao: enviado ? 'feita' : status === 'DEVOLVIDO' ? 'atual' : 'pendente',
    },
    {
      titulo: status === 'EM_REVISAO' ? 'Em revisão' : 'Aguardando revisão',
      situacao: emRevisao ? 'atual' : status === 'PUBLICADO' ? 'feita' : 'pendente',
    },
    { titulo: 'Publicado para a família', situacao: status === 'PUBLICADO' ? 'feita' : 'pendente' },
  ];
}

function DetalheAcompanhamento() {
  const { id } = useParams();
  const [registro, setRegistro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      setRegistro(await buscarAcompanhamento(id));
    } catch (error) {
      setErro(mensagemDeErro(error));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [id]);

  const trilha = (
    <nav className="da-trilha">
      <Link to="/professor/acompanhamentos">Acompanhamentos</Link>
      <ChevronRight size={14} />
      <span>{registro?.aluno.nome || 'Registro'}</span>
    </nav>
  );

  if (carregando) {
    return (
      <div className="da">
        {trilha}
        <div className="card estado">Carregando acompanhamento...</div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="da">
        {trilha}
        <div className="card estado">
          <span className="estado-icone estado-icone--erro"><TriangleAlert size={22} /></span>
          <h2>Não foi possível carregar o acompanhamento</h2>
          <p>{erro}</p>
          <button type="button" className="botao botao--secundario" onClick={carregar}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const aviso = AVISOS[registro.status];
  const editavel = STATUS_EDITAVEIS.includes(registro.status);

  return (
    <div className="da">
      {trilha}

      <div className="da-cabecalho">
        <div>
          <h1 className="da-titulo">{registro.aluno.nome} · {registro.disciplina.nome}</h1>
          <p className="da-subtitulo">
            {registro.turma.nome} · {registro.bimestre.numero}º bimestre {registro.anoLetivo}
          </p>
        </div>
        <BadgeStatus status={registro.status} />
      </div>

      {aviso && (
        <div className={`alerta alerta--${aviso.tipo} da-aviso`}>
          <aviso.Icone size={18} />
          <div>
            <p className="alerta-titulo">{aviso.titulo}</p>
            <p>{aviso.texto}</p>
          </div>
        </div>
      )}

      {registro.status === 'DEVOLVIDO' && registro.motivoDevolucao && (
        <div className="da-motivo">
          <p className="da-motivo-rotulo">Motivo da devolução</p>
          <p>“{registro.motivoDevolucao}”</p>
        </div>
      )}

      <div className="da-grade">
        <section className="card">
          <h2 className="da-card-titulo">Conteúdo do registro</h2>
          <p className="da-descricao">{registro.descricao || 'Sem descrição.'}</p>

          <div className="da-dados">
            <div>
              <span className="da-rotulo">Média</span>
              <strong className="da-media">{formatarMedia(registro.media)}</strong>
            </div>
            <div>
              <span className="da-rotulo">Professor</span>
              <strong>{registro.professor.nome}</strong>
            </div>
            {registro.publicadoEm && (
              <div>
                <span className="da-rotulo">Publicado em</span>
                <strong>{formatarDataHora(registro.publicadoEm)}</strong>
              </div>
            )}
          </div>

          <span className="da-rotulo">Tags</span>
          {registro.tags.length === 0 ? (
            <p className="da-sem-tags">Nenhuma tag.</p>
          ) : (
            <div className="da-tags">
              {registro.tags.map((t) => (
                <span key={t.id} className="da-tag">
                  <CircleCheck size={14} />
                  {t.nome}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="da-card-titulo">Etapas</h2>
          <ol className="linha-tempo">
            {montarEtapas(registro.status).map((etapa) => (
              <li key={etapa.titulo} className={`linha-tempo-item linha-tempo-item--${etapa.situacao}`}>
                {etapa.titulo}
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="da-acoes">
        <Link to="/professor/acompanhamentos" className="botao botao--secundario">
          <ArrowLeft size={16} /> Voltar para a lista
        </Link>
        {editavel && (
          <Link to={`/professor/acompanhamentos/${registro.id}/editar`} className="botao botao--primario">
            <Pencil size={16} /> {registro.status === 'DEVOLVIDO' ? 'Corrigir e reenviar' : 'Editar rascunho'}
          </Link>
        )}
      </div>
    </div>
  );
}

export default DetalheAcompanhamento;
