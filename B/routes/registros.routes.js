const express = require("express");
const router = express.Router();
const db = require("../config/db");

// =====================================================
// 📋 LISTAR / BUSCAR REGISTROS (USUARIOS / CLIENTES)
// =====================================================
router.post("/", async (req, res) => {
  try {
    const { tipo, identificacion } = req.body;

    if (!tipo) {
      return res.status(400).json({ error: "Tipo no enviado" });
    }

    let sql = "";
    let params = [];

    // ===============================
    // USUARIOS
    // ===============================
    if (tipo === "usuario") {
      if (identificacion) {
        sql = `
          SELECT
            id_usuario,
            nombres,
            apellidos,
            cedula,
            correo,
            rol
          FROM usuario
          WHERE cedula = ?
        `;
        params = [identificacion];
      } else {
        sql = `
          SELECT
            id_usuario,
            nombres,
            apellidos,
            cedula,
            correo,
            rol
          FROM usuario
        `;
      }
    }

    // ===============================
    // CLIENTES
    // ===============================
    if (tipo === "cliente") {
      if (identificacion) {
        sql = `
          SELECT
            id_cliente,
            nombres,
            apellidos,
            cedula_o_nit,
            correo,
            tipo_cliente
          FROM cliente
          WHERE cedula_o_nit = ?
        `;
        params = [identificacion];
      } else {
        sql = `
          SELECT
            id_cliente,
            nombres,
            apellidos,
            cedula_o_nit,
            correo,
            tipo_cliente
          FROM cliente
        `;
      }
    }

    if (!sql) {
      return res.status(400).json({ error: "Tipo no válido" });
    }

    const [rows] = await db.query(sql, params);

    res.json({ data: rows });

  } catch (error) {
    console.error("ERROR REGISTROS:", error);
    res.status(500).json({ error: "Error al obtener registros" });
  }
});

// =====================================================
// 🔍 OBTENER UN REGISTRO POR ID (MODIFICAR / ELIMINAR)
// =====================================================
router.get("/:tipo/:id", async (req, res) => {
  try {
    const { tipo, id } = req.params;

    let sql = "";
    let params = [id];

    // ===============================
    // USUARIO
    // ===============================
    if (tipo === "usuario") {
      sql = `
        SELECT *
        FROM usuario
        WHERE id_usuario = ?
        LIMIT 1
      `;
    }

    // ===============================
    // CLIENTE
    // ===============================
    else if (tipo === "cliente") {
      sql = `
        SELECT *
        FROM cliente
        WHERE id_cliente = ?
        LIMIT 1
      `;
    } else {
      return res.status(400).json({ error: "Tipo no válido" });
    }

    const [rows] = await db.query(sql, params);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Registro no encontrado" });
    }

    res.json({ data: rows[0] });

  } catch (error) {
    console.error("ERROR REGISTRO POR ID:", error);
    res.status(500).json({ error: "Error al obtener registro" });
  }
});

module.exports = router;
