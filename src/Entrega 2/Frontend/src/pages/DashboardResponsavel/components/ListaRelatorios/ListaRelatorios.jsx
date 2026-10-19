import EstadoRequisicao from '../EstadoRequisicao/EstadoRequisicao';
import './ListaRelatorios.css';

function formatarMedia(media) {
  if (media === null || media === undefined || media === '') return '—';
  const numero = Number(media);
  return Number.isNaN(numero) ? String(media) : numero.toFixed(1).replace('.', ',');
}

function ListaRelatorios({ relatorios, alunos }) {
  if (relatorios.length === 0) {
    return <EstadoRequisicao tipo="vazio" mensagem="Nenhum relatório publicado até agora." />;
  }

  // Encontra o nome do aluno pelo id (a API do acompanhamento só traz o id)
  function nomeDoAluno(idAluno) {
    return alunos.find((a) => a.id === idAluno)?.nome ?? `Aluno ${idAluno}`;
  }

  return (
    <ul className="lista-rel">
      {relatorios.map((r) => (
        <li key={r.id} className="lista-rel__item">
          <div className="lista-rel__cabecalho">
            <span className="lista-rel__aluno">{nomeDoAluno(r.idAluno)}</span>
            <span className="lista-rel__status">Publicado</span>
          </div>
          <p className="lista-rel__meta">
            Disciplina {r.idDisciplina} · Bimestre {r.idBimestre}
          </p>
          {r.descricao && <p className="lista-rel__descricao">{r.descricao}</p>}
          <p className="lista-rel__media">
            Média <strong>{formatarMedia(r.media)}</strong>
          </p>
        </li>
      ))}
    </ul>
  );
}

export default ListaRelatorios;
