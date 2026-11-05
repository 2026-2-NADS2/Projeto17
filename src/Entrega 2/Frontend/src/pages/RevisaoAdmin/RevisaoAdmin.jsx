import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';
import EstadoCarregando from '../../components/EstadoCarregando/EstadoCarregando';
import EstadoErro from '../../components/EstadoErro/EstadoErro';
import { listarAcompanhamentos } from '../../services/acompanhamentoService';
import { filaExemploAtual } from './dadosExemplo';
import { nomeDe, formatarMedia } from './formatadores';
import './RevisaoAdmin.css';

function RevisaoAdmin() {
  const navigate = useNavigate();
  const location = useLocation();

  // Quando a página de detalhe publica ou devolve, ela volta pra cá com um aviso
  const aviso = location.state?.aviso ?? null;
  const voltouDoExemplo = location.state?.exemplo === true;

  const [fila, setFila] = useState(voltouDoExemplo ? filaExemploAtual() : []);
  const [carregando, setCarregando] = useState(!voltouDoExemplo);
  const [erro, setErro] = useState(null);
  const [modoExemplo, setModoExemplo] = useState(voltouDoExemplo);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (modoExemplo) return; // dados de exemplo: não chama a API

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
  }, [tentativa, modoExemplo]);

  function tentarNovamente() {
    setCarregando(true);
    setErro(null);
    setModoExemplo(false);
    setTentativa((t) => t + 1);
  }

  function usarDadosExemplo() {
    setFila(filaExemploAtual());
    setErro(null);
    setModoExemplo(true);
  }

  function abrirRevisao(item) {
    navigate(`/admin/revisao/${item.id}`, { state: { item, exemplo: modoExemplo } });
  }

  function renderizarConteudo() {
    if (carregando) return <EstadoCarregando mensagem="Carregando fila de revisão..." />;
    if (erro) {
      return <EstadoErro mensagem={erro} onTentarNovamente={tentarNovamente} onUsarExemplo={usarDadosExemplo} />;
    }
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
                  <button
                    type="button"
                    className="revisao-admin__botao-revisar"
                    onClick={() => abrirRevisao(item)}
                    aria-label={`Revisar acompanhamento de ${nomeDe(item.aluno)}`}
                  >
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

        {aviso && <p className="revisao-admin__aviso" role="status">{aviso}</p>}

        {modoExemplo && !carregando && (
          <p className="revisao-admin__aviso-exemplo" role="note">
            Você está vendo dados de exemplo porque a API não respondeu.
          </p>
        )}

        {renderizarConteudo()}
      </main>
    </div>
  );
}

export default RevisaoAdmin;