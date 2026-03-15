// ===============================
// DEFINICIÓN CENTRAL DE ROLES
// ===============================
const ROLES = {
  admin: {
    nombre: "Administrador",
    permisos: [
      "pos",
      "facturas",
      "productos",
      "clientes",
      "usuarios",
      "reportes",
      "cartera",
      "configuracion"
    ]
  },

  contadora: {
    nombre: "Contadora",
    permisos: [
      "facturas",
      "reportes",
      "cartera",
      "clientes"
    ]
  },

  cajero: {
    nombre: "Cajero",
    permisos: [
      "pos",          // Facturación POS
      "facturas",     // Crédito + consulta ventas
      "productos",    // Inventario
      "clientes",     // Clientes
      "cartera"       // Pagos y abonos
    ]
  }
};

// ===============================
// UTILIDADES DE PERMISOS
// ===============================
function obtenerUsuario() {
  try {
    return JSON.parse(sessionStorage.getItem("usuario"));
  } catch {
    return null;
  }
}

function tienePermiso(permiso) {
  const usuario = obtenerUsuario();
  if (!usuario) return false;

  const rol = ROLES[usuario.rol];
  if (!rol) return false;

  return rol.permisos.includes(permiso);
}

// Exponer globalmente
window.ROLES = ROLES;
window.tienePermiso = tienePermiso;

