import CabecalhoPagina from '../../components/CabecalhoPagina/CabecalhoPagina';
import './Privacidade.css';

const SECOES = [
  {
    id: 'dados',
    titulo: '1. Dados que coletamos',
    texto:
      'Somente o necessário para o acompanhamento escolar: nome, e-mail, vínculo aluno–responsável, turma, disciplinas e os registros bimestrais.',
  },
  {
    id: 'finalidade',
    titulo: '2. Finalidade',
    texto: 'Registrar, revisar, publicar e consultar o acompanhamento bimestral do aluno.',
  },
  {
    id: 'acesso',
    titulo: '3. Quem acessa',
    texto:
      'Cada perfil acessa apenas o que lhe compete: professores, suas turmas; responsáveis, os alunos vinculados; a administração, a gestão escolar.',
  },
  {
    id: 'criancas',
    titulo: '4. Dados de crianças e adolescentes',
    texto:
      'Tratados no melhor interesse do aluno, com acesso restrito e registro de consentimento do responsável quando aplicável.',
  },
  {
    id: 'direitos',
    titulo: '5. Direitos do titular',
    texto: 'Confirmação, acesso, correção e eliminação podem ser solicitados ao encarregado.',
  },
  {
    id: 'encarregado',
    titulo: '6. Contato do encarregado',
    texto:
      'Solicitações sobre dados pessoais podem ser enviadas para privacidade@classsync.com.br ou pela página de Contato.',
  },
];

function Privacidade() {
  return (
    <>
      <CabecalhoPagina
        variante="claro"
        rotulo="Legal"
        titulo="Política de privacidade e proteção de dados (LGPD)"
        subtitulo="Última atualização: 05/11/2026"
      />

      <div className="privacidade">
        <nav className="card privacidade-indice" aria-label="Seções desta página">
          <h2>Nesta página</h2>
          <ul>
            {SECOES.map((secao) => (
              <li key={secao.id}>
                <a href={`#${secao.id}`}>{secao.titulo}</a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="card privacidade-conteudo">
          {SECOES.map((secao) => (
            <section key={secao.id} id={secao.id}>
              <h2>{secao.titulo}</h2>
              <p>{secao.texto}</p>
            </section>
          ))}
        </article>
      </div>
    </>
  );
}

export default Privacidade;