(() => {
  // ===============================
  // BLINDAJE: SOLO EJECUTAR EN LOGIN
  // ===============================
  const form = document.getElementById("loginForm");

  if (!form) {
    console.warn("login.js cargado fuera del login");
    return;
  }

  // ===============================
  // MANEJO DEL LOGIN
  // ===============================
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // evita recarga del formulario

    const usuarioInput = document.getElementById("usuario");
    const contrasenaInput = document.getElementById("contrasena");

    if (!usuarioInput || !contrasenaInput) {
      alert("Error en el formulario de login");
      return;
    }

    const usuario = usuarioInput.value.trim();
    const contrasena = contrasenaInput.value.trim();

    if (!usuario || !contrasena) {
      alert("Completa todos los campos");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ usuario, contrasena })
      });

      // ⚠️ SIEMPRE intentar leer el JSON
      const data = await response.json();

      // ❌ Credenciales incorrectas (401)
      if (response.status === 401) {
        alert(data.error || "Usuario o contraseña incorrectos");
        return;
      }

      // ❌ Otros errores HTTP
      if (!response.ok) {
        alert("Error inesperado del servidor");
        return;
      }

      // ❌ Respuesta lógica inválida
      if (!data.ok) {
        alert(data.error || "Credenciales incorrectas");
        return;
      }

      // ✅ LOGIN EXITOSO
      sessionStorage.setItem("usuario", JSON.stringify(data));

      // 👉 Redirigir sin permitir volver atrás
      window.location.replace("Menu_principal.html");

    } catch (error) {
      console.error("Error en login:", error);
      alert("No se pudo conectar con el servidor");
    }
  });
})();

