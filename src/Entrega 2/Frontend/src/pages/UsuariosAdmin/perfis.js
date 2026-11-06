// Código que vem da API → nome que aparece na tela
export const NOMES_PERFIL = {
    ADMIN: 'Administrador',
    PROFESSOR: 'Professor',
    RESPONSAVEL: 'Responsável',
  };
  
  export const OPCOES_PERFIL = Object.entries(NOMES_PERFIL).map(([valor, rotulo]) => ({ valor, rotulo }));
  
  // MySQL costuma devolver 1/0 em vez de true/false. Se não vier nada, considera ativo.
  export function estaAtivo(usuario) {
    if (usuario.ativo === undefined || usuario.ativo === null) return true;
    return Boolean(Number(usuario.ativo));
  }