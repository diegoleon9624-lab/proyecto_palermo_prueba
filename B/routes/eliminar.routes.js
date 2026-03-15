const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 🗑️ ELIMINAR USUARIO O CLIENTE
router.delete("/:tipo/:id", async (req, res) => {
  try {
    const { tipo, id } = req.params;

    if (!tipo || !id) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    let tabla = "";
    let campoId = "";

    // ===============================
    // USUARIO
    // ===============================
    if (tipo === "usuario") {
      tabla = "usuario";
      campoId = "id_usuario";

      // 🔐 BLOQUEAR ADMIN PRINCIPAL
      const [admin] = await db.query(
        "SELECT rol FROM usuario WHERE id_usuario = ?",
        [id]
      );

      if (admin.length && admin[0].rol === "admin") {
        return res.status(403).json({
          error: "No se puede eliminar el administrador principal",
        });
      }
    }

    // ===============================
    // CLIENTE
    // ===============================
    else if (tipo === "cliente") {
      tabla = "cliente";
      campoId = "id_cliente";
    }

    // ===============================
    // VALIDACIÓN FINAL
    // ===============================
    else {
      return res.status(400).json({ error: "Tipo no válido" });
    }

    // ===============================
    // ELIMINAR
    // ===============================
    const sql = `
      DELETE FROM ${tabla}
      WHERE ${campoId} = ?
    `;

    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Registro no encontrado" });
    }

    res.json({
      message: "Registro eliminado correctamente",
    });

  } catch (error) {
    console.error("ERROR ELIMINAR:", error);
    res.status(500).json({ error: "Error al eliminar" });
  }
});

module.exports = router;
