import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CircleCheck, CircleX } from 'lucide-react';
import banner from '../../assets/BANNER - ClassSync.png';
import EntradaSenha from '../../components/EntradaSenha/EntradaSenha';
import { redefinirSenha } from '../../services/authService';
import { mensagemDeErro } from '../../services/api';
import '../Login/Login.css';

// Mesmas regras do backend (AuthService.#validarSenha)
const REGRAS = [
  { texto: 'Mínimo de 8 caracteres', ok: (s) => s.length >= 8 },
  { texto: 'Pelo menos uma letra', ok: (s) => /[A-Za-z]/.test(s) },
  { texto: 'Pelo menos um número', ok: (s) => /[0-9]/.test(s) },
];

// L07 (criar nova senha) → L08 (senha alterada). O token chega no link do e-mail.
function RedefinirSenha() {
  const [busca] = useSearchParams();
  const token = busca.get('token') || '';

  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [linkInvalido, setLinkInvalido] = useState(!token);
  const [salvando, setSalvando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  const regrasOk = REGRAS.every((r) => r.ok(senha));
  const confirmacaoErrada = confirmacao.length > 0 && confirmacao !== senha;

  async function salvar(e) {
    e.preventDefault();
    setErro('');

    if (!regrasOk) {
      setErro('A nova senha não atende às regras.');
      return;
    }
    if (senha !== confirmacao) {
      setErro('As senhas não coincidem.');
      return;
    }

    try {
      setSalvando(true);
      await redefinirSenha(token, senha);
      setConcluido(true);
    } catch (error) {
      const mensagem = mensagemDeErro(error);
      // Link vencido, adulterado ou já usado: mostra o caminho para pedir outro
      if (mensagem.includes('link')) setLinkInvalido(true);
      setErro(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  function conteudo() {
    if (concluido) {
      return (
        <>
          <span className="login-icone-status login-icone-status--verde" aria-hidden="true">
            <CircleCheck size={22} />
          </span>
          <h2>Senha alterada</h2>
          <p className="login-subtitulo">Sua nova senha foi salva. Use-a para entrar na plataforma.</p>
          <Link to="/entrar" className="login-btn-entrar login-btn-link">Ir para o login</Link>
        </>
      );
    }

    if (linkInvalido) {
      return (
        <>
          <span className="login-icone-status login-icone-status--vermelho" aria-hidden="true">
            <CircleX size={22} />
          </span>
          <h2>Link inválido ou expirado</h2>
          <p className="login-subtitulo">
            O link de recuperação vale por 30 minutos e pode ser usado uma vez só. Peça um novo link para continuar.
          </p>
          <Link to="/recuperar-senha" className="login-btn-entrar login-btn-link">Pedir novo link</Link>
          <Link to="/entrar" className="login-voltar login-voltar--centro">Voltar para o login</Link>
        </>
      );
    }

    return (
      <>
        <h2>Criar nova senha</h2>
        <p className="login-subtitulo">Defina uma nova senha para a sua conta.</p>

        <form onSubmit={salvar}>
          <label htmlFor="nova-senha">Nova senha</label>
          <EntradaSenha
            id="nova-senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="new-password"
          />

          <ul className="login-regras" aria-label="Regras da senha">
            {REGRAS.map((regra) => {
              const ok = regra.ok(senha);
              return (
                <li key={regra.texto} className={ok ? 'login-regra--ok' : ''}>
                  {ok ? <CircleCheck size={14} aria-hidden="true" /> : <CircleX size={14} aria-hidden="true" />}
                  {regra.texto}
                </li>
              );
            })}
          </ul>

          <label htmlFor="confirmar-senha">Confirmar nova senha</label>
          <EntradaSenha
            id="confirmar-senha"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            autoComplete="new-password"
          />
          {confirmacaoErrada && <p className="login-erro">As senhas não coincidem.</p>}

          {erro && <p className="login-erro">{erro}</p>}

          <button type="submit" className="login-btn-entrar" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      </>
    );
  }

  return (
    <div className="login">
      <div className="login-lado-esquerdo">
        <img src={banner} alt="ClassSync" className="login-banner" />
        <h1>Acompanhamento escolar, do professor à família</h1>
        <p>Entre com sua conta para acessar seu módulo — Professor, Administrador ou Pai/Responsável.</p>
      </div>

      <div className="login-lado-direito">
        <div className="login-form-container">{conteudo()}</div>
      </div>
    </div>
  );
}

export default RedefinirSenha;
