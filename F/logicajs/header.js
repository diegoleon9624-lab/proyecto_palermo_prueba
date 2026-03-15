document.addEventListener("DOMContentLoaded", () => {
  // ===============================
  // PROTEGER LA PÁGINA
  // ===============================
  const usuarioLogueado = JSON.parse(sessionStorage.getItem("usuario"));

  if (!usuarioLogueado) {
    // Si no hay sesión, volver al login
    window.location.href = "index.html";
    return;
  }

  // ===============================
  // MOSTRAR VENDEDOR (esperar a que exista)
  // ===============================
  function mostrarVendedorCuandoExista() {
    const vendedorSpan = document.getElementById("vendedor");

    if (vendedorSpan) {
      vendedorSpan.textContent = usuarioLogueado.nombre;
    } else {
      // volver a intentar hasta que el header esté en el DOM
      setTimeout(mostrarVendedorCuandoExista, 50);
    }
  }

  mostrarVendedorCuandoExista();

  // ===============================
  // FECHA Y HORA EN TIEMPO REAL
  // ===============================
  function actualizarFechaHora() {
    const ahora = new Date();

    const fecha = ahora.toLocaleDateString();
    const hora = ahora.toLocaleTimeString();

    const fechaSpan = document.getElementById("fecha-actual");
    const horaSpan = document.getElementById("hora-actual");

    if (fechaSpan) fechaSpan.textContent = fecha;
    if (horaSpan) horaSpan.textContent = hora;
  }

  // Ejecutar al cargar
  actualizarFechaHora();

  // Actualizar cada segundo
  setInterval(actualizarFechaHora, 1000);

  // ===============================
  // NÚMERO DE FACTURA DESDE BASE DE DATOS
  // ===============================
  async function cargarNumeroFactura() {
    try {
      const response = await fetch("/api/facturas/next");
      const data = await response.json();

      if (data.ok) {
        const numeroFormateado = "FAC-" + String(data.numero).padStart(6, "0");

        const facturaSpan = document.getElementById("numero-factura");
        if (facturaSpan) {
          facturaSpan.textContent = numeroFormateado;
        }
      }
    } catch (error) {
      console.error("Error obteniendo número de factura", error);
    }
  }

  // ===============================
  // MOSTRAR NÚMERO DE FACTURA SOLO EN FACTURACIÓN
  // ===============================
  function mostrarNumeroFacturaCuandoExista() {
    // Verificar si esta página requiere factura
    const modoFactura = document.querySelector(
      "#modo-facturacion[data-factura='true']",
    );

    if (!modoFactura) {
      // No es página de facturación → ocultar el campo
      const facturaItem = document.getElementById("numero-factura");
      if (facturaItem) {
        facturaItem.parentElement.style.display = "none";
      }
      return;
    }

    // Es página de facturación → esperar el elemento
    const facturaSpan = document.getElementById("numero-factura");

    if (facturaSpan) {
      cargarNumeroFactura();
    } else {
      setTimeout(mostrarNumeroFacturaCuandoExista, 50);
    }
  }

  // ===============================
  // CERRAR SESIÓN (LOGOUT)
  // ===============================
  const btnLogout = document.getElementById("btn-logout");

  if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
      // Mostrar confirmación (misma que ya tienes)
      const confirmar = confirm("¿Seguro que deseas salir?");
      if (!confirmar) {
        e.preventDefault();
        return;
      }

      // Borrar sesión
      sessionStorage.removeItem("usuario");

      // Redirigir sin permitir volver atrás
      window.location.replace("index.html");
    });
  }

  mostrarNumeroFacturaCuandoExista();
});
