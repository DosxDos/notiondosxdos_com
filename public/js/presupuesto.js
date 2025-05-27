// Variables globales
if (typeof window.todosLosClientes === 'undefined') {
    window.todosLosClientes = [];
}
if (typeof window.clienteSeleccionado === 'undefined') {
    window.clienteSeleccionado = null;
}
if (typeof window.currentPage === 'undefined') {
    window.currentPage = 1;
}
if (typeof window.isLoading === 'undefined') {
    window.isLoading = false;
}

// Verificar autenticación antes de inicializar
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof requireAuth === 'function' && !await requireAuth()) {
        console.log('Usuario no autenticado');
        return;
    }
    
    try {
        await initializeApp();
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
    }
});

// Esperar a que auth.js esté cargado
async function initializeApp() {
    if (typeof requireAuth !== 'function') {
        console.error('requireAuth no está definido. Asegúrate de que auth.js está cargado.');
        return;
    }

    if (!requireAuth()) return;

    try {
        await cargarClientes();
        await cargarTodasLasOTs(); // Cargar todas las OTs por defecto
        
        // Solo inicializar los elementos si estamos en la página correcta
        const inputBuscador = document.getElementById('buscador-cliente');
        if (inputBuscador) {
            initializeBuscador();
        }

        // Configurar el botón "Ver todas"
        const botonVerTodas = document.getElementById('ver-todas');
        if (botonVerTodas) {
            botonVerTodas.addEventListener('click', () => {
                currentPage = 1;
                cargarTodasLasOTs();
                document.getElementById('filtro-activo').classList.add('hidden');
            });
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

        const filtrados = window.todosLosClientes.filter(c =>
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

                // Guardar información del cliente en sessionStorage
                sessionStorage.setItem('clienteSeleccionado', JSON.stringify({
                    id: cliente.id,
                    nombre: li.textContent,
                    Account_Name: cliente.Account_Name
                }));

                // Mostrar OTs del cliente seleccionado
                currentPage = 1;
                await cargarOTsDelCliente(cliente);
                
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

async function cargarTodasLasOTs(append = false) {
    const listaOTs = document.getElementById('lista-ots');
    if (!listaOTs) return;

    try {
        window.spinner.show();
        
        const res = await fetchWithAuth('/api/recogerModuloZoho?modulo=OTs');
        if (!res.ok) throw new Error('Error al cargar OTs');
        const data = await res.json();
        console.log('Datos de OTs recibidos:', data);

        listaOTs.innerHTML = '';

        if (data.proveedores && data.proveedores.length > 0) {
            data.proveedores.forEach(ot => {
                const card = document.createElement('div');
                card.className = 'bg-white p-6 rounded-lg shadow-md border border-gray-200';
                
                // Usar la función centralizada para generar el HTML de la tarjeta
                card.innerHTML = window.generarTarjetaOT(ot);
                listaOTs.appendChild(card);
            });
        } else {
            listaOTs.innerHTML = '<div class="col-span-full text-center text-gray-500">No hay OTs disponibles</div>';
        }
    } catch (err) {
        console.error('Error al cargar OTs:', err);
        listaOTs.innerHTML = '<div class="col-span-full text-center text-red-500">Error al cargar las OTs</div>';
    } finally {
        window.spinner.hide();
    }
}

async function cargarOTsDelCliente(cliente) {
    const listaOTs = document.getElementById('lista-ots');
    if (!listaOTs) return;

    try {
        window.spinner.show();
        
        const criteria = `Account_Name.id:equals:${cliente.id}`;
        const res = await fetchWithAuth(`/api/recogerModuloZoho?modulo=OTs&criteria=${encodeURIComponent(criteria)}`);
        if (!res.ok) throw new Error('Error al cargar OTs');
        const data = await res.json();
        console.log('Datos de OTs del cliente recibidos:', data);

        listaOTs.innerHTML = '';

        if (data.proveedores && data.proveedores.length > 0) {
            data.proveedores.forEach(ot => {
                const card = document.createElement('div');
                card.className = 'bg-white p-6 rounded-lg shadow-md border border-gray-200';
                
                // Usar la función centralizada para generar el HTML de la tarjeta
                card.innerHTML = window.generarTarjetaOT(ot);
                listaOTs.appendChild(card);
            });
        } else {
            listaOTs.innerHTML = '<div class="col-span-full text-center text-gray-500">Este cliente no tiene OTs registradas</div>';
        }
    } catch (err) {
        console.error('Error al cargar OTs del cliente:', err);
        listaOTs.innerHTML = '<div class="col-span-full text-center text-red-500">Error al cargar las OTs</div>';
    } finally {
        window.spinner.hide();
    }
}

async function cargarClientes() {
    try {
        const res = await fetchWithAuth('/api/recogerModuloZoho?modulo=Clientes');
        if (!res.ok) throw new Error('Error al cargar clientes');
        const json = await res.json();
        window.todosLosClientes = json.proveedores || [];
    } catch (err) {
        console.error('Error al cargar clientes:', err);
        window.todosLosClientes = [];
    }
}

// Botón "Generar PDF"

