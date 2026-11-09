import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EstadoRequisicao from '../DashboardResponsavel/components/EstadoRequisicao/EstadoRequisicao';
import { obterUsuario } from '../../services/authService';
import { buscarAlunos, mensagemDeErro } from '../../services/responsavelService';
import './MeuPerfilResponsavel.css';

function senhaValida(senha) {
  return senha.length >= 8 && /[A-Z]/.test(senha) && /\d/.test(senha);
}

function MeuPerfilResponsavel() {
  const usuario = obterUsuario();

  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  const [telefone, setTelefone] = useState(usuario?.telefone ?? '');
  const [msgConta, setMsgConta] = useState('');

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [msgSenha, setMsgSenha] = useState('');

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      try {
        const lista = await buscarAlunos();
        if (!cancelado) setAlunos(lista);
      } catch (e) {
        if (!cancelado) setErro(mensagemDeErro(e));
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }
    carregar();
    return () => {
      cancelado = true;
    };
  }, [tentativa]);

  function tentarDeNovo() {
    setErro(null);
    setCarregando(true);
    setTentativa((t) => t + 1);
  }

  // TODO: quando o backend tiver a rota de perfil, chamar api.put aqui
  function salvarConta(e) {
    e.preventDefault();
    setMsgConta('Telefone salvo.');
  }

  // TODO: quando o backend tiver a rota de troca de senha, chamar api.put aqui
  function atualizarSenha(e) {
    e.preventDefault();
    setMsgSenha('');
    if (!senhaAtual) return setErroSenha('Informe a senha atual.');
    if (!senhaValida(novaSenha)) {
      return setErroSenha('A nova senha precisa ter no mínimo 8 caracteres, uma letra maiúscula e um número.');
    }
    if (novaSenha !== confirmacao) return setErroSenha('A confirmação não é igual à nova senha.');
    setErroSenha('');
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmacao('');
    setMsgSenha('Senha atualizada.');
  }

  return (
    <div className="perfil-resp">
      <h1 className="perfil-resp__titulo">Meu perfil</h1>
      <p className="perfil-resp__subtitulo">Dados da conta, senha e privacidade</p>

      <div className="perfil-resp__grade">
        <form className="perfil-resp__card" onSubmit={salvarConta}>
          <h2>Dados da conta</h2>
          <label htmlFor="nome">Nome completo</label>
          <input id="nome" value={usuario?.nome ?? ''} disabled />
          <small>Para alterar, fale com a secretaria.</small>

          <label htmlFor="email">E-mail de acesso</label>
          <input id="email" value={usuario?.email ?? ''} disabled />

          <label htmlFor="telefone">Telefone</label>
          <input
            id="telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(11) 90000-0000"
            inputMode="tel"
          />

          <div className="perfil-resp__rodape">
            {msgConta && <span className="perfil-resp__ok" role="status">{msgConta}</span>}
            <button type="submit" className="perfil-resp__botao">Salvar</button>
          </div>
        </form>

        <form className="perfil-resp__card" onSubmit={atualizarSenha}>
          <h2>Alterar senha</h2>
          <label htmlFor="senha-atual">Senha atual</label>
          <input id="senha-atual" type="password" autoComplete="current-password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} />

          <label htmlFor="nova-senha">Nova senha</label>
          <input id="nova-senha" type="password" autoComplete="new-password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
          <small>Mínimo de 8 caracteres, com letra maiúscula e número.</small>

          <label htmlFor="confirmar-senha">Confirmar nova senha</label>
          <input id="confirmar-senha" type="password" autoComplete="new-password" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} />

          {erroSenha && <p className="perfil-resp__erro" role="alert">{erroSenha}</p>}
          <div className="perfil-resp__rodape">
            {msgSenha && <span className="perfil-resp__ok" role="status">{msgSenha}</span>}
            <button type="submit" className="perfil-resp__botao">Atualizar senha</button>
          </div>
        </form>

        <section className="perfil-resp__card">
          <h2>Alunos vinculados</h2>
          {carregando && <EstadoRequisicao tipo="carregando" mensagem="Carregando alunos…" />}
          {!carregando && erro && (
            <EstadoRequisicao tipo="erro" mensagem={erro} onTentarDeNovo={tentarDeNovo} />
          )}
          {!carregando && !erro && alunos.length === 0 && (
            <EstadoRequisicao tipo="vazio" mensagem="Nenhum aluno vinculado ao seu cadastro ainda." />
          )}
          {!carregando && !erro && alunos.length > 0 && (
            <ul className="perfil-resp__lista">
              {alunos.map((a) => (
                <li key={a.id}>{a.nome} · {a.turma ?? `Turma ${a.idTurma ?? '—'}`}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="perfil-resp__card">
          <h2>Privacidade (LGPD)</h2>
          {usuario?.consentimentoEm && (
            <p className="perfil-resp__texto">
              Consentimento aceito em {new Date(usuario.consentimentoEm).toLocaleDateString('pt-BR')}
            </p>
          )}
          <Link to="/privacidade" className="perfil-resp__link">Ver política de privacidade</Link>
          <Link to="/privacidade" className="perfil-resp__link">
            Solicitar meus dados ou correções ao encarregado
          </Link>
        </section>
      </div>
    </div>
  );
}

export default MeuPerfilResponsavel;