import './CampoFormulario.css';

function CampoFormulario({
  label,
  id,
  type = 'text',
  value,
  onChange,
  erro,
  placeholder,
  autoComplete,
}) {
  return (
    <div className="campo-formulario">
      <label htmlFor={id} className="campo-label">
        {label}
      </label>

      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`campo-input ${erro ? 'campo-input--erro' : ''}`}
        aria-invalid={erro ? 'true' : 'false'}
        aria-describedby={erro ? `${id}-erro` : undefined}
      />

      {erro && (
        <span id={`${id}-erro`} className="campo-erro">
          {erro}
        </span>
      )}
    </div>
  );
}

export default CampoFormulario;