import { Info, CircleCheck, Shield } from 'lucide-react';
import CabecalhoPagina from '../../components/CabecalhoPagina/CabecalhoPagina';
import CardIcone from '../../components/CardIcone/CardIcone';
import './Institucional.css';

const BLOCOS = [
  {
    titulo: 'Quem somos',
    Icone: Info,
    texto:
      'A KFKA Technology Consulting desenvolve software educacional. O ClassSync nasceu para organizar o acompanhamento bimestral dos alunos.',
  },
  {
    titulo: 'Nosso propósito',
    Icone: CircleCheck,
    texto:
      'Dar clareza ao desenvolvimento de cada aluno, com registros revisados antes de chegarem às famílias.',
  },
  {
    titulo: 'Privacidade em primeiro lugar',
    Icone: Shield,
    texto:
      'Coleta mínima de dados, acesso por perfil e proteção especial a dados de crianças e adolescentes (LGPD).',
  },
];

function Institucional() {
  return (
    <>
      <CabecalhoPagina
        rotulo="Institucional"
        titulo="Sobre a KFKA e o ClassSync"
        subtitulo="Tecnologia para fortalecer a comunicação entre escola, professores e famílias no Ensino Fundamental."
      />

      <div className="institucional">
        <div className="institucional-grade">
          {BLOCOS.map((bloco) => (
            <CardIcone key={bloco.titulo} Icone={bloco.Icone} titulo={bloco.titulo}>
              <p>{bloco.texto}</p>
            </CardIcone>
          ))}
        </div>
      </div>
    </>
  );
}

export default Institucional;