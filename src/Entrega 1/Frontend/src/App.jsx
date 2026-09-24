import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LayoutPublico from './components/LayoutPublico/LayoutPublico';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutPublico />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
