console.log(" FACTURAS.ROUTES CARGADO - VERSION NUEVA");

const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ======================================================
// GUARDAR FACTURA (POS + CRÉDITO UNIFICADO)
// ======================================================
router.post("/", async (req, res) => {
  const connection = await db.getConnection();

  try {
    const {
      tipo_factura = "POS", // POS | CREDITO
      id_cliente = null, // SOLO obligatorio en crédito
      id_usuario, // usuario logueado
      productos, // [{ id_producto, cantidad, precio }]
    } = req.body;

    // ===============================
    // VALIDACIONES BÁSICAS
    // ===============================
    if (!id_usuario) {
      return res.status(400).json({ error: "Usuario no válido" });
    }

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: "Factura sin productos" });
    }

    if (!["POS", "CREDITO"].includes(tipo_factura)) {
      return res.status(400).json({ error: "Tipo de factura inválido" });
    }

    if (tipo_factura === "CREDITO" && !id_cliente) {
      return res
        .status(400)
        .json({ error: "Factura a crédito requiere cliente" });
    }

    // ===============================
    // CALCULAR TOTAL (BACKEND MANDA)
    // ===============================
    let total_factura = 0;

    for (const p of productos) {
      if (
        !p.id_producto ||
        !p.cantidad ||
        !p.precio ||
        Number(p.cantidad) <= 0 ||
        Number(p.precio) <= 0
      ) {
        return res
          .status(400)
          .json({ error: "Producto inválido en la factura" });
      }

      total_factura += Number(p.cantidad) * Number(p.precio);
    }

    // ===============================
    // ESTADO SEGÚN TIPO
    // ===============================
    const estado = tipo_factura === "POS" ? "PAGADA" : "PENDIENTE";

    await connection.beginTransaction();

    // ===============================
    // NUMERACIÓN SECUENCIAL SEGURA
    // ===============================
    const [[{ next }]] = await connection.query(
      "SELECT IFNULL(MAX(numero_factura),0) + 1 AS next FROM facturas FOR UPDATE",
    );

    // ===============================
    // INSERTAR FACTURA
    // ===============================
    const [facturaResult] = await connection.query(
      `
      INSERT INTO facturas
      (numero_factura, tipo_factura, id_cliente, fecha_emision, total_factura, estado, id_usuario)
      VALUES (?, ?, ?, NOW(), ?, ?, ?)
      `,
      [
        next,
        tipo_factura,
        tipo_factura === "POS" ? null : id_cliente,
        total_factura,
        estado,
        id_usuario,
      ],
    );

    const idFactura = facturaResult.insertId;

    // ======================================================
    // INSERTAR DETALLE + DESCONTAR STOCK (CRÍTICO)
    // ======================================================
    for (const p of productos) {
      // 🔒 BLOQUEAR PRODUCTO
      const [[producto]] = await connection.query(
        `
        SELECT stock
        FROM productos
        WHERE id_producto = ?
        FOR UPDATE
        `,
        [p.id_producto],
      );

      if (!producto) {
        throw new Error(`Producto no existe (ID ${p.id_producto})`);
      }

      if (Number(producto.stock) < Number(p.cantidad)) {
        throw new Error(`Stock insuficiente para producto ID ${p.id_producto}`);
      }

      // ➖ DESCONTAR STOCK
      await connection.query(
        `
        UPDATE productos
        SET stock = stock - ?
        WHERE id_producto = ?
        `,
        [p.cantidad, p.id_producto],
      );

      // 📦 INSERTAR DETALLE
      await connection.query(
        `
        INSERT INTO detalle_factura
        (cantidad, precio_kg_ud, id_factura, id_producto)
        VALUES (?, ?, ?, ?)
        `,
        [p.cantidad, p.precio, idFactura, p.id_producto],
      );
    }

    await connection.commit();

    // ===============================
    // RESPUESTA
    // ===============================
    res.json({
      ok: true,
      id_factura: idFactura,
      numero_factura: next,
      total: total_factura,
      estado,
    });
  } catch (error) {
    await connection.rollback();
    console.error("❌ Error guardando factura:", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// ======================================================
// OBTENER SIGUIENTE NÚMERO DE FACTURA
// ======================================================
router.get("/next", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT IFNULL(MAX(numero_factura), 0) + 1 AS siguiente FROM facturas",
    );

    res.json({
      ok: true,
      numero: rows[0].siguiente,
    });
  } catch (error) {
    console.error("❌ Error obteniendo número de factura:", error.message);
    res.status(500).json({ error: "Error obteniendo número de factura" });
  }
});

// ======================================================
// LISTAR / FILTRAR FACTURAS
// ======================================================
router.get("/", async (req, res) => {
  try {

    const { cliente, fechaInicio, fechaFin, factura } = req.query;

    let sql = `
      SELECT 
        f.numero_factura,
        f.fecha_emision,
        f.total_factura,
        f.estado,
        c.nombres AS cliente,
        u.nombres AS vendedor
      FROM facturas f
      LEFT JOIN cliente c ON f.id_cliente = c.id_cliente
      LEFT JOIN usuario u ON f.id_usuario = u.id_usuario
    `;

    const condiciones = [];
    const valores = [];

    if (cliente) {
      condiciones.push("c.nombre LIKE ?");
      valores.push(`%${cliente}%`);
    }

    if (fechaInicio) {
      condiciones.push("f.fecha_emision >= ?");
      valores.push(fechaInicio);
    }

    if (fechaFin) {
      condiciones.push("f.fecha_emision <= ?");
      valores.push(fechaFin);
    }

    if (factura) {
      condiciones.push("f.numero_factura = ?");
      valores.push(factura);
    }

    if (condiciones.length > 0) {
      sql += " WHERE " + condiciones.join(" AND ");
    }

    const [rows] = await db.query(sql, valores);

    res.json({
      ok: true,
      total: rows.length,
      facturas: rows,
    });

  } catch (error) {
  console.error("🔥 ERROR REAL:", error);
  res.status(500).json({ error: error.message });
  }

  //catch (error) {
    //console.error("Error listando facturas:", error.message);
   // res.status(500).json({ error: "Error listando facturas" });
  //}
  
});


module.exports = router;
