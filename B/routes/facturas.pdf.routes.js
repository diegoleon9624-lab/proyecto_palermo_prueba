const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const db = require("../config/db");

router.get("/:id/pdf", async (req, res) => {
  const { id } = req.params;

  const formato = req.query.formato === "termica" ? "termica" : "carta";

  // 🔑 PAGOS VIENEN DEL FRONTEND (NO BD)
  const metodoPago = req.query.metodo || "efectivo";
  const pagoEfectivo = Number(req.query.efectivo || 0);
  const pagoElectronico = Number(req.query.electronico || 0);
  const cambio = Number(req.query.cambio || 0);

  try {
    // ===============================
    // FACTURA + CLIENTE + VENDEDOR
    // ===============================
    const [[factura]] = await db.query(
      `
      SELECT 
        f.numero_factura,
        f.tipo_factura,
        f.fecha_emision,
        f.total_factura,
        IFNULL(CONCAT(c.nombres,' ',c.apellidos), 'CONSUMIDOR FINAL') AS cliente,
        IFNULL(c.cedula_o_nit, 'N/A') AS cedula_o_nit,
        IFNULL(c.direccion, 'N/A') AS direccion,
        CONCAT(u.nombres,' ',u.apellidos) AS vendedor
      FROM facturas f
      LEFT JOIN cliente c ON f.id_cliente = c.id_cliente
      JOIN usuario u ON f.id_usuario = u.id_usuario
      WHERE f.id_factura = ?
      `,
      [id],
    );

    if (!factura) {
      return res.status(404).json({ error: "Factura no encontrada" });
    }

    // ===============================
    // DETALLE DE FACTURA
    // ===============================
    const [detalle] = await db.query(
      `
      SELECT 
        p.codigo,
        p.nombre_producto,
        d.cantidad,
        d.precio_kg_ud
      FROM detalle_factura d
      JOIN productos p ON d.id_producto = p.id_producto
      WHERE d.id_factura = ?
      `,
      [id],
    );

    // ===============================
    // FILAS HTML
    // ===============================
    const filas = detalle
      .map((p) => {
        const subtotal = Number(p.cantidad) * Number(p.precio_kg_ud);
        return `
          <tr>
            <td>${p.codigo}</td>
            <td>${p.nombre_producto}</td>
            <td>${p.cantidad}</td>
            <td>$${Number(p.precio_kg_ud).toFixed(2)}</td>
            <td>$${subtotal.toFixed(2)}</td>
          </tr>
        `;
      })
      .join("");

    // ===============================
    // FECHA EN ESPAÑOL
    // ===============================
    const fechaES = new Date(factura.fecha_emision).toLocaleDateString(
      "es-CO",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      },
    );

    // ===============================
    // DATOS EMPRESA (FIJOS)
    // ===============================
    const EMPRESA = "Carnes Palermo";
    const TELEFONO_EMPRESA = "300 000 0000";
    const DIRECCION_EMPRESA = "Barrio Centro";

    // ===============================
    // LOGO (RUTA LOCAL CORRECTA)
    // ===============================
    const logoBase64 = fs
      .readFileSync(path.join(__dirname, "../pdf/logo.txt"), "utf8")
      .replace(/\s+/g, "");

    const logoPath = `data:image/png;base64,${logoBase64}`;

    // ===============================
    // TEMPLATE
    // ===============================
    const templatePath = path.join(__dirname, "../pdf/factura_template.html");

    let html = fs.readFileSync(templatePath, "utf8");

    html = html
      .replace(/{{LOGO}}/g, logoPath)
      .replace(/{{EMPRESA}}/g, EMPRESA)
      .replace(/{{TELEFONO_EMPRESA}}/g, TELEFONO_EMPRESA)
      .replace(/{{DIRECCION_EMPRESA}}/g, DIRECCION_EMPRESA)
      .replace(/{{TIPO}}/g, factura.tipo_factura)
      .replace(/{{NUMERO}}/g, factura.numero_factura)
      .replace(/{{FECHA_ES}}/g, fechaES)
      .replace(/{{VENDEDOR}}/g, factura.vendedor)
      .replace(/{{CLIENTE}}/g, factura.cliente)
      .replace(/{{DOCUMENTO}}/g, factura.cedula_o_nit)
      .replace(/{{DIRECCION}}/g, factura.direccion)
      .replace(/{{DETALLE}}/g, filas)
      .replace(/{{TOTAL}}/g, Number(factura.total_factura).toFixed(2))
      .replace(/{{METODO_PAGO}}/g, metodoPago.toUpperCase())
      .replace(/{{PAGO_EFECTIVO}}/g, pagoEfectivo.toFixed(2))
      .replace(/{{PAGO_ELECTRONICO}}/g, pagoElectronico.toFixed(2))
      .replace(/{{CAMBIO}}/g, cambio.toFixed(2));

    // ===============================
    // GENERAR PDF
    // ===============================
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // ✅ ÚNICA LÍNEA NUEVA (PERMITE IMÁGENES LOCALES)
    await page.setBypassCSP(true);

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 0,
    });

    const pdf = await page.pdf(
      formato === "termica"
        ? {
            width: "80mm",
            printBackground: true,
            margin: { top: "5mm", bottom: "5mm" },
          }
        : {
            format: "A4",
            printBackground: true,
            margin: { top: "20mm", bottom: "20mm" },
          },
    );

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=factura_${factura.numero_factura}.pdf`,
    });

    res.send(pdf);
  } catch (error) {
    console.error("❌ Error generando PDF:", error);
    res.status(500).json({ error: "Error generando PDF" });
  }
});

module.exports = router;
