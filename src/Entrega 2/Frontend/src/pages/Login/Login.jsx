import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import banner from '../../assets/BANNER - ClassSync.png';
import { login, rotaDoPerfil } from '../../services/authService';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  function validarEmail(valor) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(valor);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (!email.trim() || !senha.trim()) {
      setErro('Preencha todos os campos.');
      return;
    }

    if (!validarEmail(email)) {
      setErro('Digite um e-mail válido.');
      return;
    }

    try {
      setCarregando(true);
      const usuario = await login(email.trim(), senha);
      navigate(rotaDoPerfil(usuario.perfil));
    } catch (error) {
      if (error.response) {
        setErro(error.response.data?.erro || 'Não foi possível entrar.');
      } else {
        setErro('Servidor indisponível. Tente novamente em instantes.');
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login">
      <div className="login-lado-esquerdo">
        <img src={banner} alt="ClassSync" className="login-banner" />
        <h1>Acompanhamento escolar, do professor à família</h1>
        <p>Entre com sua conta para acessar seu módulo — Professor, Administrador ou Pai/Responsável.</p>
      </div>

      <div className="login-lado-direito">
        <div className="login-form-container">
          <h2>Entrar</h2>
          <p className="login-subtitulo">Acesse sua conta ClassSync</p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@escola.com.br"
            />

            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
            />

            <Link to="/recuperar-senha" className="login-esqueci">
              Esqueci minha senha
            </Link>

            {erro && <p className="login-erro">{erro}</p>}

            <button type="submit" className="login-btn-entrar" disabled={carregando}>
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <hr className="login-linha" />

          <p className="login-demo-titulo">DEMONSTRAÇÃO — ENTRAR COMO</p>
          <div className="login-demo-botoes">
            <button onClick={() => navigate('/professor')}>Professor</button>
            <button onClick={() => navigate('/admin')}>Administrador</button>
            <button onClick={() => navigate('/responsavel')}>Responsável</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;