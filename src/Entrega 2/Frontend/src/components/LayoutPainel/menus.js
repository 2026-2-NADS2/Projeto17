import { House, Layers, FileText, FilePlus, Undo2, ChartColumn, User, GraduationCap } from 'lucide-react';

// fim: true → só fica "ativo" na rota exata (senão o Início ficaria aceso em todas)
export const menuProfessor = [
  { rota: '/professor', rotulo: 'Início', Icone: House, fim: true },
  { rota: '/professor/turmas', rotulo: 'Minhas turmas', Icone: Layers },
  { rota: '/professor/acompanhamentos', rotulo: 'Acompanhamentos', Icone: FileText },
  { rota: '/professor/criar-acompanhamento', rotulo: 'Novo acompanhamento', Icone: FilePlus },
  { rota: '/professor/devolvidos', rotulo: 'Devolvidos', Icone: Undo2 },
  { rota: '/professor/relatorios', rotulo: 'Relatórios e retornos', Icone: ChartColumn },
  { rota: '/professor/perfil', rotulo: 'Meu perfil', Icone: User },
];

export const menuResponsavel = [
  { rota: '/responsavel', rotulo: 'Início', Icone: House, fim: true },
  { rota: '/responsavel/alunos', rotulo: 'Meus alunos', Icone: GraduationCap },
  { rota: '/responsavel/relatorios', rotulo: 'Relatórios', Icone: FileText },
  { rota: '/responsavel/perfil', rotulo: 'Meu perfil', Icone: User },
];