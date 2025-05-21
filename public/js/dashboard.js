document.addEventListener('DOMContentLoaded', async () => {
    // Elementos del DOM
    const listaOTs = document.getElementById('lista-ots');
    const verTodasBtn = document.getElementById('ver-todas');
    const cargarMasBtn = document.getElementById('cargar-mas');
    const filtroActivo = document.getElementById('filtro-activo');
    const nombreClienteFiltro = document.getElementById('nombre-cliente-filtro');
    
    let paginaActual = 1;
    let clienteSeleccionado = null;

    // Función para cargar OTs
    async function cargarOTs(clienteId = null, pagina = 1) {
        try {
            let criteria = null;
            if (clienteId) {
                criteria = {
                    "Cliente": clienteId
                };
            }

            const response = await window.apiService.getDatosZoho('Presupuestos', criteria);
            const ots = response.proveedores;

            if (pagina === 1) {
                listaOTs.innerHTML = '';
            }

            ots.forEach(ot => {
                const otCard = crearOTCard(ot);
                listaOTs.appendChild(otCard);
            });

            // Mostrar/ocultar botón "Ver más"
            cargarMasBtn.style.display = ots.length >= 10 ? 'block' : 'none';
        } catch (error) {
            console.error('Error al cargar OTs:', error);
            mostrarError('Error al cargar las OTs');
        }
    }

    // Función para crear una tarjeta de OT
    function crearOTCard(ot) {
        const div = document.createElement('div');
        div.className = 'bg-white rounded-lg shadow p-4 hover:shadow-md transition';
        div.innerHTML = `
            <h3 class="font-semibold text-lg mb-2">${ot.Codigo_OT || 'Sin código'}</h3>
            <p class="text-gray-600 mb-2">Cliente: ${ot.Cliente || 'Sin cliente'}</p>
            <p class="text-gray-600 mb-4">Fecha: ${new Date(ot.Fecha).toLocaleDateString()}</p>
            <a href="/presupuesto/${ot.Codigo_OT}" class="text-red-700 hover:text-red-800">
                Ver detalles →
            </a>
        `;
        return div;
    }

    // Función para mostrar error
    function mostrarError(mensaje) {
        const div = document.createElement('div');
        div.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4';
        div.textContent = mensaje;
        listaOTs.prepend(div);
    }

    // Event Listeners
    verTodasBtn.addEventListener('click', () => {
        clienteSeleccionado = null;
        filtroActivo.classList.add('hidden');
        paginaActual = 1;
        cargarOTs();
    });

    cargarMasBtn.addEventListener('click', () => {
        paginaActual++;
        cargarOTs(clienteSeleccionado, paginaActual);
    });

    // Cargar OTs iniciales
    cargarOTs();
}); 