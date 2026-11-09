import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LayoutPublico from './components/LayoutPublico/LayoutPublico';
import Home from './pages/Home/Home';
import NotFound from './pages/NotFound/NotFound';
import Login from './pages/Login/Login';
import DashboardProfessor from './pages/DashboardProfessor/DashboardProfessor';
import DashboardAdmin from './pages/DashboardAdmin/DashboardAdmin';
import RevisaoAdmin from './pages/RevisaoAdmin/RevisaoAdmin';
import DetalheRevisao from './pages/DetalheRevisao/DetalheRevisao';
import RetornosAdmin from './pages/RetornosAdmin/RetornosAdmin';
import UsuariosAdmin from './pages/UsuariosAdmin/UsuariosAdmin';
import NovoUsuario from './pages/NovoUsuario/NovoUsuario';
import AlunosAdmin from './pages/AlunosAdmin/AlunosAdmin';
import TurmasAdmin from './pages/TurmasAdmin/TurmasAdmin';
import DisciplinasAdmin from './pages/DisciplinasAdmin/DisciplinasAdmin';
import TagsAdmin from './pages/TagsAdmin/TagsAdmin';
import VinculosAdmin from './pages/VinculosAdmin/VinculosAdmin';
import BimestresAdmin from './pages/BimestresAdmin/BimestresAdmin';
import RelatoriosAdmin from './pages/RelatoriosAdmin/RelatoriosAdmin';
import HistoricoAdmin from './pages/HistoricoAdmin/HistoricoAdmin';
import PerfilAdmin from './pages/PerfilAdmin/PerfilAdmin';
import DashboardResponsavel from './pages/DashboardResponsavel/DashboardResponsavel';
import TelaTurmas from './pages/TelaTurmas/TelaTurmas';
import AcompanhamentosAlunos from './pages/AcompanhamentosAlunos/AcompanhamentosAlunos';
import CriarAcompanhamento from './pages/CriarAcompanhamento/CriarAcompanhamento';
import RegistrosDevolvidos from './pages/RegistrosDevolvidos/RegistrosDevolvidos';
import MeuPerfil from './pages/MeuPerfil/MeuPerfil';
import RotaProtegida from './components/RotaProtegida/RotaProtegida';
import LayoutPainel from './components/LayoutPainel/LayoutPainel';
import { menuProfessor } from './components/LayoutPainel/menus';
import DetalheAcompanhamento from './pages/DetalheAcompanhamento/DetalheAcompanhamento';
import Servicos from './pages/Servicos/Servicos';
import Institucional from './pages/Institucional/Institucional';
import Privacidade from './pages/Privacidade/Privacidade';
import AcessoNegado from './pages/AcessoNegado/AcessoNegado';
import TurmaAlunos from './pages/TurmaAlunos/TurmaAlunos';
import HistoricoAluno from './pages/HistoricoAluno/HistoricoAluno';
import RelatoriosProfessor from './pages/RelatoriosProfessor/RelatoriosProfessor';
import Contato from './pages/Contato/Contato';
import MeusAlunosResponsavel from './pages/MeusAlunosResponsavel/MeusAlunosResponsavel';
import RelatoriosResponsavel from './pages/RelatoriosResponsavel/RelatoriosResponsavel';
import LayoutResponsavel from './components/LayoutResponsavel/LayoutResponsavel';
import DetalheRelatorioResponsavel from './pages/DetalheRelatorioResponsavel/DetalheRelatorioResponsavel';
import MeuPerfilResponsavel from './pages/MeuPerfilResponsavel/MeuPerfilResponsavel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutPublico />}>
          <Route path="/" element={<Home />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/institucional" element={<Institucional />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/acesso-negado" element={<AcessoNegado />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/entrar" element={<Login />} />

        <Route element={<RotaProtegida perfis={['PROFESSOR']} />}>
          <Route element={<LayoutPainel itens={menuProfessor} />}>
            <Route path="/professor" element={<DashboardProfessor />} />
            <Route path="/professor/turmas" element={<TelaTurmas />} />
            <Route path="/professor/turmas/:idTurma" element={<TurmaAlunos />} />
            <Route path="/professor/turmas/:idTurma/alunos/:idAluno" element={<HistoricoAluno />} />
            <Route path="/professor/acompanhamentos" element={<AcompanhamentosAlunos />} />
            <Route path="/professor/criar-acompanhamento" element={<CriarAcompanhamento />} />
            <Route path="/professor/acompanhamentos/:id/editar" element={<CriarAcompanhamento />} />
            <Route path="/professor/acompanhamentos/:id" element={<DetalheAcompanhamento />} />
            <Route path="/professor/devolvidos" element={<RegistrosDevolvidos />} />
            <Route path="/professor/relatorios" element={<RelatoriosProfessor />} />
            <Route path="/professor/perfil" element={<MeuPerfil />} />
          </Route>
        </Route>

        <Route element={<RotaProtegida perfis={['ADMIN']} />}>
          <Route path="/admin" element={<DashboardAdmin />} />
          <Route path="/admin/revisao" element={<RevisaoAdmin />} />
          <Route path="/admin/revisao/:id" element={<DetalheRevisao />} />
          <Route path="/admin/retornos" element={<RetornosAdmin />} />
          <Route path="/admin/usuarios" element={<UsuariosAdmin key="usuarios" />} />
          <Route path="/admin/usuarios/novo" element={<NovoUsuario />} />
          <Route path="/admin/alunos" element={<AlunosAdmin />} />
          <Route path="/admin/turmas" element={<TurmasAdmin />} />
          <Route path="/admin/disciplinas" element={<DisciplinasAdmin />} />
          <Route path="/admin/tags" element={<TagsAdmin />} />
          <Route path="/admin/vinculos" element={<VinculosAdmin />} />
          <Route path="/admin/bimestres" element={<BimestresAdmin />} />
          <Route path="/admin/relatorios" element={<RelatoriosAdmin />} />
          <Route path="/admin/auditoria" element={<HistoricoAdmin />} />
          <Route path="/admin/perfil" element={<PerfilAdmin />} />
          <Route
            path="/admin/professores"
            element={
              <UsuariosAdmin
                key="professores"
                perfilFixo="PROFESSOR"
                titulo="Professores"
                subtitulo="Professores com acesso à plataforma."
                textoNovo="Novo professor"
              />
            }
          />
          <Route
            path="/admin/responsaveis"
            element={
              <UsuariosAdmin
                key="responsaveis"
                perfilFixo="RESPONSAVEL"
                titulo="Responsáveis"
                subtitulo="Pais e responsáveis com acesso à plataforma."
                textoNovo="Novo responsável"
              />
            }
          />
        </Route>

        <Route element={<RotaProtegida perfis={['RESPONSAVEL']} />}>
          <Route element={<LayoutResponsavel />}>
            <Route path="/responsavel" element={<DashboardResponsavel />} />
                                    <Route path="/responsavel/perfil" element={<MeuPerfilResponsavel />} />
            <Route path="/responsavel/alunos" element={<MeusAlunosResponsavel />} />
            <Route path="/responsavel/relatorios" element={<RelatoriosResponsavel />} />
            <Route path="/responsavel/relatorio/:id" element={<DetalheRelatorioResponsavel />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;