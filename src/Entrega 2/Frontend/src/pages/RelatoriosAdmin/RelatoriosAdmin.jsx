import { useEffect, useState } from 'react';
import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';
import EstadoCarregando from '../../components/EstadoCarregando/EstadoCarregando';
import EstadoErro from '../../components/EstadoErro/EstadoErro';
import { listarAcompanhamentos } from '../../services/acompanhamentoService';
import { exportarCsv } from '../../utils/exportarCsv';
import { nomeDe, formatarMedia } from '../RevisaoAdmin/formatadores';
import { acompanhamentosExemplo } from '../DashboardAdmin/dadosExemplo';
import './RelatoriosAdmin.css';

const NOMES_STATUS = {
  RASCUNHO: 'Rascunho',
  ENVIADO: 'Enviado',
  EM_REVISAO: 'Em revisão',
  PUBLICADO: 'Publicado',
  DEVOLVIDO: 'Devolvido',
  CANCELADO: 'Cancelado',
};

// Cada filtro sabe como ler o seu valor de um acompanhamento
const FILTROS = [
  { campo: 'aluno', rotulo: 'Aluno', ler: (a) => nomeDe(a.aluno) },
  { campo: 'turma', rotulo: 'Turma', ler: (a) => (a.turma ? nomeDe(a.turma) : null) },
  { campo: 'disciplina', rotulo: 'Disciplina', ler: (a) => nomeDe(a.disciplina) },
  { campo: 'professor', rotulo: 'Professor', ler: (a) => nomeDe(a.professor) },
  { campo: 'bimestre', rotulo: 'Bimestre', ler: (a) => (a.bimestre ? String(a.bimestre) : null), formatar: (v) => `${v}º bimestre` },
  { campo: 'anoLetivo', rotulo: 'Ano letivo', ler: (a) => (a.anoLetivo ? String(a.anoLetivo) : null) },
  { campo: 'status', rotulo: 'Status', ler: (a) => a.status, formatar: (v) => NOMES_STATUS[v] ?? v },
];

const filtrosVazios = Object.fromEntries(FILTROS.map((f) => [f.campo, '']));

// Valores únicos de um filtro, em ordem (números em ordem numérica, textos em ordem alfabética)
function opcoesDe(filtro, lista) {
  const valores = [...new Set(lista.map(filtro.ler))].filter((v) => v && v !== '—');
  return valores.sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
}

function RelatoriosAdmin() {
  const [acompanhamentos, setAcompanhamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modoExemplo, setModoExemplo] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [filtros, setFiltros] = useState(filtrosVazios);

  useEffect(() => {
    if (modoExemplo) return;

    let ativo = true;

    async function buscar() {
      try {
        const lista = await listarAcompanhamentos();
        if (ativo) setAcompanhamentos(lista);
      } catch (e) {
        if (ativo) {
          setErro(e.response?.data?.erro ?? e.response?.data?.mensagem ?? 'Não foi possível carregar os dados do relatório.');
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    buscar();
    return () => { ativo = false; };
  }, [tentativa, modoExemplo]);

  function tentarNovamente() {
    setCarregando(true);
    setErro(null);
    setModoExemplo(false);
    setTentativa((t) => t + 1);
  }

  function usarDadosExemplo() {
    setAcompanhamentos(acompanhamentosExemplo);
    setErro(null);
    setModoExemplo(true);
  }

  function trocarFiltro(campo, valor) {
    setFiltros((anterior) => ({ ...anterior, [campo]: valor }));
  }

  function limparFiltros() {
    setFiltros(filtrosVazios);
  }

  // Só mostra os filtros que têm alguma opção (ex.: Turma some se a API não mandar turma)
  const filtrosDisponiveis = FILTROS
    .map((f) => ({ ...f, opcoes: opcoesDe(f, acompanhamentos) }))
    .filter((f) => f.opcoes.length > 0);

  // Aplica todos os filtros escolhidos ao mesmo tempo
  const resultado = acompanhamentos.filter((a) =>
    FILTROS.every((f) => !filtros[f.campo] || f.ler(a) === filtros[f.campo])
  );

  const algumFiltro = Object.values(filtros).some(Boolean);

  // ---- Indicadores do resultado filtrado ----
  const comMedia = resultado.filter((a) => a.media !== null && a.media !== undefined);
  const mediaGeral = comMedia.length
    ? comMedia.reduce((soma, a) => soma + Number(a.media), 0) / comMedia.length
    : null;
  const publicados = resultado.filter((a) => a.status === 'PUBLICADO').length;
  const aguardando = resultado.filter((a) => a.status === 'ENVIADO' || a.status === 'EM_REVISAO').length;
  const percentualPublicado = resultado.length ? Math.round((publicados / resultado.length) * 100) : 0;

  function exportar() {
    const hoje = new Date().toLocaleDateString('sv-SE');
    exportarCsv(
      `relatorio-acompanhamentos-${hoje}.csv`,
      [
        { titulo: 'ID', valor: (a) => a.id },
        { titulo: 'Aluno', valor: (a) => nomeDe(a.aluno) },
        { titulo: 'Disciplina', valor: (a) => nomeDe(a.disciplina) },
        { titulo: 'Professor', valor: (a) => nomeDe(a.professor) },
        { titulo: 'Bimestre', valor: (a) => (a.bimestre ? `${a.bimestre}º` : '') },
        { titulo: 'Ano letivo', valor: (a) => a.anoLetivo },
        { titulo: 'Média', valor: (a) => formatarMedia(a.media) },
        { titulo: 'Status', valor: (a) => NOMES_STATUS[a.status] ?? a.status },
        { titulo: 'Descrição', valor: (a) => a.descricao },
      ],
      resultado
    );
  }

  function renderizarConteudo() {
    if (carregando) return <EstadoCarregando mensagem="Carregando dados do relatório..." />;
    if (erro) {
      return (
        <EstadoErro
          titulo="Não foi possível carregar o relatório"
          mensagem={erro}
          onTentarNovamente={tentarNovamente}
          onUsarExemplo={usarDadosExemplo}
        />
      );
    }
    if (acompanhamentos.length === 0) {
      return <p className="relatorios-admin__vazio">Ainda não há acompanhamentos lançados para gerar relatórios.</p>;
    }

    return (
      <>
        {/* Filtros */}
        <section className="relatorios-admin__card" aria-labelledby="titulo-filtros">
          <div className="relatorios-admin__card-topo">
            <h2 id="titulo-filtros">Filtros</h2>
            {algumFiltro && (
              <button type="button" className="relatorios-admin__link" onClick={limparFiltros}>
                Limpar filtros
              </button>
            )}
          </div>

          <div className="relatorios-admin__filtros">
            {filtrosDisponiveis.map((f) => (
              <label key={f.campo} className="relatorios-admin__filtro">
                <span>{f.rotulo}</span>
                <select value={filtros[f.campo]} onChange={(e) => trocarFiltro(f.campo, e.target.value)}>
                  <option value="">Todos</option>
                  {f.opcoes.map((valor) => (
                    <option key={valor} value={valor}>
                      {f.formatar ? f.formatar(valor) : valor}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </section>

        {/* Indicadores */}
        <div className="relatorios-admin__indicadores">
          <div className="relatorios-admin__indicador">
            <span>Registros</span>
            <strong>{resultado.length}</strong>
          </div>
          <div className="relatorios-admin__indicador">
            <span>Média geral</span>
            <strong>{formatarMedia(mediaGeral)}</strong>
          </div>
          <div className="relatorios-admin__indicador">
            <span>Publicados</span>
            <strong>{publicados} <small>({percentualPublicado}%)</small></strong>
          </div>
          <div className="relatorios-admin__indicador">
            <span>Aguardando revisão</span>
            <strong>{aguardando}</strong>
          </div>
        </div>

        {/* Resultado */}
        <section className="relatorios-admin__card" aria-labelledby="titulo-resultado">
          <div className="relatorios-admin__card-topo">
            <h2 id="titulo-resultado">Resultado</h2>
            <span className="relatorios-admin__total">
              {resultado.length} de {acompanhamentos.length} registros
            </span>
          </div>

          {resultado.length === 0 ? (
            <p className="relatorios-admin__texto-suave">Nenhum registro com esses filtros. Tente limpar algum filtro.</p>
          ) : (
            <div className="relatorios-admin__tabela-caixa">
              <table className="relatorios-admin__tabela">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Disciplina</th>
                    <th>Professor</th>
                    <th>Bimestre</th>
                    <th>Ano</th>
                    <th>Média</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.map((a) => (
                    <tr key={a.id}>
                      <td className="relatorios-admin__aluno">{nomeDe(a.aluno)}</td>
                      <td>{nomeDe(a.disciplina)}</td>
                      <td>{nomeDe(a.professor)}</td>
                      <td>{a.bimestre ? `${a.bimestre}º` : '—'}</td>
                      <td>{a.anoLetivo ?? '—'}</td>
                      <td>{formatarMedia(a.media)}</td>
                      <td>
                        <span className={`relatorios-admin__pilula relatorios-admin__pilula--${String(a.status).toLowerCase()}`}>
                          {NOMES_STATUS[a.status] ?? a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </>
    );
  }

  const prontoParaUsar = !carregando && !erro && acompanhamentos.length > 0;

  return (
    <div className="relatorios-admin">
      <SidebarAdmin />

      <main className="relatorios-admin__conteudo">
        <header className="relatorios-admin__topo">
          <div>
            <h1>Relatórios gerenciais</h1>
            <p>Filtre os acompanhamentos e exporte o resultado para o Excel.</p>
          </div>

          {prontoParaUsar && resultado.length > 0 && (
            <button type="button" className="relatorios-admin__botao-exportar" onClick={exportar}>
              Exportar {algumFiltro ? 'resultado filtrado' : 'tudo'}
            </button>
          )}
        </header>

        {modoExemplo && (
          <p className="relatorios-admin__aviso-exemplo" role="note">
            Você está vendo dados de exemplo porque a API não respondeu.
          </p>
        )}

        {renderizarConteudo()}
      </main>
    </div>
  );
}

export default RelatoriosAdmin;