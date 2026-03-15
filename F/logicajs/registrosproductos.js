document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("regprod-body")) return;

  const form = document.getElementById("form-registro-producto");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());

    // Validaciones frontend
    if (!data.codigo || !data.nombre) {
      alert("Código y nombre son obligatorios");
      return;
    }

    try {
      const res = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Error registrando producto");
        return;
      }

      alert("✅ Producto registrado correctamente");
      form.reset();

    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor");
    }
  });
});
