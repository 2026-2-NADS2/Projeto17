// Um único lugar com rótulo e cores de cada status.
// A barra de distribuição e o selo da tabela leem daqui, então ficam sempre iguais.
export const STATUS_ACOMPANHAMENTO = {
  RASCUNHO:   { rotulo: 'Rascunho',   cor: '#8A97B1', fundo: '#EEF1F6', texto: '#44526E' },
  ENVIADO:    { rotulo: 'Enviado',    cor: '#2695FD', fundo: '#E3F0FF', texto: '#0B5CAD' },
  EM_REVISAO: { rotulo: 'Em revisão', cor: '#F2B01E', fundo: '#FFF4D6', texto: '#7F5300' },
  PUBLICADO:  { rotulo: 'Publicado',  cor: '#1FA971', fundo: '#DDF5EA', texto: '#136B47' },
  DEVOLVIDO:  { rotulo: 'Devolvido',  cor: '#F07A2E', fundo: '#FFE8D9', texto: '#9C400C' },
  CANCELADO:  { rotulo: 'Cancelado',  cor: '#D64545', fundo: '#FDE2E3', texto: '#A12222' },
};

export const ORDEM_STATUS = Object.keys(STATUS_ACOMPANHAMENTO);