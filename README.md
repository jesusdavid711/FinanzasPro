💰 FinanzasPro
FinanzasPro es una aplicación web para gestionar finanzas personales, permitiendo registrar ingresos y egresos, clasificarlos por categoría, visualizar balances y generar reportes útiles para el análisis financiero.

🧩 Funcionalidades
📋 Registro de operaciones (ingresos/egresos)

🗃️ Clasificación por categorías

📅 Filtro por fechas, tipo y categoría

📊 Reportes por mes y categoría destacada

🧮 Cálculo de balance total, ingresos y gastos

🧼 Estado vacío si no hay operaciones cargadas

✏️ Edición y eliminación de operaciones

🛠️ Tecnologías utilizadas
HTML5 / CSS3

JavaScript (Vanilla)

json-server para simular backend REST

SPA/MPA modularizada por páginas

🚀 Cómo iniciar el proyecto
Clonar el repositorio:


git clone https://github.com/jesusdavid711/FinanzasPro.git
cd FinanzasPro
Instalar json-server de forma global (si no lo tenés):


npm install -g json-server
Iniciar el servidor:


json-server --watch db.json --port 3000
Abrir index.html o la página principal en tu navegador.

📁 Estructura del proyecto
pgsql
Copiar
Editar
FinanzasPro/
├── index.html
├── balance.html
├── movimientos.html
├── categorias.html
├── reportes.html
├── js/
│   ├── balance.js
│   ├── movimientos.js
│   ├── categorias.js
│   └── reportes.js
├── css/
│   └── styles.css
├── db.json
└── README.md
✨ Autor
@jesusdavid711