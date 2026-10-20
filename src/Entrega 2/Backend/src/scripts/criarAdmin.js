require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../config/database");

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const senha = process.env.ADMIN_SENHA;

  if (!email || !senha) {
    console.error("Defina ADMIN_EMAIL e ADMIN_SENHA no .env");
    process.exit(1);
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  await pool.query(
    `INSERT INTO usuario (nome, email, senha_hash, perfil)
     VALUES (?, ?, ?, 'ADMIN')
     ON DUPLICATE KEY UPDATE senha_hash = VALUES(senha_hash)`,
    ["Administrador", email, senhaHash]
  );

  console.log(`Admin pronto: ${email}`);
  process.exit(0);
}

main().catch((erro) => {
  console.error("Erro ao criar admin:", erro.message);
  process.exit(1);
});