import { useEffect, useState } from 'react';
import { CircleCheck, TriangleAlert } from 'lucide-react';
import { obterUsuario, alterarSenha } from '../../services/authService';
import { listarVinculos } from '../../services/vinculoService';
import { mensagemDeErro } from '../../services/api';
import './MeuPerfil.css';

const PERFIS = { ADMIN: 'Administração', PROFESSOR: 'Professor', RESPONSAVEL: 'Responsável' };
const SENHA_VAZIA = { atual: '', nova: '', confirmacao: '' };

// "Ricardo Lima" → "RL"
function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes.at(-1)[0] : '')).toUpperCase();
}

// As mesmas regras do backend, para avisar antes de enviar
function validarSenhas({ atual, nova, confirmacao }) {
  const erros = {};
  if (!atual) erros.atual = 'Informe a senha atual.';
  if (nova.length < 8) erros.nova = 'A nova senha precisa ter pelo menos 8 caracteres.';
  else if (!/[A-Za-z]/.test(nova) || !/[0-9]/.test(nova)) erros.nova = 'Use letras e números.';
  else if (nova === atual) erros.nova = 'A nova senha precisa ser diferente da atual.';
  if (confirmacao !== nova) erros.confirmacao = 'As senhas não conferem.';
  return erros;
}

function MeuPerfil() {
  const usuario = obterUsuario();
  const ehProfessor = usuario?.perfil === 'PROFESSOR';

  const [senhas, setSenhas] = useState(SENHA_VAZIA);
  const [errosSenha, setErrosSenha] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState(null); // { tipo: 'sucesso' | 'erro', texto }

  const [vinculos, setVinculos] = useState([]);
  const [erroVinculos, setErroVinculos] = useState('');

  useEffect(() => {
    if (!ehProfessor) return;
    listarVinculos()
      .then(setVinculos)
      .catch((error) => setErroVinculos(mensagemDeErro(error)));
  }, [ehProfessor]);

  function alterarCampo(evento) {
    const { name, value } = evento.target;
    setSenhas((atuais) => ({ ...atuais, [name]: value }));
    setErrosSenha((atuais) => ({ ...atuais, [name]: undefined }));
  }

  async function enviarSenha(evento) {
    evento.preventDefault();
    setAviso(null);

    const erros = validarSenhas(senhas);
    setErrosSenha(erros);
    if (Object.keys(erros).length > 0) return;

    setSalvando(true);
    try {
      await alterarSenha(senhas.atual, senhas.nova);
      setSenhas(SENHA_VAZIA); // não deixa senha guardada na tela
      setAviso({ tipo: 'sucesso', texto: 'Senha atualizada. Use a nova senha no próximo acesso.' });
    } catch (error) {
      setAviso({ tipo: 'erro', texto: mensagemDeErro(error) });
    } finally {
      setSalvando(false);
    }
  }

  // Monta um campo de senha (os três são iguais, muda só o nome e o texto)
  function campoSenha(nome, rotulo, ajuda, autocompletar) {
    return (
      <div className="campo">
        <label htmlFor={`mp-${nome}`} className="campo-rotulo">{rotulo}</label>
        <input
          id={`mp-${nome}`}
          name={nome}
          type="password"
          autoComplete={autocompletar}
          className={`campo-entrada ${errosSenha[nome] ? 'campo-entrada--erro' : ''}`}
          value={senhas[nome]}
          onChange={alterarCampo}
          aria-invalid={Boolean(errosSenha[nome])}
          aria-describedby={`mp-${nome}-ajuda`}
        />
        <span id={`mp-${nome}-ajuda`} className={errosSenha[nome] ? 'campo-erro' : 'campo-ajuda'}>
          {errosSenha[nome] || ajuda}
        </span>
      </div>
    );
  }

  return (
    <div className="mp">
      <h1 className="mp-titulo">Meu perfil</h1>
      <p className="mp-subtitulo">Dados da sua conta e segurança</p>

      <div className="mp-grade">
        {/* ----- Dados da conta (somente leitura) ----- */}
        <section className="card mp-card" aria-labelledby="mp-titulo-conta">
          <h2 id="mp-titulo-conta">Dados da conta</h2>

          <div className="mp-identidade">
            <span className="mp-avatar" aria-hidden="true">{iniciais(usuario?.nome)}</span>
            <div>
              <strong>{usuario?.nome}</strong>
              <span>{PERFIS[usuario?.perfil] ?? usuario?.perfil}</span>
            </div>
          </div>

          <div className="campo">
            <label htmlFor="mp-nome" className="campo-rotulo">Nome completo</label>
            <input id="mp-nome" className="campo-entrada" value={usuario?.nome ?? ''} disabled />
          </div>

          <div className="campo">
            <label htmlFor="mp-email" className="campo-rotulo">E-mail de acesso</label>
            <input id="mp-email" className="campo-entrada" value={usuario?.email ?? ''} disabled />
            <span className="campo-ajuda">Alterações de nome e e-mail são feitas pela administração.</span>
          </div>
        </section>

        <div className="mp-coluna">
          {/* ----- Alterar senha ----- */}
          <section className="card mp-card" aria-labelledby="mp-titulo-senha">
            <h2 id="mp-titulo-senha">Alterar senha</h2>

            {aviso && (
              <div className={`alerta alerta--${aviso.tipo}`} role="status">
                {aviso.tipo === 'sucesso' ? <CircleCheck size={18} /> : <TriangleAlert size={18} />}
                <p>{aviso.texto}</p>
              </div>
            )}

            <form className="mp-form" onSubmit={enviarSenha} noValidate>
              {campoSenha('atual', 'Senha atual', '', 'current-password')}
              {campoSenha('nova', 'Nova senha', 'Mínimo de 8 caracteres, com letras e números.', 'new-password')}
              {campoSenha('confirmacao', 'Confirmar nova senha', '', 'new-password')}

              <button type="submit" className="botao botao--primario mp-botao" disabled={salvando}>
                {salvando ? 'Atualizando...' : 'Atualizar senha'}
              </button>
            </form>
          </section>

          {/* ----- Vínculos (só professor) ----- */}
          {ehProfessor && (
            <section className="card mp-card" aria-labelledby="mp-titulo-vinculos">
              <h2 id="mp-titulo-vinculos">Vínculos (somente leitura)</h2>
              {erroVinculos && <p className="campo-erro">{erroVinculos}</p>}
              {!erroVinculos && vinculos.length === 0 && (
                <p className="campo-ajuda">Nenhum vínculo cadastrado. Fale com a administração.</p>
              )}
              <ul className="mp-vinculos">
                {vinculos.map((v) => (
                  <li key={v.id}>{v.turma} · {v.disciplina}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default MeuPerfil;