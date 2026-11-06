import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LayoutPublico from './components/LayoutPublico/LayoutPublico';
import Home from './pages/Home/Home';
import NotFound from './pages/NotFound/NotFound';
import Login from './pages/Login/Login';
import DashboardProfessor from './pages/DashboardProfessor/DashboardProfessor';
import DashboardAdmin from './pages/DashboardAdmin/DashboardAdmin';
import DashboardResponsavel from './pages/DashboardResponsavel/DashboardResponsavel';
import TelaTurmas from './pages/TelaTurmas/TelaTurmas';
import AcompanhamentosAlunos from './pages/AcompanhamentosAlunos/AcompanhamentosAlunos';
import CriarAcompanhamento from './pages/CriarAcompanhamento/CriarAcompanhamento';
import RegistrosDevolvidos from './pages/RegistrosDevolvidos/RegistrosDevolvidos';
import MeuPerfil from './pages/MeuPerfil/MeuPerfil';
import RotaProtegida from './components/RotaProtegida/RotaProtegida';
import LayoutPainel from './components/LayoutPainel/LayoutPainel';
import EmConstrucao from './components/EmConstrucao/EmConstrucao';
import { menuProfessor } from './components/LayoutPainel/menus';
import DetalheAcompanhamento from './pages/DetalheAcompanhamento/DetalheAcompanhamento';
import RevisaoAdmin from './pages/RevisaoAdmin/RevisaoAdmin';
import DetalheRevisao from './pages/DetalheRevisao/DetalheRevisao';
import Servicos from './pages/Servicos/Servicos';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutPublico />}>
          <Route path="/" element={<Home />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/entrar" element={<Login />} />
        <Route element={<RotaProtegida perfis={['PROFESSOR']} />}>
          <Route element={<LayoutPainel itens={menuProfessor} />}>
            <Route path="/professor" element={<DashboardProfessor />} />
            <Route path="/professor/turmas" element={<TelaTurmas />} />
            <Route path="/professor/acompanhamentos" element={<AcompanhamentosAlunos />} />
            <Route path="/professor/criar-acompanhamento" element={<CriarAcompanhamento />} />
            <Route path="/professor/acompanhamentos/:id/editar" element={<CriarAcompanhamento />} />
            <Route path="/professor/acompanhamentos/:id" element={<DetalheAcompanhamento />} />
            <Route path="/professor/devolvidos" element={<RegistrosDevolvidos />} />
            <Route path="/professor/relatorios" element={<EmConstrucao titulo="Relatórios e retornos" />} />
            <Route path="/professor/perfil" element={<MeuPerfil />} />
          </Route>
        </Route>

        <Route element={<RotaProtegida perfis={['ADMIN']} />}>
          <Route path="/admin" element={<DashboardAdmin />} />
          <Route path="/admin/revisao" element={<RevisaoAdmin />} />
          <Route path="/admin/revisao/:id" element={<DetalheRevisao />} />
        </Route>

        <Route element={<RotaProtegida perfis={['RESPONSAVEL']} />}>
          <Route path="/responsavel" element={<DashboardResponsavel />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;