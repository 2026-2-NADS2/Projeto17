import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './LayoutPublico.css';
import RolarParaTopo from '../RolarParaTopo/RolarParaTopo';

function LayoutPublico() {
  return (
    <div className="layout-publico">
      <RolarParaTopo />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default LayoutPublico;