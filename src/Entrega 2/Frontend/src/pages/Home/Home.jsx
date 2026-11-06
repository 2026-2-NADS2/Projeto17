import { Link } from 'react-router-dom';
import { ChartColumn, ClipboardCheck, BookOpen, Users } from 'lucide-react';
import CardIcone from '../../components/CardIcone/CardIcone';
import EmBreveCard from '../../components/EmBreveCard/EmBreveCard';
import PassoCard from '../../components/PassoCard/PassoCard';
import './Home.css';

const PERSPECTIVAS = [
  {
    Icone: ClipboardCheck,
    titulo: 'Módulo Administrador',
    descricao: 'Gestão de cadastros, vínculos e períodos bimestrais. Revisa e publica os acompanhamentos.',
  },
  {
    Icone: BookOpen,
    titulo: 'Módulo Professor',
    descricao: 'Registro do acompanhamento por aluno, turma e disciplina — descrição, média e tags.',
  },
  {
    Icone: Users,
    titulo: 'Módulo Pai/Responsável',
    descricao: 'Consulta aos relatórios publicados por bimestre e disciplina. Geração de PDF e ciência.',
  },
];

const EM_BREVE = [
  'Notificações por e-mail quando um novo relatório for publicado.',
  'Dashboard com evolução das médias ao longo do ano letivo.',
  'Assinatura eletrônica de confirmação de ciência do relatório.',
];

const PASSOS = [
  { titulo: 'Estrutura e bimestre', descricao: 'Administrador cadastra e abre o período.' },
  { titulo: 'Registro do professor', descricao: 'Descrição, média e tags — envia para revisão.' },
  { titulo: 'Revisão e publicação', descricao: 'Administrador revisa e publica à família.' },
  { titulo: 'Consulta da família', descricao: 'Responsável consulta e gera o PDF.' },
];

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-conteudo">
          <span className="hero-selo">UM PRODUTO KFKA TECHNOLOGY CONSULTING</span>
          <h1>Acompanhamento escolar bimestral, do professor à família, em um só lugar</h1>
          <p>
            O ClassSync conecta professores, administração escolar e responsáveis em um fluxo
            único de registro, revisão, publicação e consulta de relatórios — com segurança e
            conformidade com a LGPD.
          </p>
          <div className="hero-botoes">
            <Link to="/entrar" className="botao hero-botao-primario">Acessar plataforma</Link>
            <Link to="/contato" className="botao botao--link hero-botao-link">Falar com o suporte</Link>
          </div>
        </div>

        <div className="hero-visual">
          <ChartColumn size={32} />
          <span>Prévia do painel (imagem/ilustração a definir)</span>
        </div>
      </section>

      <section className="home-secao home-secao--cinza">
        <h2>Um sistema, três perspectivas</h2>
        <p className="home-subtitulo">Cada perfil vê exatamente o que precisa — nada a mais, nada a menos.</p>
        <div className="home-grade home-grade--3">
          {PERSPECTIVAS.map(({ Icone, titulo, descricao }) => (
            <CardIcone key={titulo} Icone={Icone} titulo={titulo}>
              <p>{descricao}</p>
            </CardIcone>
          ))}
        </div>
      </section>

      <section className="home-em-breve">
        <div className="home-grade home-grade--3 home-em-breve-caixa">
          {EM_BREVE.map((texto) => (
            <EmBreveCard key={texto} texto={texto} />
          ))}
        </div>
      </section>

      <section className="home-secao">
        <h2>Do registro à consulta, em quatro passos</h2>
        <div className="home-grade home-grade--4">
          {PASSOS.map((passo, indice) => (
            <PassoCard key={passo.titulo} numero={indice + 1} {...passo} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;