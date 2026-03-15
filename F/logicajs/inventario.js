document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("inv-tbody");

  const inputs = document.querySelectorAll(".inv-input");
  const btnBuscar = document.querySelector(".inv-btn-buscar");

  // inputs:
  // 0 → código
  // 1 → nombre
  // 2 → categoría
  const inputCodigo = inputs[0];
  const inputNombre = inputs[1];
  const selectCategoria = inputs[2];

  function cargarInventario(query = "") {
    fetch(`http://localhost:3000/api/productos${query}`)
      .then((res) => res.json())
      .then((productos) => {
        tbody.innerHTML = "";

        if (!productos.length) {
          tbody.innerHTML = `
            <tr>
              <td colspan="7" style="text-align:center">
                No se encontraron productos
              </td>
            </tr>
          `;
          return;
        }

        productos.forEach((p) => {
          tbody.innerHTML += `
            <tr>
              <td>${p.codigo}</td>
              <td>${p.nombre_producto}</td>
              <td>${p.categoria}</td>
              <td>${p.unidad_medida}</td>
              <td>${p.stock}</td>
              <td>$${Number(p.precio_venta).toLocaleString()}</td>
              <td class="${
                p.estado === "ACTIVO" ? "inv-activo" : "inv-inactivo"
              }">
                ${p.estado}
              </td>
              <td>
                <button class="btn-editar" data-id="${
                  p.id_producto
                }">✏️</button>
                <button class="btn-eliminar" data-id="${
                  p.id_producto
                }">🗑</button>
              </td>
            </tr>
          `;
        });
      })
      .catch((err) => {
        console.error("Error inventario:", err);
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align:center">
              Error cargando inventario
            </td>
          </tr>
        `;
      });
  }

  // 🔹 Carga inicial
  cargarInventario();

  // 🔍 Buscar
  btnBuscar.addEventListener("click", () => {
    const codigo = inputCodigo.value.trim();
    const nombre = inputNombre.value.trim();
    const categoria = selectCategoria.value;

    let query = "?";

    if (codigo) query += `codigo=${encodeURIComponent(codigo)}&`;
    if (nombre) query += `nombre=${encodeURIComponent(nombre)}&`;
    if (categoria) query += `categoria=${encodeURIComponent(categoria)}`;

    cargarInventario(query);
  });
});
document.addEventListener("click", async (e) => {
  // EDITAR
  if (e.target.classList.contains("btn-editar")) {
    const id = e.target.dataset.id;

    const nombre = prompt("Nuevo nombre:");
    const categoria = prompt("Nueva categoría:");
    const ubicacion = prompt("Nueva ubicación:");
    const unidad = prompt("Unidad (KG / UND):");
    const precio_compra = prompt("Precio compra:");
    const precio_venta = prompt("Precio venta:");

    if (!nombre) return;

    await fetch(`http://localhost:3000/api/productos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        categoria,
        ubicacion,
        unidad,
        precio_compra,
        precio_venta,
      }),
    });

    alert("Producto actualizado");
    location.reload();
  }

  // ELIMINAR
  if (e.target.classList.contains("btn-eliminar")) {
    const id = e.target.dataset.id;

    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

    await fetch(`http://localhost:3000/api/productos/${id}`, {
      method: "DELETE",
    });

    const res = await fetch(`http://localhost:3000/api/productos/${id}`, {
      method: "DELETE",
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.error);
      return;
    }

    alert("🗑 Producto eliminado definitivamente");
    location.reload();
  }
});
