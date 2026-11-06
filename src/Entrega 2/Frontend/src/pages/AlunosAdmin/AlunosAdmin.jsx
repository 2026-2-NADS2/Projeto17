import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';
import EstadoCarregando from '../../components/EstadoCarregando/EstadoCarregando';
import EstadoErro from '../../components/EstadoErro/EstadoErro';
import CampoFormulario from '../../components/CampoFormulario/CampoFormulario';
import { listarAlunos, criarAluno, atualizarAluno, excluirAluno } from '../../services/alunoService';
import { exportarCsv } from '../../utils/exportarCsv';
import { alunosExemplo } from './dadosExemplo';
import './AlunosAdmin.css';

// A API pode mandar "idAluno" (formato antigo) ou "id"
function idDe(aluno) {
  return aluno.idAluno ?? aluno.id;
}

// Aceita turma como objeto { nome }, como texto, ou só o idTurma
function turmaDe(aluno) {
  if (aluno.turma && typeof aluno.turma === 'object') return aluno.turma.nome;
  if (aluno.turma) return aluno.turma;
  if (aluno.idTurma) return `Turma ${aluno.idTurma}`;
  return '—';
}

// "2014-03-14" → "14/03/2014" (sem usar Date, pra o fuso não mudar o dia)
function formatarData(valor) {
  if (!valor) return '—';
  const [ano, mes, dia] = String(valor).slice(0, 10).split('-');
  if (!dia) return valor;
  return `${dia}/${mes}/${ano}`;
}

function mensagemDoErro(e, padrao) {
  return e.response?.data?.erro ?? e.response?.data?.mensagem ?? padrao;
}

const formularioVazio = { nome: '', dataNascimento: '', idTurma: '' };

// Função pura: devolve só os campos com erro
function validar(dados) {
  const erros = {};
  const hoje = new Date().toLocaleDateString('sv-SE'); // "2026-11-05"

  if (!dados.nome.trim()) {
    erros.nome = 'Informe o nome do aluno.';
  } else if (dados.nome.trim().length < 3) {
    erros.nome = 'O nome precisa ter pelo menos 3 letras.';
  }

  if (!dados.dataNascimento) {
    erros.dataNascimento = 'Informe a data de nascimento.';
  } else if (dados.dataNascimento > hoje) {
    erros.dataNascimento = 'A data de nascimento não pode ser no futuro.';
  }

  if (!dados.idTurma) {
    erros.idTurma = 'Informe o código da turma.';
  } else if (!/^\d+$/.test(dados.idTurma)) {
    erros.idTurma = 'O código da turma é um número.';
  }

  return erros;
}

function AlunosAdmin() {
  // Lista
  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modoExemplo, setModoExemplo] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [busca, setBusca] = useState('');
  const [aviso, setAviso] = useState(null);

  // Janela: null (fechada) · { tipo: 'form', aluno } (aluno null = novo) · { tipo: 'excluir', aluno }
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
        const lista = await listarAlunos();
        if (ativo) setAlunos(lista);
      } catch (e) {
        if (ativo) setErro(mensagemDoErro(e, 'Não foi possível carregar os alunos.'));
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    buscar();
    return () => { ativo = false; };
  }, [tentativa, modoExemplo]);

  // Tecla Esc fecha a janela (se não estiver enviando)
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
    setAlunos(alunosExemplo);
    setErro(null);
    setModoExemplo(true);
  }

  // ---- Abrir / fechar janelas ----
  function abrirNovo() {
    setDados(formularioVazio);
    setErros({});
    setErroModal(null);
    setModal({ tipo: 'form', aluno: null });
  }

  function abrirEditar(aluno) {
    setDados({
      nome: aluno.nome ?? '',
      dataNascimento: String(aluno.dataNascimento ?? '').slice(0, 10),
      idTurma: aluno.idTurma ? String(aluno.idTurma) : '',
    });
    setErros({});
    setErroModal(null);
    setModal({ tipo: 'form', aluno });
  }

  function abrirExcluir(aluno) {
    setErroModal(null);
    setModal({ tipo: 'excluir', aluno });
  }

  function fecharModal() {
    if (!enviando) setModal(null);
  }

  function handleChange(evento) {
    const { name, value } = evento.target;
    setDados((anterior) => ({ ...anterior, [name]: value }));
    if (erros[name]) setErros((anterior) => ({ ...anterior, [name]: '' }));
  }

  // ---- Salvar (novo ou edição) ----
  async function salvar(evento) {
    evento.preventDefault();

    const errosEncontrados = validar(dados);
    setErros(errosEncontrados);
    if (Object.keys(errosEncontrados).length > 0) return;

    const editando = modal.aluno;
    const corpo = {
      nome: dados.nome.trim(),
      dataNascimento: dados.dataNascimento,
      idTurma: Number(dados.idTurma),
    };

    setEnviando(true);
    setErroModal(null);

    try {
      if (modoExemplo) {
        // Só simula na tela
        if (editando) {
          setAlunos((lista) => lista.map((a) => (idDe(a) === idDe(editando) ? { ...a, ...corpo } : a)));
        } else {
          setAlunos((lista) => [{ idAluno: Date.now(), ...corpo }, ...lista]);
        }
      } else {
        if (editando) await atualizarAluno(idDe(editando), corpo);
        else await criarAluno(corpo);
        setTentativa((t) => t + 1); // busca a lista atualizada na API
      }

      setAviso(editando ? `Dados de ${corpo.nome} atualizados.` : `${corpo.nome} foi cadastrado(a).`);
      setModal(null);
    } catch (e) {
      setErroModal(mensagemDoErro(e, 'Não foi possível salvar. Tente novamente.'));
    } finally {
      setEnviando(false);
    }
  }

  // ---- Excluir ----
  async function confirmarExclusao() {
    const aluno = modal.aluno;
    setEnviando(true);
    setErroModal(null);

    try {
      if (!modoExemplo) await excluirAluno(idDe(aluno));
      setAlunos((lista) => lista.filter((a) => idDe(a) !== idDe(aluno)));
      setAviso(`${aluno.nome} foi excluído(a).`);
      setModal(null);
    } catch (e) {
      setErroModal(mensagemDoErro(e, 'Não foi possível excluir. Tente novamente.'));
    } finally {
      setEnviando(false);
    }
  }

  // ---- Lista visível (busca por nome) ----
  const termo = busca.trim().toLowerCase();
  const visiveis = termo
    ? alunos.filter((a) => a.nome?.toLowerCase().includes(termo))
    : alunos;

  function exportar() {
    const hoje = new Date().toLocaleDateString('sv-SE');
    exportarCsv(
      `alunos-${hoje}.csv`,
      [
        { titulo: 'ID', valor: (a) => idDe(a) },
        { titulo: 'Aluno', valor: (a) => a.nome },
        { titulo: 'Data de nascimento', valor: (a) => formatarData(a.dataNascimento) },
        { titulo: 'Turma', valor: (a) => turmaDe(a) },
      ],
      visiveis
    );
  }

  function renderizarConteudo() {
    if (carregando) return <EstadoCarregando mensagem="Carregando alunos..." />;
    if (erro) {
      return (
        <EstadoErro
          titulo="Não foi possível carregar os alunos"
          mensagem={erro}
          onTentarNovamente={tentarNovamente}
          onUsarExemplo={usarDadosExemplo}
        />
      );
    }
    if (alunos.length === 0) {
      return <p className="alunos-admin__vazio">Nenhum aluno cadastrado ainda. Clique em "Novo aluno" para começar.</p>;
    }
    if (visiveis.length === 0) {
      return <p className="alunos-admin__vazio">Nenhum aluno encontrado com essa busca.</p>;
    }

    return (
      <div className="alunos-admin__tabela-caixa">
        <table className="alunos-admin__tabela">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Data de nascimento</th>
              <th>Turma</th>
              <th><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((aluno) => (
              <tr key={idDe(aluno)}>
                <td className="alunos-admin__nome">{aluno.nome}</td>
                <td>{formatarData(aluno.dataNascimento)}</td>
                <td>{turmaDe(aluno)}</td>
                <td className="alunos-admin__acoes">
                  <button
                    type="button"
                    className="alunos-admin__icone-botao"
                    onClick={() => abrirEditar(aluno)}
                    aria-label={`Editar ${aluno.nome}`}
                    title="Editar"
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="alunos-admin__icone-botao alunos-admin__icone-botao--perigo"
                    onClick={() => abrirExcluir(aluno)}
                    aria-label={`Excluir ${aluno.nome}`}
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
            <h1>Alunos</h1>
            <p>
              {prontoParaUsar
                ? `${alunos.length} aluno${alunos.length === 1 ? '' : 's'} cadastrado${alunos.length === 1 ? '' : 's'}.`
                : 'Alunos matriculados na escola.'}
            </p>
          </div>

          {prontoParaUsar && (
            <div className="alunos-admin__botoes-topo">
              {visiveis.length > 0 && (
                <button type="button" className="alunos-admin__botao alunos-admin__botao--secundario" onClick={exportar}>
                  Exportar
                </button>
              )}
              <button type="button" className="alunos-admin__botao alunos-admin__botao--primario" onClick={abrirNovo}>
                + Novo aluno
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

        {prontoParaUsar && alunos.length > 0 && (
          <div className="alunos-admin__filtros">
            <label className="alunos-admin__filtro">
              <span>Buscar</span>
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Nome do aluno"
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
            aria-labelledby="titulo-modal-aluno"
            onClick={(e) => e.stopPropagation()}
            onSubmit={salvar}
            noValidate
          >
            <h2 id="titulo-modal-aluno">{modal.aluno ? 'Editar aluno' : 'Novo aluno'}</h2>

            <div className="alunos-admin__campos">
              <CampoFormulario
                label="Nome completo"
                id="nome"
                value={dados.nome}
                onChange={handleChange}
                erro={erros.nome}
                placeholder="Ana Beatriz Costa"
                autoComplete="off"
              />
              <CampoFormulario
                label="Data de nascimento"
                id="dataNascimento"
                type="date"
                value={dados.dataNascimento}
                onChange={handleChange}
                erro={erros.dataNascimento}
              />
              <CampoFormulario
                label="Código da turma"
                id="idTurma"
                type="number"
                value={dados.idTurma}
                onChange={handleChange}
                erro={erros.idTurma}
                placeholder="1"
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
                {enviando ? 'Salvando...' : modal.aluno ? 'Salvar alterações' : 'Cadastrar aluno'}
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
            aria-labelledby="titulo-modal-excluir"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="titulo-modal-excluir">Excluir {modal.aluno.nome}?</h2>
            <p className="alunos-admin__texto-modal">
              Essa ação não pode ser desfeita. Se o aluno tiver acompanhamentos lançados, o sistema pode impedir a exclusão.
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
                {enviando ? 'Excluindo...' : 'Excluir aluno'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlunosAdmin;