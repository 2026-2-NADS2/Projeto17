import { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

function Modal({ aberto, titulo, children, onFechar }) {
  // Fecha com a tecla Esc
  useEffect(() => {
    if (!aberto) return;
    function aoApertarTecla(evento) {
      if (evento.key === 'Escape') onFechar();
    }
    window.addEventListener('keydown', aoApertarTecla);
    return () => window.removeEventListener('keydown', aoApertarTecla);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div className="modal-fundo" onClick={onFechar}>
      <div
        className="modal-caixa"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="modal-cabecalho">
          <h2 id="modal-titulo">{titulo}</h2>
          <button type="button" className="modal-fechar" onClick={onFechar} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;