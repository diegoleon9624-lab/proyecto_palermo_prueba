const form = document.getElementById("cvFilterForm");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  console.log("Formulario enviado");
  const fechaInicio = document.getElementById("cvFechaInicio").value;
  const fechaFin = document.getElementById("cvFechaFin").value;
  const cliente = document.getElementById("cvCliente").value;
  const factura = document.getElementById("cvFactura").value;

     const filtros = {};

      if (fechaInicio) filtros.fechaInicio = fechaInicio;
      if (fechaFin) filtros.fechaFin = fechaFin;
      if (cliente) filtros.cliente = cliente;
      if (factura) filtros.factura = factura;


      const params = new URLSearchParams(filtros);

      const url = `http://localhost:3000/api/facturas?${params.toString()}`;


  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.getElementById("cvTbody");
      tbody.innerHTML = ""; // limpiar tabla antes de pintar
      console.log(data.facturas);
      data.facturas.forEach((f) => {
        const fila = `
        <tr>
          <td>${f.numero_factura}</td>
          <td>${new Date(f.fecha_emision).toLocaleDateString()}</td>
          <td>${f.cliente || "SIN CLIENTE"}</td>
          <td>${f.vendedor || "SIN VENDEDOR"}</td>
          <td>${f.total_factura}</td>
          <td>${f.estado}</td>
          <td>Ver</td>
        </tr>
      `;

        tbody.innerHTML += fila;
      });
    })
    .catch((err) => {
      console.error("Error:", err);
    });
});
