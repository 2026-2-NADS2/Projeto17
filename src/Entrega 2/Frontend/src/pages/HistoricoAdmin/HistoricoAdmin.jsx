import { useEffect, useState } from 'react';
import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';
import EstadoCarregando from '../../components/EstadoCarregando/EstadoCarregando';
import EstadoErro from '../../components/EstadoErro/EstadoErro';
import { listarAuditoria } from '../../services/auditoriaService';
import { nomeDe } from '../RevisaoAdmin/formatadores';
import { exportarCsv } from '../../utils/exportarCsv';
import { formatarDataHora, diaLocal, tempoDe } from '../../utils/datas';
import { auditoriaExemplo } from './dadosExemplo';
import '../AlunosAdmin/AlunosAdmin.css';
import './HistoricoAdmin.css';

const NOMES_ACAO = {
  CRIAR: 'Criou',
  EDITAR: 'Alterou',
  ENVIAR: 'Enviou',
  PUBLICAR: 'Publicou',
  DEVOLVER: 'Devolveu',
  CANCELAR: 'Cancelou',
  EXCLUIR: 'Excluiu',
};

const NOMES_ENTIDADE = {
  ACOMPANHAMENTO: 'Acompanhamento',
  USUARIO: 'Usuário',
  ALUNO: 'Aluno',
  TURMA: 'Turma',
  DISCIPLINA: 'Disciplina',
  BIMESTRE: 'Bimestre',
  TAG: 'Tag',
  VINCULO: 'Vínculo',
};

const filtrosVazios = { acao: '', usuario: '', de: '', ate: '' };

function mensagemDoErro(e, padrao) {
  return e.response?.data?.erro ?? e.response?.data?.mensagem ?? padrao;
}

function valorLegivel(valor) {
  if (valor === null || valor === undefined || valor === '') return '—';
  if (typeof valor === 'object') return JSON.stringify(valor);
  return String(valor);
}

// Junta os campos de "antes" e "depois" numa lista para comparar lado a lado
function compararCampos(antes, depois) {
  const campos = [...new Set([...Object.keys(antes ?? {}), ...Object.keys(depois ?? {})])];
  return campos.map((campo) => {
    const valorAntes = antes?.[campo];
    const valorDepois = depois?.[campo];
    return {
      campo,
      antes: valorLegivel(valorAntes),
      depois: valorLegivel(valorDepois),
      mudou: JSON.stringify(valorAntes) !== JSON.stringify(valorDepois),
    };
  });
}

function HistoricoAdmin() {
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modoExemplo, setModoExemplo] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [filtros, setFiltros] = useState(filtrosVazios);
  const [detalhe, setDetalhe] = useState(null);

  useEffect(() => {
    if (modoExemplo) return;

    let ativo = true;

    async function buscar() {
      try {
        const lista = await listarAuditoria();
        if (ativo) setRegistros(lista);
      } catch (e) {
        if (ativo) setErro(mensagemDoErro(e, 'Não foi possível carregar o histórico.'));
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    buscar();
    return () => { ativo = false; };
  }, [tentativa, modoExemplo]);

  useEffect(() => {
    if (!detalhe) return;

    function aoTeclar(e) {
      if (e.key === 'Escape') setDetalhe(null);
    }

    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [detalhe]);

  function tentarNovamente() {
    setCarregando(true);
    setErro(null);
    setModoExemplo(false);
    setTentativa((t) => t + 1);
  }

  function usarDadosExemplo() {
    setRegistros(auditoriaExemplo);
    setErro(null);
    setModoExemplo(true);
  }

  function trocarFiltro(campo, valor) {
    setFiltros((anterior) => ({ ...anterior, [campo]: valor }));
  }

  const algumFiltro = Object.values(filtros).some(Boolean);

  // Opções dos selects, tiradas dos próprios registros
  const usuarios = [...new Set(registros.map((r) => nomeDe(r.usuario)))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const acoes = [...new Set(registros.map((r) => r.acao))].filter(Boolean);

  const visiveis = registros
    .filter((r) => !filtros.acao || r.acao === filtros.acao)
    .filter((r) => !filtros.usuario || nomeDe(r.usuario) === filtros.usuario)
    .filter((r) => !filtros.de || diaLocal(r.dataHora) >= filtros.de)
    .filter((r) => !filtros.ate || diaLocal(r.dataHora) <= filtros.ate)
    .sort((a, b) => tempoDe(b.dataHora) - tempoDe(a.dataHora));

  const nomeRegistro = (r) => `${NOMES_ENTIDADE[r.entidade] ?? r.entidade} #${r.idEntidade}`;

  function exportar() {
    const hoje = new Date().toLocaleDateString('sv-SE');
    exportarCsv(
      `historico-${hoje}.csv`,
      [
        { titulo: 'Data e hora', valor: (r) => formatarDataHora(r.dataHora) },
        { titulo: 'Usuário', valor: (r) => nomeDe(r.usuario) },
        { titulo: 'Ação', valor: (r) => NOMES_ACAO[r.acao] ?? r.acao },
        { titulo: 'Registro', valor: nomeRegistro },
        { titulo: 'Descrição', valor: (r) => r.descricao },
        { titulo: 'Antes', valor: (r) => (r.antes ? JSON.stringify(r.antes) : '') },
        { titulo: 'Depois', valor: (r) => (r.depois ? JSON.stringify(r.depois) : '') },
      ],
      visiveis
    );
  }

  function renderizarConteudo() {
    if (carregando) return <EstadoCarregando mensagem="Carregando histórico..." />;
    if (erro) {
      return (
        <EstadoErro
          titulo="Não foi possível carregar o histórico"
          mensagem={erro}
          onTentarNovamente={tentarNovamente}
          onUsarExemplo={usarDadosExemplo}
        />
      );
    }
    if (registros.length === 0) {
      return <p className="alunos-admin__vazio">Nenhuma ação registrada ainda.</p>;
    }

    return (
      <>
        <div className="historico-admin__filtros">
          <label className="alunos-admin__filtro">
            <span>Ação</span>
            <select value={filtros.acao} onChange={(e) => trocarFiltro('acao', e.target.value)}>
              <option value="">Todas</option>
              {acoes.map((a) => (
                <option key={a} value={a}>{NOMES_ACAO[a] ?? a}</option>
              ))}
            </select>
          </label>
          <label className="alunos-admin__filtro">
            <span>Usuário</span>
            <select value={filtros.usuario} onChange={(e) => trocarFiltro('usuario', e.target.value)}>
              <option value="">Todos</option>
              {usuarios.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </label>
          <label className="alunos-admin__filtro">
            <span>De</span>
            <input type="date" value={filtros.de} onChange={(e) => trocarFiltro('de', e.target.value)} />
          </label>
          <label className="alunos-admin__filtro">
            <span>Até</span>
            <input type="date" value={filtros.ate} onChange={(e) => trocarFiltro('ate', e.target.value)} />
          </label>
        </div>

        {algumFiltro && (
          <p style={{ margin: '0 0 12px' }}>
            <button type="button" className="historico-admin__link" onClick={() => setFiltros(filtrosVazios)}>
              Limpar filtros
            </button>
          </p>
        )}

        {visiveis.length === 0 ? (
          <p className="alunos-admin__vazio">Nenhuma ação encontrada com esses filtros.</p>
        ) : (
          <div className="alunos-admin__tabela-caixa">
            <table className="alunos-admin__tabela">
              <thead>
                <tr>
                  <th>Quando</th>
                  <th>Usuário</th>
                  <th>Ação</th>
                  <th>Registro</th>
                  <th>Descrição</th>
                  <th><span className="sr-only">Detalhes</span></th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((r) => (
                  <tr key={r.id}>
                    <td className="historico-admin__data">{formatarDataHora(r.dataHora)}</td>
                    <td className="alunos-admin__nome">{nomeDe(r.usuario)}</td>
                    <td>
                      <span className={`historico-admin__pilula historico-admin__pilula--${String(r.acao).toLowerCase()}`}>
                        {NOMES_ACAO[r.acao] ?? r.acao}
                      </span>
                    </td>
                    <td className="historico-admin__registro">{nomeRegistro(r)}</td>
                    <td>{r.descricao}</td>
                    <td className="alunos-admin__acoes">
                      <button
                        type="button"
                        className="historico-admin__link"
                        onClick={() => setDetalhe(r)}
                        aria-label={`Ver detalhes: ${r.descricao}`}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  }

  const prontoParaUsar = !carregando && !erro && registros.length > 0;

  return (
    <div className="alunos-admin">
      <SidebarAdmin />

      <main className="alunos-admin__conteudo">
        <header className="alunos-admin__topo">
          <div>
            <h1>Histórico e auditoria</h1>
            <p>Quem fez o quê, e quando. Toda alteração fica registrada com o estado anterior e o novo.</p>
          </div>

          {prontoParaUsar && visiveis.length > 0 && (
            <button type="button" className="alunos-admin__botao alunos-admin__botao--secundario" onClick={exportar}>
              Exportar
            </button>
          )}
        </header>

        {modoExemplo && (
          <p className="alunos-admin__aviso-exemplo" role="note">
            Você está vendo dados de exemplo porque a API não respondeu.
          </p>
        )}

        {renderizarConteudo()}
      </main>

      {detalhe && (
        <div className="alunos-admin__overlay" onClick={() => setDetalhe(null)}>
          <div
            className="alunos-admin__modal historico-admin__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-detalhe-historico"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="titulo-detalhe-historico">Detalhe da alteração</h2>

            <dl className="historico-admin__resumo">
              <dt>Quando</dt>
              <dd>{formatarDataHora(detalhe.dataHora)}</dd>
              <dt>Quem</dt>
              <dd>{nomeDe(detalhe.usuario)}</dd>
              <dt>Ação</dt>
              <dd>{NOMES_ACAO[detalhe.acao] ?? detalhe.acao}</dd>
              <dt>Registro</dt>
              <dd>{nomeRegistro(detalhe)}</dd>
            </dl>

            <p className="alunos-admin__texto-modal">{detalhe.descricao}</p>

            {(detalhe.antes || detalhe.depois) && (
              <table className="historico-admin__diff">
                <thead>
                  <tr>
                    <th>Campo</th>
                    <th>Antes</th>
                    <th>Depois</th>
                  </tr>
                </thead>
                <tbody>
                  {compararCampos(detalhe.antes, detalhe.depois).map((linha) => (
                    <tr key={linha.campo} className={linha.mudou ? 'historico-admin__mudou' : ''}>
                      <td>{linha.campo}</td>
                      <td className={linha.mudou ? 'historico-admin__antes' : ''}>{linha.antes}</td>
                      <td className={linha.mudou ? 'historico-admin__depois' : ''}>{linha.depois}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="alunos-admin__acoes-modal">
              <button type="button" className="alunos-admin__botao alunos-admin__botao--primario" onClick={() => setDetalhe(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoricoAdmin;