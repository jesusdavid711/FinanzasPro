// 🌐 Endpoints de tus APIs locales
let endpointCategories = "http://localhost:3000/categories";
let endpointMovimientos = "http://localhost:3000/movimientos";

// 🎯 Elementos del DOM donde mostraremos los datos
const categoriaMasVendida = document.getElementById("categoria-mas-vendida");
const categoriaMasComprada = document.getElementById("categoria-mas-compras");
const productoMasVendido = document.getElementById("producto-mas-vendido");
const productoMasComprado = document.getElementById("producto-comprado");
const mesMasVentas = document.getElementById("mas-ventas");
const mesMasCompras = document.getElementById("mes-mas-compra");
const tablaTotalesCategoria = document.getElementById("totales-categoria");
const tablaTotalesMes = document.getElementById("totales-mes");

// 🚀 Cuando la página carga, obtenemos datos y pintamos reportes
document.addEventListener("DOMContentLoaded", async () => {
    const movimientos = await obtener(endpointMovimientos);
    const categorias = await obtener(endpointCategories);

    pintarCategoriaMasGanancia(movimientos, categorias);
    pintarCategoriaMasGasto(movimientos, categorias);
    pintarDescripcionMasGanancia(movimientos);
    pintarDescripcionMasGasto(movimientos);
    pintarMesMayorGanancia(movimientos);
    pintarMesMayorGasto(movimientos);
    pintarTablaTotalesPorCategoria(movimientos, categorias);
    pintarTablaTotalesPorMes(movimientos);
});

// 🔄 Función para hacer fetch GET y convertir a JSON
async function obtener(endpoint) {
    const res = await fetch(endpoint);
    return await res.json();
}

// 📊 1. Categoría con mayor ganancia acumulada
function pintarCategoriaMasGanancia(movs, categorias) {
    const ganancias = movs.filter((m) => m.tipo === "ganancia");
    const totales = agruparPor(ganancias, "categoryId", "importe");
    const idMax = obtenerIdConMayorValor(totales);
    const categoria = categorias.find((cat) => cat.id === idMax);
    categoriaMasVendida.textContent = categoria ? categoria.nombre : "-";
}

// 📉 2. Categoría con mayor gasto acumulado
function pintarCategoriaMasGasto(movs, categorias) {
    const gastos = movs.filter((m) => m.tipo === "gasto");
    const totales = agruparPor(gastos, "categoryId", "importe");
    const idMax = obtenerIdConMayorValor(totales);
    const categoria = categorias.find((cat) => cat.id === idMax);
    categoriaMasComprada.textContent = categoria ? categoria.nombre : "-";
}

// 📦 3. Descripción (producto) con mayor ganancia
function pintarDescripcionMasGanancia(movs) {
    const ganancias = movs.filter((m) => m.tipo === "ganancia");
    const totales = agruparPor(ganancias, "descripcion", "importe");
    const descripcionMax = obtenerIdConMayorValor(totales);
    productoMasVendido.textContent = descripcionMax || "-";
}

// 🛒 4. Descripción (producto) con mayor gasto
function pintarDescripcionMasGasto(movs) {
    const gastos = movs.filter((m) => m.tipo === "gasto");
    const totales = agruparPor(gastos, "descripcion", "importe");
    const descripcionMax = obtenerIdConMayorValor(totales);
    productoMasComprado.textContent = descripcionMax || "-";
}

// 📅 5. Mes con mayor ganancia total
function pintarMesMayorGanancia(movs) {
    const ganancias = movs.filter((m) => m.tipo === "ganancia");
    const totales = agruparPor(ganancias, "mes", "importe");
    const mesMax = obtenerIdConMayorValor(totales);
    mesMasVentas.textContent = mesMax || "-";
}

// 📅 6. Mes con mayor gasto total
function pintarMesMayorGasto(movs) {
    const gastos = movs.filter((m) => m.tipo === "gasto");
    const totales = agruparPor(gastos, "mes", "importe");
    const mesMax = obtenerIdConMayorValor(totales);
    mesMasCompras.textContent = mesMax || "-";
}

// 📊 7. Tabla: Totales agrupados por categoría
function pintarTablaTotalesPorCategoria(movs, categorias) {
    const resumen = {};

    // Agrupamos movimientos por categoría y tipo
    movs.forEach((m) => {
        if (!m.categoryId) return;
        if (!resumen[m.categoryId]) {
            resumen[m.categoryId] = { ganancia: 0, gasto: 0 };
        }
        if (m.tipo === "ganancia") {
            resumen[m.categoryId].ganancia += Number(m.importe);
        } else if (m.tipo === "gasto") {
            resumen[m.categoryId].gasto += Number(m.importe);
        }
    });

    // Construimos la tabla HTML
    let html = `
    <table>
      <thead>
        <tr>
          <th>Categoría</th>
          <th>Total Ganancia</th>
          <th>Total Gasto</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
  `;

    for (let id in resumen) {
        const categoria = categorias.find((cat) => cat.id === id);
        const nombre = categoria ? categoria.nombre : "(Eliminada)";
        const g = resumen[id];
        const balance = g.ganancia - g.gasto;

        html += `
      <tr>
        <td>${nombre}</td>
        <td>$${g.ganancia}</td>
        <td>$${g.gasto}</td>
        <td>$${balance}</td>
      </tr>
    `;
    }

    html += "</tbody></table>";
    tablaTotalesCategoria.innerHTML = html;
}

// 📅 8. Tabla: Totales agrupados por mes
function pintarTablaTotalesPorMes(movs) {
    const resumen = {};

    // Agrupamos movimientos por mes y tipo
    movs.forEach((m) => {
        const mes = m.fecha.slice(0, 7); // "YYYY-MM"
        if (!resumen[mes]) {
            resumen[mes] = { ganancia: 0, gasto: 0 };
        }
        if (m.tipo === "ganancia") {
            resumen[mes].ganancia += Number(m.importe);
        } else if (m.tipo === "gasto") {
            resumen[mes].gasto += Number(m.importe);
        }
    });

    // Construimos tabla HTML
    let html = `
    <table>
      <thead>
        <tr>
          <th>Mes</th>
          <th>Total Ganancia</th>
          <th>Total Gasto</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
  `;

    for (let mes in resumen) {
        const g = resumen[mes];
        const balance = g.ganancia - g.gasto;

        html += `
      <tr>
        <td>${mes}</td>
        <td>$${g.ganancia}</td>
        <td>$${g.gasto}</td>
        <td>$${balance}</td>
      </tr>
    `;
    }

    html += "</tbody></table>";
    tablaTotalesMes.innerHTML = html;
}

// 🧮 Agrupa y suma una propiedad numérica por clave (mes, categoría, etc.)
function agruparPor(arr, propiedad, sumarCampo) {
    const resultado = {};

    for (const item of arr) {
        let clave =
            propiedad === "mes"
                ? item.fecha.slice(0, 7) // Extrae el "YYYY-MM"
                : item[propiedad];

        if (!clave) continue;

        if (!resultado[clave]) {
            resultado[clave] = 0;
        }

        resultado[clave] += Number(item[sumarCampo]);
    }

    return resultado;
}

// 🔍 Devuelve la clave con mayor valor acumulado
function obtenerIdConMayorValor(obj) {
    let max = 0;
    let idMax = null;

    for (const id in obj) {
        if (obj[id] > max) {
            max = obj[id];
            idMax = id;
        }
    }

    return idMax;
}
