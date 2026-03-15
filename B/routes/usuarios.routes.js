const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");

// ===============================
// REGISTRAR USUARIO
// ===============================
router.post("/", async (req, res) => {
  try {
    const {
      nombres,
      apellidos,
      cedula,
      correo,
      rol,
      usuario,
      contrasena,
      telefono,
      estado,
    } = req.body;

    // ===============================
    // VALIDACIONES BÁSICAS
    // ===============================
    if (!nombres || !apellidos || !cedula || !usuario || !contrasena || !rol || !estado) {
      return res.status(400).json({
        error: "Campos obligatorios incompletos",
      });
    }

    // ===============================
    // VALIDAR DUPLICADOS
    // ===============================
    const [existe] = await db.query(
      `SELECT id_usuario 
       FROM usuario 
       WHERE usuario = ? OR correo = ? OR cedula = ?`,
      [usuario, correo, cedula]
    );

    if (existe.length > 0) {
      return res.status(400).json({
        error: "El usuario, correo o cédula ya existe",
      });
    }

    // ===============================
    // ENCRIPTAR CONTRASEÑA
    // ===============================
    const hash = await bcrypt.hash(contrasena, 10);

    // ===============================
    // INSERTAR USUARIO
    // ===============================
    await db.query(
      `INSERT INTO usuario
       (nombres, apellidos, cedula, correo, rol, usuario, contrasena, telefono, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombres,
        apellidos,
        cedula,
        correo || "",
        rol,
        usuario,
        hash,
        telefono || null,
        estado,
      ]
    );

    res.json({
      message: "Usuario registrado correctamente",
    });

  } catch (error) {
    console.error("❌ ERROR USUARIO:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

module.exports = router;
