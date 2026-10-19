import StatusBadge from '../StatusBadge/StatusBadge';
import './TabelaAcompanhamentos.css';

// A média pode vir do MySQL como texto ("7.50"), número ou null
function formatarMedia(media) {
  if (media === null || media === undefined || media === '') return '—';
  const numero = Number(media);
  if (Number.isNaN(numero)) return '—';
  return numero.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function TabelaAcompanhamentos({ acompanhamentos, nomesAlunos = {} }) {
  if (acompanhamentos.length === 0) {
    return (
      <p className="tabela-acompanhamentos__vazio">
        Nenhum acompanhamento cadastrado ainda. Eles aparecem aqui assim que um professor fizer o primeiro lançamento.
      </p>
    );
  }

  return (
    <div className="tabela-acompanhamentos">
      <table>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Aluno</th>
            <th scope="col">Disciplina</th>
            <th scope="col">Bimestre</th>
            <th scope="col">Média</th>
            <th scope="col">Status</th>
            <th scope="col">Descrição</th>
          </tr>
        </thead>
        <tbody>
          {acompanhamentos.map((item) => {
            const id = item.idAcompanhamento ?? item.id;
            const nomeAluno = nomesAlunos[item.idAluno] ?? `Aluno #${item.idAluno}`;

            return (
              <tr key={id}>
                <td className="tabela-acompanhamentos__id">#{id}</td>
                <td className="tabela-acompanhamentos__aluno">{nomeAluno}</td>
                <td>#{item.idDisciplina}</td>
                <td>#{item.idBimestre}</td>
                <td className="tabela-acompanhamentos__media">{formatarMedia(item.media)}</td>
                <td><StatusBadge status={item.status} /></td>
                <td className="tabela-acompanhamentos__descricao" title={item.descricao || ''}>
                  {item.descricao || '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TabelaAcompanhamentos;