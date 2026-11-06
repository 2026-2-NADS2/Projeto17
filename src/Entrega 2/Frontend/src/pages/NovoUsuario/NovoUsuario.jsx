import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';
import CampoFormulario from '../../components/CampoFormulario/CampoFormulario';
import { cadastrarUsuario } from '../../services/usuarioService';
import { NOMES_PERFIL, OPCOES_PERFIL } from '../UsuariosAdmin/perfis';
import './NovoUsuario.css';

const estadoInicial = {
  nome: '',
  email: '',
  perfil: '',
  senha: '',
  confirmarSenha: '',
};

// Para o breadcrumb e o botão Cancelar mostrarem o nome certo da tela de origem
const NOMES_ORIGEM = {
  '/admin/usuarios': 'Usuários',
  '/admin/professores': 'Professores',
  '/admin/responsaveis': 'Responsáveis',
};

// Função pura (mesma ideia do Cadastro.jsx): devolve só os campos com erro
function validar(dados) {
  const erros = {};
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!dados.nome.trim()) {
    erros.nome = 'Informe o nome completo.';
  } else if (dados.nome.trim().length < 3) {
    erros.nome = 'O nome precisa ter pelo menos 3 letras.';
  }

  if (!dados.email.trim()) {
    erros.email = 'Informe o e-mail.';
  } else if (!regexEmail.test(dados.email.trim())) {
    erros.email = 'Digite um e-mail válido (ex: nome@escola.com).';
  }

  if (!dados.perfil) {
    erros.perfil = 'Escolha o perfil de acesso.';
  }

  if (!dados.senha) {
    erros.senha = 'Crie uma senha.';
  } else if (dados.senha.length < 8) {
    erros.senha = 'A senha precisa ter pelo menos 8 caracteres.';
  } else if (!/[A-Za-z]/.test(dados.senha) || !/\d/.test(dados.senha)) {
    erros.senha = 'A senha precisa ter letras e números.';
  }

  if (!dados.confirmarSenha) {
    erros.confirmarSenha = 'Confirme a senha.';
  } else if (dados.confirmarSenha !== dados.senha) {
    erros.confirmarSenha = 'As senhas não coincidem.';
  }

  return erros;
}

function NovoUsuario() {
  const location = useLocation();
  const navigate = useNavigate();

  // Vindo de Professores ou Responsáveis, o perfil já chega marcado e o "voltar" leva pra lá
  const voltarPara = location.state?.voltarPara ?? '/admin/usuarios';
  const nomeOrigem = NOMES_ORIGEM[voltarPara] ?? 'Usuários';
  const perfilInicial = location.state?.perfil ?? '';

  const [dados, setDados] = useState({ ...estadoInicial, perfil: perfilInicial });
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [erroServidor, setErroServidor] = useState('');

  const titulo = perfilInicial ? `Novo ${NOMES_PERFIL[perfilInicial].toLowerCase()}` : 'Novo usuário';

  function handleChange(evento) {
    const { name, value } = evento.target;
    setDados((anterior) => ({ ...anterior, [name]: value }));
    if (erros[name]) {
      setErros((anterior) => ({ ...anterior, [name]: '' }));
    }
  }

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErroServidor('');

    const errosEncontrados = validar(dados);
    setErros(errosEncontrados);
    if (Object.keys(errosEncontrados).length > 0) return;

    setEnviando(true);
    try {
      const nome = dados.nome.trim();
      await cadastrarUsuario({
        nome,
        email: dados.email.trim().toLowerCase(),
        senha: dados.senha,
        perfil: dados.perfil,
      });
      navigate(voltarPara, {
        state: { aviso: `${nome} foi cadastrado(a). Já pode entrar com o e-mail e a senha cadastrados.` },
      });
    } catch (erro) {
      // Contrato do grupo: error.response.data.erro (o "mensagem" fica de reserva)
      setErroServidor(
        erro.response?.data?.erro ??
          erro.response?.data?.mensagem ??
          'Não foi possível criar o usuário. Tente novamente.'
      );
      setEnviando(false);
    }
  }

  return (
    <div className="novo-usuario">
      <SidebarAdmin />

      <main className="novo-usuario__conteudo">
        <nav className="novo-usuario__breadcrumb" aria-label="Você está em">
          <Link to={voltarPara}>{nomeOrigem}</Link>
          <span aria-hidden="true">›</span>
          <span>Novo</span>
        </nav>

        <header className="novo-usuario__topo">
          <h1>{titulo}</h1>
          <p>Crie a conta de acesso de um administrador, professor ou responsável.</p>
        </header>

        {erroServidor && (
          <div className="novo-usuario__alerta" role="alert">{erroServidor}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <section className="novo-usuario__card" aria-labelledby="titulo-dados">
            <h2 id="titulo-dados">Dados do usuário</h2>
            <div className="novo-usuario__grade">
              <CampoFormulario
                label="Nome completo"
                id="nome"
                value={dados.nome}
                onChange={handleChange}
                erro={erros.nome}
                placeholder="Ana Ribeiro"
                autoComplete="off"
              />
              <CampoFormulario
                label="E-mail"
                id="email"
                type="email"
                value={dados.email}
                onChange={handleChange}
                erro={erros.email}
                placeholder="nome@escola.com"
                autoComplete="off"
              />

              {/* O CampoFormulario só faz <input>; aqui é um <select> com as mesmas classes */}
              <div className="campo-formulario">
                <label htmlFor="perfil" className="campo-label">Perfil</label>
                <select
                  id="perfil"
                  name="perfil"
                  value={dados.perfil}
                  onChange={handleChange}
                  className={`campo-input ${erros.perfil ? 'campo-input--erro' : ''}`}
                  aria-invalid={erros.perfil ? 'true' : 'false'}
                  aria-describedby={erros.perfil ? 'perfil-erro' : undefined}
                >
                  <option value="">Selecione...</option>
                  {OPCOES_PERFIL.map((op) => (
                    <option key={op.valor} value={op.valor}>{op.rotulo}</option>
                  ))}
                </select>
                {erros.perfil && (
                  <span id="perfil-erro" className="campo-erro">{erros.perfil}</span>
                )}
              </div>
            </div>
          </section>

          <section className="novo-usuario__card" aria-labelledby="titulo-acesso">
            <h2 id="titulo-acesso">Acesso</h2>
            <p className="novo-usuario__dica">Mínimo de 8 caracteres, com letras e números.</p>
            <div className="novo-usuario__grade">
              <CampoFormulario
                label="Senha"
                id="senha"
                type="password"
                value={dados.senha}
                onChange={handleChange}
                erro={erros.senha}
                autoComplete="new-password"
              />
              <CampoFormulario
                label="Confirmar senha"
                id="confirmarSenha"
                type="password"
                value={dados.confirmarSenha}
                onChange={handleChange}
                erro={erros.confirmarSenha}
                autoComplete="new-password"
              />
            </div>
          </section>

          <div className="novo-usuario__acoes">
            <Link to={voltarPara} className="novo-usuario__botao novo-usuario__botao--secundario">
              Cancelar
            </Link>
            <button type="submit" className="novo-usuario__botao novo-usuario__botao--primario" disabled={enviando}>
              {enviando ? 'Criando...' : 'Criar cadastro'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default NovoUsuario;