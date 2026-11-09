// Envio de e-mail pela API HTTP do Brevo.
// Por que API e não SMTP (Gmail etc.)? O plano gratuito do Render bloqueia as portas SMTP,
// mas libera requisições HTTPS normais. Usa o fetch nativo do Node 18+, sem pacote novo.
async function enviarEmail({ para, nomeDestinatario, assunto, html, texto }) {
  const chave = process.env.BREVO_API_KEY;
  const remetente = process.env.EMAIL_REMETENTE;

  if (!chave || !remetente) {
    throw new Error("Envio de e-mail não configurado: defina BREVO_API_KEY e EMAIL_REMETENTE no .env.");
  }

  const resposta = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": chave,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: process.env.EMAIL_REMETENTE_NOME || "ClassSync", email: remetente },
      to: [{ email: para, name: nomeDestinatario }],
      subject: assunto,
      htmlContent: html,
      textContent: texto,
    }),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text();
    throw new Error(`O Brevo recusou o envio (${resposta.status}): ${detalhe}`);
  }
}

module.exports = enviarEmail;
