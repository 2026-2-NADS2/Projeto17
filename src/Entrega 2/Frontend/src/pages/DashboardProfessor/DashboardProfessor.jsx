  import { Link } from 'react-router-dom';
  import { obterUsuario } from '../../services/authService';
  import iconeModulo from '../../assets/Ícone_módulos.svg';
  import './DashboardProfessor.css';

function DashboardProfessor() {
  const usuario = obterUsuario();

  const professor = {
    nome: usuario?.nome || 'Professor',
    bimestre: '3º Bimestre 2026',
    bimestreAtual: '3º Bimestre',
    prazoDigitacao: '15/10',
  };

  const estatisticas = [
    { numero: 3, label: 'turmas ativas' },
    { numero: 7, label: 'acompanhamentos pendentes' },
    { numero: 2, label: 'rascunhos salvos' },
    { numero: 1, label: 'registro devolvido' },
  ];

  const ferramentas = [
    {
      titulo: 'Tela de Turmas',
      descricao: 'Listagem de turmas → selecionar turma → alunos',
      rota: '/professor/turmas',
    },
    {
      titulo: 'Disciplinas',
      descricao: 'Listagem de disciplinas → selecionar → turmas vinculadas',
      rota: '/professor/disciplinas',
    },
    {
      titulo: 'Acompanhamentos / Alunos',
      descricao: 'Selecionar turma/disciplina → lista de alunos → detalhes',
      rota: '/professor/acompanhamentos',
    },
    {
      titulo: 'Criar Novo Acompanhamento',
      descricao: 'Aluno + turma + disciplina + bimestre + descrição + média + tags',
      rota: '/professor/criar-acompanhamento',
    },
    {
      titulo: 'Enviados (para Administração)',
      badge: '3 pendentes',
      descricao: 'Listagem dos acompanhamentos enviados → visualizar status',
      rota: '/professor/enviados',
    },
    {
      titulo: 'Registros Devolvidos',
      badge: '1 novo',
      descricao: 'Motivo/observação → editar → reenviar',
      rota: '/professor/devolvidos',
    },
    {
      titulo: 'Meu Perfil',
      descricao: 'Dados da conta → alterar senha → sair',
      rota: '/professor/perfil',
    },
  ];

  return (
    <div className="dashboard-professor">
      <main className="dp-conteudo">
        <h1>Olá, {professor.nome.split(' ')[0]}</h1>
        <p className="dp-subtitulo">
          Bimestre atual: {professor.bimestreAtual} · período de digitação aberto até {professor.prazoDigitacao}
        </p>

        <div className="dp-estatisticas">
          {estatisticas.map((item, index) => (
            <div key={index} className="dp-estatistica-card">
              <span className="dp-estatistica-numero">{item.numero}</span>
              <span className="dp-estatistica-label">{item.label}</span>
            </div>
          ))}
        </div>

        <h2>Suas ferramentas</h2>

        <div className="dp-ferramentas-lista">
          {ferramentas.map((item, index) => (
            <Link to={item.rota} key={index} className="dp-ferramenta-card">
              <div className="dp-ferramenta-icone">
                <img src={iconeModulo} alt="" />
              </div>
              <div className="dp-ferramenta-titulo-linha">
                <h3>{item.titulo}</h3>
                {item.badge && <span className="dp-badge">{item.badge}</span>}
              </div>
              <p>{item.descricao}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

export default DashboardProfessor;