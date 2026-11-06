import { Link } from 'react-router-dom';
import { ClipboardCheck, BookOpen, Users, CircleCheck } from 'lucide-react';
import CabecalhoPagina from '../../components/CabecalhoPagina/CabecalhoPagina';
import CardIcone from '../../components/CardIcone/CardIcone';
import './Servicos.css';

const PERFIS = [
  {
    titulo: 'Administração escolar',
    Icone: ClipboardCheck,
    itens: [
      'Cadastro de alunos, responsáveis, professores, áreas, disciplinas, turmas e tags',
      'Vínculos Turma × Professor × Disciplina × Aluno',
      'Abertura e encerramento dos 4 bimestres',
      'Revisão, alteração rastreável, devolução e publicação',
      'Relatórios gerenciais e exportação para Excel',
    ],
  },
  {
    titulo: 'Professores',
    Icone: BookOpen,
    itens: [
      'Visualiza apenas suas turmas, disciplinas e alunos',
      'Registra descrição, média e múltiplas tags',
      'Salva rascunho e envia para revisão',
      'Acompanha status e trata devolvidos',
      'Consulta retornos dos responsáveis',
    ],
  },
  {
    titulo: 'Famílias',
    Icone: Users,
    itens: [
      'Vê somente os alunos vinculados',
      'Consulta relatórios publicados por ano, bimestre e disciplina',
      'Gera e baixa o relatório em PDF',
      'Registra ciência e envia observação',
    ],
  },
];

function Servicos() {
  return (
    <>
      <CabecalhoPagina
        rotulo="Serviços"
        titulo="O que o ClassSync faz por cada perfil"
        subtitulo="Um fluxo único: o professor registra, a administração revisa e publica, a família consulta."
      />

      <div className="servicos">
        <div className="servicos-grade">
          {PERFIS.map((perfil) => (
            <CardIcone key={perfil.titulo} Icone={perfil.Icone} titulo={perfil.titulo}>
              <ul className="servicos-lista">
                {perfil.itens.map((item) => (
                  <li key={item}>
                    <CircleCheck size={16} />
                    {item}
                  </li>
                ))}
              </ul>
            </CardIcone>
          ))}
        </div>

        <div className="servicos-chamada">
          <p>Sua escola já usa o ClassSync? Acesse com o e-mail cadastrado.</p>
          <Link to="/entrar" className="botao servicos-chamada-botao">
            Acessar plataforma
          </Link>
        </div>
      </div>
    </>
  );
}

export default Servicos;