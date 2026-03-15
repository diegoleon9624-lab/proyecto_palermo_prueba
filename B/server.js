require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
// servir archivos del frontend
app.use(express.static(path.join(__dirname, "../F")));

app.use(cors());
app.use(express.json());


// 🔍 prueba base
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../F/index.html"));
});

// 🔥 IMPORTAR RUTAS
const usuariosRoutes = require("./routes/usuarios.routes");
const clientesRoutes = require("./routes/clientes.routes");
const productosRoutes = require("./routes/productos.routes");
const facturasRoutes = require("./routes/facturas.routes");
const facturasPdfRoutes = require("./routes/facturas.pdf.routes");
const busquedaRoutes = require("./routes/busqueda.routes");
const eliminarRoutes = require("./routes/eliminar.routes");
const registrosRoutes = require("./routes/registros.routes");
const loginRoutes = require("./routes/login.routes");





// 🔥 USAR RUTAS (ESTO ES LO CRÍTICO)
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/facturas", facturasRoutes);
app.use("/api/facturas", facturasPdfRoutes);
app.use("/api/busqueda", busquedaRoutes);
app.use("/api/eliminar", eliminarRoutes);
app.use("/api/registros", registrosRoutes);
app.use("/api/login", loginRoutes);


// 🔥 SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
