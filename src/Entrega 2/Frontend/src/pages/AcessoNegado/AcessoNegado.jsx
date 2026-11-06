import PaginaErro from '../../components/PaginaErro/PaginaErro';
import { obterUsuario, rotaDoPerfil } from '../../services/authService';

function AcessoNegado() {
  const usuario = obterUsuario();

  return (
    <PaginaErro
      codigo="403"
      variante="erro"
      titulo="Você não tem permissão para acessar esta página"
      texto="Esta área é restrita a outro perfil de usuário. Se acredita que é um engano, fale com a administração da escola."
      destino={rotaDoPerfil(usuario?.perfil)}
      textoBotao="Ir para o meu início"
    />
  );
}

export default AcessoNegado;