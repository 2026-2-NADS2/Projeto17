import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import banner from '../../assets/BANNER - ClassSync.png';
import { solicitarRecuperacao } from '../../services/authService';
import { mensagemDeErro } from '../../services/api';
import '../Login/Login.css';

// L05 (informar o e-mail) → L06 (verifique seu e-mail)
function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviar(e) {
    e?.preventDefault();
    setErro('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErro('Digite um e-mail válido.');
      return;
    }

    try {
      setEnviando(true);
      await solicitarRecuperacao(email.trim());
      setEnviado(true);
    } catch (error) {
      setErro(mensagemDeErro(error));
    } finally {
      setEnviando(false);
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
          {enviado ? (
            <>
              <span className="login-icone-status login-icone-status--azul" aria-hidden="true">
                <MailCheck size={22} />
              </span>
              <h2>Verifique seu e-mail</h2>
              <p className="login-subtitulo">
                Se houver uma conta para <strong>{email.trim()}</strong>, você vai receber um link para criar
                uma nova senha. O link vale por 30 minutos. Confira também a caixa de spam.
              </p>

              <Link to="/entrar" className="login-btn-secundario">Voltar para o login</Link>

              <button type="button" className="login-link-botao" onClick={enviar} disabled={enviando}>
                {enviando ? 'Reenviando...' : 'Não recebeu? Reenviar e-mail'}
              </button>
              {erro && <p className="login-erro">{erro}</p>}
            </>
          ) : (
            <>
              <Link to="/entrar" className="login-voltar">← Voltar para o login</Link>
              <h2>Recuperar senha</h2>
              <p className="login-subtitulo">
                Informe o e-mail cadastrado. Enviaremos um link para você criar uma nova senha.
              </p>

              <form onSubmit={enviar}>
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@escola.com.br"
                  autoComplete="email"
                />

                {erro && <p className="login-erro">{erro}</p>}

                <button type="submit" className="login-btn-entrar" disabled={enviando}>
                  {enviando ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecuperarSenha;
