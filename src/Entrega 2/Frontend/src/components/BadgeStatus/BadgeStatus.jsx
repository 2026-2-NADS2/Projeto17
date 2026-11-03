import './BadgeStatus.css';

const ROTULOS = {
  RASCUNHO: 'Rascunho',
  ENVIADO: 'Enviado',
  EM_REVISAO: 'Em revisão',
  PUBLICADO: 'Publicado',
  DEVOLVIDO: 'Devolvido',
  CANCELADO: 'Cancelado',
};

function BadgeStatus({ status }) {
  const classe = `badge-status badge-status--${status?.toLowerCase()}`;
  return <span className={classe}>{ROTULOS[status] || status}</span>;
}

export default BadgeStatus;