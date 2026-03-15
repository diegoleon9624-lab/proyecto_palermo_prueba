const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ======================================================
// REGISTRAR CLIENTE (YA LO TENÍAS)
// ======================================================
router.post("/", async (req, res) => {
  try {
    const {
      nombres,
      apellidos,
      cedula_o_nit,
      telefono,
      direccion,
      correo,
      tipo_cliente
    } = req.body;

    if (
      !nombres ||
      !apellidos ||
      !cedula_o_nit ||
      !telefono ||
      !direccion ||
      !correo
    ) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const sql = `
      INSERT INTO cliente
      (nombres, apellidos, cedula_o_nit, telefono, direccion, correo, tipo_cliente)
      VALUES (?,?,?,?,?,?,?)
    `;

    await db.query(sql, [
      nombres,
      apellidos,
      cedula_o_nit,
      telefono,
      direccion,
      correo,
      tipo_cliente || "contado"
    ]);

    res.json({ message: "Cliente registrado correctamente" });

  } catch (error) {
    console.error("ERROR REGISTRO CLIENTE:", error);
    res.status(500).json({ error: "Error registrando cliente" });
  }
});

// ======================================================
// 🔍 BUSCAR CLIENTES (FACTURACIÓN ELECTRÓNICA)
// ======================================================
router.get("/", async (req, res) => {
  try {
    const { documento, nombre } = req.query;

    let sql = `
      SELECT
        id_cliente,
        CONCAT(nombres, ' ', apellidos) AS nombre,
        cedula_o_nit AS documento,
        telefono,
        direccion,
        correo AS email,
        tipo_cliente
      FROM cliente
    `;
    let params = [];

    if (documento) {
      sql += " WHERE cedula_o_nit = ?";
      params.push(documento);
    } else if (nombre) {
      sql += " WHERE CONCAT(nombres, ' ', apellidos) LIKE ?";
      params.push(`%${nombre}%`);
    }

    const [rows] = await db.query(sql, params);
    res.json(rows);

  } catch (error) {
    console.error("ERROR BUSCAR CLIENTES:", error);
    res.status(500).json({ error: "Error buscando clientes" });
  }
});

module.exports = router;
