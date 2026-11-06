import './CabecalhoPagina.css';

// variante "escuro" (padrão) = faixa azul-marinho; "claro" = sem faixa, texto escuro
function CabecalhoPagina({ rotulo, titulo, subtitulo, variante = 'escuro' }) {
  return (
    <section className={`cabecalho-pagina cabecalho-pagina--${variante}`}>
      {rotulo && <p className="cabecalho-pagina-rotulo">{rotulo}</p>}
      <h1 className="cabecalho-pagina-titulo">{titulo}</h1>
      {subtitulo && <p className="cabecalho-pagina-subtitulo">{subtitulo}</p>}
    </section>
  );
}

export default CabecalhoPagina;