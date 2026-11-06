import PaginaErro from '../../components/PaginaErro/PaginaErro';

function NotFound() {
  return (
    <PaginaErro
      codigo="404"
      titulo="Página não encontrada"
      texto="A página que você tentou acessar não existe ou foi movida."
      destino="/"
      textoBotao="Voltar para o início"
    />
  );
}

export default NotFound;