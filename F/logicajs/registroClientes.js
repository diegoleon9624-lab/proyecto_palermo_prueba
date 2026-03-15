// ===============================
// REGISTRO DE CLIENTES
// ===============================

const form = document.getElementById("formCliente");

if (!form) {
  console.error("❌ No se encontró el formulario formCliente");
} else {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    // -------------------------------
    // NORMALIZAR TIPO CLIENTE
    // -------------------------------
    let tipoCliente = formData.get("tipo_cliente");

    if (!tipoCliente || tipoCliente === "Tipo de Cliente") {
      tipoCliente = "contado";
    }

    if (tipoCliente === "suport") {
      tipoCliente = "contado";
    }

    // -------------------------------
    // NORMALIZAR DATOS
    // -------------------------------
    const data = {
      // MAYÚSCULAS (datos reales)
      nombres: formData.get("nombres")?.trim().toUpperCase(),
      apellidos: formData.get("apellidos")?.trim().toUpperCase(),
      direccion: formData.get("direccion")?.trim().toUpperCase(),

      // SIN CAMBIOS
      cedula_o_nit: formData.get("cedula_o_nit")?.trim(),
      telefono: formData.get("telefono")?.trim(),

      // MINÚSCULAS
      correo: formData.get("correo")?.trim().toLowerCase(),

      tipo_cliente: tipoCliente,
    };

    // -------------------------------
    // VALIDACIONES BÁSICAS
    // -------------------------------
    if (
      !data.nombres ||
      !data.apellidos ||
      !data.cedula_o_nit ||
      !data.telefono ||
      !data.direccion ||
      !data.correo
    ) {
      alert("⚠️ Por favor completa todos los campos obligatorios");
      return;
    }

    if (isNaN(data.telefono)) {
      alert("⚠️ El teléfono debe ser numérico");
      return;
    }

    // -------------------------------
    // ENVÍO AL BACKEND
    // -------------------------------
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        alert("✅ Cliente registrado correctamente");
        form.reset();
      } else {
        alert("❌ " + (result.error || "Error al registrar cliente"));
      }

    } catch (error) {
      console.error("❌ Error de conexión:", error);
      alert("❌ No se pudo conectar con el servidor");
    }
  });
}
