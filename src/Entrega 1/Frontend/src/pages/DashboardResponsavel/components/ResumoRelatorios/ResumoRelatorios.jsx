import './ResumoRelatorios.css';

function ResumoRelatorios({ quantidade }) {
  const texto =
    quantidade === 1 ? '1 relatório publicado' : `${quantidade} relatórios publicados`;

  return (
    <div className="resumo-rel" role="status">
      <p className="resumo-rel__titulo">{texto}</p>
      <p className="resumo-rel__detalhe">
        {quantidade > 0 ? 'aguardando sua ciência' : 'nenhum relatório novo no momento'}
      </p>
    </div>
  );
}

export default ResumoRelatorios;
