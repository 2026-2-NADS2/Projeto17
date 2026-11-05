import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';
import './RevisaoAdmin.css';

function RevisaoAdmin() {
  return (
    <div className="revisao-admin">
      <SidebarAdmin />

      <main className="revisao-admin__conteudo">
        <header className="revisao-admin__topo">
          <h1>Revisão e publicação</h1>
          <p>Revise os acompanhamentos enviados pelos professores e publique ou devolva para ajustes.</p>
        </header>
      </main>
    </div>
  );
}

export default RevisaoAdmin;