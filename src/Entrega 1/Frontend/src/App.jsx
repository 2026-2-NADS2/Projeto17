import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LayoutPublico from './components/LayoutPublico/LayoutPublico';
import Home from './pages/Home/Home';
import NotFound from './pages/NotFound/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutPublico />}>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
