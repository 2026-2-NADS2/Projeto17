import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';
import EstadoCarregando from '../../components/EstadoCarregando/EstadoCarregando';
import EstadoErro from '../../components/EstadoErro/EstadoErro';
import CampoFormulario from '../../components/CampoFormulario/CampoFormulario';
import { listarTurmas, criarTurma, atualizarTurma, excluirTurma } from '../../services/turmaService';
import { exportarCsv } from '../../utils/exportarCsv';
import { turmasExemplo } from './dadosExemplo';
// Mesmo visual da tela de Alunos (cards, tabela, botões e janelas)
import '../AlunosAdmin/AlunosAdmin.css';

const TURNOS = [
  { valor: 'MANHA', rotulo: 'Manhã' },
  { valor: 'TARDE', rotulo: 'Tarde' },
  { valor: 'NOITE', rotulo: 'Noite' },
];

const NOMES_TURNO = Object.fromEntries(TURNOS.map((t) => [t.valor, t.rotulo]));

function idDe(turma) {
  return turma.id ?? turma.idTurma;
}

function mensagemDoErro(e, padrao) {
  return e.response?.data?.erro ?? e.response?.data?.mensagem ?? padrao;
}

const anoAtual = new Date().getFullYear();
const formularioVazio = { nome: '', serie: '', turno: '', anoLetivo: String(anoAtual) };

// Função pura: devolve só os campos com erro
function validar(dados) {
  const erros = {};

  if (!dados.nome.trim()) erros.nome = 'Informe o nome da turma (ex: 6º A).';
  if (!dados.serie.trim()) erros.serie = 'Informe a série (ex: 6º ano).';
  if (!dados.turno) erros.turno = 'Escolha o turno.';

  if (!dados.anoLetivo) {
    erros.anoLetivo = 'Informe o ano letivo.';
  } else if (!/^\d{4}$/.test(dados.anoLetivo) || Number(dados.anoLetivo) < 2000) {
    erros.anoLetivo = 'Digite um ano válido (ex: 2026).';
  }

  return erros;
}

function TurmasAdmin() {
  // Lista
  const [turmas, setTurmas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modoExemplo, setModoExemplo] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [busca, setBusca] = useState('');
  const [aviso, setAviso] = useState(null);

  // Janela: null · { tipo: 'form', turma } (turma null = nova) · { tipo: 'excluir', turma }
  const [modal, setModal] = useState(null);
  const [dados, setDados] = useState(formularioVazio);
  const [erros, setErros] = useState({});
  const [erroModal, setErroModal] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (modoExemplo) return;

    let ativo = true;

    async function buscar() {
      try {
        const lista = await listarTurmas();
        if (ativo) setTurmas(lista);
      } catch (e) {
        if (ativo) setErro(mensagemDoErro(e, 'Não foi possível carregar as turmas.'));
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    buscar();
    return () => { ativo = false; };
  }, [tentativa, modoExemplo]);

  // Tecla Esc fecha a janela
  useEffect(() => {
    if (!modal) return;

    function aoTeclar(e) {
      if (e.key === 'Escape' && !enviando) setModal(null);
    }

    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [modal, enviando]);

  function tentarNovamente() {
    setCarregando(true);
    setErro(null);
    setModoExemplo(false);
    setTentativa((t) => t + 1);
  }

  function usarDadosExemplo() {
    setTurmas(turmasExemplo);
    setErro(null);
    setModoExemplo(true);
  }

  function abrirNova() {
    setDados(formularioVazio);
    setErros({});
    setErroModal(null);
    setModal({ tipo: 'form', turma: null });
  }

  function abrirEditar(turma) {
    setDados({
      nome: turma.nome ?? '',
      serie: turma.serie ?? '',
      turno: turma.turno ?? '',
      anoLetivo: turma.anoLetivo ? String(turma.anoLetivo) : String(anoAtual),
    });
    setErros({});
    setErroModal(null);
    setModal({ tipo: 'form', turma });
  }

  function abrirExcluir(turma) {
    setErroModal(null);
    setModal({ tipo: 'excluir', turma });
  }

  function fecharModal() {
    if (!enviando) setModal(null);
  }

  function handleChange(evento) {
    const { name, value } = evento.target;
    setDados((anterior) => ({ ...anterior, [name]: value }));
    if (erros[name]) setErros((anterior) => ({ ...anterior, [name]: '' }));
  }

  async function salvar(evento) {
    evento.preventDefault();

    const errosEncontrados = validar(dados);
    setErros(errosEncontrados);
    if (Object.keys(errosEncontrados).length > 0) return;

    const editando = modal.turma;
    const corpo = {
      nome: dados.nome.trim(),
      serie: dados.serie.trim(),
      turno: dados.turno,
      anoLetivo: Number(dados.anoLetivo),
    };

    setEnviando(true);
    setErroModal(null);

    try {
      if (modoExemplo) {
        if (editando) {
          setTurmas((lista) => lista.map((t) => (idDe(t) === idDe(editando) ? { ...t, ...corpo } : t)));
        } else {
          setTurmas((lista) => [{ id: Date.now(), ...corpo }, ...lista]);
        }
      } else {
        if (editando) await atualizarTurma(idDe(editando), corpo);
        else await criarTurma(corpo);
        setTentativa((t) => t + 1);
      }

      setAviso(editando ? `Turma ${corpo.nome} atualizada.` : `Turma ${corpo.nome} cadastrada.`);
      setModal(null);
    } catch (e) {
      setErroModal(mensagemDoErro(e, 'Não foi possível salvar. Tente novamente.'));
    } finally {
      setEnviando(false);
    }
  }

  async function confirmarExclusao() {
    const turma = modal.turma;
    setEnviando(true);
    setErroModal(null);

    try {
      if (!modoExemplo) await excluirTurma(idDe(turma));
      setTurmas((lista) => lista.filter((t) => idDe(t) !== idDe(turma)));
      setAviso(`Turma ${turma.nome} excluída.`);
      setModal(null);
    } catch (e) {
      setErroModal(mensagemDoErro(e, 'Não foi possível excluir. Tente novamente.'));
    } finally {
      setEnviando(false);
    }
  }

  const termo = busca.trim().toLowerCase();
  const visiveis = termo
    ? turmas.filter((t) => `${t.nome} ${t.serie}`.toLowerCase().includes(termo))
    : turmas;

  function exportar() {
    const hoje = new Date().toLocaleDateString('sv-SE');
    exportarCsv(
      `turmas-${hoje}.csv`,
      [
        { titulo: 'ID', valor: (t) => idDe(t) },
        { titulo: 'Turma', valor: (t) => t.nome },
        { titulo: 'Série', valor: (t) => t.serie },
        { titulo: 'Turno', valor: (t) => NOMES_TURNO[t.turno] ?? t.turno },
        { titulo: 'Ano letivo', valor: (t) => t.anoLetivo },
      ],
      visiveis
    );
  }

  function renderizarConteudo() {
    if (carregando) return <EstadoCarregando mensagem="Carregando turmas..." />;
    if (erro) {
      return (
        <EstadoErro
          titulo="Não foi possível carregar as turmas"
          mensagem={erro}
          onTentarNovamente={tentarNovamente}
          onUsarExemplo={usarDadosExemplo}
        />
      );
    }
    if (turmas.length === 0) {
      return <p className="alunos-admin__vazio">Nenhuma turma cadastrada ainda. Clique em "Nova turma" para começar.</p>;
    }
    if (visiveis.length === 0) {
      return <p className="alunos-admin__vazio">Nenhuma turma encontrada com essa busca.</p>;
    }

    return (
      <div className="alunos-admin__tabela-caixa">
        <table className="alunos-admin__tabela">
          <thead>
            <tr>
              <th>Turma</th>
              <th>Série</th>
              <th>Turno</th>
              <th>Ano letivo</th>
              <th><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((turma) => (
              <tr key={idDe(turma)}>
                <td className="alunos-admin__nome">{turma.nome}</td>
                <td>{turma.serie}</td>
                <td>{NOMES_TURNO[turma.turno] ?? turma.turno ?? '—'}</td>
                <td>{turma.anoLetivo ?? '—'}</td>
                <td className="alunos-admin__acoes">
                  <button
                    type="button"
                    className="alunos-admin__icone-botao"
                    onClick={() => abrirEditar(turma)}
                    aria-label={`Editar turma ${turma.nome}`}
                    title="Editar"
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="alunos-admin__icone-botao alunos-admin__icone-botao--perigo"
                    onClick={() => abrirExcluir(turma)}
                    aria-label={`Excluir turma ${turma.nome}`}
                    title="Excluir"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const prontoParaUsar = !carregando && !erro;

  return (
    <div className="alunos-admin">
      <SidebarAdmin />

      <main className="alunos-admin__conteudo">
        <header className="alunos-admin__topo">
          <div>
            <h1>Turmas</h1>
            <p>
              {prontoParaUsar
                ? `${turmas.length} turma${turmas.length === 1 ? '' : 's'} cadastrada${turmas.length === 1 ? '' : 's'}.`
                : 'Turmas da escola por série, turno e ano letivo.'}
            </p>
          </div>

          {prontoParaUsar && (
            <div className="alunos-admin__botoes-topo">
              {visiveis.length > 0 && (
                <button type="button" className="alunos-admin__botao alunos-admin__botao--secundario" onClick={exportar}>
                  Exportar
                </button>
              )}
              <button type="button" className="alunos-admin__botao alunos-admin__botao--primario" onClick={abrirNova}>
                + Nova turma
              </button>
            </div>
          )}
        </header>

        {aviso && <p className="alunos-admin__aviso" role="status">{aviso}</p>}

        {modoExemplo && (
          <p className="alunos-admin__aviso-exemplo" role="note">
            Dados de exemplo: o que você cadastrar, editar ou excluir aqui não vai para a API.
          </p>
        )}

        {prontoParaUsar && turmas.length > 0 && (
          <div className="alunos-admin__filtros">
            <label className="alunos-admin__filtro">
              <span>Buscar</span>
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Turma ou série"
              />
            </label>
          </div>
        )}

        {renderizarConteudo()}
      </main>

      {/* Janela de cadastro / edição */}
      {modal?.tipo === 'form' && (
        <div className="alunos-admin__overlay" onClick={fecharModal}>
          <form
            className="alunos-admin__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-turma"
            onClick={(e) => e.stopPropagation()}
            onSubmit={salvar}
            noValidate
          >
            <h2 id="titulo-modal-turma">{modal.turma ? 'Editar turma' : 'Nova turma'}</h2>

            <div className="alunos-admin__campos">
              <CampoFormulario
                label="Nome da turma"
                id="nome"
                value={dados.nome}
                onChange={handleChange}
                erro={erros.nome}
                placeholder="6º A"
                autoComplete="off"
              />
              <CampoFormulario
                label="Série"
                id="serie"
                value={dados.serie}
                onChange={handleChange}
                erro={erros.serie}
                placeholder="6º ano"
                autoComplete="off"
              />

              {/* O CampoFormulario só faz <input>; aqui é um <select> com as mesmas classes */}
              <div className="campo-formulario">
                <label htmlFor="turno" className="campo-label">Turno</label>
                <select
                  id="turno"
                  name="turno"
                  value={dados.turno}
                  onChange={handleChange}
                  className={`campo-input ${erros.turno ? 'campo-input--erro' : ''}`}
                  aria-invalid={erros.turno ? 'true' : 'false'}
                  aria-describedby={erros.turno ? 'turno-erro' : undefined}
                >
                  <option value="">Selecione...</option>
                  {TURNOS.map((t) => (
                    <option key={t.valor} value={t.valor}>{t.rotulo}</option>
                  ))}
                </select>
                {erros.turno && <span id="turno-erro" className="campo-erro">{erros.turno}</span>}
              </div>

              <CampoFormulario
                label="Ano letivo"
                id="anoLetivo"
                type="number"
                value={dados.anoLetivo}
                onChange={handleChange}
                erro={erros.anoLetivo}
                placeholder={String(anoAtual)}
              />
            </div>

            {erroModal && <p className="alunos-admin__erro-modal" role="alert">{erroModal}</p>}

            <div className="alunos-admin__acoes-modal">
              <button
                type="button"
                className="alunos-admin__botao alunos-admin__botao--secundario"
                onClick={fecharModal}
                disabled={enviando}
              >
                Cancelar
              </button>
              <button type="submit" className="alunos-admin__botao alunos-admin__botao--primario" disabled={enviando}>
                {enviando ? 'Salvando...' : modal.turma ? 'Salvar alterações' : 'Cadastrar turma'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Janela de confirmação de exclusão */}
      {modal?.tipo === 'excluir' && (
        <div className="alunos-admin__overlay" onClick={fecharModal}>
          <div
            className="alunos-admin__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-excluir-turma"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="titulo-modal-excluir-turma">Excluir a turma {modal.turma.nome}?</h2>
            <p className="alunos-admin__texto-modal">
              Essa ação não pode ser desfeita. Se a turma tiver alunos ou vínculos, o sistema pode impedir a exclusão.
            </p>

            {erroModal && <p className="alunos-admin__erro-modal" role="alert">{erroModal}</p>}

            <div className="alunos-admin__acoes-modal">
              <button
                type="button"
                className="alunos-admin__botao alunos-admin__botao--secundario"
                onClick={fecharModal}
                disabled={enviando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="alunos-admin__botao alunos-admin__botao--perigo"
                onClick={confirmarExclusao}
                disabled={enviando}
              >
                {enviando ? 'Excluindo...' : 'Excluir turma'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TurmasAdmin;