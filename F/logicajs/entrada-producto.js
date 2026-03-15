// ===============================
// ENTRADA / SALIDA DE PRODUCTOS
// ===============================

// FUNCIÓN ÚNICA PARA CALCULAR STOCK
function calcularStockFinal(stockInicial, cantidad, tipo, tipoAjuste) {
  let resultado = stockInicial;

  if (tipo === "Compra" || tipo === "Devolución") {
    resultado += cantidad;
  } else if (tipo === "Venta" || tipo === "Mermas" || tipo === "Perdidas") {
    resultado -= cantidad;
  } else if (tipo === "Ajuste") {
    if (!tipoAjuste) return null;
    resultado += tipoAjuste === "sumar" ? cantidad : -cantidad;
  }

  return resultado;
}

// ===============================
// VARIABLES
// ===============================
let productos = [];
let productoSeleccionado = null;
let confirmando = false;
let stockActualNumerico = 0;
// ===============================
// CARGAR PRODUCTOS DESDE BD
// ===============================
async function cargarProductos() {
  try {
    const res = await fetch("http://localhost:3000/api/productos");
    productos = await res.json();
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

cargarProductos();

// ===============================
// SELECTORES
// ===============================
const buscarInput = document.querySelector(".input-search input");
const listaProductos = document.querySelector(".lista-productos");
const cantidadInput = document.querySelector(
  ".entrada-form input[type='number']"
);
const btnGuardar = document.getElementById("btn-guardar");
const btnCancelar = document.getElementById("btn-cancelar");

const estadoActual = document.querySelectorAll(".estado-box")[0];
const estadoNuevo = document.querySelectorAll(".estado-box")[1];

const selectTipo = document.querySelector(".input-select");
const ajusteBox = document.querySelector(".ajuste-tipo");
const ajusteSelect = document.querySelector(".input-ajuste");
const resumenBox = document.querySelector(".resumen-movimiento");

// ===============================
// MOSTRAR ESTADO ACTUAL
// ===============================
function mostrarEstadoActual() {
  estadoActual.innerHTML = `
    <h4 class="estado-title">Estado actual</h4>
    <p><strong>Nombre:</strong> ${productoSeleccionado.nombre_producto}</p>
    <p><strong>Código:</strong> ${productoSeleccionado.codigo}</p>
    <p><strong>Cantidad:</strong> ${stockActualNumerico}</p>
    <p><strong>Precio:</strong> ${productoSeleccionado.precio_venta}</p>
  `;
}

// ===============================
// CALCULAR NUEVO ESTADO
// ===============================
cantidadInput.addEventListener("input", calcularNuevoEstado);
selectTipo.addEventListener("change", calcularNuevoEstado);
ajusteSelect.addEventListener("change", calcularNuevoEstado);

function calcularNuevoEstado() {
  if (!productoSeleccionado) return;

  const cantidad = Number(cantidadInput.value) || 0;
  const tipo = selectTipo.value;
  const tipoAjuste = tipo === "Ajuste" ? ajusteSelect.value : null;

  if (!tipo) {
    estadoNuevo.innerHTML = `
      <h4 class="estado-title">Nuevo estado</h4>
      <p>Seleccione el tipo de movimiento</p>
    `;
    return;
  }

  const nuevaCantidad = calcularStockFinal(
    stockActualNumerico,
    cantidad,
    tipo,
    tipoAjuste
  );

  if (nuevaCantidad === null) {
    estadoNuevo.innerHTML = `
      <h4 class="estado-title">Nuevo estado</h4>
      <p>Seleccione si el ajuste suma o resta</p>
    `;
    return;
  }

  estadoNuevo.innerHTML = `
    <h4 class="estado-title">Nuevo estado</h4>
    <p><strong>Nombre:</strong> ${productoSeleccionado.nombre_producto}</p>
    <p><strong>Código:</strong> ${productoSeleccionado.codigo}</p>
    <p><strong>Cantidad:</strong> ${nuevaCantidad}</p>
    <p><strong>Precio:</strong> ${productoSeleccionado.precio_venta}</p>
  `;
}

// ===============================
// GUARDAR MOVIMIENTO
// ===============================
btnGuardar.addEventListener("click", async () => {
  if (!productoSeleccionado) {
    alert("Seleccione un producto");
    return;
  }

  const cantidad = Number(cantidadInput.value);
  const tipo = selectTipo.value;
  const tipoAjuste = tipo === "Ajuste" ? ajusteSelect.value : null;

  if (!tipo || cantidad <= 0) {
    alert("Datos inválidos");
    return;
  }

  const stockFinal = calcularStockFinal(
    Number(productoSeleccionado.stock),
    cantidad,
    tipo,
    tipoAjuste
  );

  if (stockFinal === null) {
    alert("Seleccione si el ajuste suma o resta");
    return;
  }

  if (stockFinal < 0) {
    alert("❌ El stock no puede quedar negativo");
    return;
  }

  // PRIMER CLIC → MOSTRAR RESUMEN
  if (!confirmando) {
    document.getElementById("res-nombre").textContent =
      productoSeleccionado.nombre_producto;
    document.getElementById("res-actual").textContent =
      productoSeleccionado.stock + " kg";

    const signo =
      tipo === "Compra" || tipo === "Devolución" || tipoAjuste === "sumar"
        ? "+"
        : "-";

    document.getElementById(
      "res-movimiento"
    ).textContent = `${tipo} (${signo}${cantidad} kg)`;

    document.getElementById("res-final").textContent = stockFinal + " kg";

    resumenBox.style.display = "block";
    btnGuardar.textContent = "CONFIRMAR";
    confirmando = true;
    return;
  }

  // SEGUNDO CLIC → GUARDAR EN BD
  const res = await fetch(
    `http://localhost:3000/api/productos/stock/${productoSeleccionado.id_producto}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockFinal }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  alert("✅ Movimiento realizado correctamente");

  // ✅ ACTUALIZAR STOCK LOCAL
  stockActualNumerico = stockFinal;

  // ✅ REINICIAR FORMULARIO COMPLETO
  resumenBox.style.display = "none";
  btnGuardar.textContent = "GUARDAR";
  confirmando = false;

  buscarInput.value = "";
  cantidadInput.value = "";
  selectTipo.value = "";
  ajusteSelect.value = "";
  ajusteBox.style.display = "none";

  productoSeleccionado = null;
  estadoActual.innerHTML = "<h4 class='estado-title'>Estado actual</h4>";
  estadoNuevo.innerHTML = "<h4 class='estado-title'>Nuevo estado</h4>";
  listaProductos.innerHTML = "";

  await cargarProductos();
});

// ===============================
// CANCELAR
// ===============================
btnCancelar.addEventListener("click", () => {
  resumenBox.style.display = "none";
  btnGuardar.textContent = "GUARDAR";
  confirmando = false;
});

// ===============================
// MOSTRAR AJUSTE SOLO SI ES NECESARIO
// ===============================
selectTipo.addEventListener("change", () => {
  if (selectTipo.value === "Ajuste") {
    ajusteBox.style.display = "block";
  } else {
    ajusteBox.style.display = "none";
    ajusteSelect.value = "";
  }
});

// ===============================
// BÚSQUEDA SELECCIONABLE
// ===============================
buscarInput.addEventListener("input", () => {
  const texto = buscarInput.value.toLowerCase();
  listaProductos.innerHTML = "";

  if (!texto) return;

  const resultados = productos.filter((p) =>
    p.nombre_producto.toLowerCase().includes(texto)
  );

  resultados.forEach((p) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${p.nombre_producto}</strong>
      <small>Código: ${p.codigo} | Stock: ${p.stock}</small>
    `;

    li.classList.add("item-producto");

    li.addEventListener("click", () => {
      productoSeleccionado = p;
      stockActualNumerico = Number(p.stock);
      buscarInput.value = p.nombre_producto;
      listaProductos.innerHTML = "";
      mostrarEstadoActual();
      calcularNuevoEstado();
    });

    listaProductos.appendChild(li);
  });
});
