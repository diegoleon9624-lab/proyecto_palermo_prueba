const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ===============================
// 🔍 BUSCAR USUARIO O CLIENTE
// SOLO POR DOCUMENTO DE IDENTIDAD
// ===============================
router.post("/buscar", async (req, res) => {
  try {
    const { tipo, identificacion } = req.body;

    if (!tipo || !identificacion) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    let sql = "";
    let params = [];

    if (tipo === "usuario") {
      // 🔐 USUARIO → CÉDULA
      sql = `
        SELECT *
        FROM usuario
        WHERE cedula = ?
        LIMIT 1
      `;
      params = [identificacion];

    } else if (tipo === "cliente") {
      // 🔐 CLIENTE → CÉDULA / NIT
      sql = `
        SELECT *
        FROM cliente
        WHERE cedula_o_nit = ?
        LIMIT 1
      `;
      params = [identificacion];

    } else {
      return res.status(400).json({ error: "Tipo no válido" });
    }

    const [rows] = await db.query(sql, params);

    if (rows.length === 0) {
      return res.json({ encontrado: false });
    }

    res.json({
      encontrado: true,
      data: rows[0],
    });

  } catch (error) {
    console.error("ERROR BUSQUEDA:", error);
    res.status(500).json({ error: "Error en búsqueda" });
  }
});

// ===============================
// ✏️ MODIFICAR USUARIO O CLIENTE
// ===============================
router.put("/actualizar", async (req, res) => {
  try {
    const { tipo, id, datos } = req.body;

    if (!tipo || !id || !datos) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    let tabla = "";
    let campoId = "";

    if (tipo === "usuario") {
      tabla = "usuario";
      campoId = "id_usuario";
    } else if (tipo === "cliente") {
      tabla = "cliente";
      campoId = "id_cliente";
    } else {
      return res.status(400).json({ error: "Tipo no válido" });
    }

    const campos = Object.keys(datos)
      .map((c) => `${c} = ?`)
      .join(", ");

    const valores = Object.values(datos);

    const sql = `
      UPDATE ${tabla}
      SET ${campos}
      WHERE ${campoId} = ?
    `;

    await db.query(sql, [...valores, id]);

    res.json({ message: "Registro actualizado correctamente" });

  } catch (error) {
    console.error("ERROR ACTUALIZAR:", error);
    res.status(500).json({ error: "Error al actualizar" });
  }
});

module.exports = router;
