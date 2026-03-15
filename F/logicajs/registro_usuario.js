document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-usuario");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // ===============================
    // OBTENER Y NORMALIZAR DATOS
    // ===============================
    const data = {
      // MAYÚSCULAS (nombres reales)
      nombres: form.nombres.value.trim().toUpperCase(),
      apellidos: form.apellidos.value.trim().toUpperCase(),

      // SIN CAMBIOS
      cedula: form.cedula.value.trim(),

      // MINÚSCULAS (identificadores / login)
      correo: form.correo.value.trim().toLowerCase(),
      usuario: form.usuario.value.trim().toLowerCase(),

      telefono: form.telefono.value.trim(),
      rol: form.rol.value,
      estado: form.estado.value,

      contrasena: form.contrasena.value,
      confirmar_contrasena: form.confirmar_contrasena.value,
    };

    // ===============================
    // VALIDACIONES BÁSICAS
    // ===============================
    if (!data.nombres || !data.apellidos || !data.cedula) {
      alert("⚠️ Debes completar nombres, apellidos y cédula");
      return;
    }

    if (data.contrasena !== data.confirmar_contrasena) {
      alert("❌ Las contraseñas no coinciden");
      return;
    }

    if (!data.rol) {
      alert("⚠️ Debes seleccionar un rol");
      return;
    }

    if (!data.estado) {
      alert("⚠️ Debes seleccionar un estado");
      return;
    }

    // Validación numérica básica
    if (data.telefono && isNaN(data.telefono)) {
      alert("⚠️ El teléfono debe ser numérico");
      return;
    }

    // ===============================
    // ENVÍO AL BACKEND
    // ===============================
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message || "✅ Usuario registrado correctamente");
        form.reset();
      } else {
        alert(result.error || "❌ Error al registrar usuario");
      }

    } catch (error) {
      console.error("Error de conexión:", error);
      alert("❌ Error de conexión con el servidor");
    }
  });
});
