import { useEffect, useState } from 'react';
import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';
import EstadoCarregando from '../../components/EstadoCarregando/EstadoCarregando';
import EstadoErro from '../../components/EstadoErro/EstadoErro';
import { listarAcompanhamentos } from '../../services/acompanhamentoService';
import './RevisaoAdmin.css';
import { filaExemplo } from './dadosExemplo';

// Funciona se a API mandar "Lucas Ferreira" ou { id: 2, nome: "Lucas Ferreira" }
function nomeDe(valor) {
    if (valor && typeof valor === 'object') return valor.nome;
    return valor ?? '—';
  }
  
  // 5.5 → "5,5" (vírgula, como no Brasil) · null → "—"
  function formatarMedia(media) {
    if (media === null || media === undefined) return '—';
    return Number(media).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

function RevisaoAdmin() {
  const [fila, setFila] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;

    async function buscarFila() {
      try {
        const lista = await listarAcompanhamentos({ status: 'ENVIADO' });
        if (ativo) setFila(lista);
      } catch (e) {
        if (ativo) {
          setErro(e.response?.data?.erro ?? 'Não foi possível carregar a fila de revisão.');
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    buscarFila();
    return () => { ativo = false; };
  }, [tentativa]);

  function tentarNovamente() {
    setCarregando(true);
    setErro(null);
    setTentativa((t) => t + 1);
  }

  function usarDadosExemplo() {
    setFila(filaExemplo);
    setErro(null);
  }

  function renderizarConteudo() {
    if (carregando) return <EstadoCarregando mensagem="Carregando fila de revisão..." />;
    if (erro) return <EstadoErro mensagem={erro} onTentarNovamente={tentarNovamente} onUsarExemplo={usarDadosExemplo} />;
    if (fila.length === 0) {
      return <p className="revisao-admin__vazio">Nenhum acompanhamento aguardando revisão. 🎉</p>;
    }
  
    return (
      <div className="revisao-admin__tabela-caixa">
        <table className="revisao-admin__tabela">
          <thead>
            <tr>
              <th>#</th>
              <th>Aluno</th>
              <th>Disciplina</th>
              <th>Professor</th>
              <th>Bimestre</th>
              <th>Média</th>
              <th><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            {fila.map((item) => (
              <tr key={item.id}>
                <td className="revisao-admin__id">#{item.id}</td>
                <td className="revisao-admin__aluno">{nomeDe(item.aluno)}</td>
                <td>{nomeDe(item.disciplina)}</td>
                <td>{nomeDe(item.professor)}</td>
                <td>{item.bimestre}º</td>
                <td>{formatarMedia(item.media)}</td>
                <td className="revisao-admin__acao">
                  <button type="button" className="revisao-admin__botao-revisar">
                    Revisar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="revisao-admin">
      <SidebarAdmin />

      <main className="revisao-admin__conteudo">
        <header className="revisao-admin__topo">
          <h1>Revisão e publicação</h1>
          <p>Revise os acompanhamentos enviados pelos professores e publique ou devolva para ajustes.</p>
        </header>

        {renderizarConteudo()}
      </main>
    </div>
  );
}

export default RevisaoAdmin;