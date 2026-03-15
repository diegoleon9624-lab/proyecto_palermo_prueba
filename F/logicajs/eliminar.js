console.log("eliminar.js cargado");

// ===============================
// ELEMENTOS
// ===============================
const filtro = document.getElementById("filtro_tipo");
const btnBuscar = document.getElementById("btnBuscar");
const btnEliminar = document.getElementById("btnEliminar");
const btnLimpiar = document.getElementById("btnLimpiar");
const tituloModulo = document.getElementById("titulo-modulo");

const inputIdentificacion = document.getElementById("identificacion");
const infoEliminar = document.getElementById("info-eliminar");

let registroActual = null;
let tipoActual = filtro.value;

// ===============================
// UTILIDADES URL (NUEVO)
// ===============================
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    tipo: params.get("tipo"),
    id: params.get("id"),
  };
}

// ===============================
// TÍTULO DINÁMICO
// ===============================
function actualizarTitulo(tipo) {
  tituloModulo.textContent =
    tipo === "cliente"
      ? "ELIMINAR CLIENTES"
      : "ELIMINAR USUARIOS";
}

// ===============================
// LIMPIAR PANTALLA
// ===============================
function limpiarPantalla() {
  inputIdentificacion.value = "";

  infoEliminar.innerHTML = `
    <p><b>NOMBRE:</b> —</p>
    <p><b>IDENTIFICACIÓN:</b> —</p>
    <p><b>CORREO:</b> —</p>
    <p><b>ROL / TIPO:</b> —</p>
  `;

  registroActual = null;
}

// ===============================
// MOSTRAR DATOS
// ===============================
function mostrarRegistro(registro) {
  if (tipoActual === "usuario") {
    infoEliminar.innerHTML = `
      <p><b>NOMBRE:</b> ${registro.nombres} ${registro.apellidos}</p>
      <p><b>IDENTIFICACIÓN:</b> ${registro.cedula}</p>
      <p><b>CORREO:</b> ${registro.correo}</p>
      <p><b>ROL:</b> ${registro.rol}</p>
    `;
  }

  if (tipoActual === "cliente") {
    infoEliminar.innerHTML = `
      <p><b>NOMBRE:</b> ${registro.nombres} ${registro.apellidos}</p>
      <p><b>IDENTIFICACIÓN:</b> ${registro.cedula_o_nit}</p>
      <p><b>CORREO:</b> ${registro.correo}</p>
      <p><b>TIPO CLIENTE:</b> ${registro.tipo_cliente}</p>
    `;
  }
}

// ===============================
// CARGAR REGISTRO POR ID (PRO)
// ===============================
async function cargarPorId(tipo, id) {
  try {
    const res = await fetch(
      `http://localhost:3000/api/registros/${tipo}/${id}`
    );

    const json = await res.json();

    if (!res.ok || !json.data) {
      alert("❌ No se pudo cargar el registro");
      return;
    }

    registroActual = json.data;
    mostrarRegistro(registroActual);

  } catch (error) {
    console.error(error);
    alert("❌ Error al cargar registro");
  }
}

// ===============================
// CAMBIO DE FILTRO
// ===============================
filtro.addEventListener("change", (e) => {
  const nuevoTipo = e.target.value;

  if (
    !confirm(
      `Vas a cambiar a ELIMINAR ${nuevoTipo.toUpperCase()}.\n¿Estás seguro?`
    )
  ) {
    filtro.value = tipoActual;
    return;
  }

  tipoActual = nuevoTipo;
  actualizarTitulo(tipoActual);
  limpiarPantalla();

  inputIdentificacion.placeholder =
    tipoActual === "usuario"
      ? "Digita cédula o usuario"
      : "Digita cédula o NIT";
});

// ===============================
// BUSCAR MANUAL
// ===============================
btnBuscar.addEventListener("click", async () => {
  const identificacion = inputIdentificacion.value.trim();

  if (!identificacion) {
    alert("⚠️ Debes ingresar un valor para buscar");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/busqueda/buscar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: tipoActual,
        identificacion,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.encontrado) {
      alert("❌ No encontrado");
      limpiarPantalla();
      return;
    }

    registroActual = data.data;
    mostrarRegistro(registroActual);

  } catch (error) {
    console.error("Error al buscar:", error);
    alert("❌ Error de conexión al buscar");
  }
});

// ===============================
// ELIMINAR
// ===============================
btnEliminar.addEventListener("click", async () => {
  if (!registroActual) {
    alert("⚠️ Primero debes buscar o cargar un registro");
    return;
  }

  if (
    !confirm(
      "⚠️ ESTA ACCIÓN ES IRREVERSIBLE.\n¿Deseas continuar?"
    )
  ) return;

  const id =
    tipoActual === "usuario"
      ? registroActual.id_usuario
      : registroActual.id_cliente;

  try {
    const res = await fetch(
      `http://localhost:3000/api/eliminar/${tipoActual}/${id}`,
      { method: "DELETE" }
    );

    if (!res.ok) {
      alert("❌ Error al eliminar");
      return;
    }

    alert("✅ Registro eliminado correctamente");
    limpiarPantalla();

  } catch (error) {
    console.error("Error al eliminar:", error);
    alert("❌ Error de conexión al eliminar");
  }
});

// ===============================
// BOTÓN LIMPIAR
// ===============================
btnLimpiar.addEventListener("click", limpiarPantalla);

// ===============================
// INICIAL
// ===============================
(() => {
  actualizarTitulo(tipoActual);
  limpiarPantalla();

  const { tipo, id } = getQueryParams();

  if (tipo && id) {
    filtro.value = tipo;
    tipoActual = tipo;
    actualizarTitulo(tipo);
    cargarPorId(tipo, id);
  }
})();
