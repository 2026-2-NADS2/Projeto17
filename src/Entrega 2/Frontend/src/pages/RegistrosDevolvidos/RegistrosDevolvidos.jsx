import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleCheck, Pencil, TriangleAlert } from 'lucide-react';
import { listarAcompanhamentos } from '../../services/acompanhamentoService';
import { mensagemDeErro } from '../../services/api';
import './RegistrosDevolvidos.css';

function RegistrosDevolvidos() {
  const [devolvidos, setDevolvidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Busca os dados na API. Os setState ficam dentro do .then/.catch/.finally,
  // ou seja, só rodam quando a resposta chega. Por isso ela pode ser chamada
  // direto no useEffect (regra react-hooks/set-state-in-effect do lint).
  function buscar() {
    return listarAcompanhamentos({ status: 'DEVOLVIDO' })
      .then((lista) => setDevolvidos(lista))
      .catch((error) => setErro(mensagemDeErro(error)))
      .finally(() => setCarregando(false));
  }

  // Botão "Tentar novamente": mostra o carregando de novo e refaz a busca
  function carregar() {
    setCarregando(true);
    setErro('');
    buscar();
  }

  useEffect(() => {
    buscar();
  }, []);

  function renderizarConteudo() {
    if (carregando) {
      return <div className="card estado">Carregando devolvidos...</div>;
    }

    if (erro) {
      return (
        <div className="card estado">
          <span className="estado-icone estado-icone--erro"><TriangleAlert size={22} /></span>
          <h2>Não foi possível carregar os dados</h2>
          <p>{erro}</p>
          <button type="button" className="botao botao--secundario" onClick={carregar}>
            Tentar novamente
          </button>
        </div>
      );
    }

    if (devolvidos.length === 0) {
      return (
        <div className="estado">
          <span className="estado-icone"><CircleCheck size={22} /></span>
          <h2>Nenhum registro devolvido</h2>
          <p>Quando a administração devolver um registro, ele aparecerá aqui com o motivo.</p>
        </div>
      );
    }

    return (
      <div className="card tabela-caixa">
        <table className="tabela">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Turma</th>
              <th>Disciplina</th>
              <th>Bim.</th>
              <th>Motivo da devolução</th>
              <th className="tabela-acoes">Ação</th>
            </tr>
          </thead>
          <tbody>
            {devolvidos.map((r) => (
              <tr key={r.id}>
                <td className="tabela-forte">{r.aluno.nome}</td>
                <td>{r.turma.nome}</td>
                <td>{r.disciplina.nome}</td>
                <td>{r.bimestre.numero}º</td>
                <td className="rd-motivo">“{r.motivoDevolucao}”</td>
                <td className="tabela-acoes">
                  <Link to={`/professor/acompanhamentos/${r.id}/editar`} className="botao botao--primario rd-botao">
                    <Pencil size={14} /> Corrigir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="rd">
      <h1 className="rd-titulo">Devolvidos para ajuste</h1>
      <p className="rd-subtitulo">
        Registros que a administração devolveu com um motivo. Corrija e reenvie dentro do período.
      </p>
      {renderizarConteudo()}
    </div>
  );
}

export default RegistrosDevolvidos;
