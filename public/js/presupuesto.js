let materialesDisponibles = {}; //variable global de materiales con su precio
let todosLosClientes = [];
let clienteSeleccionado = null;
let currentPage = 1;
let isLoading = false;

// Función simple para hacer peticiones
async function fetchData(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error('Error en la petición');
    }
    return response;
}

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Verificar autenticación al cargar
if (!isAuthenticated()) {
    window.location.href = '/login';
}

// Esperar a que auth.js esté cargado
async function initializeApp() {
    if (typeof requireAuth !== 'function') {
        console.error('requireAuth no está definido. Asegúrate de que auth.js está cargado.');
        return;
    }

    if (!requireAuth()) return;

    try {
        await cargarMateriales();
        await cargarClientes();
        
        // Solo inicializar los elementos si estamos en la página correcta
        const inputBuscador = document.getElementById('buscador-cliente');
        if (inputBuscador) {
            initializeBuscador();
        }
    } catch (error) {
        console.error('Error en la inicialización:', error);
    }
}

function initializeBuscador() {
    const inputBuscador = document.getElementById('buscador-cliente');
    const sugerenciasUl = document.getElementById('sugerencias-clientes');
    const nombreClienteSpan = document.getElementById('nombre-cliente');
    const infoCliente = document.getElementById('info-cliente');

    if (!inputBuscador || !sugerenciasUl) return;

    // Autocompletado
    inputBuscador.addEventListener('input', () => {
        const termino = inputBuscador.value.toLowerCase();
        sugerenciasUl.innerHTML = '';

        if (!termino) {
            sugerenciasUl.classList.add('hidden');
            return;
        }

        const filtrados = todosLosClientes.filter(c =>
            c.Account_Name?.toLowerCase?.().includes(termino) ||
            c.Account_Name?.name?.toLowerCase?.().includes(termino)
        );

        if (filtrados.length === 0) {
            sugerenciasUl.classList.add('hidden');
            return;
        }

        filtrados.slice(0, 10).forEach(cliente => {
            const li = document.createElement('li');
            li.textContent = cliente.Account_Name?.name || cliente.Account_Name || 'Nombre desconocido';
            li.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';

            li.addEventListener('click', async () => {
                clienteSeleccionado = cliente;
                inputBuscador.value = li.textContent;
                sugerenciasUl.classList.add('hidden');
                if (nombreClienteSpan) {
                    nombreClienteSpan.textContent = li.textContent;
                }

                // Actualizar el filtro activo
                const filtroActivo = document.getElementById('filtro-activo');
                const nombreClienteFiltro = document.getElementById('nombre-cliente-filtro');
                if (filtroActivo && nombreClienteFiltro) {
                    nombreClienteFiltro.textContent = li.textContent;
                    filtroActivo.classList.remove('hidden');
                }
            });

            sugerenciasUl.appendChild(li);
        });

        sugerenciasUl.classList.remove('hidden');
    });
}

async function cargarClientes() {
    try {
        const res = await fetchData('/api/recogerModuloZoho?modulo=Accounts');
        const data = await res.json();
        todosLosClientes = data.proveedores || [];
    } catch (err) {
        console.error('Error al cargar clientes:', err);
    }
}

async function cargarMateriales() {
    try {
        const res = await fetchData('/api/materialesPresupuesto');
        const data = await res.json();
        materialesDisponibles = data;
    } catch (err) {
        console.error('Error al cargar materiales:', err);
    }
}

function ocultarTodasLasVistas() {
    document.querySelectorAll('.vista').forEach(vista => {
        vista.classList.add('hidden');
    });
}

function mostrarVista(nombre) {
    ocultarTodasLasVistas();
    const vista = document.getElementById(`vista-${nombre}`);
    if (vista) {
        vista.classList.remove('hidden');
    }
}

function inicializarBotonesAddRow() {
    document.querySelectorAll('.add-row').forEach(button => {
        button.addEventListener('click', handleAddRow);
    });
}

function handleAddRow(event) {
    const button = event.target;
    const tableId = button.dataset.table;
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    const newRow = tbody.rows[0].cloneNode(true);
    
    // Limpiar valores
    newRow.querySelectorAll('input, select').forEach(input => {
        if (input.type === 'number') {
            input.value = '0';
        } else if (input.type === 'text') {
            input.value = '';
        } else if (input.tagName === 'SELECT') {
            input.selectedIndex = 0;
        }
    });

    tbody.appendChild(newRow);
}

