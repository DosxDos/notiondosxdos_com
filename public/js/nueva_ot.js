// Función para cargar el nombre del cliente desde sessionStorage
function cargarInformacionCliente() {
    const clienteGuardado = sessionStorage.getItem('clienteSeleccionado');
    
    // Si no hay cliente guardado Y estamos en producción (no en desarrollo local)
    if (!clienteGuardado && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // Guardamos una bandera para evitar redirecciones infinitas
        if (!sessionStorage.getItem('redireccionando')) {
            sessionStorage.setItem('redireccionando', 'true');
            window.location.href = '/presupuestos';
            return;
        } else {
            sessionStorage.removeItem('redireccionando');
            return;
        }
    }

    const cliente = JSON.parse(clienteGuardado);
    const nombreClienteSpan = document.getElementById('nombre-cliente-formulario');
    if (nombreClienteSpan) {
        nombreClienteSpan.textContent = cliente.nombre;
    }
}

// Inicialización segura
document.addEventListener('DOMContentLoaded', () => {
    if (typeof requireAuth === 'function' && !requireAuth()) {
        return;
    }
    cargarInformacionCliente();
}); 