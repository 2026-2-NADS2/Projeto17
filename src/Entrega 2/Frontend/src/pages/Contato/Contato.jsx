import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleCheck, CircleX, Clock, Mail, Send, Shield } from 'lucide-react';
import CabecalhoPagina from '../../components/CabecalhoPagina/CabecalhoPagina';
import './Contato.css';

const PERFIS = ['Responsável', 'Professor', 'Escola / gestão', 'Outro'];
const ASSUNTOS = ['Acesso à plataforma', 'Dúvida sobre relatórios', 'Implantação na escola', 'Privacidade e dados', 'Outro'];
const LIMITE_MENSAGEM = 1000;
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FORMULARIO_VAZIO = {
  nome: '',
  email: '',
  perfil: PERFIS[0],
  assunto: ASSUNTOS[0],
  mensagem: '',
  consentimento: false,
};

// Devolve { campo: 'mensagem de erro' } só para os campos com problema
function validar(dados) {
  const erros = {};
  if (dados.nome.trim().length < 3) erros.nome = 'Informe seu nome.';
  if (!EMAIL_VALIDO.test(dados.email.trim())) erros.email = 'Informe um e-mail válido (ex.: nome@dominio.com).';
  if (dados.mensagem.trim().length < 10) erros.mensagem = 'Escreva sua mensagem (pelo menos 10 caracteres).';
  else if (dados.mensagem.length > LIMITE_MENSAGEM) erros.mensagem = `Use no máximo ${LIMITE_MENSAGEM} caracteres.`;
  if (!dados.consentimento) erros.consentimento = 'É preciso concordar para podermos responder.';
  return erros;
}

function Contato() {
  const [dados, setDados] = useState(FORMULARIO_VAZIO);
  const [erros, setErros] = useState({});
  const [enviado, setEnviado] = useState(false);
  const resumoRef = useRef(null);

  function alterar(evento) {
    const { name, value, type, checked } = evento.target;
    setDados((atuais) => ({ ...atuais, [name]: type === 'checkbox' ? checked : value }));
    setErros((atuais) => ({ ...atuais, [name]: undefined })); // o erro some assim que a pessoa corrige
  }

  function enviar(evento) {
    evento.preventDefault();
    const novosErros = validar(dados);
    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      // Leva o foco (e o leitor de tela) para o resumo dos erros
      requestAnimationFrame(() => resumoRef.current?.focus());
      return;
    }
    // Envio real (por e-mail) fica para a próxima versão; por enquanto, só a confirmação na tela
    setEnviado(true);
  }

  function novaMensagem() {
    setDados(FORMULARIO_VAZIO);
    setErros({});
    setEnviado(false);
  }

  const quantidadeErros = Object.values(erros).filter(Boolean).length;

  // Atributos comuns de cada campo: classe de erro e ligação com a mensagem
  const propsDoCampo = (nome) => ({
    id: `contato-${nome}`,
    name: nome,
    value: dados[nome],
    onChange: alterar,
    className: `campo-entrada ${erros[nome] ? 'campo-entrada--erro' : ''}`,
    'aria-invalid': Boolean(erros[nome]),
    'aria-describedby': erros[nome] ? `contato-${nome}-erro` : undefined,
  });

  const erroDo = (nome) =>
    erros[nome] && <span id={`contato-${nome}-erro`} className="campo-erro">{erros[nome]}</span>;

  return (
    <>
      <CabecalhoPagina
        variante="claro"
        titulo="Fale com a gente"
        subtitulo="Dúvidas sobre a plataforma, implantação na escola ou acesso? Responderemos em até 2 dias úteis."
      />

      <div className="contato">
        <section className="card contato-card" aria-label="Formulário de contato">
          {enviado ? (
            <div className="contato-sucesso" role="status">
              <span className="contato-sucesso-icone"><CircleCheck size={28} /></span>
              <h2>Obrigado pelo contato, {dados.nome.trim().split(' ')[0]}!</h2>
              <p>
                Recebemos sua mensagem sobre <strong>{dados.assunto}</strong>. Responderemos em até 2 dias úteis
                no e-mail <strong>{dados.email.trim()}</strong>.
              </p>
              <button type="button" className="botao botao--secundario" onClick={novaMensagem}>
                Enviar outra mensagem
              </button>
            </div>
          ) : (
            <form className="contato-form" onSubmit={enviar} noValidate>
              {quantidadeErros > 0 && (
                <div className="alerta alerta--erro" ref={resumoRef} tabIndex={-1} role="alert">
                  <CircleX size={18} />
                  <div>
                    <p className="alerta-titulo">Revise os campos destacados</p>
                    <p>
                      Há {quantidadeErros} {quantidadeErros === 1 ? 'campo' : 'campos'} com problemas antes do envio.
                    </p>
                  </div>
                </div>
              )}

              <div className="contato-linha">
                <div className="campo">
                  <label htmlFor="contato-nome" className="campo-rotulo">Nome completo</label>
                  <input {...propsDoCampo('nome')} autoComplete="name" />
                  {erroDo('nome')}
                </div>
                <div className="campo">
                  <label htmlFor="contato-email" className="campo-rotulo">E-mail</label>
                  <input {...propsDoCampo('email')} type="email" autoComplete="email" />
                  {erroDo('email')}
                </div>
              </div>

              <div className="contato-linha">
                <div className="campo">
                  <label htmlFor="contato-perfil" className="campo-rotulo">Você é</label>
                  <select {...propsDoCampo('perfil')}>
                    {PERFIS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="campo">
                  <label htmlFor="contato-assunto" className="campo-rotulo">Assunto</label>
                  <select {...propsDoCampo('assunto')}>
                    {ASSUNTOS.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div className="campo">
                <label htmlFor="contato-mensagem" className="campo-rotulo">Mensagem</label>
                <textarea {...propsDoCampo('mensagem')} rows={5} maxLength={LIMITE_MENSAGEM} />
                {erroDo('mensagem') || (
                  <span className="campo-ajuda">{dados.mensagem.length}/{LIMITE_MENSAGEM} caracteres</span>
                )}
              </div>

              <div className="campo">
                <label className="contato-consentimento">
                  <input
                    type="checkbox"
                    name="consentimento"
                    checked={dados.consentimento}
                    onChange={alterar}
                    aria-invalid={Boolean(erros.consentimento)}
                    aria-describedby={erros.consentimento ? 'contato-consentimento-erro' : undefined}
                  />
                  <span>
                    Concordo com o uso dos meus dados para responder a este contato (
                    <Link to="/privacidade">Política de privacidade</Link>).
                  </span>
                </label>
                {erroDo('consentimento')}
              </div>

              <button type="submit" className="botao botao--primario contato-enviar">
                <Send size={16} /> Enviar mensagem
              </button>
            </form>
          )}
        </section>

        <aside className="card contato-canais" aria-labelledby="contato-titulo-canais">
          <h2 id="contato-titulo-canais">Outros canais</h2>
          <div className="contato-canal">
            <Mail size={18} />
            <div>
              <strong>E-mail</strong>
              <span>suporte@classsync.com.br</span>
            </div>
          </div>
          <div className="contato-canal">
            <Clock size={18} />
            <div>
              <strong>Atendimento</strong>
              <span>Seg. a sex., 8h às 18h</span>
            </div>
          </div>
          <div className="contato-canal">
            <Shield size={18} />
            <div>
              <strong>Dados pessoais (LGPD)</strong>
              <span>Solicitações do titular: privacidade@classsync.com.br</span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

export default Contato;