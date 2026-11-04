const fs = require("fs");
const mysql = require("mysql2/promise");
require("dotenv").config();

// SSL só é usado quando há um certificado configurado (banco na nuvem).
// No banco local, nenhuma das duas variáveis existe e a conexão segue sem SSL.
function opcoesSsl() {
  // No Render: o conteúdo do ca.pem vai direto na variável de ambiente
  if (process.env.DB_SSL_CA) {
    return { ca: process.env.DB_SSL_CA.replace(/\\n/g, "\n") };
  }
  // No computador: o caminho até o arquivo ca.pem
  if (process.env.DB_SSL_CA_PATH) {
    return { ca: fs.readFileSync(process.env.DB_SSL_CA_PATH, "utf8") };
  }
  return undefined;
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: opcoesSsl(),
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;