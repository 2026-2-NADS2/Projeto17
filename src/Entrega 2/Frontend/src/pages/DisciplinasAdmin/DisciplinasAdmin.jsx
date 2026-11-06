import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';
import EstadoCarregando from '../../components/EstadoCarregando/EstadoCarregando';
import EstadoErro from '../../components/EstadoErro/EstadoErro';
import CampoFormulario from '../../components/CampoFormulario/CampoFormulario';
import {
  listarAreas,
  criarArea,
  listarDisciplinas,
  criarDisciplina,
  atualizarDisciplina,
  excluirDisciplina,
} from '../../services/disciplinaService';
import { exportarCsv } from '../../utils/exportarCsv';
import { areasExemplo, disciplinasExemplo } from './dadosExemplo';
// Mesmo visual da tela de Alunos (cards, tabela, botões e janelas)
import '../AlunosAdmin/AlunosAdmin.css';

function mensagemDoErro(e, padrao) {
  return e.response?.data?.erro ?? e.response?.data?.mensagem ?? padrao;
}

const disciplinaVazia = { nome: '', codigo: '', idArea: '' };

function validarDisciplina(dados) {
  const erros = {};

  if (!dados.nome.trim()) erros.nome = 'Informe o nome da disciplina.';

  if (!dados.codigo.trim()) {
    erros.codigo = 'Informe o código (ex: MAT).';
  } else if (!/^[A-Za-z0-9]{2,10}$/.test(dados.codigo.trim())) {
    erros.codigo = 'Use de 2 a 10 letras ou números, sem espaços.';
  }

  if (!dados.idArea) erros.idArea = 'Escolha a área.';

  return erros;
}

function DisciplinasAdmin() {
  const [areas, setAreas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modoExemplo, setModoExemplo] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [filtroArea, setFiltroArea] = useState('');
  const [busca, setBusca] = useState('');
  const [aviso, setAviso] = useState(null);

  // Janela: null · { tipo: 'disciplina', disciplina } · { tipo: 'area' } · { tipo: 'excluir', disciplina }
  const [modal, setModal] = useState(null);
  const [dados, setDados] = useState(disciplinaVazia);
  const [nomeArea, setNomeArea] = useState('');
  const [erros, setErros] = useState({});
  const [erroModal, setErroModal] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Busca áreas e disciplinas ao mesmo tempo
  useEffect(() => {
    if (modoExemplo) return;

    let ativo = true;

    async function buscar() {
      try {
        const [listaAreas, listaDisciplinas] = await Promise.all([listarAreas(), listarDisciplinas()]);
        if (!ativo) return;
        setAreas(listaAreas);
        setDisciplinas(listaDisciplinas);
      } catch (e) {
        if (ativo) setErro(mensagemDoErro(e, 'Não foi possível carregar áreas e disciplinas.'));
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
    setAreas(areasExemplo);
    setDisciplinas(disciplinasExemplo);
    setErro(null);
    setModoExemplo(true);
  }

  // Nome da área: aceita "area" vindo pronto da API ou procura pelo idArea
  function nomeDaArea(disciplina) {
    if (disciplina.area && typeof disciplina.area === 'object') return disciplina.area.nome;
    if (disciplina.area) return disciplina.area;
    return areas.find((a) => String(a.id) === String(disciplina.idArea))?.nome ?? '—';
  }

  // ---- Janelas ----
  function abrirNovaDisciplina() {
    setDados({ ...disciplinaVazia, idArea: filtroArea });
    setErros({});
    setErroModal(null);
    setModal({ tipo: 'disciplina', disciplina: null });
  }

  function abrirEditar(disciplina) {
    setDados({
      nome: disciplina.nome ?? '',
      codigo: disciplina.codigo ?? '',
      idArea: disciplina.idArea ? String(disciplina.idArea) : '',
    });
    setErros({});
    setErroModal(null);
    setModal({ tipo: 'disciplina', disciplina });
  }

  function abrirNovaArea() {
    setNomeArea('');
    setErros({});
    setErroModal(null);
    setModal({ tipo: 'area' });
  }

  function abrirExcluir(disciplina) {
    setErroModal(null);
    setModal({ tipo: 'excluir', disciplina });
  }

  function fecharModal() {
    if (!enviando) setModal(null);
  }

  function handleChange(evento) {
    const { name, value } = evento.target;
    setDados((anterior) => ({ ...anterior, [name]: value }));
    if (erros[name]) setErros((anterior) => ({ ...anterior, [name]: '' }));
  }

  // ---- Salvar disciplina ----
  async function salvarDisciplina(evento) {
    evento.preventDefault();

    const errosEncontrados = validarDisciplina(dados);
    setErros(errosEncontrados);
    if (Object.keys(errosEncontrados).length > 0) return;

    const editando = modal.disciplina;
    const corpo = {
      nome: dados.nome.trim(),
      codigo: dados.codigo.trim().toUpperCase(),
      idArea: Number(dados.idArea),
    };

    setEnviando(true);
    setErroModal(null);

    try {
      if (modoExemplo) {
        // Simula a regra do backend: código não pode repetir
        const repetido = disciplinas.some(
          (d) => d.codigo?.toUpperCase() === corpo.codigo && d.id !== editando?.id
        );
        if (repetido) {
          setErroModal(`Já existe uma disciplina com o código ${corpo.codigo}.`);
          return;
        }
        if (editando) {
          setDisciplinas((lista) => lista.map((d) => (d.id === editando.id ? { ...d, ...corpo } : d)));
        } else {
          setDisciplinas((lista) => [...lista, { id: Date.now(), ...corpo }]);
        }
      } else {
        if (editando) await atualizarDisciplina(editando.id, corpo);
        else await criarDisciplina(corpo);
        setTentativa((t) => t + 1);
      }

      setAviso(editando ? `Disciplina ${corpo.nome} atualizada.` : `Disciplina ${corpo.nome} cadastrada.`);
      setModal(null);
    } catch (e) {
      setErroModal(mensagemDoErro(e, 'Não foi possível salvar. Tente novamente.'));
    } finally {
      setEnviando(false);
    }
  }

  // ---- Salvar área ----
  async function salvarArea(evento) {
    evento.preventDefault();

    const nome = nomeArea.trim();
    if (!nome) {
      setErros({ nomeArea: 'Informe o nome da área.' });
      return;
    }

    setEnviando(true);
    setErroModal(null);

    try {
      if (modoExemplo) {
        setAreas((lista) => [...lista, { id: Date.now(), nome }]);
      } else {
        await criarArea({ nome });
        setTentativa((t) => t + 1);
      }
      setAviso(`Área ${nome} cadastrada.`);
      setModal(null);
    } catch (e) {
      setErroModal(mensagemDoErro(e, 'Não foi possível salvar a área. Tente novamente.'));
    } finally {
      setEnviando(false);
    }
  }

  // ---- Excluir disciplina ----
  async function confirmarExclusao() {
    const disciplina = modal.disciplina;
    setEnviando(true);
    setErroModal(null);

    try {
      if (!modoExemplo) await excluirDisciplina(disciplina.id);
      setDisciplinas((lista) => lista.filter((d) => d.id !== disciplina.id));
      setAviso(`Disciplina ${disciplina.nome} excluída.`);
      setModal(null);
    } catch (e) {
      setErroModal(mensagemDoErro(e, 'Não foi possível excluir. Tente novamente.'));
    } finally {
      setEnviando(false);
    }
  }

  // ---- Lista visível ----
  const termo = busca.trim().toLowerCase();
  const visiveis = disciplinas.filter((d) => {
    if (filtroArea && String(d.idArea) !== filtroArea) return false;
    if (!termo) return true;
    return `${d.nome} ${d.codigo}`.toLowerCase().includes(termo);
  });

  function exportar() {
    const hoje = new Date().toLocaleDateString('sv-SE');
    exportarCsv(
      `disciplinas-${hoje}.csv`,
      [
        { titulo: 'ID', valor: (d) => d.id },
        { titulo: 'Código', valor: (d) => d.codigo },
        { titulo: 'Disciplina', valor: (d) => d.nome },
        { titulo: 'Área', valor: (d) => nomeDaArea(d) },
      ],
      visiveis
    );
  }

  function renderizarConteudo() {
    if (carregando) return <EstadoCarregando mensagem="Carregando áreas e disciplinas..." />;
    if (erro) {
      return (
        <EstadoErro
          titulo="Não foi possível carregar áreas e disciplinas"
          mensagem={erro}
          onTentarNovamente={tentarNovamente}
          onUsarExemplo={usarDadosExemplo}
        />
      );
    }
    if (areas.length === 0) {
      return <p className="alunos-admin__vazio">Nenhuma área cadastrada ainda. Comece clicando em "Nova área".</p>;
    }
    if (disciplinas.length === 0) {
      return <p className="alunos-admin__vazio">Nenhuma disciplina cadastrada ainda. Clique em "Nova disciplina".</p>;
    }
    if (visiveis.length === 0) {
      return <p className="alunos-admin__vazio">Nenhuma disciplina encontrada com esses filtros.</p>;
    }

    return (
      <div className="alunos-admin__tabela-caixa">
        <table className="alunos-admin__tabela">
          <thead>
            <tr>
              <th>Código</th>
              <th>Disciplina</th>
              <th>Área</th>
              <th><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((d) => (
              <tr key={d.id}>
                <td>{d.codigo}</td>
                <td className="alunos-admin__nome">{d.nome}</td>
                <td>{nomeDaArea(d)}</td>
                <td className="alunos-admin__acoes">
                  <button
                    type="button"
                    className="alunos-admin__icone-botao"
                    onClick={() => abrirEditar(d)}
                    aria-label={`Editar ${d.nome}`}
                    title="Editar"
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="alunos-admin__icone-botao alunos-admin__icone-botao--perigo"
                    onClick={() => abrirExcluir(d)}
                    aria-label={`Excluir ${d.nome}`}
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
            <h1>Áreas e disciplinas</h1>
            <p>
              {prontoParaUsar
                ? `${areas.length} área${areas.length === 1 ? '' : 's'} · ${disciplinas.length} disciplina${disciplinas.length === 1 ? '' : 's'}.`
                : 'Disciplinas organizadas por área do conhecimento.'}
            </p>
          </div>

          {prontoParaUsar && (
            <div className="alunos-admin__botoes-topo">
              {visiveis.length > 0 && (
                <button type="button" className="alunos-admin__botao alunos-admin__botao--secundario" onClick={exportar}>
                  Exportar
                </button>
              )}
              <button type="button" className="alunos-admin__botao alunos-admin__botao--secundario" onClick={abrirNovaArea}>
                + Nova área
              </button>
              {areas.length > 0 && (
                <button type="button" className="alunos-admin__botao alunos-admin__botao--primario" onClick={abrirNovaDisciplina}>
                  + Nova disciplina
                </button>
              )}
            </div>
          )}
        </header>

        {aviso && <p className="alunos-admin__aviso" role="status">{aviso}</p>}

        {modoExemplo && (
          <p className="alunos-admin__aviso-exemplo" role="note">
            Dados de exemplo: o que você cadastrar, editar ou excluir aqui não vai para a API.
          </p>
        )}

        {prontoParaUsar && disciplinas.length > 0 && (
          <div className="alunos-admin__filtros" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <label className="alunos-admin__filtro">
              <span>Buscar</span>
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Nome ou código"
              />
            </label>
            <label className="alunos-admin__filtro">
              <span>Área</span>
              <select
                value={filtroArea}
                onChange={(e) => setFiltroArea(e.target.value)}
                className="alunos-admin__select"
              >
                <option value="">Todas</option>
                {areas.map((a) => (
                  <option key={a.id} value={String(a.id)}>{a.nome}</option>
                ))}
              </select>
            </label>
          </div>
        )}

        {renderizarConteudo()}
      </main>

      {/* Janela de disciplina (nova / editar) */}
      {modal?.tipo === 'disciplina' && (
        <div className="alunos-admin__overlay" onClick={fecharModal}>
          <form
            className="alunos-admin__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-disciplina"
            onClick={(e) => e.stopPropagation()}
            onSubmit={salvarDisciplina}
            noValidate
          >
            <h2 id="titulo-modal-disciplina">{modal.disciplina ? 'Editar disciplina' : 'Nova disciplina'}</h2>

            <div className="alunos-admin__campos">
              <CampoFormulario
                label="Nome da disciplina"
                id="nome"
                value={dados.nome}
                onChange={handleChange}
                erro={erros.nome}
                placeholder="Matemática"
                autoComplete="off"
              />
              <CampoFormulario
                label="Código"
                id="codigo"
                value={dados.codigo}
                onChange={handleChange}
                erro={erros.codigo}
                placeholder="MAT"
                autoComplete="off"
              />

              <div className="campo-formulario">
                <label htmlFor="idArea" className="campo-label">Área</label>
                <select
                  id="idArea"
                  name="idArea"
                  value={dados.idArea}
                  onChange={handleChange}
                  className={`campo-input ${erros.idArea ? 'campo-input--erro' : ''}`}
                  aria-invalid={erros.idArea ? 'true' : 'false'}
                  aria-describedby={erros.idArea ? 'idArea-erro' : undefined}
                >
                  <option value="">Selecione...</option>
                  {areas.map((a) => (
                    <option key={a.id} value={String(a.id)}>{a.nome}</option>
                  ))}
                </select>
                {erros.idArea && <span id="idArea-erro" className="campo-erro">{erros.idArea}</span>}
              </div>
            </div>

            {erroModal && <p className="alunos-admin__erro-modal" role="alert">{erroModal}</p>}

            <div className="alunos-admin__acoes-modal">
              <button type="button" className="alunos-admin__botao alunos-admin__botao--secundario" onClick={fecharModal} disabled={enviando}>
                Cancelar
              </button>
              <button type="submit" className="alunos-admin__botao alunos-admin__botao--primario" disabled={enviando}>
                {enviando ? 'Salvando...' : modal.disciplina ? 'Salvar alterações' : 'Cadastrar disciplina'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Janela de nova área */}
      {modal?.tipo === 'area' && (
        <div className="alunos-admin__overlay" onClick={fecharModal}>
          <form
            className="alunos-admin__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-area"
            onClick={(e) => e.stopPropagation()}
            onSubmit={salvarArea}
            noValidate
          >
            <h2 id="titulo-modal-area">Nova área</h2>

            <div className="alunos-admin__campos">
              <CampoFormulario
                label="Nome da área"
                id="nomeArea"
                value={nomeArea}
                onChange={(e) => {
                  setNomeArea(e.target.value);
                  if (erros.nomeArea) setErros({});
                }}
                erro={erros.nomeArea}
                placeholder="Ciências da Natureza"
                autoComplete="off"
              />
            </div>

            {erroModal && <p className="alunos-admin__erro-modal" role="alert">{erroModal}</p>}

            <div className="alunos-admin__acoes-modal">
              <button type="button" className="alunos-admin__botao alunos-admin__botao--secundario" onClick={fecharModal} disabled={enviando}>
                Cancelar
              </button>
              <button type="submit" className="alunos-admin__botao alunos-admin__botao--primario" disabled={enviando}>
                {enviando ? 'Salvando...' : 'Cadastrar área'}
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
            aria-labelledby="titulo-modal-excluir-disciplina"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="titulo-modal-excluir-disciplina">Excluir {modal.disciplina.nome}?</h2>
            <p className="alunos-admin__texto-modal">
              Essa ação não pode ser desfeita. Se a disciplina tiver vínculos ou acompanhamentos, o sistema pode impedir a exclusão.
            </p>

            {erroModal && <p className="alunos-admin__erro-modal" role="alert">{erroModal}</p>}

            <div className="alunos-admin__acoes-modal">
              <button type="button" className="alunos-admin__botao alunos-admin__botao--secundario" onClick={fecharModal} disabled={enviando}>
                Cancelar
              </button>
              <button type="button" className="alunos-admin__botao alunos-admin__botao--perigo" onClick={confirmarExclusao} disabled={enviando}>
                {enviando ? 'Excluindo...' : 'Excluir disciplina'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DisciplinasAdmin;