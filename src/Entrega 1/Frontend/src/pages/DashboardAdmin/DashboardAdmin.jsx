import { useEffect, useState } from 'react';
import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';
import DistribuicaoStatus from '../../components/DistribuicaoStatus/DistribuicaoStatus';
import TabelaAcompanhamentos from '../../components/TabelaAcompanhamentos/TabelaAcompanhamentos';
import EstadoCarregando from '../../components/EstadoCarregando/EstadoCarregando';
import EstadoErro from '../../components/EstadoErro/EstadoErro';
import { listarAcompanhamentos } from '../../services/acompanhamentoService';
import { listarAlunos } from '../../services/alunoService';
import { acompanhamentosExemplo, alunosExemplo } from './dadosExemplo';
import './DashboardAdmin.css';

// Transforma o erro técnico do axios numa frase que o usuário entende
function montarMensagemErro(erro) {
  if (erro.code === 'ECONNABORTED') {
    return 'O servidor demorou demais para responder. Tente novamente em instantes.';
  }
  if (erro.response) {
    return `O servidor respondeu com erro ${erro.response.status}. Verifique se o banco de dados MySQL está configurado e rodando.`;
  }
  return 'Não foi possível conectar à API em http://localhost:3000. Verifique se o backend está rodando.';
}

function DashboardAdmin() {
  // Os "estados" da tela: cada vez que um muda, o React redesenha a página
  const [acompanhamentos, setAcompanhamentos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modoExemplo, setModoExemplo] = useState(false);
  const [tentativa, setTentativa] = useState(0); // muda = busca de novo

  // Roda quando a tela abre e sempre que "tentativa" mudar
  useEffect(() => {
    let ativo = true; // evita atualizar a tela se o usuário já saiu dela

    async function buscarDados() {
      try {
        // Faz as duas requisições AO MESMO TEMPO e espera as duas terminarem
        const [listaAcompanhamentos, listaAlunos] = await Promise.all([
          listarAcompanhamentos(),
          listarAlunos(),
        ]);
        if (!ativo) return;
        setAcompanhamentos(listaAcompanhamentos);
        setAlunos(listaAlunos);
      } catch (e) {
        if (ativo) setErro(montarMensagemErro(e));
      } finally {
        if (ativo) setCarregando(false); // roda com sucesso OU com erro
      }
    }

    buscarDados();

    return () => {
      ativo = false;
    };
  }, [tentativa]);

  function tentarNovamente() {
    setCarregando(true);
    setErro(null);
    setModoExemplo(false);
    setTentativa((valorAtual) => valorAtual + 1);
  }

  function usarDadosExemplo() {
    setAcompanhamentos(acompanhamentosExemplo);
    setAlunos(alunosExemplo);
    setErro(null);
    setModoExemplo(true);
  }

  // Dicionário { idAluno: nome } para mostrar o nome na tabela em vez do número
  const nomesAlunos = Object.fromEntries(
    alunos.map((aluno) => [aluno.idAluno ?? aluno.id, aluno.nome])
  );

  // O que o administrador precisa resolver: enviados e em revisão
  const aguardandoPublicacao = acompanhamentos.filter(
    (item) => item.status === 'ENVIADO' || item.status === 'EM_REVISAO'
  ).length;

  function montarSubtitulo() {
    if (carregando || erro) return 'Acompanhamentos lançados pelos professores.';
    if (aguardandoPublicacao === 0) return 'Nenhum acompanhamento aguardando publicação.';
    if (aguardandoPublicacao === 1) return '1 acompanhamento aguarda sua revisão para ser publicado.';
    return `${aguardandoPublicacao} acompanhamentos aguardam sua revisão para serem publicados.`;
  }

  // Renderização condicional: mostra UMA das três situações
  function renderizarConteudo() {
    if (carregando) {
      return <EstadoCarregando mensagem="Carregando acompanhamentos..." />;
    }

    if (erro) {
      return (
        <EstadoErro
          mensagem={erro}
          onTentarNovamente={tentarNovamente}
          onUsarExemplo={usarDadosExemplo}
        />
      );
    }

    return (
      <>
        {modoExemplo && (
          <p className="dashboard-admin__aviso-exemplo" role="note">
            Você está vendo dados de exemplo porque a API não respondeu. Clique em "Atualizar" para tentar a API de novo.
          </p>
        )}

        <DistribuicaoStatus acompanhamentos={acompanhamentos} />

        <section className="dashboard-admin__secao" aria-labelledby="tabela-titulo">
          <h2 id="tabela-titulo">Todos os acompanhamentos</h2>
          <TabelaAcompanhamentos acompanhamentos={acompanhamentos} nomesAlunos={nomesAlunos} />
        </section>
      </>
    );
  }

  return (
    <div className="dashboard-admin">
      <SidebarAdmin />

      <main className="dashboard-admin__conteudo">
        <header className="dashboard-admin__topo">
          <div>
            <h1>Visão geral</h1>
            <p>{montarSubtitulo()}</p>
          </div>

          {!carregando && !erro && (
            <button type="button" className="dashboard-admin__botao-atualizar" onClick={tentarNovamente}>
              Atualizar
            </button>
          )}
        </header>

        {renderizarConteudo()}
      </main>
    </div>
  );
}

export default DashboardAdmin;