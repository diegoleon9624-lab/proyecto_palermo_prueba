console.log("busqueda.js cargado");

// ===============================
// ELEMENTOS
// ===============================
const filtro = document.getElementById("filtro_tipo");
const btnBuscar = document.getElementById("btnBuscar");
const btnGuardar = document.getElementById("btnGuardar");
const btnLimpiar = document.getElementById("btnLimpiar");
const tituloModulo = document.getElementById("titulo-modulo");

const campos = document.querySelectorAll(".uc-input");

let registroActual = null;
let tipoActual = filtro.value;

// ===============================
// PLACEHOLDERS ORIGINALES (CLAVE)
// ===============================
const placeholdersIniciales = {};
campos.forEach((campo) => {
  if (campo.placeholder) {
    placeholdersIniciales[campo.id] = campo.placeholder;
  }
});

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
// UI
// ===============================
function actualizarTitulo(tipo) {
  tituloModulo.textContent =
    tipo === "cliente"
      ? "MODIFICAR CLIENTES"
      : "MODIFICAR USUARIOS";
}

function ajustarCamposPorTipo(tipo) {
  campos.forEach((campo) => {
    if (campo.id === "filtro_tipo") return;

    const aplicaA = campo.dataset.tipo;

    campo.style.display =
      !aplicaA || aplicaA === tipo ? "" : "none";
  });
}

// ===============================
// RESET COMPLETO
// ===============================
function resetPantalla() {
  campos.forEach((campo) => {
    if (campo.id === "filtro_tipo") return;

    if (placeholdersIniciales[campo.id]) {
      campo.placeholder = placeholdersIniciales[campo.id];
    }

    campo.value = "";
    campo.readOnly = false;
    campo.disabled = false;

    if (campo.tagName === "SELECT") {
      campo.selectedIndex = 0;
    }
  });

  registroActual = null;
  ajustarCamposPorTipo(tipoActual);
  validarCupo();
}

// ===============================
// VALIDACIONES
// ===============================
function validarCupo() {
  const tipoCliente = document.getElementById("tipo_cliente");
  const cupo = document.getElementById("cupo");

  if (!tipoCliente || !cupo) return;

  cupo.disabled = tipoCliente.value !== "credito";
  if (cupo.disabled) cupo.value = "";
}

// ===============================
// SET CAMPO (BD → PLACEHOLDER)
// ===============================
function setCampo(id, valor, editable = true) {
  const input = document.getElementById(id);
  if (!input) return;

  input.placeholder = valor ?? "";
  input.value = "";
  input.readOnly = !editable;
  input.disabled = !editable;
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

    // COMUNES
    setCampo("nombres", registroActual.nombres, true);
    setCampo("apellidos", registroActual.apellidos, true);
    setCampo("telefono", registroActual.telefono, true);
    setCampo("correo", registroActual.correo, true);

    if (tipo === "cliente") {
      setCampo("cedula_o_nit", registroActual.cedula_o_nit, false);
      setCampo("direccion", registroActual.direccion, true);
      setCampo("cupo", registroActual.cupo, false);

      document.getElementById("tipo_cliente").value =
        registroActual.tipo_cliente || "";

      setCampo(
        "fecha_registro_cliente",
        registroActual.fecha_registro,
        false
      );
    }

    if (tipo === "usuario") {
      setCampo("cedula_usuario", registroActual.cedula, false);
      setCampo("rol", registroActual.rol, false);
      setCampo("usuario", registroActual.usuario, false);
      setCampo("contrasena", "", true);
      setCampo("estado", registroActual.estado, true);
    }

    ajustarCamposPorTipo(tipo);
    validarCupo();
    actualizarTitulo(tipo);

  } catch (error) {
    console.error(error);
    alert("❌ Error al cargar registro");
  }
}

// ===============================
// EVENTOS
// ===============================
filtro.addEventListener("change", (e) => {
  const nuevoTipo = e.target.value;

  if (
    !confirm(
      `Vas a cambiar a MODIFICAR ${nuevoTipo.toUpperCase()}.\n¿Estás seguro?`
    )
  ) {
    filtro.value = tipoActual;
    return;
  }

  tipoActual = nuevoTipo;
  resetPantalla();
  actualizarTitulo(nuevoTipo);
});

btnLimpiar?.addEventListener("click", resetPantalla);

// ===============================
// BUSCAR MANUAL
// ===============================
btnBuscar.addEventListener("click", async () => {
  const identificacion = document
    .getElementById("identificacion")
    .value.trim();

  if (!identificacion) {
    alert("⚠️ Debes ingresar un valor para buscar");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/busqueda/buscar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: tipoActual, identificacion }),
    });

    const data = await res.json();

    if (!res.ok || !data.encontrado) {
      alert("❌ No encontrado");
      return;
    }

    registroActual = data.data;

    // reutilizamos la misma lógica
    cargarPorId(
      tipoActual,
      tipoActual === "usuario"
        ? registroActual.id_usuario
        : registroActual.id_cliente
    );

  } catch (error) {
    console.error(error);
    alert("❌ Error al buscar");
  }
});

// ===============================
// GUARDAR
// ===============================
btnGuardar.addEventListener("click", async () => {
  if (!registroActual) {
    alert("⚠️ Primero debes buscar");
    return;
  }

  const getValor = (id) => {
    const i = document.getElementById(id);
    return i.value.trim() || i.placeholder.trim();
  };

  let datos = {};

  if (tipoActual === "cliente") {
    datos = {
      nombres: getValor("nombres"),
      apellidos: getValor("apellidos"),
      telefono: getValor("telefono"),
      correo: getValor("correo"),
      direccion: getValor("direccion"),
      cupo: Number(getValor("cupo")) || 0,
    };
  }

  if (tipoActual === "usuario") {
    datos = {
      nombres: getValor("nombres"),
      apellidos: getValor("apellidos"),
      telefono: getValor("telefono"),
      correo: getValor("correo"),
      estado: getValor("estado"),
    };

    const pass = document.getElementById("contrasena").value.trim();
    if (pass) datos.contrasena = pass;
  }

  const id =
    tipoActual === "usuario"
      ? registroActual.id_usuario
      : registroActual.id_cliente;

  try {
    const res = await fetch("http://localhost:3000/api/busqueda/actualizar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: tipoActual, id, datos }),
    });

    if (!res.ok) {
      alert("❌ Error al actualizar");
      return;
    }

    alert("✅ Registro actualizado correctamente");
  } catch (error) {
    console.error(error);
    alert("❌ Error de conexión");
  }
});

// ===============================
// INICIAL
// ===============================
(() => {
  const { tipo, id } = getQueryParams();

  if (tipo && id) {
    filtro.value = tipo;
    tipoActual = tipo;
    cargarPorId(tipo, id);
  } else {
    ajustarCamposPorTipo(tipoActual);
    actualizarTitulo(tipoActual);
  }
})();
