function iniciarSidebar() {
  // 🔥 RESTAURAR ESTADO DEL SIDEBAR (EXCEPTO EN MENU PRINCIPAL)
  const esMenuPrincipal = window.location.pathname.includes("Menu_principal");

  if (!esMenuPrincipal && localStorage.getItem("sidebar") === "min") {
    document.body.classList.add("sidebar-minimizada");
  }

  // 🔥 2. ABRIR / CERRAR SUBMENÚS
  document.querySelectorAll(".menu .item > a").forEach((link) => {
    link.addEventListener("click", (e) => {
      const item = link.parentElement;
      const submenu = item.querySelector(".submenu, .submenu-dos");

      if (!submenu) return;

      e.preventDefault();

      document
        .querySelectorAll(".menu .item.open")
        .forEach((i) => i !== item && i.classList.remove("open"));

      item.classList.toggle("open");
    });
  });

  // 🔥 3. CLICK EN SUBMENÚ → GUARDAR ESTADO MINIMIZADO
  document.querySelectorAll(".submenu a, .submenu-dos a").forEach((link) => {
    link.addEventListener("click", () => {
      localStorage.setItem("sidebar", "min");
    });
  });

  // 🔥 4. CLICK EN MENÚ PRINCIPAL → RESTAURAR NORMAL
  const menuPrincipal = document.querySelector(
    '.menu > .item > a[href*="Menu_principal"]'
  );

  if (menuPrincipal) {
    menuPrincipal.addEventListener("click", () => {
      localStorage.removeItem("sidebar");
      document.body.classList.remove("sidebar-minimizada");
    });
  }
  const sidebar = document.querySelector(".sidebar");

  if (sidebar) {
    sidebar.addEventListener("mouseenter", () => {
      document.body.classList.add("sidebar-hover");
    });

    sidebar.addEventListener("mouseleave", () => {
      document.body.classList.remove("sidebar-hover");
    });
  }
}
