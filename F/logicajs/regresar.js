// ===============================
// BOTÓN REGRESAR → Menu_principal.html
// FUNCIONA CON HEADER DINÁMICO
// ===============================
document.addEventListener("click", function (e) {
  // Botón regresar del encabezado
  if (e.target.closest(".btn-regresar-header")) {
    e.preventDefault();
    window.location.href = "Menu_principal.html";
  }

  // Botón regresar alterno (si existe en alguna vista)
  if (e.target.closest(".boton-regresar")) {
    e.preventDefault();
    window.location.href = "Menu_principal.html";
  }
});
