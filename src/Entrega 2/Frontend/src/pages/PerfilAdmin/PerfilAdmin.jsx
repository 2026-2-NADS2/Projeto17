import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Mail, ShieldCheck, User } from 'lucide-react';
import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';
import CampoFormulario from '../../components/CampoFormulario/CampoFormulario';
import { obterUsuario, sair, alterarSenha } from '../../services/authService';
import { NOMES_PERFIL } from '../UsuariosAdmin/perfis';
import './PerfilAdmin.css';

// "Ana Ribeiro" → "AR"
function obterIniciais(nome) {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

const senhaVazia = { senhaAtual: '', novaSenha: '', confirmarSenha: '' };

// Mesma regra do cadastro de usuário: 8+ caracteres, com letras e números
function validarSenha(dados) {
  const erros = {};

  if (!dados.senhaAtual) erros.senhaAtual = 'Informe a sua senha atual.';

  if (!dados.novaSenha) {
    erros.novaSenha = 'Crie a nova senha.';
  } else if (dados.novaSenha.length < 8) {
    erros.novaSenha = 'A nova senha precisa ter pelo menos 8 caracteres.';
  } else if (!/[A-Za-z]/.test(dados.novaSenha) || !/\d/.test(dados.novaSenha)) {
    erros.novaSenha = 'A nova senha precisa ter letras e números.';
  } else if (dados.novaSenha === dados.senhaAtual) {
    erros.novaSenha = 'A nova senha precisa ser diferente da atual.';
  }

  if (!dados.confirmarSenha) {
    erros.confirmarSenha = 'Confirme a nova senha.';
  } else if (dados.confirmarSenha !== dados.novaSenha) {
    erros.confirmarSenha = 'As senhas não coincidem.';
  }

  return erros;
}

function PerfilAdmin() {
  const navigate = useNavigate();
  const usuario = obterUsuario(); // dados salvos no login (localStorage)

  const nome = usuario?.nome ?? 'Administrador';
  const email = usuario?.email ?? '—';
  const perfil = NOMES_PERFIL[usuario?.perfil] ?? usuario?.perfil ?? '—';

  const [dados, setDados] = useState(senhaVazia);
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [erroServidor, setErroServidor] = useState('');
  const [sucesso, setSucesso] = useState('');

  function handleChange(evento) {
    const { name, value } = evento.target;
    setDados((anterior) => ({ ...anterior, [name]: value }));
    if (erros[name]) setErros((anterior) => ({ ...anterior, [name]: '' }));
    setSucesso('');
  }

  async function trocarSenha(evento) {
    evento.preventDefault();
    setErroServidor('');
    setSucesso('');

    const errosEncontrados = validarSenha(dados);
    setErros(errosEncontrados);
    if (Object.keys(errosEncontrados).length > 0) return;

    setEnviando(true);
    try {
      await alterarSenha(dados.senhaAtual, dados.novaSenha);
      setDados(senhaVazia); // limpa os campos depois de trocar
      setSucesso('Senha alterada! Use a nova senha no próximo login.');
    } catch (e) {
      setErroServidor(
        e.response?.data?.erro ??
          e.response?.data?.mensagem ??
          'Não foi possível alterar a senha. Tente novamente.'
      );
    } finally {
      setEnviando(false);
    }
  }

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

            <div className="perfil-admin__bloco perfil-admin__bloco--sessao">
              <strong>Sessão</strong>
              <p>Ao sair, seus dados de acesso são apagados deste navegador.</p>
              <button type="button" className="perfil-admin__botao-sair" onClick={handleSair}>
                <LogOut size={16} aria-hidden="true" />
                Sair da conta
              </button>
            </div>
          </section>

          {/* Trocar senha */}
          <section className="perfil-admin__card" aria-labelledby="titulo-senha">
            <h2 id="titulo-senha" className="perfil-admin__titulo-card">Trocar senha</h2>
            <p className="perfil-admin__dica">Mínimo de 8 caracteres, com letras e números.</p>

            {sucesso && <p className="perfil-admin__sucesso" role="status">{sucesso}</p>}
            {erroServidor && <p className="perfil-admin__erro" role="alert">{erroServidor}</p>}

            <form className="perfil-admin__form" onSubmit={trocarSenha} noValidate>
              <CampoFormulario
                label="Senha atual"
                id="senhaAtual"
                type="password"
                value={dados.senhaAtual}
                onChange={handleChange}
                erro={erros.senhaAtual}
                autoComplete="current-password"
              />
              <CampoFormulario
                label="Nova senha"
                id="novaSenha"
                type="password"
                value={dados.novaSenha}
                onChange={handleChange}
                erro={erros.novaSenha}
                autoComplete="new-password"
              />
              <CampoFormulario
                label="Confirmar nova senha"
                id="confirmarSenha"
                type="password"
                value={dados.confirmarSenha}
                onChange={handleChange}
                erro={erros.confirmarSenha}
                autoComplete="new-password"
              />

              <button type="submit" className="perfil-admin__botao-salvar" disabled={enviando}>
                {enviando ? 'Salvando...' : 'Salvar nova senha'}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default PerfilAdmin;