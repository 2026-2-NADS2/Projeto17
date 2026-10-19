import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CampoFormulario from '../../components/CampoFormulario/CampoFormulario';
import { cadastrarUsuario } from '../../services/usuarioService';
import './Cadastro.css';

const estadoInicial = {
  nome: '',
  email: '',
  telefone: '',
  senha: '',
  confirmarSenha: '',
};

// Função pura: recebe os dados e devolve um objeto só com os campos que têm erro
function validar(dados) {
  const erros = {};
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const digitosTelefone = dados.telefone.replace(/\D/g, '');

  if (!dados.nome.trim()) {
    erros.nome = 'Informe seu nome completo.';
  } else if (dados.nome.trim().length < 3) {
    erros.nome = 'O nome precisa ter pelo menos 3 letras.';
  }

  if (!dados.email.trim()) {
    erros.email = 'Informe seu e-mail.';
  } else if (!regexEmail.test(dados.email.trim())) {
    erros.email = 'Digite um e-mail válido (ex: nome@email.com).';
  }

  if (!digitosTelefone) {
    erros.telefone = 'Informe seu telefone.';
  } else if (digitosTelefone.length < 10 || digitosTelefone.length > 11) {
    erros.telefone = 'Digite o DDD + número (10 ou 11 dígitos).';
  }

  if (!dados.senha) {
    erros.senha = 'Crie uma senha.';
  } else if (dados.senha.length < 6) {
    erros.senha = 'A senha precisa ter pelo menos 6 caracteres.';
  }

  if (!dados.confirmarSenha) {
    erros.confirmarSenha = 'Confirme sua senha.';
  } else if (dados.confirmarSenha !== dados.senha) {
    erros.confirmarSenha = 'As senhas não coincidem.';
  }

  return erros;
}

function Cadastro() {
  const [dados, setDados] = useState(estadoInicial);
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [erroServidor, setErroServidor] = useState('');
  const navigate = useNavigate();

  function handleChange(evento) {
    const { name, value } = evento.target;
    setDados((anterior) => ({ ...anterior, [name]: value }));

    // Se o campo tinha erro, some assim que a pessoa começa a corrigir
    if (erros[name]) {
      setErros((anterior) => ({ ...anterior, [name]: '' }));
    }
  }

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErroServidor('');

    const errosEncontrados = validar(dados);
    setErros(errosEncontrados);

    // Se existe qualquer erro, para aqui e não envia nada ao backend
    if (Object.keys(errosEncontrados).length > 0) return;

    setEnviando(true);
    try {
      await cadastrarUsuario({
        nome: dados.nome.trim(),
        email: dados.email.trim().toLowerCase(),
        telefone: dados.telefone.replace(/\D/g, ''),
        senha: dados.senha,
      });
      navigate('/entrar', { state: { cadastroRealizado: true } });
    } catch (erro) {
      setErroServidor(
        erro.response?.data?.mensagem ||
          'Não foi possível concluir o cadastro. Tente novamente.'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="cadastro">
      <div className="cadastro-card">
        <h1 className="cadastro-titulo">Crie sua conta</h1>
        <p className="cadastro-subtitulo">
          Acompanhe a vida escolar do seu filho em um só lugar.
        </p>

        {erroServidor && (
          <div className="cadastro-alerta" role="alert">
            {erroServidor}
          </div>
        )}

        <form className="cadastro-form" onSubmit={handleSubmit} noValidate>
          <CampoFormulario
            label="Nome completo"
            id="nome"
            value={dados.nome}
            onChange={handleChange}
            erro={erros.nome}
            placeholder="Maria da Silva"
            autoComplete="name"
          />

          <CampoFormulario
            label="E-mail"
            id="email"
            type="email"
            value={dados.email}
            onChange={handleChange}
            erro={erros.email}
            placeholder="nome@email.com"
            autoComplete="email"
          />

          <CampoFormulario
            label="Telefone"
            id="telefone"
            type="tel"
            value={dados.telefone}
            onChange={handleChange}
            erro={erros.telefone}
            placeholder="(11) 91234-5678"
            autoComplete="tel"
          />

          <div className="cadastro-linha">
            <CampoFormulario
              label="Senha"
              id="senha"
              type="password"
              value={dados.senha}
              onChange={handleChange}
              erro={erros.senha}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />

            <CampoFormulario
              label="Confirmar senha"
              id="confirmarSenha"
              type="password"
              value={dados.confirmarSenha}
              onChange={handleChange}
              erro={erros.confirmarSenha}
              placeholder="Repita a senha"
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="cadastro-btn" disabled={enviando}>
            {enviando ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>

        <p className="cadastro-rodape">
          Já tem uma conta? <Link to="/entrar">Entrar</Link>
        </p>
      </div>
    </section>
  );
}

export default Cadastro;