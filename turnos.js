document.addEventListener("DOMContentLoaded", function () {
  const URL =
    "https://script.google.com/macros/s/AKfycbzo842JJ121XUsoDp9hvQdhSXYXGBY6yWdwkqqJzXOGQz15p0w8EzUkC1GxCnwUCyGwzQ/exec";
  const horariosBase = ["12:00", "14:00", "16:00", "18:00"];

  const app = document.getElementById("app-turnos");

  // Render inicial
  app.innerHTML = `
    <div style="max-width:320px;margin:20px auto;font-family:Arial;background:#ffffff;padding:20px;border-radius:12px;box-shadow:0 4px 10px rgba(0,0,0,0.1);">
      
      <h3 style="text-align:center;margin-bottom:15px;">🐶 Reservar turno</h3>

      <input id="nombre" placeholder="Nombre"
        style="width:100%;padding:10px;margin:6px 0;border-radius:6px;border:1px solid #ccc;">

      <input id="telefono" placeholder="Teléfono"
        style="width:100%;padding:10px;margin:6px 0;border-radius:6px;border:1px solid #ccc;">

      <input type="date" id="fecha"
        style="width:100%;padding:10px;margin:6px 0;border-radius:6px;border:1px solid #ccc;">

      <div id="horarios" style="margin:10px 0;text-align:center;"></div>

      <input type="hidden" id="hora">

      <select id="servicio"
        style="width:100%;padding:10px;margin:6px 0;border-radius:6px;border:1px solid #ccc;">
        <option value="">Servicio</option>
        <option>Baño</option>
        <option>Baño y corte</option>
      </select>

      <select id="tamano"
        style="width:100%;padding:10px;margin:6px 0;border-radius:6px;border:1px solid #ccc;">
        <option value="">Tamaño</option>
        <option>Raza Pequeña</option>
        <option>Raza Mediana</option>
        <option>Raza Grande</option>
      </select>

      <select id="pelaje"
        style="width:100%;padding:10px;margin:6px 0;border-radius:6px;border:1px solid #ccc;">
        <option value="">Pelaje</option>
        <option>Corto</option>
        <option>Largo</option>
      </select>

      <button id="btnReservar"
        style="width:100%;padding:12px;margin-top:10px;background:#2e7d32;color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer;">
        Reservar
      </button>

      <p id="msg" style="text-align:center;margin-top:10px;"></p>
    </div>
  `;

  const fechaInput = document.getElementById("fecha");
  const horariosContainer = document.getElementById("horarios");

  // Evento fecha
  fechaInput.addEventListener("change", cargarHorarios);

  function cargarHorarios() {
    const fecha = fechaInput.value;

    if (!fecha) return;

    horariosContainer.innerHTML = "Cargando...";

    fetch(URL + "?fecha=" + encodeURIComponent(fecha)) // ✅ CORRECTO
      .then((res) => res.json())
      .then((ocupados) => {
        console.log("RESPUESTA CRUDA:", text);

        let ocupados;
        try {
          ocupados = JSON.parse(text);
        } catch (e) {
          console.error("NO ES JSON:", text);
          horariosContainer.innerHTML = "Error de formato";
          return;
        }

        console.log("OCUPADOS:", ocupados);

        if (!Array.isArray(ocupados)) ocupados = [];

        horariosContainer.innerHTML = "";

        horariosBase.forEach((hora) => {
          const btn = document.createElement("button");
          btn.innerText = hora;

          btn.style.margin = "5px";
          btn.style.padding = "10px";
          btn.style.borderRadius = "6px";
          btn.style.border = "1px solid #ccc";
          btn.style.cursor = "pointer";

          if (ocupados.includes(hora)) {
            btn.innerText += " ❌";
            btn.disabled = true;
            btn.style.background = "#eee";
          } else {
            btn.onclick = () => {
              document.getElementById("hora").value = hora;

              document.querySelectorAll("#horarios button").forEach((b) => {
                b.style.background = "";
                b.style.color = "";
              });

              btn.style.background = "#2e7d32";
              btn.style.color = "white";
            };
          }

          horariosContainer.appendChild(btn);
        });
      })
      .catch((err) => {
        console.error("ERROR FETCH:", err);
        horariosContainer.innerHTML = "Error cargando horarios";
      });
  }

  document.getElementById("btnReservar").addEventListener("click", function () {
    const btn = document.getElementById("btnReservar");
    const msg = document.getElementById("msg");

    const data = {
      nombre: document.getElementById("nombre").value,
      telefono: document.getElementById("telefono").value,
      fecha: document.getElementById("fecha").value,
      hora: document.getElementById("hora").value,
      servicio: document.getElementById("servicio").value,
      tamano: document.getElementById("tamano").value,
      pelaje: document.getElementById("pelaje").value,
    };

    if (!data.nombre || !data.telefono || !data.fecha || !data.hora) {
      msg.innerText = "Completá todos los datos";
      return;
    }

    // 🔒 bloquear botón
    btn.disabled = true;
    btn.innerText = "Reservando...";

    const params = new URLSearchParams(data).toString();

    fetch(URL + "?" + params)
      .then((res) => res.json())
      .then((res) => {
        if (res.status === "error") {
          msg.innerText = "❌ " + res.message;
        } else {
          msg.innerText = "✅ Turno reservado";
          document.getElementById("hora").value = "";
          document.querySelectorAll("#horarios button").forEach((b) => {
            b.style.background = "";
            b.style.color = "";
          });

          // 🔄 refrescar horarios
          console.log("FECHA FRONT:", fechaInput.value);
          const fechaActual = document.getElementById("fecha").value;

          if (fechaActual) {
            fetch(URL + "?fecha=" + encodeURIComponent(fechaActual))
              .then((res) => res.json())
              .then(() => {
                cargarHorarios();
              });
          }
          // 🔒 limpiar selección
          document.getElementById("hora").value = "";
        }
      })
      .catch(() => {
        msg.innerText = "Error al reservar";
      })
      .finally(() => {
        // 🔓 volver a habilitar botón
        btn.disabled = false;
        btn.innerText = "Reservar";
      });
  });
});
