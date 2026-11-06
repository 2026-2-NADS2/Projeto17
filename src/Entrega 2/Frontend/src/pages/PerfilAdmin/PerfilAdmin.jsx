import { useNavigate } from 'react-router-dom';
import { LogOut, Mail, ShieldCheck, User } from 'lucide-react';
import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';
import { obterUsuario, sair } from '../../services/authService';
import { NOMES_PERFIL } from '../UsuariosAdmin/perfis';
import './PerfilAdmin.css';

// "Ana Ribeiro" → "AR"
function obterIniciais(nome) {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

function PerfilAdmin() {
  const navigate = useNavigate();
  const usuario = obterUsuario(); // dados salvos no login (localStorage)

  const nome = usuario?.nome ?? 'Administrador';
  const email = usuario?.email ?? '—';
  const perfil = NOMES_PERFIL[usuario?.perfil] ?? usuario?.perfil ?? '—';

  function handleSair() {
    sair();
    navigate('/entrar');
  }

  return (
    <div className="perfil-admin">
      <SidebarAdmin />

      <main className="perfil-admin__conteudo">
        <header className="perfil-admin__topo">
          <h1>Meu perfil</h1>
          <p>Seus dados de acesso ao ClassSync.</p>
        </header>

        {/* Cartão de identificação */}
        <section className="perfil-admin__card perfil-admin__identidade">
          <span className="perfil-admin__avatar" aria-hidden="true">{obterIniciais(nome)}</span>
          <div>
            <h2>{nome}</h2>
            <span className="perfil-admin__badge">{perfil}</span>
          </div>
        </section>

        <div className="perfil-admin__grade">
          {/* Dados da conta */}
          <section className="perfil-admin__card" aria-labelledby="titulo-dados">
            <h2 id="titulo-dados" className="perfil-admin__titulo-card">Dados da conta</h2>

            <dl className="perfil-admin__dados">
              <div>
                <dt><User size={16} aria-hidden="true" /> Nome</dt>
                <dd>{nome}</dd>
              </div>
              <div>
                <dt><Mail size={16} aria-hidden="true" /> E-mail</dt>
                <dd>{email}</dd>
              </div>
              <div>
                <dt><ShieldCheck size={16} aria-hidden="true" /> Perfil de acesso</dt>
                <dd>{perfil}</dd>
              </div>
            </dl>

            <p className="perfil-admin__nota">
              Para alterar nome ou e-mail, peça a outro administrador na tela de Usuários.
            </p>
          </section>

          {/* Senha e sessão */}
          <section className="perfil-admin__card" aria-labelledby="titulo-seguranca">
            <h2 id="titulo-seguranca" className="perfil-admin__titulo-card">Segurança</h2>

            <div className="perfil-admin__bloco">
              <strong>Senha</strong>
              <p>
                A troca de senha pela plataforma ainda não está disponível. Enquanto isso,
                fale com o suporte da escola.
              </p>
            </div>

            <div className="perfil-admin__bloco">
              <strong>Sessão</strong>
              <p>Ao sair, seus dados de acesso são apagados deste navegador.</p>
              <button type="button" className="perfil-admin__botao-sair" onClick={handleSair}>
                <LogOut size={16} aria-hidden="true" />
                Sair da conta
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default PerfilAdmin;