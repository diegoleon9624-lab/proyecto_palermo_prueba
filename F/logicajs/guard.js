// ===============================
// GUARDIA DE ACCESO POR ROL
// ===============================

// 1️⃣ Verificar sesión
const usuario = JSON.parse(sessionStorage.getItem("usuario"));

if (!usuario) {
  alert("Sesión expirada. Inicia sesión nuevamente.");
  window.location.href = "index.html";
}

// 2️⃣ Obtener permiso requerido de la página
const permisoRequerido = document.body.getAttribute("data-permiso");

// Si la página no requiere permiso, salir
if (!permisoRequerido) {
  console.warn("Página sin control de permisos");
} else {
  // 3️⃣ Verificar permiso
  if (typeof tienePermiso !== "function") {
    console.error("roles.js no está cargado");
  } else if (!tienePermiso(permisoRequerido)) {
    alert("No tienes permiso para acceder a esta sección");
    window.location.href = "Menu_principal.html";
  }
}
