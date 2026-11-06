import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SidebarAdmin from '../../components/SidebarAdmin/SidebarAdmin';
import EstadoCarregando from '../../components/EstadoCarregando/EstadoCarregando';
import EstadoErro from '../../components/EstadoErro/EstadoErro';
import { listarAcompanhamentos } from '../../services/acompanhamentoService';
import { nomeDe } from '../RevisaoAdmin/formatadores';
import { acompanhamentosExemplo } from './dadosExemplo';
import './DashboardAdmin.css';

// Ordem e nomes dos status (a mesma ordem da barra e das pílulas do Figma)
const STATUS = [
  { valor: 'RASCUNHO', rotulo: 'Rascunho' },
  { valor: 'ENVIADO', rotulo: 'Enviado' },
  { valor: 'EM_REVISAO', rotulo: 'Em revisão' },
  { valor: 'PUBLICADO', rotulo: 'Publicado' },
  { valor: 'DEVOLVIDO', rotulo: 'Devolvido' },
  { valor: 'CANCELADO', rotulo: 'Cancelado' },
];

// Transforma o erro técnico do axios numa frase que o usuário entende
function montarMensagemErro(erro) {
  if (erro.response?.data?.erro) return erro.response.data.erro;
  if (erro.code === 'ECONNABORTED') {
    return 'O servidor demorou demais para responder. Tente novamente em instantes.';
  }
  if (erro.response) {
    return `O servidor respondeu com erro ${erro.response.status}. Verifique se o banco de dados MySQL está configurado e rodando.`;
  }
  return 'Não foi possível conectar à API em http://localhost:3000. Verifique se o backend está rodando.';
}

// Agrupa por professor: quantos lançou, quantos já publicou e quantos ainda faltam
function resumirProfessores(lista) {
  const porNome = {};

  lista.forEach((item) => {
    if (item.status === 'CANCELADO') return; // cancelado não conta
    const nome = nomeDe(item.professor);
    if (!porNome[nome]) {
      porNome[nome] = { nome, disciplina: nomeDe(item.disciplina), lancados: 0, publicados: 0 };
    }
    porNome[nome].lancados += 1;
    if (item.status === 'PUBLICADO') porNome[nome].publicados += 1;
  });

  return Object.values(porNome)
    .map((p) => ({ ...p, pendentes: p.lancados - p.publicados }))
    .filter((p) => p.pendentes > 0)
    .sort((a, b) => b.pendentes - a.pendentes)
    .slice(0, 5);
}

function DashboardAdmin() {
  const navigate = useNavigate();

  const [acompanhamentos, setAcompanhamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modoExemplo, setModoExemplo] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (modoExemplo) return;

    let ativo = true;

    async function buscar() {
      try {
        const lista = await listarAcompanhamentos();
        if (ativo) setAcompanhamentos(lista);
      } catch (e) {
        if (ativo) setErro(montarMensagemErro(e));
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

  function abrirRevisao(item) {
    navigate(`/admin/revisao/${item.id}`, { state: { item, exemplo: modoExemplo } });
  }

  // ---- Números calculados a partir da lista ----
  const total = acompanhamentos.length;
  const contagem = Object.fromEntries(
    STATUS.map((s) => [s.valor, acompanhamentos.filter((a) => a.status === s.valor).length])
  );
  const fila = acompanhamentos.filter((a) => a.status === 'ENVIADO');
  const aguardando = contagem.ENVIADO + contagem.EM_REVISAO;
  const professores = resumirProfessores(acompanhamentos);

  function montarSubtitulo() {
    if (carregando || erro) return 'Acompanhamentos lançados pelos professores.';
    if (aguardando === 0) return 'Nenhum acompanhamento aguardando revisão.';
    if (aguardando === 1) return '1 acompanhamento aguardando revisão.';
    return `${aguardando} acompanhamentos aguardando revisão.`;
  }

  function renderizarConteudo() {
    if (carregando) return <EstadoCarregando mensagem="Carregando acompanhamentos..." />;
    if (erro) {
      return <EstadoErro mensagem={erro} onTentarNovamente={tentarNovamente} onUsarExemplo={usarDadosExemplo} />;
    }
    if (total === 0) {
      return <p className="dashboard-admin__vazio">Nenhum acompanhamento lançado ainda.</p>;
    }

    return (
      <>
        {/* Situação dos acompanhamentos */}
        <section className="dashboard-admin__card" aria-labelledby="titulo-situacao">
          <div className="dashboard-admin__card-topo">
            <h2 id="titulo-situacao">Situação dos acompanhamentos</h2>
            <span className="dashboard-admin__total">{total} no total</span>
          </div>

          {/* A barra é só visual; os números estão nas pílulas logo abaixo */}
          <div className="dashboard-admin__barra" aria-hidden="true">
            {STATUS.filter((s) => contagem[s.valor] > 0).map((s) => (
              <span
                key={s.valor}
                className={`dashboard-admin__segmento dashboard-admin__segmento--${s.valor.toLowerCase()}`}
                style={{ width: `${(contagem[s.valor] / total) * 100}%` }}
              />
            ))}
          </div>

          <ul className="dashboard-admin__legenda">
            {STATUS.map((s) => (
              <li key={s.valor}>
                <span className={`dashboard-admin__pilula dashboard-admin__pilula--${s.valor.toLowerCase()}`}>
                  {s.rotulo}
                </span>
                <strong>{contagem[s.valor]}</strong>
              </li>
            ))}
          </ul>
        </section>

        <div className="dashboard-admin__linha">
          {/* Fila de revisão (resumo) */}
          <section className="dashboard-admin__card" aria-labelledby="titulo-fila">
            <div className="dashboard-admin__card-topo">
              <h2 id="titulo-fila">Fila de revisão</h2>
              <Link to="/admin/revisao" className="dashboard-admin__link">Ver fila completa</Link>
            </div>

            {fila.length === 0 ? (
              <p className="dashboard-admin__texto-suave">Nenhum acompanhamento aguardando revisão. 🎉</p>
            ) : (
              <div className="dashboard-admin__tabela-caixa">
                <table className="dashboard-admin__tabela">
                  <thead>
                    <tr>
                      <th>Aluno</th>
                      <th>Disciplina</th>
                      <th>Professor</th>
                      <th><span className="sr-only">Ações</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fila.slice(0, 5).map((item) => (
                      <tr key={item.id}>
                        <td className="dashboard-admin__aluno">{nomeDe(item.aluno)}</td>
                        <td>{nomeDe(item.disciplina)}</td>
                        <td>{nomeDe(item.professor)}</td>
                        <td className="dashboard-admin__acao">
                          <button
                            type="button"
                            className="dashboard-admin__botao-revisar"
                            onClick={() => abrirRevisao(item)}
                            aria-label={`Revisar acompanhamento de ${nomeDe(item.aluno)}`}
                          >
                            Revisar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Professores com pendências */}
          <section className="dashboard-admin__card" aria-labelledby="titulo-professores">
            <div className="dashboard-admin__card-topo">
              <h2 id="titulo-professores">Professores com pendências</h2>
            </div>

            {professores.length === 0 ? (
              <p className="dashboard-admin__texto-suave">Todos os acompanhamentos lançados já foram publicados.</p>
            ) : (
              <ul className="dashboard-admin__professores">
                {professores.map((p) => (
                  <li key={p.nome}>
                    <div className="dashboard-admin__professor-topo">
                      <strong>{p.nome} · {p.disciplina}</strong>
                      <span>{p.publicados}/{p.lancados} publicados</span>
                    </div>
                    <div className="dashboard-admin__progresso" aria-hidden="true">
                      <span style={{ width: `${(p.publicados / p.lancados) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </>
    );
  }

  return (
    <div className="dashboard-admin">
      <SidebarAdmin />

      <main className="dashboard-admin__conteudo">
        <header className="dashboard-admin__topo">
          <div>
            <h1>Visão geral</h1>
            <p>{montarSubtitulo()}</p>
          </div>

          {!carregando && !erro && (
            <button type="button" className="dashboard-admin__botao-atualizar" onClick={tentarNovamente}>
              Atualizar
            </button>
          )}
        </header>

        {modoExemplo && (
          <p className="dashboard-admin__aviso-exemplo" role="note">
            Você está vendo dados de exemplo porque a API não respondeu. Clique em "Atualizar" para tentar a API de novo.
          </p>
        )}

        {renderizarConteudo()}
      </main>
    </div>
  );
}

export default DashboardAdmin;