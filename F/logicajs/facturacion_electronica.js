// =========================================================
// FACTURACIÓN ELECTRÓNICA
// Solo para: Facturacion_electronica.html
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("factura-electronica-body")) return;

  const $ = (id) => document.getElementById(id);

  const fmtCOP = (n) =>
    Number(n || 0).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    });

  let productos = [];
  let productoActual = null; // ← CLAVE para autocompletar

  // ======================================================
  // SUBTOTAL EN VIVO
  // ======================================================
  function subtotalEnVivo() {
    const cant = Number($("cantidad-producto")?.value || 0);
    const precio = Number($("precio-unitario")?.value || 0);
    const sub = cant * precio;
    $("subtotal").value = sub > 0 ? fmtCOP(sub) : "";
  }

  // ======================================================
  // AUTOCARGA PRODUCTO POR CÓDIGO (IGUAL QUE POS)
  // ======================================================
  $("codigo-producto").addEventListener("blur", () => {
    const codigo = $("codigo-producto").value.trim();
    if (codigo) buscarProductoPorCodigo(codigo);
  });

  async function buscarProductoPorCodigo(codigo) {
    try {
      const res = await fetch(
        `/api/productos?codigo=${codigo}`,
      );
      const data = await res.json();

      if (!data.length) {
        alert("Producto no encontrado");
        limpiarProducto();
        return;
      }

      const p = data[0];
      productoActual = p;

      $("nombre-producto").value = p.nombre_producto;
      $("precio-unitario").value = p.precio_venta;
      $("unidad-producto").value = p.unidad_medida.toUpperCase();
      $("cantidad-producto").value = 1;

      subtotalEnVivo();
    } catch (error) {
      console.error("Error buscando producto:", error);
    }
  }

  // ======================================================
  // TABLA
  // ======================================================
  function renderTabla() {
    const tbody = $("lista-productos");
    tbody.innerHTML = "";

    productos.forEach((p, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.codigo}</td>
        <td>${p.nombre}</td>
        <td>${p.cantidad}</td>
        <td>${fmtCOP(p.precio)}</td>
        <td>${p.unidad}</td>
        <td>${fmtCOP(p.subtotal)}</td>
        <td>
          <button class="btn-eliminar" data-i="${i}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".btn-eliminar").forEach((btn) => {
      btn.addEventListener("click", () => {
        productos.splice(btn.dataset.i, 1);
        renderTabla();
        recalcularTotales();
      });
    });
  }

  // ======================================================
  // TOTALES + CAMBIO
  // ======================================================
  function recalcularTotales() {
    const total = productos.reduce((s, p) => s + p.subtotal, 0);
    $("subtotal-total").textContent = fmtCOP(total);
    $("total-final").textContent = fmtCOP(total);
    recalcularCambio();
  }

  function recalcularCambio() {
    const plazo = Number($("plazo-dias").value || 0);
    if (plazo > 0) return;

    const total = productos.reduce((s, p) => s + p.subtotal, 0);
    const tipo = document.querySelector(
      'input[name="tipoPago"]:checked',
    )?.value;

    const ef = Number($("monto-efectivo").value || 0);
    const el = Number($("monto-electronico").value || 0);

    let cambio = 0;
    if (tipo === "EFECTIVO") cambio = ef - total;
    if (tipo === "MIXTO") cambio = ef + el - total;

    $("cambio").value =
      tipo === "EFECTIVO" || tipo === "MIXTO"
        ? fmtCOP(Math.max(cambio, 0))
        : "";
  }

  // ======================================================
  // UI PAGO
  // ======================================================
  function syncPagoUI() {
    const tipo = document.querySelector(
      'input[name="tipoPago"]:checked',
    )?.value;

    $("pago-efectivo").style.display = tipo === "ELECTRONICO" ? "none" : "grid";
    $("pago-electronico").style.display = tipo === "EFECTIVO" ? "none" : "grid";

    recalcularCambio();
  }

  // ======================================================
  // CRÉDITO VS CONTADO
  // ======================================================
  function syncCreditoUI() {
    const plazo = Number($("plazo-dias").value || 0);
    const radiosPago = document.querySelector(".facte-radio");

    if (plazo > 0) {
      if (radiosPago) radiosPago.style.display = "none";
      $("pago-efectivo").style.display = "none";
      $("pago-electronico").style.display = "none";
      $("monto-efectivo").value = "";
      $("monto-electronico").value = "";
      $("cambio").value = "";
    } else {
      if (radiosPago) radiosPago.style.display = "flex";
      syncPagoUI();
    }
  }

  // ======================================================
  // AGREGAR PRODUCTO
  // ======================================================
  function agregarProducto() {
    if (!productoActual) {
      alert("Debes ingresar un código de producto válido");
      return;
    }

    const cantidad = Number($("cantidad-producto").value);
    const precio = Number($("precio-unitario").value);

    if (cantidad <= 0 || precio <= 0) {
      alert("Cantidad o precio inválido");
      return;
    }

    productos.push({
      id_producto: productoActual.id_producto,
      codigo: productoActual.codigo,
      nombre: productoActual.nombre_producto,
      cantidad,
      precio,
      unidad: $("unidad-producto").value,
      subtotal: cantidad * precio,
    });

    renderTabla();
    recalcularTotales();
    limpiarProducto();
  }

  function limpiarProducto() {
    productoActual = null;
    $("codigo-producto").value = "";
    $("nombre-producto").value = "";
    $("cantidad-producto").value = "";
    $("precio-unitario").value = "";
    $("subtotal").value = "";
    $("codigo-producto").focus();
  }

  // ======================================================
  // FACTURAR (SIMULADO)
  // ======================================================
  function facturar() {
    if (!productos.length) {
      alert("No hay productos en la factura");
      return;
    }

    const plazo = Number($("plazo-dias").value || 0);

    alert(
      plazo > 0
        ? `Factura electrónica a CRÉDITO (${plazo} días)`
        : "Factura electrónica de CONTADO",
    );

    productos = [];
    renderTabla();
    recalcularTotales();
    $("plazo-dias").value = 0;
    syncCreditoUI();
  }

  // ======================================================
  // EVENTOS
  // ======================================================
  $("cantidad-producto").addEventListener("input", subtotalEnVivo);
  $("precio-unitario").addEventListener("input", subtotalEnVivo);
  $("btnAgregarProducto").addEventListener("click", agregarProducto);
  $("btnEnviarDian").addEventListener("click", facturar);

  document
    .querySelectorAll('input[name="tipoPago"]')
    .forEach((r) => r.addEventListener("change", syncPagoUI));

  $("monto-efectivo").addEventListener("input", recalcularCambio);
  $("monto-electronico").addEventListener("input", recalcularCambio);
  $("plazo-dias").addEventListener("input", syncCreditoUI);

  syncPagoUI();
  syncCreditoUI();
  recalcularTotales();

  // ======================================================
  // MODAL BUSCAR PRODUCTO POR NOMBRE (NO TOCADO)
  // ======================================================
  const modalProductos = document.getElementById("modal-productos");
  const inputBuscarProducto = document.getElementById("buscar-producto-nombre");
  const listaModalProductos = document.getElementById("lista-productos-modal");

  $("nombre-producto").addEventListener("focus", () => {
    modalProductos.style.display = "block";
    inputBuscarProducto.value = "";
    listaModalProductos.innerHTML = "";
    inputBuscarProducto.focus();
  });

  document
    .getElementById("cerrar-modal-productos")
    .addEventListener("click", () => {
      modalProductos.style.display = "none";
    });

  inputBuscarProducto.addEventListener("input", async () => {
    const texto = inputBuscarProducto.value.trim();
    listaModalProductos.innerHTML = "";

    if (texto.length < 2) return;

    const res = await fetch(
      `/api/productos?nombre=${texto}`,
    );
    const data = await res.json();

    data.forEach((p) => {
      const li = document.createElement("li");
      li.textContent = `${p.nombre_producto} - ${fmtCOP(p.precio_venta)}`;

      li.addEventListener("click", () => {
        productoActual = p;

        $("codigo-producto").value = p.codigo;
        $("nombre-producto").value = p.nombre_producto;
        $("precio-unitario").value = p.precio_venta;
        $("unidad-producto").value = p.unidad_medida.toUpperCase();
        $("cantidad-producto").value = 1;

        subtotalEnVivo();
        modalProductos.style.display = "none";
      });

      listaModalProductos.appendChild(li);
    });
  });

  // ======================================================
  // CLIENTE POR CÉDULA / NIT
  // ======================================================
  let clienteActual = null;

  $("doc-cliente").addEventListener("blur", () => {
    const doc = $("doc-cliente").value.trim();
    if (doc) buscarClientePorDocumento(doc);
  });

  async function buscarClientePorDocumento(documento) {
    try {
      const res = await fetch(
        `/api/clientes?documento=${documento}`,
      );
      const data = await res.json();

      if (!data.length) {
        alert("Cliente no encontrado");
        limpiarCliente();
        return;
      }

      cargarCliente(data[0]);
    } catch (error) {
      console.error("Error buscando cliente:", error);
    }
  }


  function cargarCliente(c) {
  console.log("CLIENTE RECIBIDO:", c);
  clienteActual = c;

  const documento = c.cedula_o_nit || c.documento || "";
  const nombreCompleto =
    c.nombre || `${c.nombres || ""} ${c.apellidos || ""}`.trim();

  $("doc-cliente").value = documento;
  $("nombre-cliente").value = nombreCompleto;
  $("tel-cliente").value = c.telefono || "";
  $("dir-cliente").value = c.direccion || "";
  $("correo-cliente").value = c.correo || c.email || "";

  const tipoCliente = (c.tipo_cliente || "").toLowerCase();

  $("tipo-cliente").value = tipoCliente
    ? tipoCliente.toUpperCase()
    : "";

  // 👇 CONTENEDOR VISUAL DEL PLAZO
  const contenedorPlazo = document.querySelector(".facte-plazo");

  if (tipoCliente === "contado") {
    $("plazo-dias").value = 0;
    $("plazo-dias").disabled = true;
    if (contenedorPlazo) contenedorPlazo.style.display = "none";
  } else {
    $("plazo-dias").disabled = false;
    if (contenedorPlazo) contenedorPlazo.style.display = "block";
  }

  syncCreditoUI();
}



  function limpiarCliente() {
    clienteActual = null;
    $("nombre-cliente").value = "";
    $("tel-cliente").value = "";
    $("dir-cliente").value = "";
    $("correo-cliente").value = "";

    // CAMBIO ÚNICO
    $("tipo-cliente").value = "";
    $("plazo-dias").disabled = false;
  }

  // ======================================================
  // MODAL BUSCAR CLIENTE POR NOMBRE (NO TOCADO)
  // ======================================================
  const modalClientes = document.getElementById("modal-clientes");
  const inputBuscarCliente = document.getElementById("buscar-cliente-nombre");
  const listaClientesModal = document.getElementById("lista-clientes-modal");

  $("nombre-cliente").addEventListener("focus", () => {
    modalClientes.style.display = "block";
    inputBuscarCliente.value = "";
    listaClientesModal.innerHTML = "";
    inputBuscarCliente.focus();
  });

  document
    .getElementById("cerrar-modal-clientes")
    .addEventListener("click", () => {
      modalClientes.style.display = "none";
    });

  inputBuscarCliente.addEventListener("input", async () => {
    const texto = inputBuscarCliente.value.trim();
    listaClientesModal.innerHTML = "";

    if (texto.length < 2) return;

    const res = await fetch(
      `/api/clientes?nombre=${texto}`,
    );
    const data = await res.json();

    data.forEach((c) => {
      const li = document.createElement("li");
      li.textContent = `${c.nombre} - ${c.documento}`;

      li.addEventListener("click", () => {
        modalClientes.style.display = "none";

        // 🔧 evitar que el focus vuelva a abrir el modal
        setTimeout(() => {
          cargarCliente(c);
          $("nombre-cliente").blur();
        }, 0);
      });

      listaClientesModal.appendChild(li);
    });
  });
});
