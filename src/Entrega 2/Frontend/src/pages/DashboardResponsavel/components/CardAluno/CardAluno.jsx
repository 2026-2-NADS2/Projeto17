import './CardAluno.css';

// "Lucas Mendes" → "LM"
function pegarIniciais(nome) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

function CardAluno({ aluno, totalRelatorios }) {
  return (
    <article className="card-aluno">
      <div className="card-aluno__avatar" aria-hidden="true">
        {pegarIniciais(aluno.nome)}
      </div>
      <div>
        <h3 className="card-aluno__nome">{aluno.nome}</h3>
        <p className="card-aluno__info">
          Turma {aluno.idTurma ?? '—'} · {totalRelatorios} relatório(s) publicado(s)
        </p>
      </div>
    </article>
  );
}

export default CardAluno;
