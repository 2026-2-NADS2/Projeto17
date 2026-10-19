import { STATUS_ACOMPANHAMENTO, ORDEM_STATUS } from '../../utils/statusAcompanhamento';
import './DistribuicaoStatus.css';

function DistribuicaoStatus({ acompanhamentos }) {
  const total = acompanhamentos.length;

  // Para cada status, conta quantos acompanhamentos estão nele
  const contagem = ORDEM_STATUS.map((status) => ({
    status,
    ...STATUS_ACOMPANHAMENTO[status],
    quantidade: acompanhamentos.filter((item) => item.status === status).length,
  }));

  return (
    <section className="distribuicao-status" aria-labelledby="distribuicao-titulo">
      <div className="distribuicao-status__cabecalho">
        <h2 id="distribuicao-titulo">Situação dos acompanhamentos</h2>
        <span className="distribuicao-status__total">{total} no total</span>
      </div>

      {/* Barra dividida: cada pedaço tem largura proporcional à quantidade */}
      <div className="distribuicao-status__barra" aria-hidden="true">
        {contagem
          .filter((item) => item.quantidade > 0)
          .map((item) => (
            <span
              key={item.status}
              className="distribuicao-status__segmento"
              style={{ width: `${(item.quantidade / total) * 100}%`, background: item.cor }}
            />
          ))}
      </div>

      <ul className="distribuicao-status__legenda">
        {contagem.map((item) => (
          <li key={item.status} className="distribuicao-status__item">
            <span className="distribuicao-status__ponto" style={{ background: item.cor }} />
            <span className="distribuicao-status__rotulo">{item.rotulo}</span>
            <strong className="distribuicao-status__quantidade">{item.quantidade}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default DistribuicaoStatus;