const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/db");

// ======================================================
// LOGIN
// ======================================================
router.post("/", async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const [rows] = await db.query(
      `
      SELECT id_usuario, usuario, contrasena, rol, nombres, apellidos
      FROM usuario
      WHERE usuario = ?
      AND estado = 'activo'
      LIMIT 1
      `,
      [usuario]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    const user = rows[0];

    const match = await bcrypt.compare(contrasena, user.contrasena);

    if (!match) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    res.json({
      ok: true,
      id_usuario: user.id_usuario,
      usuario: user.usuario,
      rol: user.rol,
      nombre: `${user.nombres} ${user.apellidos}`
    });

  } catch (error) {
    console.error("❌ Error en login:", error.message);
    res.status(500).json({ error: "Error del servidor" });
  }
});

module.exports = router;
