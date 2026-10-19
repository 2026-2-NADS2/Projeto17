import { STATUS_ACOMPANHAMENTO } from '../../utils/statusAcompanhamento';
import './StatusBadge.css';

function StatusBadge({ status }) {
  // Se vier um status desconhecido, mostramos o texto cru em cinza
  const config = STATUS_ACOMPANHAMENTO[status] ?? {
    rotulo: status ?? 'Sem status',
    fundo: '#EEF1F6',
    texto: '#44526E',
  };

  return (
    <span
      className="status-badge"
      style={{ background: config.fundo, color: config.texto }}
    >
      {config.rotulo}
    </span>
  );
}

export default StatusBadge;