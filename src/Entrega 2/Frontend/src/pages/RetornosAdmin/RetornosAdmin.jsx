import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';
import EstadoCarregando from '../../components/EstadoCarregando/EstadoCarregando';
import EstadoErro from '../../components/EstadoErro/EstadoErro';
import { listarRetornos } from '../../services/retornoService';
import { nomeDe } from '../RevisaoAdmin/formatadores';
import { exportarCsv } from '../../utils/exportarCsv';
import { formatarDataHora, tempoDe } from '../../utils/datas';
import { retornosExemplo } from './dadosExemplo';
import '../AlunosAdmin/AlunosAdmin.css';
import './RetornosAdmin.css';

const SETE_DIAS = 7 * 24 * 60 * 60 * 1000;

function mensagemDoErro(e, padrao) {
  return e.response?.data?.erro ?? e.response?.data?.mensagem ?? padrao;
}

// Cada responsável dá ciência uma vez por acompanhamento, então os dois juntos identificam o retorno
function chaveDe(r) {
  return `${r.idAcompanhamento}-${r.responsavel?.id ?? nomeDe(r.responsavel)}`;
}

function temObservacao(r) {
  return Boolean(r.observacao && String(r.observacao).trim());
}

function numeroBimestre(r) {
  return r.bimestre && typeof r.bimestre === 'object' ? r.bimestre.numero : r.bimestre;
}

function RetornosAdmin() {
  const [retornos, setRetornos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modoExemplo, setModoExemplo] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('');
  const [filtroBimestre, setFiltroBimestre] = useState('');

  useEffect(() => {
    if (modoExemplo) return;

    let ativo = true;

    async function buscar() {
      try {
        const lista = await listarRetornos();
        if (ativo) setRetornos(lista);
      } catch (e) {
        if (ativo) setErro(mensagemDoErro(e, 'Não foi possível carregar os retornos das famílias.'));
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
    setRetornos(retornosExemplo);
    setErro(null);
    setModoExemplo(true);
  }

  // Indicadores
  const comObservacao = retornos.filter(temObservacao).length;
  const recentes = retornos.filter((r) => Date.now() - tempoDe(r.dataHora) <= SETE_DIAS).length;

  // Opções dos filtros, tiradas dos próprios dados
  const turmas = [...new Set(retornos.map((r) => nomeDe(r.turma)).filter((t) => t && t !== '—'))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
  const bimestres = [...new Set(retornos.map(numeroBimestre).filter(Boolean))].sort((a, b) => a - b);

  const visiveis = retornos
    .filter((r) => !filtroTipo || (filtroTipo === 'OBSERVACAO' ? temObservacao(r) : !temObservacao(r)))
    .filter((r) => !filtroTurma || nomeDe(r.turma) === filtroTurma)
    .filter((r) => !filtroBimestre || String(numeroBimestre(r)) === filtroBimestre)
    .sort((a, b) => tempoDe(b.dataHora) - tempoDe(a.dataHora)); // mais recentes primeiro

  function exportar() {
    const hoje = new Date().toLocaleDateString('sv-SE');
    exportarCsv(
      `retornos-familias-${hoje}.csv`,
      [
        { titulo: 'Data e hora', valor: (r) => formatarDataHora(r.dataHora) },
        { titulo: 'Responsável', valor: (r) => nomeDe(r.responsavel) },
        { titulo: 'Aluno', valor: (r) => nomeDe(r.aluno) },
        { titulo: 'Turma', valor: (r) => nomeDe(r.turma) },
        { titulo: 'Disciplina', valor: (r) => nomeDe(r.disciplina) },
        { titulo: 'Bimestre', valor: (r) => `${numeroBimestre(r)}º` },
        { titulo: 'Observação', valor: (r) => r.observacao ?? '' },
      ],
      visiveis
    );
  }

  function renderizarConteudo() {
    if (carregando) return <EstadoCarregando mensagem="Carregando retornos..." />;
    if (erro) {
      return (
        <EstadoErro
          titulo="Não foi possível carregar os retornos"
          mensagem={erro}
          onTentarNovamente={tentarNovamente}
          onUsarExemplo={usarDadosExemplo}
        />
      );
    }
    if (retornos.length === 0) {
      return (
        <p className="alunos-admin__vazio">
          Nenhuma família respondeu ainda. Os retornos aparecem aqui quando os responsáveis confirmam ciência de um relatório publicado.
        </p>
      );
    }

    return (
      <>
        <div className="retornos-admin__indicadores">
          <div className="retornos-admin__indicador">
            <span>Ciências registradas</span>
            <strong>{retornos.length}</strong>
          </div>
          <div className="retornos-admin__indicador">
            <span>Com observação</span>
            <strong>{comObservacao}</strong>
          </div>
          <div className="retornos-admin__indicador">
            <span>Últimos 7 dias</span>
            <strong>{recentes}</strong>
          </div>
        </div>

        <div className="retornos-admin__filtros">
          <label className="alunos-admin__filtro">
            <span>Tipo</span>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="alunos-admin__select">
              <option value="">Todos</option>
              <option value="OBSERVACAO">Com observação</option>
              <option value="CIENCIA">Só ciência</option>
            </select>
          </label>
          <label className="alunos-admin__filtro">
            <span>Turma</span>
            <select value={filtroTurma} onChange={(e) => setFiltroTurma(e.target.value)} className="alunos-admin__select">
              <option value="">Todas</option>
              {turmas.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="alunos-admin__filtro">
            <span>Bimestre</span>
            <select value={filtroBimestre} onChange={(e) => setFiltroBimestre(e.target.value)} className="alunos-admin__select">
              <option value="">Todos</option>
              {bimestres.map((b) => <option key={b} value={String(b)}>{b}º bimestre</option>)}
            </select>
          </label>
        </div>

        {visiveis.length === 0 ? (
          <p className="alunos-admin__vazio">Nenhum retorno com esses filtros.</p>
        ) : (
          <ul className="retornos-admin__lista">
            {visiveis.map((r) => {
              const observacao = temObservacao(r);
              return (
                <li key={chaveDe(r)} className={`retornos-admin__card ${observacao ? 'retornos-admin__card--novo' : ''}`}>
                  <div className="retornos-admin__card-topo">
                    <span className={`retornos-admin__pilula retornos-admin__pilula--${observacao ? 'observacao' : 'ciencia'}`}>
                      {observacao ? 'Observação' : 'Ciência'}
                    </span>
                    <span className="retornos-admin__data">{formatarDataHora(r.dataHora)}</span>
                  </div>

                  <p className="retornos-admin__quem">
                    <strong>{nomeDe(r.responsavel)}</strong>, responsável por <strong>{nomeDe(r.aluno)}</strong>
                  </p>
                  <p className="retornos-admin__contexto">
                    {nomeDe(r.disciplina)} · {nomeDe(r.turma)} · {numeroBimestre(r)}º bimestre
                  </p>

                  {observacao ? (
                    <p className="retornos-admin__mensagem">“{r.observacao}”</p>
                  ) : (
                    <p className="retornos-admin__contexto">Confirmou que leu o relatório.</p>
                  )}

                  <div className="retornos-admin__acoes">
                    <Link
                      to={`/admin/revisao/${r.idAcompanhamento}`}
                      className="alunos-admin__botao alunos-admin__botao--secundario"
                      style={{ textDecoration: 'none' }}
                    >
                      Ver acompanhamento
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </>
    );
  }

  const prontoParaUsar = !carregando && !erro && visiveis.length > 0;

  return (
    <div className="alunos-admin">
      <SidebarAdmin />

      <main className="alunos-admin__conteudo">
        <header className="alunos-admin__topo">
          <div>
            <h1>Retornos das famílias</h1>
            <p>Ciências e observações que os responsáveis deixaram nos relatórios publicados.</p>
          </div>

          {prontoParaUsar && (
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
    </div>
  );
}

export default RetornosAdmin;