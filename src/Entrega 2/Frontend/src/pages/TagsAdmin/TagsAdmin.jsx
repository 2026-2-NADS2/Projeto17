import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';
import EstadoCarregando from '../../components/EstadoCarregando/EstadoCarregando';
import EstadoErro from '../../components/EstadoErro/EstadoErro';
import CampoFormulario from '../../components/CampoFormulario/CampoFormulario';
import { listarTags, criarTag, atualizarTag, excluirTag } from '../../services/tagService';
import { listarAcompanhamentos } from '../../services/acompanhamentoService';
import { nomeDe } from '../RevisaoAdmin/formatadores';
import { exportarCsv } from '../../utils/exportarCsv';
import { tagsExemplo } from './dadosExemplo';
import { filaExemplo } from '../RevisaoAdmin/dadosExemplo';
import '../AlunosAdmin/AlunosAdmin.css';
import './TagsAdmin.css';

const LIMITE_NOME = 40;
const LIMITE_DESCRICAO = 200;

function mensagemDoErro(e, padrao) {
  return e.response?.data?.erro ?? e.response?.data?.mensagem ?? padrao;
}

// Conta em quantos acompanhamentos cada tag aparece (pelo nome, sem diferenciar maiúsculas)
function contarUso(acompanhamentos) {
  const contagem = {};
  acompanhamentos.forEach((a) => {
    (a.tags ?? []).forEach((tag) => {
      const chave = String(nomeDe(tag)).toLowerCase();
      contagem[chave] = (contagem[chave] ?? 0) + 1;
    });
  });
  return contagem;
}

const tagVazia = { nome: '', descricao: '' };

function TagsAdmin() {
  const [tags, setTags] = useState([]);
  const [uso, setUso] = useState(null); // null = não deu pra calcular
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modoExemplo, setModoExemplo] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [busca, setBusca] = useState('');
  const [aviso, setAviso] = useState(null);

  // Janela: null · { tipo: 'form', tag } (tag null = nova) · { tipo: 'excluir', tag }
  const [modal, setModal] = useState(null);
  const [dados, setDados] = useState(tagVazia);
  const [erros, setErros] = useState({});
  const [erroModal, setErroModal] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (modoExemplo) return;

    let ativo = true;

    async function buscar() {
      try {
        const lista = await listarTags();
        if (!ativo) return;
        setTags(lista);

        // O "uso" é um extra: se os acompanhamentos falharem, a tela funciona sem ele
        try {
          const acompanhamentos = await listarAcompanhamentos();
          if (ativo) setUso(contarUso(acompanhamentos));
        } catch {
          if (ativo) setUso(null);
        }
      } catch (e) {
        if (ativo) setErro(mensagemDoErro(e, 'Não foi possível carregar as tags.'));
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
    setTags(tagsExemplo);
    setUso(contarUso(filaExemplo));
    setErro(null);
    setModoExemplo(true);
  }

  function abrirNova() {
    setDados(tagVazia);
    setErros({});
    setErroModal(null);
    setModal({ tipo: 'form', tag: null });
  }

  function abrirEditar(tag) {
    setDados({ nome: tag.nome ?? '', descricao: tag.descricao ?? '' });
    setErros({});
    setErroModal(null);
    setModal({ tipo: 'form', tag });
  }

  function abrirExcluir(tag) {
    setErroModal(null);
    setModal({ tipo: 'excluir', tag });
  }

  function fecharModal() {
    if (!enviando) setModal(null);
  }

  function handleChange(evento) {
    const { name, value } = evento.target;
    setDados((anterior) => ({ ...anterior, [name]: value }));
    if (erros[name]) setErros((anterior) => ({ ...anterior, [name]: '' }));
  }

  function validar() {
    const novosErros = {};
    const nome = dados.nome.trim();
    const editando = modal.tag;

    if (!nome) {
      novosErros.nome = 'Informe o nome da tag.';
    } else if (nome.length > LIMITE_NOME) {
      novosErros.nome = `Use no máximo ${LIMITE_NOME} caracteres.`;
    } else if (
      tags.some((t) => t.nome?.toLowerCase() === nome.toLowerCase() && t.id !== editando?.id)
    ) {
      novosErros.nome = 'Já existe uma tag com esse nome.';
    }

    if (dados.descricao.length > LIMITE_DESCRICAO) {
      novosErros.descricao = `Use no máximo ${LIMITE_DESCRICAO} caracteres.`;
    }

    return novosErros;
  }

  async function salvar(evento) {
    evento.preventDefault();

    const errosEncontrados = validar();
    setErros(errosEncontrados);
    if (Object.keys(errosEncontrados).length > 0) return;

    const editando = modal.tag;
    const corpo = { nome: dados.nome.trim(), descricao: dados.descricao.trim() || null };

    setEnviando(true);
    setErroModal(null);

    try {
      if (modoExemplo) {
        if (editando) {
          setTags((lista) => lista.map((t) => (t.id === editando.id ? { ...t, ...corpo } : t)));
        } else {
          setTags((lista) => [...lista, { id: Date.now(), ...corpo }]);
        }
      } else {
        if (editando) await atualizarTag(editando.id, corpo);
        else await criarTag(corpo);
        setTentativa((t) => t + 1);
      }

      setAviso(editando ? `Tag ${corpo.nome} atualizada.` : `Tag ${corpo.nome} criada.`);
      setModal(null);
    } catch (e) {
      setErroModal(mensagemDoErro(e, 'Não foi possível salvar. O cadastro de tags pode ainda não estar disponível no servidor.'));
    } finally {
      setEnviando(false);
    }
  }

  async function confirmarExclusao() {
    const tag = modal.tag;
    setEnviando(true);
    setErroModal(null);

    try {
      if (!modoExemplo) await excluirTag(tag.id);
      setTags((lista) => lista.filter((t) => t.id !== tag.id));
      setAviso(`Tag ${tag.nome} excluída.`);
      setModal(null);
    } catch (e) {
      setErroModal(mensagemDoErro(e, 'Não foi possível excluir. A exclusão de tags pode ainda não estar disponível no servidor.'));
    } finally {
      setEnviando(false);
    }
  }

  const usoDe = (tag) => uso?.[String(tag.nome).toLowerCase()] ?? 0;
  const temDescricao = tags.some((t) => t.descricao);

  const termo = busca.trim().toLowerCase();
  const visiveis = tags
    .filter((t) => !termo || `${t.nome} ${t.descricao ?? ''}`.toLowerCase().includes(termo))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  function exportar() {
    const hoje = new Date().toLocaleDateString('sv-SE');
    const colunas = [
      { titulo: 'ID', valor: (t) => t.id },
      { titulo: 'Tag', valor: (t) => t.nome },
      { titulo: 'Descrição', valor: (t) => t.descricao ?? '' },
    ];
    if (uso) colunas.push({ titulo: 'Usada em (acompanhamentos)', valor: usoDe });
    exportarCsv(`tags-${hoje}.csv`, colunas, visiveis);
  }

  function renderizarConteudo() {
    if (carregando) return <EstadoCarregando mensagem="Carregando tags..." />;
    if (erro) {
      return (
        <EstadoErro
          titulo="Não foi possível carregar as tags"
          mensagem={erro}
          onTentarNovamente={tentarNovamente}
          onUsarExemplo={usarDadosExemplo}
        />
      );
    }
    if (tags.length === 0) {
      return <p className="alunos-admin__vazio">Nenhuma tag cadastrada ainda. Clique em "Nova tag" para começar.</p>;
    }
    if (visiveis.length === 0) {
      return <p className="alunos-admin__vazio">Nenhuma tag encontrada com essa busca.</p>;
    }

    return (
      <div className="alunos-admin__tabela-caixa">
        <table className="alunos-admin__tabela">
          <thead>
            <tr>
              <th>Tag</th>
              {temDescricao && <th>Descrição</th>}
              {uso && <th>Uso</th>}
              <th><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((tag) => (
              <tr key={tag.id}>
                <td><span className="tags-admin__pilula">{tag.nome}</span></td>
                {temDescricao && <td className="tags-admin__descricao">{tag.descricao || '—'}</td>}
                {uso && (
                  <td className="tags-admin__uso">
                    {usoDe(tag)} acompanhamento{usoDe(tag) === 1 ? '' : 's'}
                  </td>
                )}
                <td className="alunos-admin__acoes">
                  <button
                    type="button"
                    className="alunos-admin__icone-botao"
                    onClick={() => abrirEditar(tag)}
                    aria-label={`Editar tag ${tag.nome}`}
                    title="Editar"
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="alunos-admin__icone-botao alunos-admin__icone-botao--perigo"
                    onClick={() => abrirExcluir(tag)}
                    aria-label={`Excluir tag ${tag.nome}`}
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
            <h1>Tags</h1>
            <p>Etiquetas que os professores usam para descrever o desempenho dos alunos.</p>
          </div>

          {prontoParaUsar && (
            <div className="alunos-admin__botoes-topo">
              {visiveis.length > 0 && (
                <button type="button" className="alunos-admin__botao alunos-admin__botao--secundario" onClick={exportar}>
                  Exportar
                </button>
              )}
              <button type="button" className="alunos-admin__botao alunos-admin__botao--primario" onClick={abrirNova}>
                + Nova tag
              </button>
            </div>
          )}
        </header>

        {aviso && <p className="alunos-admin__aviso" role="status">{aviso}</p>}

        {modoExemplo && (
          <p className="alunos-admin__aviso-exemplo" role="note">
            Dados de exemplo: o que você criar, editar ou excluir aqui não vai para a API.
          </p>
        )}

        {prontoParaUsar && tags.length > 0 && (
          <div className="alunos-admin__filtros">
            <label className="alunos-admin__filtro">
              <span>Buscar</span>
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Nome ou descrição"
              />
            </label>
          </div>
        )}

        {renderizarConteudo()}
      </main>

      {modal?.tipo === 'form' && (
        <div className="alunos-admin__overlay" onClick={fecharModal}>
          <form
            className="alunos-admin__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-tag"
            onClick={(e) => e.stopPropagation()}
            onSubmit={salvar}
            noValidate
          >
            <h2 id="titulo-modal-tag">{modal.tag ? 'Editar tag' : 'Nova tag'}</h2>

            <div className="alunos-admin__campos">
              <CampoFormulario
                label="Nome da tag"
                id="nome"
                value={dados.nome}
                onChange={handleChange}
                erro={erros.nome}
                placeholder="Participativo"
                autoComplete="off"
              />
              <span className="tags-admin__contador">{dados.nome.trim().length}/{LIMITE_NOME}</span>

              <CampoFormulario
                label="Descrição (opcional)"
                id="descricao"
                value={dados.descricao}
                onChange={handleChange}
                erro={erros.descricao}
                placeholder="Quando usar esta tag"
                autoComplete="off"
              />
              <span className="tags-admin__contador">{dados.descricao.length}/{LIMITE_DESCRICAO}</span>
            </div>

            {erroModal && <p className="alunos-admin__erro-modal" role="alert">{erroModal}</p>}

            <div className="alunos-admin__acoes-modal">
              <button type="button" className="alunos-admin__botao alunos-admin__botao--secundario" onClick={fecharModal} disabled={enviando}>
                Cancelar
              </button>
              <button type="submit" className="alunos-admin__botao alunos-admin__botao--primario" disabled={enviando}>
                {enviando ? 'Salvando...' : modal.tag ? 'Salvar alterações' : 'Criar tag'}
              </button>
            </div>
          </form>
        </div>
      )}

      {modal?.tipo === 'excluir' && (
        <div className="alunos-admin__overlay" onClick={fecharModal}>
          <div
            className="alunos-admin__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-excluir-tag"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="titulo-modal-excluir-tag">Excluir a tag {modal.tag.nome}?</h2>
            <p className="alunos-admin__texto-modal">
              {uso && usoDe(modal.tag) > 0
                ? `Ela está em ${usoDe(modal.tag)} acompanhamento(s). Os acompanhamentos continuam salvos, só perdem essa tag.`
                : 'Essa ação não pode ser desfeita.'}
            </p>

            {erroModal && <p className="alunos-admin__erro-modal" role="alert">{erroModal}</p>}

            <div className="alunos-admin__acoes-modal">
              <button type="button" className="alunos-admin__botao alunos-admin__botao--secundario" onClick={fecharModal} disabled={enviando}>
                Cancelar
              </button>
              <button type="button" className="alunos-admin__botao alunos-admin__botao--perigo" onClick={confirmarExclusao} disabled={enviando}>
                {enviando ? 'Excluindo...' : 'Excluir tag'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TagsAdmin;