const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ===============================
// GET /api/productos (listar / buscar)
// ===============================
router.get("/", async (req, res) => {
  const { codigo, nombre, categoria } = req.query;

  let sql = "SELECT * FROM productos WHERE 1=1";
  const params = [];

  if (codigo) {
    sql += " AND codigo LIKE ?";
    params.push(`%${codigo}%`);
  }

  if (nombre) {
    sql += " AND nombre_producto LIKE ?";
    params.push(`%${nombre}%`);
  }

  if (categoria) {
    sql += " AND categoria = ?";
    params.push(categoria);
  }

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("ERROR MYSQL:", error.message);
    res.status(500).json({
      error: "Error al obtener productos",
      detalle: error.message
    });
  }
});

// ===============================
// POST /api/productos (registrar)
// ===============================
router.post("/", async (req, res) => {
  console.log("📥 BODY RECIBIDO:", req.body);

  const {
    codigo,
    nombre,
    categoria,
    ubicacion,
    unidad,
    cantidad,
    precio_compra,
    precio_venta
  } = req.body;

  // 🔧 Normalizar valores según la BD
  const estado = Number(cantidad) > 0 ? "disponible" : "agotado";

  // Ajustar unidad a ENUM permitido
  const unidad_medida = unidad === "KG" ? "KG" : "UND";

  try {
    const [result] = await db.query(
      `INSERT INTO productos
      (codigo, nombre_producto, categoria, ubicacion, unidad_medida, stock, precio_compra, precio_venta, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo,
        nombre,
        categoria,
        ubicacion,
        unidad_medida,
        cantidad,
        precio_compra,
        precio_venta,
        estado
      ]
    );

    console.log("✅ INSERT OK:", result);
    res.json({ message: "Producto registrado correctamente" });

  } catch (error) {
    console.error("❌ ERROR INSERT:", error.message);
    res.status(500).json({
      error: "Error registrando producto",
      detalle: error.message
    });
  }
});
// ===============================
// PUT /api/productos/:id (editar)
// ===============================
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    categoria,
    ubicacion,
    unidad,
    precio_compra,
    precio_venta
  } = req.body;

  try {
    await db.query(
      `UPDATE productos
       SET nombre_producto = ?,
           categoria = ?,
           ubicacion = ?,
           unidad_medida = ?,
           precio_compra = ?,
           precio_venta = ?
       WHERE id_producto = ?`,
      [
        nombre,
        categoria,
        ubicacion,
        unidad,
        precio_compra,
        precio_venta,
        id
      ]
    );

    res.json({ message: "Producto actualizado correctamente" });

  } catch (error) {
    console.error("❌ ERROR UPDATE:", error.message);
    res.status(500).json({ error: "Error actualizando producto" });
  }
});
// ===============================
// DELETE /api/productos/:id (eliminar real)
// ===============================
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 🔎 Verificar si tiene movimientos
    const [movs] = await db.query(
      "SELECT COUNT(*) AS total FROM movimientos_inventario WHERE id_producto = ?",
      [id]
    );

    // 🔎 Verificar si tiene ventas
    const [ventas] = await db.query(
      "SELECT COUNT(*) AS total FROM detalle_factura WHERE id_producto = ?",
      [id]
    );

    if (movs[0].total > 0 || ventas[0].total > 0) {
      return res.status(400).json({
        error: "No se puede eliminar: el producto tiene movimientos o ventas"
      });
    }

    // 🗑 Eliminar producto
    await db.query(
      "DELETE FROM productos WHERE id_producto = ?",
      [id]
    );

    res.json({ message: "Producto eliminado definitivamente" });

  } catch (error) {
    console.error("❌ ERROR DELETE:", error.message);
    res.status(500).json({ error: "Error eliminando producto" });
  }
});

// ===============================
// PUT /api/productos/stock/:id
// ===============================
router.put("/stock/:id", async (req, res) => {
  const { id } = req.params;
  const { stockFinal } = req.body;

  // Validación básica
  if (typeof stockFinal !== "number") {
    return res.status(400).json({ error: "Stock inválido" });
  }

  try {
    const [producto] = await db.query(
      "SELECT stock FROM productos WHERE id_producto = ?",
      [id]
    );

    if (producto.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    if (stockFinal < 0) {
      return res.status(400).json({ error: "Stock insuficiente" });
    }

    await db.query(
      "UPDATE productos SET stock = ? WHERE id_producto = ?",
      [stockFinal, id]
    );

    res.json({
      message: "Stock actualizado correctamente",
      stockFinal,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error actualizando stock" });
  }
});



// ⚠️ EXPORTAR SIEMPRE AL FINAL
module.exports = router;
