import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './EntradaSenha.css';

// <input> de senha com o botão de olho para mostrar/esconder o que foi digitado.
// Todas as outras props (id, value, onChange, className, autoComplete...) vão direto para o <input>.
function EntradaSenha({ className = '', ...props }) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="entrada-senha">
      <input
        {...props}
        type={visivel ? 'text' : 'password'}
        className={`${className} entrada-senha-campo`}
      />
      <button
        type="button" // não envia o formulário
        className="entrada-senha-botao"
        onClick={() => setVisivel((atual) => !atual)}
        aria-label={visivel ? 'Esconder senha' : 'Mostrar senha'}
        aria-pressed={visivel}
        title={visivel ? 'Esconder senha' : 'Mostrar senha'}
      >
        {visivel ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default EntradaSenha;