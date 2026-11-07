const express = require("express");
const { autenticar } = require("../middlewares/authMiddleware");
const { listarTags } = require("../controllers/catalogoController");

const router = express.Router();

router.get("/tags", autenticar, listarTags);

module.exports = router;