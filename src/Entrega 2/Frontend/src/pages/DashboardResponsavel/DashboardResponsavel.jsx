import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderResponsavel from './components/HeaderResponsavel/HeaderResponsavel';
import CardAluno from './components/CardAluno/CardAluno';
import ResumoRelatorios from './components/ResumoRelatorios/ResumoRelatorios';
import CardAtalho from './components/CardAtalho/CardAtalho';
import ListaRelatorios from './components/ListaRelatorios/ListaRelatorios';
import EstadoRequisicao from './components/EstadoRequisicao/EstadoRequisicao';
import {
  buscarAlunos,
  buscarRelatoriosPublicados,
  mensagemDeErro,
} from '../../services/responsavelService';
import './DashboardResponsavel.css';

// TEMPORÁRIO: ainda não existe login nem vínculo responsável → aluno no banco.
// Quando existir, esses dados virão do usuário logado.
const RESPONSAVEL = { nome: 'Carla Mendes' };

// Deixe vazio para considerar "vinculados" os alunos que têm relatório publicado.
// Ou coloque IDs fixos para testar, ex.: [1, 2]
const IDS_ALUNOS_VINCULADOS = [];

const ATALHOS = [
  { titulo: 'Meu(s) Aluno(s)', descricao: 'Lista de alunos vinculados → selecionar aluno' },
  { titulo: 'Relatórios Públicos', descricao: 'Aluno → ano letivo → bimestre → disciplina' },
  { titulo: 'Filtros de Relatório', descricao: 'Ano letivo → bimestre → disciplina' },
  { titulo: 'Visualizar Relatório', descricao: 'Descrição + média + tags + informações do acompanhamento' },
  { titulo: 'Gerar/Baixar PDF', descricao: 'Ação disponível dentro do relatório publicado' },
  { titulo: 'Registrar Ciência', descricao: 'Confirmar ciência do relatório', mostraPendentes: true },
  { titulo: 'Observação/Retorno', descricao: 'Mensagem vinculada ao relatório → visível ao professor/admin' },
  { titulo: 'Meu Perfil', descricao: 'Dados da conta → alterar senha → sair' },
];

function DashboardResponsavel() {
  const navigate = useNavigate();

  const [alunos, setAlunos] = useState([]);
  const [relatorios, setRelatorios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  // Mudar este número faz o useEffect rodar de novo (botão "Tentar de novo")
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let cancelado = false;

    async function carregarDados() {
      try {
        // As duas requisições saem ao mesmo tempo
        const [todosAlunos, publicados] = await Promise.all([
          buscarAlunos(),
          buscarRelatoriosPublicados(),
        ]);

        const idsVinculados =
          IDS_ALUNOS_VINCULADOS.length > 0
            ? IDS_ALUNOS_VINCULADOS
            : [...new Set(publicados.map((r) => r.idAluno))];

        if (!cancelado) {
          setAlunos(todosAlunos.filter((a) => idsVinculados.includes(a.id)));
          setRelatorios(publicados.filter((r) => idsVinculados.includes(r.idAluno)));
        }
      } catch (e) {
        if (!cancelado) setErro(mensagemDeErro(e));
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    carregarDados();

    // Limpeza: se a tela for fechada antes da resposta chegar,
    // não tentamos atualizar um componente que já saiu da tela.
    return () => {
      cancelado = true;
    };
  }, [tentativa]);

  function tentarDeNovo() {
    setErro(null);
    setCarregando(true);
    setTentativa((t) => t + 1);
  }

  const primeiroNome = RESPONSAVEL.nome.split(' ')[0];
  const pendentes = !carregando && !erro ? relatorios.length : null;

  return (
    <div className="dash-resp">
      <HeaderResponsavel nomeUsuario={RESPONSAVEL.nome} onSair={() => navigate('/')} />

      <main className="dash-resp__conteudo">
        <h1 className="dash-resp__saudacao">Olá, {primeiroNome}</h1>
        <p className="dash-resp__subtitulo">
          Resumo do(s) aluno(s) vinculado(s) e relatórios publicados
        </p>

        {carregando && (
          <EstadoRequisicao tipo="carregando" mensagem="Carregando dados do(s) aluno(s)…" />
        )}

        {!carregando && erro && (
          <EstadoRequisicao tipo="erro" mensagem={erro} onTentarDeNovo={tentarDeNovo} />
        )}

        {!carregando && !erro && (
          <div className="dash-resp__resumo">
            <div className="dash-resp__alunos">
              {alunos.length === 0 ? (
                <EstadoRequisicao
                  tipo="vazio"
                  mensagem="Nenhum aluno vinculado com relatório publicado ainda."
                />
              ) : (
                alunos.map((aluno) => (
                  <CardAluno
                    key={aluno.id}
                    aluno={aluno}
                    totalRelatorios={relatorios.filter((r) => r.idAluno === aluno.id).length}
                  />
                ))
              )}
            </div>
            <ResumoRelatorios quantidade={relatorios.length} />
          </div>
        )}

        <section className="dash-resp__secao">
          <h2 className="dash-resp__titulo-secao">Acompanhamento</h2>
          <div className="dash-resp__grade">
            {ATALHOS.map((atalho) => (
              <CardAtalho
                key={atalho.titulo}
                titulo={atalho.titulo}
                descricao={atalho.descricao}
                selo={atalho.mostraPendentes && pendentes > 0 ? `${pendentes} pendentes` : null}
              />
            ))}
          </div>
        </section>

        <section className="dash-resp__secao">
          <h2 className="dash-resp__titulo-secao">Relatórios publicados</h2>
          {carregando && <EstadoRequisicao tipo="carregando" mensagem="Carregando relatórios…" />}
          {!carregando && erro && (
            <EstadoRequisicao
              tipo="erro"
              mensagem="Os relatórios não puderam ser carregados. Veja o aviso acima."
            />
          )}
          {!carregando && !erro && <ListaRelatorios relatorios={relatorios} alunos={alunos} />}
        </section>
      </main>
    </div>
  );
}

export default DashboardResponsavel;
