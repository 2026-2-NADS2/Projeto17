import { Navigate, Outlet } from 'react-router-dom';
import { estaLogado, obterUsuario, rotaDoPerfil } from '../../services/authService';

function RotaProtegida({ perfis }) {
  if (!estaLogado()) {
    return <Navigate to="/entrar" replace />;
  }

  const usuario = obterUsuario();

  if (perfis && !perfis.includes(usuario?.perfil)) {
    return <Navigate to={rotaDoPerfil(usuario?.perfil)} replace />;
  }

  return <Outlet />;
}

export default RotaProtegida;