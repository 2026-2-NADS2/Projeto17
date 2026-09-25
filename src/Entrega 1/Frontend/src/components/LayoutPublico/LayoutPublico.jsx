import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './LayoutPublico.css';

function LayoutPublico() {
  return (
    <div className="layout-publico">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default LayoutPublico;