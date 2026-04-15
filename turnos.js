document.addEventListener("DOMContentLoaded", function () {
  const URL =
    "https://script.google.com/macros/s/AKfycbzo842JJ121XUsoDp9hvQdhSXYXGBY6yWdwkqqJzXOGQz15p0w8EzUkC1GxCnwUCyGwzQ/exec";

  const horariosBase = ["12:00", "14:00", "16:00", "18:00"];

  const app = document.getElementById("app-turnos");

  app.innerHTML = `
<div class="turnos-card">

  <div class="turnos-title">AGENDA TURNO</div>

  <div class="row">
    <input id="nombre" class="turnos-input turnos" placeholder="Nombre">
    <input id="telefono" class="turnos-input turnos" placeholder="Teléfono">
  </div>

  <!-- 🐶 PELAJE -->
    <div class="turnos-subtitle">Pelaje</div>
  <div class="cards-row" data-group="pelaje">
    <div class="card" data-value="Largo">
      <img src="pelolargo.png">
      <span>Largo</span>
    </div>
    <div class="card" data-value="Corto">
      <img src="pelocorto.png">
      <span>Corto</span>
    </div>
  </div>

  <!-- 🐕 TAMAÑO -->
      <div class="turnos-subtitle">Tamaño</div >

  <div class="cards-row" data-group="tamano">
    <div class="card" data-value="Raza Pequeña">
      <img src="Peque.png">
      <span>Raza Pequeña</span>
    </div>
    <div class="card" data-value="Raza Mediana">
      <img src="Mediano.png">
      <span>Raza Mediana</span>
    </div>
    <div class="card" data-value="Raza Grande">
      <img src="Grande.png">
      <span>Raza Grande</span>
    </div>
  </div>

  <!-- 📅 -->
  <input type="date" id="fecha" class="turnos-input">
  <div id="horarios" class="turnos-horarios"></div>
  <input type="hidden" id="hora">

  <!-- ✂️ SERVICIO -->
  <div class="cards-row" data-group="servicio">
    <div class="card" data-value="Baño">
      <img src="Baño.png">
      <span>Baño</span>
    </div>
    <div class="card" data-value="Baño y corte">
      <img src="Corte.png">
      <span>Baño y Corte</span>
    </div>
  </div>

  <button id="btnReservar" class="turnos-btn">Reservar</button>
  <p id="msg" class="turnos-msg"></p>

</div>
`;
  const seleccion = {
    pelaje: "",
    tamano: "",
    servicio: "",
  };

  document.querySelectorAll(".cards-row").forEach((row) => {
    row.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("click", () => {
        const group = row.dataset.group;

        // limpiar selección del grupo
        row.querySelectorAll(".card").forEach((c) => {
          c.classList.remove("selected");
        });

        card.classList.add("selected");
        seleccion[group] = card.dataset.value;

        console.log("SELECCION:", seleccion);
      });
    });
  });
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
      servicio: seleccion.servicio,
      tamano: seleccion.tamano,
      pelaje: seleccion.pelaje,
    };

    // 🔍 Validaciones
    const nombreValido = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;
    const telefonoValido = /^[0-9]+$/;

    if (
      !data.nombre ||
      !data.telefono ||
      !data.fecha ||
      !data.hora ||
      !seleccion.servicio ||
      !seleccion.tamano ||
      !seleccion.pelaje
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
