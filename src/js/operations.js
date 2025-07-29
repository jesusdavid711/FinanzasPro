// 🌐 URLs de las APIs simuladas con json-server ///////// se debe cambiar nombres
let endpointCategories = "http://localhost:3000/categories";
let endpointMovimientos = "http://localhost:3000/movimientos";

// 📄 Elementos del DOM relacionados con el formulario y tabla de movimientos
const formMovimientos = document.getElementById("form-movimiento"); // Formulario de movimientos
const tbodyMovimientos = document.getElementById("tbody-movimientos"); // Cuerpo de la tabla
const selectCategorias = formMovimientos.categoria; // Select para elegir categoría

// 🧪 Elementos del DOM usados para filtros
const filtroTipo = document.getElementById("filtro-tipo");
const filtroCategoria = document.getElementById("filtro-categoria");
const filtroFechaInicio = document.getElementById("filtro-fecha-inicio");
const filtroFechaFin = document.getElementById("filtro-fecha-fin");
const btnLimpiarFiltros = document.getElementById("btn-limpiar-filtros");

// 🚀 Al cargar la página, renderizamos categorías y movimientos
document.addEventListener("DOMContentLoaded", () => {
    pintarCategorias(); // Carga los select con categorías
    pintarMovimientos(); // Renderiza movimientos en la tabla
});

// ➕➖ Evento para agregar o editar un movimiento al enviar el formulario
formMovimientos.addEventListener("submit", async function (event) {
  event.preventDefault(); // Evita recargar la página

  // 🎯 Obtenemos los datos del formulario
  const movimiento = {
    tipo: formMovimientos.tipo.value,
    descripcion: formMovimientos.descripcion.value.trim(),
    importe: Number(formMovimientos.importe.value),
    fecha: formMovimientos.fecha.value,
    categoryId: formMovimientos.categoria.value,
  };

  // ✅ Validaciones:
  if (!movimiento.descripcion) {
    alert("La descripción no puede estar vacía");
    return;
  }
  if (isNaN(movimiento.importe) || movimiento.importe <= 0) {
    alert("El importe debe ser un número positivo");
    return;
  }

  const idAEditar = formMovimientos.getAttribute("data-edit-id");

  if (idAEditar) {
    // ✏️ Si estamos editando, hacemos PUT
    await fetch(`${endpointMovimientos}/${idAEditar}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movimiento),
    });
    alert("Movimiento actualizado correctamente");
    formMovimientos.removeAttribute("data-edit-id");
    formMovimientos.querySelector("button[type='submit']").textContent = "+ Agregar Movimiento";
  } else {
    // 🆕 Si no hay edición, es un nuevo movimiento
    await crearUnNuevoMovimiento(movimiento);
  }

  formMovimientos.reset(); // Limpia el formulario
  pintarMovimientos();     // Recarga la tabla
});


// 📌 Renderiza las categorías en los select del formulario y filtros
async function pintarCategorias() {
    const response = await fetch(endpointCategories);
    const categorias = await response.json();

    // 🧼 Inicializamos los select
    selectCategorias.innerHTML = `<option value="">-- Selecciona --</option>`;
    filtroCategoria.innerHTML = `<option value="">Categoría</option>`;

    // 📥 Insertamos las opciones
    categorias.forEach(cat => {
        const option = `<option value="${cat.id}">${cat.nombre}</option>`;
        selectCategorias.innerHTML += option;
        filtroCategoria.innerHTML += option;
    });
}

// 📊 Renderiza la tabla de movimientos aplicando los filtros activos
async function pintarMovimientos() {
    const response = await fetch(endpointMovimientos);
    let movimientos = await response.json();

    const categorias = await (await fetch(endpointCategories)).json();

    // 🔗 Relacionamos cada movimiento con su nombre de categoría
    movimientos = movimientos.map(mov => {
        const categoria = categorias.find(cat => cat.id === mov.categoryId);
        return { ...mov, categoriaNombre: categoria ? categoria.nombre : "La categoría fue eliminada" };
    });

    // 🧪 Obtenemos valores actuales de los filtros
    const tipo = filtroTipo.value;
    const categoriaId = filtroCategoria.value;
    const fechaInicio = filtroFechaInicio.value;
    const fechaFin = filtroFechaFin.value;

    // 🧹 Filtramos los movimientos
    const filtrados = movimientos.filter(mov => {
        if (tipo && mov.tipo !== tipo) return false;
        if (categoriaId && mov.categoryId !== categoriaId) return false;
        if (fechaInicio && mov.fecha < fechaInicio) return false;
        if (fechaFin && mov.fecha > fechaFin) return false;
        return true;
    });

    // 🖋️ Renderizamos los resultados en la tabla
    tbodyMovimientos.innerHTML = "";
    filtrados.forEach(mov => {
        tbodyMovimientos.innerHTML += `
        <tr>
            <td>${mov.tipo}</td>
            <td>${mov.descripcion}</td>
            <td>$${mov.importe}</td>
            <td>${mov.fecha}</td>
            <td>${mov.categoriaNombre}</td>
            <td>
                <button class="btn-editar" data-id="${mov.id}">Editar</button>
                <button class="btn-eliminar" data-id="${mov.id}">Eliminar</button>
            </td>
        </tr>`;
    });
}

// 📥 Función para guardar un nuevo movimiento
async function crearUnNuevoMovimiento(mov) {
    const response = await fetch(endpointMovimientos, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mov),
    });

    if (response.ok) {
        alert("Movimiento guardado con éxito");
    }

    pintarMovimientos(); // Recarga la tabla
}

// 🔍 Detectamos clicks en botones de editar y eliminar dentro de la tabla
tbodyMovimientos.addEventListener("click", async (event) => {
    const target = event.target;

    if (target.classList.contains("btn-eliminar")) {
        const id = target.dataset.id;
        if (confirm("¿Eliminar este movimiento?")) {
            await eliminarMovimiento(id); // Borra el movimiento
            pintarMovimientos(); // Recarga la tabla
        }
    }

    if (target.classList.contains("btn-editar")) {
        const id = target.dataset.id;
        cargarMovimientoEnFormulario(id); // Carga datos en el form
    }
});

// 🗑️ Elimina un movimiento por su ID
async function eliminarMovimiento(id) {
    await fetch(`${endpointMovimientos}/${id}`, { method: "DELETE" });
}

// 🛠️ Carga los datos de un movimiento en el formulario para editarlo
async function cargarMovimientoEnFormulario(id) {
    const response = await fetch(`${endpointMovimientos}/${id}`);
    const mov = await response.json();

    formMovimientos.tipo.value = mov.tipo;
    formMovimientos.descripcion.value = mov.descripcion;
    formMovimientos.importe.value = mov.importe;
    formMovimientos.fecha.value = mov.fecha;
    formMovimientos.categoria.value = mov.categoryId;

    formMovimientos.setAttribute("data-edit-id", mov.id); // Activa modo edición
    formMovimientos.querySelector("button[type='submit']").textContent = "Guardar Cambios";
}

// 🔁 Botón para limpiar filtros y mostrar todos los movimientos
btnLimpiarFiltros.addEventListener("click", () => {
    filtroTipo.value = "";
    filtroCategoria.value = "";
    filtroFechaInicio.value = "";
    filtroFechaFin.value = "";
    pintarMovimientos();
});

// 🔄 Cada vez que cambian los filtros, recargamos la tabla
[filtroTipo, filtroCategoria, filtroFechaInicio, filtroFechaFin].forEach(input =>
    input.addEventListener("change", pintarMovimientos)
);
