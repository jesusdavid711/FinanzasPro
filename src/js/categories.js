// Seleccionamos los elementos del DOM
const formCategoria = document.getElementById("form-categoria"); // Formulario para agregar o editar categoría
const inputNombre = document.getElementById("nombre-categoria"); // Input de nombre de categoría
const listaCategorias = document.getElementById("lista-categorias"); // Lista que muestra las categorías registradas

// URL de la API local de categorías
const API_URL = "http://localhost:3000/categories";

// Variable que guarda el ID de la categoría en edición (null si no se está editando)
let categoriaEditando = null;

// Evento que se dispara cuando la página termina de cargar
document.addEventListener('DOMContentLoaded', cargarCategorias);

// Función que obtiene las categorías desde la API y las renderiza en la lista
async function cargarCategorias() {
    listaCategorias.innerHTML = ''; // Limpiamos la lista

    try {
        const res = await fetch(API_URL); // Fetch a la API
        const categorias = await res.json(); // Parseamos el JSON recibido

        // Recorremos las categorías y las renderizamos en la lista
        categorias.forEach(categoria => {
            const li = document.createElement('li'); // Creamos elemento <li>

            li.innerHTML = `
        <span>${categoria.nombre}</span>
        <div>
          <button class="btn-editar" data-id="${categoria.id}" data-nombre="${categoria.nombre}">Editar</button>
          <button class="btn-eliminar" data-id="${categoria.id}">Eliminar</button>
        </div>`;

            listaCategorias.appendChild(li); // Agregamos el <li> a la lista
        });
    } catch (err) {
        console.error('Error al cargar categorías', err);
    }
}

// Evento que escucha el envío del formulario para agregar o editar una categoría
formCategoria.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevenimos el envío por defecto

    const nombre = inputNombre.value.trim(); // Obtenemos el valor y quitamos espacios

    if (!nombre) return alert('El nombre no puede estar vacío'); // Validación

    try {
        if (categoriaEditando) {
            // 📝 Si hay categoría en edición, hacemos PUT para actualizar
            await fetch(`${API_URL}/${categoriaEditando}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre })
            });
            categoriaEditando = null; // Salimos del modo edición
        } else {
            // 🆕 Si no hay edición, creamos nueva categoría con POST
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre })
            });
        }

        formCategoria.reset(); // Limpiamos el formulario
        cargarCategorias(); // Recargamos la lista
    } catch (err) {
        console.error('Error al guardar categoría', err);
    }
});

// Delegación de eventos para los botones de editar y eliminar dentro de la lista
listaCategorias.addEventListener('click', async (event) => {
    // 🛠️ Modo edición: carga el nombre y guarda el ID
    if (event.target.classList.contains('btn-editar')) {
        const id = event.target.dataset.id;
        const nombre = event.target.dataset.nombre;
        inputNombre.value = nombre;
        categoriaEditando = id;
    }

    // 🗑️ Modo eliminar: elimina categoría y sus movimientos asociados
    if (event.target.classList.contains('btn-eliminar')) {
        const id = event.target.dataset.id;

        if (confirm('¿Seguro que quieres eliminar esta categoría y todos sus movimientos relacionados?')) {
            try {
                // ✅ Eliminamos movimientos asociados
                const res = await fetch('http://localhost:3000/movimientos');
                const movimientos = await res.json();

                const relacionados = movimientos.filter(mov => mov.categoryId === id);

                for (const mov of relacionados) {
                    await fetch(`http://localhost:3000/movimientos/${mov.id}`, { method: 'DELETE' });
                }

                // ✅ Eliminamos la categoría
                await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

                cargarCategorias(); // Refrescamos la vista
            } catch (err) {
                console.error('Error al eliminar categoría y sus movimientos', err);
            }
        }
    }

    // Solo para debug durante desarrollo
    console.log("la cajita está:", categoriaEditando);
});
