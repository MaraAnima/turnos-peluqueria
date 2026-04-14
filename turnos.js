document.addEventListener("DOMContentLoaded", function () {
  const URL =
    "https://script.google.com/macros/s/AKfycbzo842JJ121XUsoDp9hvQdhSXYXGBY6yWdwkqqJzXOGQz15p0w8EzUkC1GxCnwUCyGwzQ/exec";

  const horariosBase = ["12:00", "14:00", "16:00", "18:00"];

  const app = document.getElementById("app-turnos");

  app.innerHTML = `
  <div class="turnos-card">
    
    <div class="turnos-title">🐶 Turnos Peluquería</div>

    <input id="nombre" class="turnos-input" placeholder="Nombre">
    <input id="telefono" class="turnos-input" placeholder="Teléfono">

    <input type="date" id="fecha" class="turnos-input">

    <div id="horarios" class="turnos-horarios"></div>

    <input type="hidden" id="hora">

    <select id="servicio" class="turnos-select">
      <option value="">Servicio</option>
      <option>Baño</option>
      <option>Baño y corte</option>
    </select>

    <select id="tamano" class="turnos-select">
      <option value="">Tamaño</option>
      <option>Raza Pequeña</option>
      <option>Raza Mediana</option>
      <option>Raza Grande</option>
    </select>

    <select id="pelaje" class="turnos-select">
      <option value="">Pelaje</option>
      <option>Corto</option>
      <option>Largo</option>
    </select>

    <button id="btnReservar" class="turnos-btn">
      Reservar
    </button>

    <p id="msg" class="turnos-msg"></p>

  </div>
`;

  const fechaInput = document.getElementById("fecha");
  const horariosContainer = document.getElementById("horarios");

  // 🚫 Bloquear fechas pasadas
  const hoy = new Date().toISOString().split("T")[0];
  fechaInput.setAttribute("min", hoy);

  // 📅 Cambio de fecha
  fechaInput.addEventListener("change", () => {
    const fecha = new Date(fechaInput.value);

    if (fecha.getDay() === 0) {
      horariosContainer.innerHTML = "🚫 Cerrado los domingos";
      return;
    }

    cargarHorarios();
  });

  function cargarHorarios() {
    const fecha = fechaInput.value;

    if (!fecha) return;

    horariosContainer.innerHTML = "Cargando...";

    fetch(URL + "?fecha=" + encodeURIComponent(fecha))
      .then((res) => res.json())
      .then((ocupadosRaw) => {
        if (!Array.isArray(ocupadosRaw)) ocupadosRaw = [];

        // 🔥 normalizar horas a HH:MM
        const ocupados = ocupadosRaw.map((h) => {
          return String(h).substring(0, 5);
        });

        console.log("OCUPADOS NORMALIZADOS:", ocupados);
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

          btn.classList.add("turno-btn");

          if (ocupados.includes(hora)) {
            btn.classList.add("disabled");
            btn.disabled = true;
          } else {
            btn.onclick = () => {
              document.getElementById("hora").value = hora;

              document.querySelectorAll(".turno-btn").forEach((b) => {
                b.classList.remove("selected");
              });

              btn.classList.add("selected");
            };
          }
          horariosContainer.appendChild(btn);
        });
      })
      .catch(() => {
        horariosContainer.innerHTML = "Error cargando horarios";
      });
  }

  document.getElementById("btnReservar").addEventListener("click", function () {
    const btn = document.getElementById("btnReservar");
    const msg = document.getElementById("msg");

    const data = {
      nombre: document.getElementById("nombre").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
      fecha: document.getElementById("fecha").value,
      hora: document.getElementById("hora").value,
      servicio: document.getElementById("servicio").value,
      tamano: document.getElementById("tamano").value,
      pelaje: document.getElementById("pelaje").value,
    };

    // 🔍 Validaciones
    const nombreValido = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;
    const telefonoValido = /^[0-9]+$/;

    if (
      !data.nombre ||
      !data.telefono ||
      !data.fecha ||
      !data.hora ||
      !data.servicio ||
      !data.tamano ||
      !data.pelaje
    ) {
      msg.innerText = "Completá todos los datos";
      return;
    }

    if (!nombreValido.test(data.nombre) || data.nombre.length < 2) {
      msg.innerText = "Nombre inválido";
      return;
    }

    if (!telefonoValido.test(data.telefono) || data.telefono.length < 6) {
      msg.innerText = "Teléfono inválido";
      return;
    }

    const fechaSeleccionada = new Date(data.fecha);
    if (fechaSeleccionada.getDay() === 0) {
      msg.innerText = "No trabajamos domingos";
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

          // limpiar form
          document.getElementById("nombre").value = "";
          document.getElementById("telefono").value = "";
          document.getElementById("hora").value = "";
          document.getElementById("servicio").value = "";
          document.getElementById("tamano").value = "";
          document.getElementById("pelaje").value = "";

          // refrescar horarios
          cargarHorarios();
        }
      })
      .catch(() => {
        msg.innerText = "Error al reservar";
      })
      .finally(() => {
        btn.disabled = false;
        btn.innerText = "Reservar";
      });
  });
});
