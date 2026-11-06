import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// A cada troca de página: volta ao topo, ou rola até a seção do #âncora (ex.: /privacidade#direitos)
function RolarParaTopo() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const alvo = document.getElementById(hash.slice(1));
      if (alvo) {
        alvo.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null; // não desenha nada na tela
}

export default RolarParaTopo;