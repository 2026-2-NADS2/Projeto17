import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';
import EstadoCarregando from '../../components/EstadoCarregando/EstadoCarregando';
import EstadoErro from '../../components/EstadoErro/EstadoErro';
import { listarVinculos, criarVinculo, excluirVinculo } from '../../services/vinculoService';
import { listarTurmas } from '../../services/turmaService';
import { listarDisciplinas } from '../../services/disciplinaService';
import { listarUsuarios } from '../../services/usuarioService';
import { exportarCsv } from '../../utils/exportarCsv';
import { vinculosExemplo } from './dadosExemplo';
import { turmasExemplo } from '../TurmasAdmin/dadosExemplo';
import { disciplinasExemplo } from '../DisciplinasAdmin/dadosExemplo';
import { usuariosExemplo } from '../UsuariosAdmin/dadosExemplo';
import '../AlunosAdmin/AlunosAdmin.css';

function mensagemDoErro(e, padrao) {
  return e.response?.data?.erro ?? e.response?.data?.mensagem ?? padrao;
}

// Acha o nome pelo id numa lista (ou usa o nome que a API já mandou pronto)
function nomePeloId(lista, id, valorPronto) {
  if (valorPronto && typeof valorPronto === 'object') return valorPronto.nome;
  if (valorPronto) return valorPronto;
  return lista.find((item) => String(item.id) === String(id))?.nome ?? '—';
}

const vinculoVazio = { idTurma: '', idDisciplina: '', idProfessor: '' };

function VinculosAdmin() {
  const [vinculos, setVinculos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modoExemplo, setModoExemplo] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [filtroTurma, setFiltroTurma] = useState('');
  const [aviso, setAviso] = useState(null);

  // Janela: null · { tipo: 'novo' } · { tipo: 'excluir', vinculo }
  const [modal, setModal] = useState(null);
  const [dados, setDados] = useState(vinculoVazio);
  const [erros, setErros] = useState({});
  const [erroModal, setErroModal] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Busca as 4 listas ao mesmo tempo
  useEffect(() => {
    if (modoExemplo) return;

    let ativo = true;

    async function buscar() {
      try {
        const [listaVinculos, listaTurmas, listaDisciplinas, listaProfessores] = await Promise.all([
          listarVinculos(),
          listarTurmas(),
          listarDisciplinas(),
          listarUsuarios({ perfil: 'PROFESSOR' }),
        ]);
        if (!ativo) return;
        setVinculos(listaVinculos);
        setTurmas(listaTurmas);
        setDisciplinas(listaDisciplinas);
        setProfessores(listaProfessores);
      } catch (e) {
        if (ativo) setErro(mensagemDoErro(e, 'Não foi possível carregar os vínculos.'));
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    buscar();
    return () => { ativo = false; };
  }, [tentativa, modoExemplo]);

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
    setVinculos(vinculosExemplo);
    setTurmas(turmasExemplo);
    setDisciplinas(disciplinasExemplo);
    setProfessores(usuariosExemplo.filter((u) => u.perfil === 'PROFESSOR'));
    setErro(null);
    setModoExemplo(true);
  }

  const nomeTurma = (v) => nomePeloId(turmas, v.idTurma, v.turma);
  const nomeDisciplina = (v) => nomePeloId(disciplinas, v.idDisciplina, v.disciplina);
  const nomeProfessor = (v) => nomePeloId(professores, v.idProfessor, v.professor);

  function abrirNovo() {
    setDados({ ...vinculoVazio, idTurma: filtroTurma });
    setErros({});
    setErroModal(null);
    setModal({ tipo: 'novo' });
  }

  function abrirExcluir(vinculo) {
    setErroModal(null);
    setModal({ tipo: 'excluir', vinculo });
  }

  function fecharModal() {
    if (!enviando) setModal(null);
  }

  function handleChange(evento) {
    const { name, value } = evento.target;
    setDados((anterior) => ({ ...anterior, [name]: value }));
    if (erros[name]) setErros((anterior) => ({ ...anterior, [name]: '' }));
    setErroModal(null);
  }

  async function salvar(evento) {
    evento.preventDefault();

    const novosErros = {};
    if (!dados.idTurma) novosErros.idTurma = 'Escolha a turma.';
    if (!dados.idDisciplina) novosErros.idDisciplina = 'Escolha a disciplina.';
    if (!dados.idProfessor) novosErros.idProfessor = 'Escolha o professor.';
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    const corpo = {
      idTurma: Number(dados.idTurma),
      idDisciplina: Number(dados.idDisciplina),
      idProfessor: Number(dados.idProfessor),
    };

    // RF03: a mesma disciplina não pode ter dois vínculos na mesma turma
    const repetido = vinculos.some(
      (v) => Number(v.idTurma) === corpo.idTurma && Number(v.idDisciplina) === corpo.idDisciplina
    );
    if (repetido) {
      setErroModal('Essa disciplina já tem um professor vinculado nessa turma. Exclua o vínculo atual antes.');
      return;
    }

    setEnviando(true);
    setErroModal(null);

    try {
      if (modoExemplo) {
        setVinculos((lista) => [...lista, { id: Date.now(), ...corpo }]);
      } else {
        await criarVinculo(corpo);
        setTentativa((t) => t + 1);
      }
      setAviso('Vínculo criado.');
      setModal(null);
    } catch (e) {
      setErroModal(mensagemDoErro(e, 'Não foi possível criar o vínculo. Tente novamente.'));
    } finally {
      setEnviando(false);
    }
  }

  async function confirmarExclusao() {
    const vinculo = modal.vinculo;
    setEnviando(true);
    setErroModal(null);

    try {
      if (!modoExemplo) await excluirVinculo(vinculo.id);
      setVinculos((lista) => lista.filter((v) => v.id !== vinculo.id));
      setAviso('Vínculo excluído.');
      setModal(null);
    } catch (e) {
      setErroModal(mensagemDoErro(e, 'Não foi possível excluir. Tente novamente.'));
    } finally {
      setEnviando(false);
    }
  }

  const visiveis = vinculos
    .filter((v) => !filtroTurma || String(v.idTurma) === filtroTurma)
    .sort((a, b) => nomeTurma(a).localeCompare(nomeTurma(b), 'pt-BR', { numeric: true }));

  function exportar() {
    const hoje = new Date().toLocaleDateString('sv-SE');
    exportarCsv(
      `vinculos-${hoje}.csv`,
      [
        { titulo: 'Turma', valor: nomeTurma },
        { titulo: 'Disciplina', valor: nomeDisciplina },
        { titulo: 'Professor', valor: nomeProfessor },
      ],
      visiveis
    );
  }

  const faltaCadastro = turmas.length === 0 || disciplinas.length === 0 || professores.length === 0;

  function renderizarConteudo() {
    if (carregando) return <EstadoCarregando mensagem="Carregando vínculos..." />;
    if (erro) {
      return (
        <EstadoErro
          titulo="Não foi possível carregar os vínculos"
          mensagem={erro}
          onTentarNovamente={tentarNovamente}
          onUsarExemplo={usarDadosExemplo}
        />
      );
    }
    if (faltaCadastro) {
      return (
        <p className="alunos-admin__vazio">
          Para criar vínculos, cadastre antes pelo menos uma turma, uma disciplina e um professor.
        </p>
      );
    }
    if (visiveis.length === 0) {
      return <p className="alunos-admin__vazio">Nenhum vínculo {filtroTurma ? 'nessa turma' : 'cadastrado'} ainda.</p>;
    }

    return (
      <div className="alunos-admin__tabela-caixa">
        <table className="alunos-admin__tabela">
          <thead>
            <tr>
              <th>Turma</th>
              <th>Disciplina</th>
              <th>Professor</th>
              <th><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((v) => (
              <tr key={v.id}>
                <td className="alunos-admin__nome">{nomeTurma(v)}</td>
                <td>{nomeDisciplina(v)}</td>
                <td>{nomeProfessor(v)}</td>
                <td className="alunos-admin__acoes">
                  <button
                    type="button"
                    className="alunos-admin__icone-botao alunos-admin__icone-botao--perigo"
                    onClick={() => abrirExcluir(v)}
                    aria-label={`Excluir vínculo de ${nomeDisciplina(v)} na turma ${nomeTurma(v)}`}
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

  const prontoParaUsar = !carregando && !erro && !faltaCadastro;

  // Select reaproveitado nos 3 campos da janela
  function campoSelect(id, rotulo, opcoes) {
    return (
      <div className="campo-formulario">
        <label htmlFor={id} className="campo-label">{rotulo}</label>
        <select
          id={id}
          name={id}
          value={dados[id]}
          onChange={handleChange}
          className={`campo-input ${erros[id] ? 'campo-input--erro' : ''}`}
          aria-invalid={erros[id] ? 'true' : 'false'}
          aria-describedby={erros[id] ? `${id}-erro` : undefined}
        >
          <option value="">Selecione...</option>
          {opcoes.map((op) => (
            <option key={op.id} value={String(op.id)}>{op.nome}</option>
          ))}
        </select>
        {erros[id] && <span id={`${id}-erro`} className="campo-erro">{erros[id]}</span>}
      </div>
    );
  }

  return (
    <div className="alunos-admin">
      <SidebarAdmin />

      <main className="alunos-admin__conteudo">
        <header className="alunos-admin__topo">
          <div>
            <h1>Vínculos acadêmicos</h1>
            <p>Qual professor dá qual disciplina em cada turma.</p>
          </div>

          {prontoParaUsar && (
            <div className="alunos-admin__botoes-topo">
              {visiveis.length > 0 && (
                <button type="button" className="alunos-admin__botao alunos-admin__botao--secundario" onClick={exportar}>
                  Exportar
                </button>
              )}
              <button type="button" className="alunos-admin__botao alunos-admin__botao--primario" onClick={abrirNovo}>
                + Novo vínculo
              </button>
            </div>
          )}
        </header>

        {aviso && <p className="alunos-admin__aviso" role="status">{aviso}</p>}

        {modoExemplo && (
          <p className="alunos-admin__aviso-exemplo" role="note">
            Dados de exemplo: o que você criar ou excluir aqui não vai para a API.
          </p>
        )}

        {prontoParaUsar && (
          <div className="alunos-admin__filtros">
            <label className="alunos-admin__filtro">
              <span>Turma</span>
              <select
                value={filtroTurma}
                onChange={(e) => setFiltroTurma(e.target.value)}
                className="alunos-admin__select"
              >
                <option value="">Todas</option>
                {turmas.map((t) => (
                  <option key={t.id} value={String(t.id)}>{t.nome}</option>
                ))}
              </select>
            </label>
          </div>
        )}

        {renderizarConteudo()}
      </main>

      {/* Janela de novo vínculo */}
      {modal?.tipo === 'novo' && (
        <div className="alunos-admin__overlay" onClick={fecharModal}>
          <form
            className="alunos-admin__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-vinculo"
            onClick={(e) => e.stopPropagation()}
            onSubmit={salvar}
            noValidate
          >
            <h2 id="titulo-modal-vinculo">Novo vínculo</h2>

            <div className="alunos-admin__campos">
              {campoSelect('idTurma', 'Turma', turmas)}
              {campoSelect('idDisciplina', 'Disciplina', disciplinas)}
              {campoSelect('idProfessor', 'Professor', professores)}
            </div>

            {erroModal && <p className="alunos-admin__erro-modal" role="alert">{erroModal}</p>}

            <div className="alunos-admin__acoes-modal">
              <button type="button" className="alunos-admin__botao alunos-admin__botao--secundario" onClick={fecharModal} disabled={enviando}>
                Cancelar
              </button>
              <button type="submit" className="alunos-admin__botao alunos-admin__botao--primario" disabled={enviando}>
                {enviando ? 'Salvando...' : 'Criar vínculo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmação de exclusão */}
      {modal?.tipo === 'excluir' && (
        <div className="alunos-admin__overlay" onClick={fecharModal}>
          <div
            className="alunos-admin__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-excluir-vinculo"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="titulo-modal-excluir-vinculo">Excluir este vínculo?</h2>
            <p className="alunos-admin__texto-modal">
              {nomeProfessor(modal.vinculo)} deixará de dar {nomeDisciplina(modal.vinculo)} na turma {nomeTurma(modal.vinculo)}.
              Os acompanhamentos já lançados continuam salvos.
            </p>

            {erroModal && <p className="alunos-admin__erro-modal" role="alert">{erroModal}</p>}

            <div className="alunos-admin__acoes-modal">
              <button type="button" className="alunos-admin__botao alunos-admin__botao--secundario" onClick={fecharModal} disabled={enviando}>
                Cancelar
              </button>
              <button type="button" className="alunos-admin__botao alunos-admin__botao--perigo" onClick={confirmarExclusao} disabled={enviando}>
                {enviando ? 'Excluindo...' : 'Excluir vínculo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VinculosAdmin;