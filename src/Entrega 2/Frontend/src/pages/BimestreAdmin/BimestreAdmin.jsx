import { useEffect, useState } from 'react';
import { CalendarDays, Pencil } from 'lucide-react';
import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';
import EstadoCarregando from '../../components/EstadoCarregando/EstadoCarregando';
import EstadoErro from '../../components/EstadoErro/EstadoErro';
import CampoFormulario from '../../components/CampoFormulario/CampoFormulario';
import { listarBimestres, atualizarBimestre } from '../../services/bimestreService';
import { bimestresExemplo } from './dadosExemplo';
import '../AlunosAdmin/AlunosAdmin.css';
import './BimestresAdmin.css';

function mensagemDoErro(e, padrao) {
  return e.response?.data?.erro ?? e.response?.data?.mensagem ?? padrao;
}

// Deixa qualquer formato de data no padrão do <input type="datetime-local">: "2026-08-01T00:00"
// Aceita "2026-08-01 00:00:00", "2026-08-01T00:00:00.000Z" etc.
function normalizarData(valor) {
  if (!valor) return '';
  return String(valor).replace(' ', 'T').slice(0, 16);
}

// "2026-08-01T00:00" → "01/08/2026 00:00" (sem Date, pra o fuso não mudar nada)
function formatarDataHora(valor) {
  const texto = normalizarData(valor);
  if (!texto) return '—';
  const [data, hora = '00:00'] = texto.split('T');
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano} ${hora}`;
}

// Situação calculada pelas datas, comparando com agora
function situacaoDe(bimestre, agora) {
  const abertura = normalizarData(bimestre.dataAbertura);
  const encerramento = normalizarData(bimestre.dataEncerramento);
  if (!abertura || !encerramento) return { chave: 'sem-data', rotulo: 'Sem datas' };
  if (agora < abertura) return { chave: 'agendado', rotulo: 'Agendado' };
  if (agora > encerramento) return { chave: 'encerrado', rotulo: 'Encerrado' };
  return { chave: 'aberto', rotulo: 'Aberto para digitação' };
}

// Dias inteiros entre agora e o encerramento
function diasAte(encerramento) {
  const fim = new Date(normalizarData(encerramento));
  const diferenca = fim.getTime() - Date.now();
  return Math.max(0, Math.ceil(diferenca / (1000 * 60 * 60 * 24)));
}

// Agora no mesmo formato das datas: "2026-11-05T22:15"
function agoraLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const anoAtual = new Date().getFullYear();
const OPCOES_ANO = [anoAtual - 1, anoAtual, anoAtual + 1];

function BimestresAdmin() {
  const [anoLetivo, setAnoLetivo] = useState(anoAtual);
  const [bimestres, setBimestres] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modoExemplo, setModoExemplo] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [aviso, setAviso] = useState(null);

  // Janela de edição: null ou o bimestre sendo editado
  const [editando, setEditando] = useState(null);
  const [dados, setDados] = useState({ dataAbertura: '', dataEncerramento: '' });
  const [erros, setErros] = useState({});
  const [erroModal, setErroModal] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (modoExemplo) return;

    let ativo = true;

    async function buscar() {
      try {
        const lista = await listarBimestres(anoLetivo);
        if (ativo) setBimestres(lista);
      } catch (e) {
        if (ativo) setErro(mensagemDoErro(e, 'Não foi possível carregar os bimestres.'));
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    buscar();
    return () => { ativo = false; };
  }, [tentativa, modoExemplo, anoLetivo]);

  useEffect(() => {
    if (!editando) return;

    function aoTeclar(e) {
      if (e.key === 'Escape' && !enviando) setEditando(null);
    }

    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [editando, enviando]);

  function tentarNovamente() {
    setCarregando(true);
    setErro(null);
    setModoExemplo(false);
    setTentativa((t) => t + 1);
  }

  function usarDadosExemplo() {
    setBimestres(bimestresExemplo.filter((b) => b.anoLetivo === anoLetivo));
    setErro(null);
    setModoExemplo(true);
  }

  function trocarAno(evento) {
    const ano = Number(evento.target.value);
    setAnoLetivo(ano);
    setAviso(null);
    if (modoExemplo) {
      setBimestres(bimestresExemplo.filter((b) => b.anoLetivo === ano));
    } else {
      setCarregando(true);
    }
  }

  function abrirEdicao(bimestre) {
    setDados({
      dataAbertura: normalizarData(bimestre.dataAbertura),
      dataEncerramento: normalizarData(bimestre.dataEncerramento),
    });
    setErros({});
    setErroModal(null);
    setEditando(bimestre);
  }

  function fecharModal() {
    if (!enviando) setEditando(null);
  }

  function handleChange(evento) {
    const { name, value } = evento.target;
    setDados((anterior) => ({ ...anterior, [name]: value }));
    if (erros[name]) setErros((anterior) => ({ ...anterior, [name]: '' }));
  }

  // Validação: datas preenchidas, encerramento depois da abertura e sem invadir os vizinhos
  function validar() {
    const novosErros = {};
    const { dataAbertura, dataEncerramento } = dados;

    if (!dataAbertura) novosErros.dataAbertura = 'Informe a data de abertura.';
    if (!dataEncerramento) novosErros.dataEncerramento = 'Informe a data de encerramento.';

    if (dataAbertura && dataEncerramento && dataEncerramento <= dataAbertura) {
      novosErros.dataEncerramento = 'O encerramento precisa ser depois da abertura.';
    }

    const anterior = bimestres.find((b) => b.numero === editando.numero - 1);
    const proximo = bimestres.find((b) => b.numero === editando.numero + 1);

    if (dataAbertura && anterior && dataAbertura <= normalizarData(anterior.dataEncerramento)) {
      novosErros.dataAbertura = `Precisa ser depois do fim do ${anterior.numero}º bimestre (${formatarDataHora(anterior.dataEncerramento)}).`;
    }
    if (dataEncerramento && proximo && dataEncerramento >= normalizarData(proximo.dataAbertura)) {
      novosErros.dataEncerramento = `Precisa ser antes do início do ${proximo.numero}º bimestre (${formatarDataHora(proximo.dataAbertura)}).`;
    }

    return novosErros;
  }

  async function salvar(evento) {
    evento.preventDefault();

    const errosEncontrados = validar();
    setErros(errosEncontrados);
    if (Object.keys(errosEncontrados).length > 0) return;

    setEnviando(true);
    setErroModal(null);

    try {
      if (!modoExemplo) await atualizarBimestre(editando.id, dados);
      setBimestres((lista) => lista.map((b) => (b.id === editando.id ? { ...b, ...dados } : b)));
      setAviso(`Datas do ${editando.numero}º bimestre atualizadas.`);
      setEditando(null);
    } catch (e) {
      setErroModal(mensagemDoErro(e, 'Não foi possível salvar as datas. Tente novamente.'));
    } finally {
      setEnviando(false);
    }
  }

  const agora = agoraLocal();
  const ordenados = [...bimestres].sort((a, b) => a.numero - b.numero);
  const atual = ordenados.find((b) => situacaoDe(b, agora).chave === 'aberto');

  function renderizarConteudo() {
    if (carregando) return <EstadoCarregando mensagem="Carregando bimestres..." />;
    if (erro) {
      return (
        <EstadoErro
          titulo="Não foi possível carregar os bimestres"
          mensagem={erro}
          onTentarNovamente={tentarNovamente}
          onUsarExemplo={usarDadosExemplo}
        />
      );
    }
    if (ordenados.length === 0) {
      return (
        <p className="alunos-admin__vazio">
          Os bimestres de {anoLetivo} ainda não foram criados no sistema.
        </p>
      );
    }

    return (
      <>
        {/* Destaque do bimestre aberto agora (como no Figma) */}
        {atual ? (
          <div className="bimestres-admin__destaque">
            <CalendarDays size={22} aria-hidden="true" />
            <div>
              <strong>{atual.numero}º bimestre aberto para digitação</strong>
              <span>
                {formatarDataHora(atual.dataAbertura)} até {formatarDataHora(atual.dataEncerramento)} · faltam {diasAte(atual.dataEncerramento)} dias
              </span>
            </div>
          </div>
        ) : (
          <div className="bimestres-admin__destaque bimestres-admin__destaque--neutro">
            <CalendarDays size={22} aria-hidden="true" />
            <div>
              <strong>Nenhum bimestre aberto agora</strong>
              <span>Os professores só conseguem lançar acompanhamentos dentro de um período aberto.</span>
            </div>
          </div>
        )}

        <ul className="bimestres-admin__grade">
          {ordenados.map((b) => {
            const situacao = situacaoDe(b, agora);
            return (
              <li key={b.id} className={`bimestres-admin__card bimestres-admin__card--${situacao.chave}`}>
                <div className="bimestres-admin__card-topo">
                  <h2>{b.numero}º bimestre</h2>
                  <span className={`bimestres-admin__pilula bimestres-admin__pilula--${situacao.chave}`}>
                    {situacao.rotulo}
                  </span>
                </div>

                <dl className="bimestres-admin__datas">
                  <div>
                    <dt>Abertura</dt>
                    <dd>{formatarDataHora(b.dataAbertura)}</dd>
                  </div>
                  <div>
                    <dt>Encerramento</dt>
                    <dd>{formatarDataHora(b.dataEncerramento)}</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  className="alunos-admin__botao alunos-admin__botao--secundario bimestres-admin__botao-editar"
                  onClick={() => abrirEdicao(b)}
                >
                  <Pencil size={14} aria-hidden="true" />
                  Editar datas
                </button>
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  return (
    <div className="alunos-admin">
      <SidebarAdmin />

      <main className="alunos-admin__conteudo">
        <header className="alunos-admin__topo">
          <div>
            <h1>Períodos bimestrais</h1>
            <p>Defina quando cada bimestre abre e encerra para os professores lançarem os acompanhamentos.</p>
          </div>

          <label className="alunos-admin__filtro">
            <span>Ano letivo</span>
            <select value={anoLetivo} onChange={trocarAno} className="alunos-admin__select">
              {OPCOES_ANO.map((ano) => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
          </label>
        </header>

        {aviso && <p className="alunos-admin__aviso" role="status">{aviso}</p>}

        {modoExemplo && (
          <p className="alunos-admin__aviso-exemplo" role="note">
            Dados de exemplo: as datas que você alterar aqui não vão para a API.
          </p>
        )}

        {renderizarConteudo()}
      </main>

      {/* Janela de edição das datas */}
      {editando && (
        <div className="alunos-admin__overlay" onClick={fecharModal}>
          <form
            className="alunos-admin__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-bimestre"
            onClick={(e) => e.stopPropagation()}
            onSubmit={salvar}
            noValidate
          >
            <h2 id="titulo-modal-bimestre">{editando.numero}º bimestre de {anoLetivo}</h2>

            <div className="alunos-admin__campos">
              <CampoFormulario
                label="Abertura"
                id="dataAbertura"
                type="datetime-local"
                value={dados.dataAbertura}
                onChange={handleChange}
                erro={erros.dataAbertura}
              />
              <CampoFormulario
                label="Encerramento"
                id="dataEncerramento"
                type="datetime-local"
                value={dados.dataEncerramento}
                onChange={handleChange}
                erro={erros.dataEncerramento}
              />
            </div>

            {erroModal && <p className="alunos-admin__erro-modal" role="alert">{erroModal}</p>}

            <div className="alunos-admin__acoes-modal">
              <button type="button" className="alunos-admin__botao alunos-admin__botao--secundario" onClick={fecharModal} disabled={enviando}>
                Cancelar
              </button>
              <button type="submit" className="alunos-admin__botao alunos-admin__botao--primario" disabled={enviando}>
                {enviando ? 'Salvando...' : 'Salvar datas'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default BimestresAdmin;