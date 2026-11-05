import { useEffect, useState } from 'react';
import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';
import EstadoCarregando from '../../components/EstadoCarregando/EstadoCarregando';
import EstadoErro from '../../components/EstadoErro/EstadoErro';
import { listarAcompanhamentos } from '../../services/acompanhamentoService';
import './RevisaoAdmin.css';

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

  function renderizarConteudo() {
    if (carregando) return <EstadoCarregando mensagem="Carregando fila de revisão..." />;
    if (erro) return <EstadoErro mensagem={erro} onTentarNovamente={tentarNovamente} />;
    if (fila.length === 0) {
      return <p className="revisao-admin__vazio">Nenhum acompanhamento aguardando revisão. 🎉</p>;
    }
    return <p>{fila.length} acompanhamento(s) na fila.</p>; // a tabela entra aqui no próximo passo
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