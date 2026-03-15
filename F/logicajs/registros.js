console.log("registros.js cargado");

// ===============================
// ELEMENTOS
// ===============================
const filtro = document.getElementById("filtro_tipo");
const btnBuscar = document.getElementById("btnBuscar");
const inputBuscar = document.getElementById("inputBuscar");
const tablaBody = document.getElementById("tabla-body");
const colExtra = document.getElementById("col-extra");
const tituloModulo = document.getElementById("titulo-modulo");
const subtitulo = document.getElementById("subtitulo-modulo");

let tipoActual = filtro.value;

// ===============================
// ACTUALIZAR TITULOS Y COLUMNA
// ===============================
function actualizarVista(tipo) {
  if (tipo === "cliente") {
    tituloModulo.textContent = "LISTADO DE CLIENTES";
    subtitulo.textContent = "VISTA DE CLIENTES";
    colExtra.textContent = "TIPO CLIENTE";
  } else {
    tituloModulo.textContent = "LISTADO DE USUARIOS";
    subtitulo.textContent = "VISTA DE USUARIOS";
    colExtra.textContent = "ROL";
  }
}

// ===============================
// LIMPIAR TABLA
// ===============================
function limpiarTabla() {
  tablaBody.innerHTML = "";
}

// ===============================
// RENDERIZAR FILAS
// ===============================
function renderFilas(data, tipo) {
  limpiarTabla();

  if (!data || data.length === 0) {
    tablaBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;">Sin registros</td>
      </tr>
    `;
    return;
  }

  data.forEach((item) => {
    const nombre = `${item.nombres} ${item.apellidos}`;
    const identificacion =
      tipo === "cliente" ? item.cedula_o_nit : item.cedula;
    const extra =
      tipo === "cliente" ? item.tipo_cliente : item.rol;

    const idRegistro =
      tipo === "cliente" ? item.id_cliente : item.id_usuario;

    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${nombre}</td>
      <td>${identificacion}</td>
      <td>${item.correo}</td>
      <td>${extra}</td>
      <td>
        <div class="uc-acciones">
          <button
            class="uc-icon-btn btn-editar"
            data-id="${idRegistro}"
            data-tipo="${tipo}"
            title="Editar"
          >✏️</button>
          <button
            class="uc-icon-btn btn-eliminar"
            data-id="${idRegistro}"
            data-tipo="${tipo}"
            title="Eliminar"
          >🗑️</button>
        </div>
      </td>
    `;

    tablaBody.appendChild(fila);
  });

  conectarAcciones();
}

// ===============================
// CONECTAR BOTONES EDITAR / ELIMINAR
// ===============================
function conectarAcciones() {
  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const tipo = btn.dataset.tipo;

      window.location.href = `Modificar_usuario_cliente.html?tipo=${tipo}&id=${id}`;
    });
  });

  document.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const tipo = btn.dataset.tipo;

      window.location.href = `Eliminar_usuario_cliente.html?tipo=${tipo}&id=${id}`;
    });
  });
}

// ===============================
// CARGAR REGISTROS (TODOS O FILTRADOS)
// ===============================
async function cargarRegistros() {
  const identificacion = inputBuscar.value.trim();

  try {
    const res = await fetch("/api/registros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: tipoActual,
        identificacion: identificacion || null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("❌ Error al cargar registros");
      return;
    }

    renderFilas(data.data, tipoActual);

  } catch (error) {
    console.error("Error:", error);
    alert("❌ Error de conexión");
  }
}

// ===============================
// EVENTOS
// ===============================
filtro.addEventListener("change", () => {
  tipoActual = filtro.value;
  actualizarVista(tipoActual);
  inputBuscar.value = "";
  cargarRegistros();
});

btnBuscar.addEventListener("click", () => {
  cargarRegistros();
});

// ===============================
// INICIAL
// ===============================
actualizarVista(tipoActual);
cargarRegistros();
