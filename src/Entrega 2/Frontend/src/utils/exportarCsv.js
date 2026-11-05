// Transforma um valor numa célula segura para o CSV
function escaparCelula(valor) {
    if (valor === null || valor === undefined) return '';
    let texto = String(valor);
  
    // Segurança: o Excel executa células que começam com = + - @ como fórmula
    if (/^[=+\-@]/.test(texto)) texto = `'${texto}`;
  
    // Se tiver ; aspas ou quebra de linha, envolve em aspas (e dobra as aspas internas)
    if (/[";\r\n]/.test(texto)) texto = `"${texto.replace(/"/g, '""')}"`;
  
    return texto;
  }
  
  /**
   * Gera e baixa um arquivo CSV que abre certinho no Excel em português.
   * colunas: [{ titulo: 'Aluno', valor: (linha) => linha.aluno }, ...]
   */
  export function exportarCsv(nomeArquivo, colunas, linhas) {
    const cabecalho = colunas.map((c) => escaparCelula(c.titulo)).join(';');
    const corpo = linhas.map((linha) =>
      colunas.map((c) => escaparCelula(c.valor(linha))).join(';')
    );
    const conteudo = [cabecalho, ...corpo].join('\r\n');
  
    // BOM: "carimbo" invisível que avisa o Excel que o arquivo é UTF-8 (senão "Média" vira "MÃ©dia")
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + conteudo], { type: 'text/csv;charset=utf-8;' });
  
    // Cria um link invisível, clica nele e joga fora
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }