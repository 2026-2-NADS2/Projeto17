import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function LayoutPublico() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default LayoutPublico;