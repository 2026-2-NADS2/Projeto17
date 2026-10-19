import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LayoutPublico from './components/LayoutPublico/LayoutPublico';
import Home from './pages/Home/Home';
import NotFound from './pages/NotFound/NotFound';
import Login from './pages/Login/Login';
import DashboardProfessor from './pages/DashboardProfessor/DashboardProfessor';
import DashboardAdmin from './pages/DashboardAdmin/DashboardAdmin';
import DashboardResponsavel from './pages/DashboardResponsavel/DashboardResponsavel';
import TelaTurmas from './pages/TelaTurmas/TelaTurmas';
import Disciplinas from './pages/Disciplinas/Disciplinas';
import AcompanhamentosAlunos from './pages/AcompanhamentosAlunos/AcompanhamentosAlunos';
import CriarAcompanhamento from './pages/CriarAcompanhamento/CriarAcompanhamento';
import EnviadosAdministracao from './pages/EnviadosAdministracao/EnviadosAdministracao';
import RegistrosDevolvidos from './pages/RegistrosDevolvidos/RegistrosDevolvidos';
import MeuPerfil from './pages/MeuPerfil/MeuPerfil';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutPublico />}>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/entrar" element={<Login />} />
        <Route path="/professor" element={<DashboardProfessor />} />
        <Route path="/professor/turmas" element={<TelaTurmas />} />
<Route path="/professor/disciplinas" element={<Disciplinas />} />
<Route path="/professor/acompanhamentos" element={<AcompanhamentosAlunos />} />
<Route path="/professor/criar-acompanhamento" element={<CriarAcompanhamento />} />
<Route path="/professor/enviados" element={<EnviadosAdministracao />} />
<Route path="/professor/devolvidos" element={<RegistrosDevolvidos />} />
<Route path="/professor/perfil" element={<MeuPerfil />} />
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/responsavel" element={<DashboardResponsavel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;