document.addEventListener("DOMContentLoaded", () => {
  let productos = [];
  let productoActual = null;

  /* =========================
     REFERENCIAS MODAL
  ========================= */
  const modal = document.getElementById("modal-productos");
  const inputProducto = document.getElementById("producto");
  const inputBuscarModal = document.getElementById("buscar-modal");
  const listaModal = document.getElementById("lista-modal");
  const btnCerrarModal = document.getElementById("cerrar-modal");

  /* =========================
     UTILIDADES
  ========================= */

  function calcularSubtotal() {
    const cantidad = Number(document.getElementById("cantidad").value || 0);
    const precio = Number(document.getElementById("precio").value || 0);
    document.getElementById("subtotal").value =
      `$${(cantidad * precio).toFixed(2)}`;
  }

  function limpiarCamposProducto() {
    document.getElementById("codigo").value = "";
    document.getElementById("producto").value = "";
    document.getElementById("cantidad").value = "1";
    document.getElementById("precio").value = "";
    document.getElementById("unidad").value = "und";
    document.getElementById("subtotal").value = "$0.00";
    productoActual = null;

    modal.style.display = "none";
    inputBuscarModal.value = "";
    listaModal.innerHTML = "";
  }

  function calcularTotales() {
    const total = productos.reduce((s, p) => s + p.cantidad * p.precio, 0);

    document.getElementById("subtotal-total").textContent =
      `$${total.toFixed(2)}`;
    document.getElementById("total-final").textContent = `$${total.toFixed(2)}`;

    calcularCambio();
  }

  /* =========================
     AGREGAR PRODUCTO
  ========================= */

  function agregarProducto() {
    if (!productoActual) {
      alert("Debes seleccionar un producto válido");
      return;
    }

    const cantidad = Number(document.getElementById("cantidad").value);
    const precio = Number(document.getElementById("precio").value);
    const unidad = document.getElementById("unidad").value;

    if (cantidad <= 0 || precio <= 0) {
      alert("Cantidad y precio deben ser mayores a cero");
      return;
    }

    const existente = productos.find(
      (p) => p.id_producto === productoActual.id_producto,
    );

    if (existente) {
      if (existente.cantidad + cantidad > productoActual.stock) {
        alert("Stock insuficiente");
        return;
      }
      existente.cantidad += cantidad;
    } else {
      if (cantidad > productoActual.stock) {
        alert("Stock insuficiente");
        return;
      }

      productos.push({
        id_producto: productoActual.id_producto,
        codigo: productoActual.codigo,
        producto: productoActual.nombre_producto,
        cantidad,
        precio,
        unidad,
      });
    }

    renderTabla();
    calcularTotales();
    limpiarCamposProducto();
    document.getElementById("btn-facturar").disabled = false;
  }

  /* =========================
     TABLA
  ========================= */

  function renderTabla() {
    const tbody = document.getElementById("lista-productos");
    tbody.innerHTML = "";

    productos.forEach((p, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.codigo}</td>
        <td>${p.producto}</td>
        <td>${p.cantidad}</td>
        <td>$${p.precio.toFixed(2)}</td>
        <td>${p.unidad}</td>
        <td>$${(p.cantidad * p.precio).toFixed(2)}</td>
        <td>
          <button class="btn-eliminar" data-index="${i}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".btn-eliminar").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.index);
        productos.splice(index, 1);
        renderTabla();
        calcularTotales();
      });
    });
  }

  /* =========================
     FACTURAR
  ========================= */

  async function procesarFactura() {
    if (productos.length === 0) {
      alert("No hay productos para facturar");
      return;
    }

    const btn = document.getElementById("btn-facturar");
    btn.disabled = true;

    const metodo = document.querySelector(
      'input[name="metodo-pago"]:checked',
    )?.value;

    const total = productos.reduce((s, p) => s + p.cantidad * p.precio, 0);

    const efectivo = Number(
      document.getElementById("efectivo-recibido").value || 0,
    );
    const electronico = Number(
      document.getElementById("monto-electronico").value || 0,
    );

    if (
      (metodo === "efectivo" && efectivo < total) ||
      (metodo === "electronico" && electronico < total) ||
      (metodo === "mixto" && efectivo + electronico < total)
    ) {
      alert("Pago insuficiente");
      btn.disabled = false;
      return;
    }

    const usuario = JSON.parse(sessionStorage.getItem("usuario"));
    let idFactura = null;

    try {
      const res = await fetch("http://localhost:3000/api/facturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_factura: "POS",
          id_cliente: null,
          id_usuario: usuario.id_usuario,
          metodo_pago: metodo,
          productos: productos.map((p) => ({
            id_producto: p.id_producto,
            cantidad: p.cantidad,
            precio: p.precio,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al guardar factura");
        btn.disabled = false;
        return;
      }

      idFactura = data.id_factura;

      alert("Factura procesada correctamente");

      const cambio = Number(
        (document.getElementById("cambio").value || "0").replace("$", ""),
      );

      // 🖨 ABRIR PDF AUTOMÁTICO (TÉRMICA)

      window.open(
        `http://localhost:3000/api/facturas/${idFactura}/pdf` +
          `?formato=termica` +
          `&metodo=${metodo}` +
          `&efectivo=${efectivo}` +
          `&electronico=${electronico}` +
          `&cambio=${cambio}`,
        "_blank",
      );

      // 🧹 LIMPIAR POS
      setTimeout(() => {
        limpiarFacturaCompleta();
      }, 100);
    } catch (error) {
      console.error("Error facturando:", error);
      btn.disabled = false;
    }
  }

  function limpiarFacturaCompleta() {
    // 🧹 limpiar datos en memoria
    productos = [];
    productoActual = null;

    // 🧹 limpiar tabla
    renderTabla();

    // 🧹 limpiar formulario de producto
    limpiarCamposProducto();

    // 🧹 totales
    document.getElementById("subtotal-total").textContent = "$0.00";
    document.getElementById("total-final").textContent = "$0.00";

    // 🧹 pagos
    document.getElementById("efectivo-recibido").value = "";
    document.getElementById("monto-electronico").value = "";
    document.getElementById("cambio").value = "$0.00";

    // 🧹 método de pago
    document
      .querySelectorAll('input[name="metodo-pago"]')
      .forEach((r) => (r.checked = false));

    actualizarMetodoPago();

    // 🧹 botones
    document.getElementById("btn-facturar").disabled = true;
  }

  /* =========================
     CAMBIO Y MÉTODO DE PAGO
  ========================= */

  function calcularCambio() {
    const total = productos.reduce((s, p) => s + p.cantidad * p.precio, 0);

    const efectivo = Number(
      document.getElementById("efectivo-recibido").value || 0,
    );
    const electronico = Number(
      document.getElementById("monto-electronico").value || 0,
    );

    const metodo = document.querySelector(
      'input[name="metodo-pago"]:checked',
    )?.value;

    let cambio = 0;

    if (metodo === "efectivo") cambio = efectivo - total;
    if (metodo === "mixto") cambio = efectivo + electronico - total;

    document.getElementById("cambio").value =
      cambio >= 0 ? `$${cambio.toFixed(2)}` : "$0.00";
  }

  function actualizarMetodoPago() {
    const metodo = document.querySelector(
      'input[name="metodo-pago"]:checked',
    )?.value;

    document.getElementById("grupo-efectivo").style.display =
      metodo === "efectivo" || metodo === "mixto" ? "block" : "none";
    document.getElementById("grupo-electronico").style.display =
      metodo === "electronico" || metodo === "mixto" ? "block" : "none";
    document.getElementById("grupo-cambio").style.display =
      metodo === "efectivo" || metodo === "mixto" ? "block" : "none";
  }

  /* =========================
     BUSCAR POR CÓDIGO ✅
  ========================= */

  async function buscarProductoPorCodigo(codigo) {
    try {
      const res = await fetch(
        `http://localhost:3000/api/productos?codigo=${codigo}`,
      );
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        alert("Producto no encontrado");
        limpiarCamposProducto();
        return;
      }

      productoActual = data[0];
      document.getElementById("producto").value =
        productoActual.nombre_producto;
      document.getElementById("precio").value = productoActual.precio_venta;
      document.getElementById("unidad").value =
        productoActual.unidad_medida.toLowerCase();

      calcularSubtotal();
    } catch (error) {
      console.error("Error buscando por código:", error);
    }
  }

  /* =========================
     BUSQUEDA MODAL POR NOMBRE
  ========================= */

  async function buscarProductosModal(texto) {
    listaModal.innerHTML = "";
    if (!texto) return;

    const res = await fetch(
      `http://localhost:3000/api/productos?nombre=${texto}`,
    );
    const data = await res.json();

    data.forEach((p) => {
      const li = document.createElement("li");
      li.textContent = `${p.nombre_producto} - $${p.precio_venta}`;
      li.addEventListener("click", () => {
        productoActual = p;
        document.getElementById("codigo").value = p.codigo;
        document.getElementById("producto").value = p.nombre_producto;
        document.getElementById("precio").value = p.precio_venta;
        document.getElementById("unidad").value = p.unidad_medida.toLowerCase();

        modal.style.display = "none";
        calcularSubtotal();
      });
      listaModal.appendChild(li);
    });
  }

  /* =========================
     EVENTOS
  ========================= */

  document.getElementById("codigo").addEventListener("blur", () => {
    const codigo = document.getElementById("codigo").value.trim();
    if (codigo) buscarProductoPorCodigo(codigo);
  });

  document
    .getElementById("cantidad")
    .addEventListener("input", calcularSubtotal);
  document.getElementById("precio").addEventListener("input", calcularSubtotal);
  document
    .getElementById("btn-agregar")
    .addEventListener("click", agregarProducto);
  document
    .getElementById("btn-facturar")
    .addEventListener("click", procesarFactura);
  document
    .getElementById("efectivo-recibido")
    .addEventListener("input", calcularCambio);
  document
    .getElementById("monto-electronico")
    .addEventListener("input", calcularCambio);

  inputProducto.addEventListener("focus", () => {
    modal.style.display = "block";
    inputBuscarModal.focus();
  });

  inputBuscarModal.addEventListener("input", () => {
    buscarProductosModal(inputBuscarModal.value.trim());
  });

  btnCerrarModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  document
    .querySelectorAll('input[name="metodo-pago"]')
    .forEach((r) => r.addEventListener("change", actualizarMetodoPago));

  actualizarMetodoPago();
});
