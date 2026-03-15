document.addEventListener("DOMContentLoaded", () => {
  fetch("components/encabezado.html")
    .then(res => {
      if (!res.ok) throw new Error("No se pudo cargar encabezado");
      return res.text();
    })
    .then(html => {
      const contenedor = document.getElementById("header-container");
      if (contenedor) {
        contenedor.innerHTML = html;
      }
    })
    .catch(err => console.error("ERROR HEADER:", err));
});
