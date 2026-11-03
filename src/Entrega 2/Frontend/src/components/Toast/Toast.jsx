import { useEffect } from 'react';
import { CircleCheck, X } from 'lucide-react';
import './Toast.css';

// Aviso flutuante no canto da tela que some sozinho
function Toast({ mensagem, onFechar, duracao = 4000 }) {
  useEffect(() => {
    if (!mensagem) return;
    const temporizador = setTimeout(onFechar, duracao);
    return () => clearTimeout(temporizador);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mensagem, duracao]);

  if (!mensagem) return null;

  return (
    <div className="toast" role="status">
      <CircleCheck size={18} className="toast-icone" />
      <span>{mensagem}</span>
      <button type="button" className="toast-fechar" onClick={onFechar} aria-label="Fechar aviso">
        <X size={16} />
      </button>
    </div>
  );
}

export default Toast;