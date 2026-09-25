import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LayoutPublico from './components/LayoutPublico/LayoutPublico';
import Home from './pages/Home/Home';
import NotFound from './pages/NotFound/NotFound';
import Login from './pages/Login/Login';
import DashboardProfessor from './pages/DashboardProfessor/DashboardProfessor';
import DashboardAdmin from './pages/DashboardAdmin/DashboardAdmin';
import DashboardResponsavel from './pages/DashboardResponsavel/DashboardResponsavel';

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
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/responsavel" element={<DashboardResponsavel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;