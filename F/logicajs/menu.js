(() => {
  // ===============================
  // VERIFICAR SESIÓN
  // ===============================
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));

  if (!usuario) {
    window.location.replace("index.html");
    return;
  }

  // ===============================
  // INTERCEPTAR CLICS DEL MENÚ
  // ===============================
  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-permiso]");

    if (!link) return;

    const permiso = link.dataset.permiso;

    // ===============================
    // VALIDAR PERMISO
    // ===============================
    if (!window.tienePermiso || !tienePermiso(permiso)) {
      e.preventDefault();

      alert("No tienes permiso para acceder a esta opción");

      return false;
    }

    // Si tiene permiso → navega normal
  });
})();
