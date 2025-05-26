// Función para verificar si el usuario está autenticado
function isAuthenticated() {
    const token = localStorage.getItem('token');
    return token !== null;
}

// Función para obtener el token
function getToken() {
    return localStorage.getItem('token');
}

// Función requireAuth que usamos en otros archivos
async function requireAuth() {
    if (!isAuthenticated()) {
        console.log('No hay token, redirigiendo a /login');
        window.location.href = '/login';
        return false;
    }

    try {
        // Verificar si el token es válido haciendo una petición a la API
        const response = await fetch('/api/prueba', {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        if (!response.ok) {
            console.log('Token inválido, redirigiendo a /login');
            localStorage.removeItem('token');
            window.location.href = '/login';
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        localStorage.removeItem('token');
        window.location.href = '/login';
        return false;
    }
}

// Función fetchWithAuth que usamos en otros archivos
async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }

    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, options);
    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
    }
    return response;
}

// Interceptar todas las peticiones para añadir el token
document.addEventListener('DOMContentLoaded', () => {
    // No verificar en la página de login
    if (window.location.pathname === '/login') {
        return;
    }

    // Verificar si hay token
    if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
    }

    // Añadir el token a todas las peticiones
    const token = getToken();
    if (token) {
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const originalOpen = xhr.open;
            xhr.open = function() {
                const result = originalOpen.apply(xhr, arguments);
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                return result;
            };
            return xhr;
        };

        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            if (url.includes('/api/login')) {
                return originalFetch(url, options);
            }
            options = options || {};
            options.headers = options.headers || {};
            options.headers['Authorization'] = `Bearer ${token}`;
            return originalFetch(url, options);
        };
    }
});

// Función para navegar con el token
async function navigateWithAuth(url) {
    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            window.location.href = url;
        } else if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        } else {
            throw new Error('Error en la navegación');
        }
    } catch (error) {
        console.error('Error al navegar:', error);
        alert('Error al navegar. Por favor, intente nuevamente.');
    }
}

// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    // No verificar en la página de login
    if (window.location.pathname === '/login') {
        return;
    }

    // Verificar si hay token y es válido
    if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
    }

    // Verificar validez del token
    try {
        const response = await fetch(window.location.pathname, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Token inválido');
        }
    } catch (error) {
        console.error('Error verificando token:', error);
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
});

// Lista de rutas protegidas
const rutasProtegidas = [
    '/presupuestos',
    '/nueva-ot',
    '/presupuesto'
];

// Verificar inmediatamente si la ruta actual requiere autenticación
(async function() {
    // No verificar en la página de login
    if (window.location.pathname === '/login') {
        return;
    }
    
    // Comprobar si estamos en una ruta protegida
    const rutaActual = window.location.pathname;
    const esRutaProtegida = rutasProtegidas.some(ruta => 
        rutaActual === ruta || rutaActual.startsWith(`${ruta}/`)
    );
    
    if (esRutaProtegida) {
        if (!isAuthenticated()) {
            console.log('Acceso directo a ruta protegida sin autenticación');
            window.location.href = '/login';
            return;
        }
        
        try {
            const response = await fetch('/api/prueba', {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            
            if (!response.ok) {
                console.log('Token inválido al acceder directamente a ruta protegida');
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Error verificando token en ruta protegida:', error);
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    }
})(); 