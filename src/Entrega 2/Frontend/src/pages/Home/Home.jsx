import { Link } from 'react-router-dom';
import PerspectivaCard from '../../components/PerspectivaCard/PerspectivaCard';
import EmBreveCard from '../../components/EmBreveCard/EmBreveCard';
import PassoCard from '../../components/PassoCard/PassoCard';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-conteudo">
          <span className="hero-tag">UM PRODUTO KFKA TECHNOLOGY CONSULTING</span>
          <h1>Acompanhamento escolar bimestral, do professor à família, em um só lugar</h1>
          <p>
             O ClassSync conecta professores, administração escolar e responsáveis em um
             fluxo único de registro, revisão, publicação e consulta de relatórios — com
             segurança e conformidade com a LGPD.
          </p>
          <div className="hero-botoes">
            <Link to="/entrar" className="hero-btn-primario">Acessar plataforma</Link>
            <Link to="/contato" className="hero-btn-secundario">Falar com o suporte</Link>
          </div>
        </div>
        <div className="hero-imagem" />
      </section>

      <section className="perspectivas">
        <h2>Um sistema, três perspectivas</h2>
        <p className="perspectivas-subtitulo">
          Cada perfil vê exatamente o que precisa — nada a mais, nada a menos.
        </p>
        <div className="perspectivas-lista">
          <PerspectivaCard
            titulo="Módulo Administrador"
            descricao="Gestão de cadastros, vínculos e períodos bimestrais. Revisa e publica os acompanhamentos."
          />
          <PerspectivaCard
            titulo="Módulo Professor"
            descricao="Registro do acompanhamento por aluno, turma e disciplina — descrição, média e tags."
          />
          <PerspectivaCard
            titulo="Módulo Pai/Responsável"
            descricao="Consulta aos relatórios publicados por bimestre e disciplina. Geração de PDF e ciência."
          />
        </div>
      </section>

      <section className="em-breve">
        <div className="em-breve-lista">
          <EmBreveCard texto="Notificações por e-mail quando um novo relatório for publicado." />
          <EmBreveCard texto="Dashboard com evolução das médias ao longo do ano letivo." />
          <EmBreveCard texto="Assinatura eletrônica de confirmação de ciência do relatório." />
        </div>
      </section>

      <section className="passos">
        <h2>Do registro à consulta, em quatro passos</h2>
        <div className="passos-lista">
          <PassoCard
            numero={1}
            titulo="Estrutura e bimestre"
            descricao="Administrador cadastra e abre o período."
          />
          <PassoCard
            numero={2}
            titulo="Registro do professor"
            descricao="Descrição, média e tags — envia para revisão."
          />
          <PassoCard
            numero={3}
            titulo="Revisão e publicação"
            descricao="Administrador revisa e publica à família."
          />
          <PassoCard
            numero={4}
            titulo="Consulta da família"
            descricao="Responsável consulta e gera o PDF."
          />
        </div>
      </section>
    </div>
  );
}

export default Home;