document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("sidebar-container");
  if (!container) return;

  fetch("components/sidebar.html")
    .then((res) => res.text())
    .then((html) => {
      // Insertar sidebar
      container.innerHTML = html;

      // Inicializar sidebar (si existe)
      if (typeof iniciarSidebar === "function") {
        iniciarSidebar();
      }

      // ===============================
      // CARGAR LÓGICA DE MENÚ (PERMISOS)
      // ===============================
      const scriptMenu = document.createElement("script");
      scriptMenu.src = "logicajs/menu.js";
      document.body.appendChild(scriptMenu);
    })
    .catch((err) => console.error("Error cargando sidebar:", err));
});
