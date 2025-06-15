// Servicio centralizado para todas las llamadas a la API 
class ApiServices {
    constructor() {
        this.baseUrl = ''; // URL base para las peticiones, vacío si es relativo
    }

    // Obtiene el token de autorización de la URL 
    getAuthToken() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (!token) {
            console.error('Token no encontrado en la URL');
        }
        
        return token;
    }

    //Realizar una petición a la API con el token de autorización  
    async fetchWithAuth(endpoint, options = {}) {
        const token = this.getAuthToken();
        
        if (!token) {
            throw new Error('No se pudo obtener el token de autorización');
        }
        
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Authorization': token,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };
        
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        if (!response.ok) {
            throw new Error(`Error en la petición a ${endpoint}: ${response.statusText}`);
        }
        
        return await response.json();
    }

    // Realiza una petición que devuelve un blob (archivo binario como PDF)    
    async fetchBlobWithAuth(endpoint, options = {}) {
        const token = this.getAuthToken();
        
        if (!token) {
            throw new Error('No se pudo obtener el token de autorización');
        }
        
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Authorization': token,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };
        
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        if (!response.ok) {
            throw new Error(`Error en la petición a ${endpoint}: ${response.statusText}`);
        }
        
        return await response.blob();
    }

    // Obtiene los datos del presupuesto por código OT     
    async obtenerPresupuestoPorOT(codigoOT) {
        return await this.fetchWithAuth(`/api/presupuestoEscaparate/${codigoOT}`);
    }

    // Obtiene datos de un módulo específico de Zoho   
    async obtenerDatosModuloZoho(modulo, criteria = null) {
        try {
            let endpoint = `/api/recogerModuloZoho?modulo=${modulo}`;
            
            if (criteria) {
                endpoint += `&criteria=${encodeURIComponent(criteria)}`;
            }
            
            const response = await this.fetchWithAuth(endpoint);
            return response;
        } catch (error) {
            console.error(`Error al obtener datos del módulo ${modulo}:`, error);
            return { error: error.message, data: [] };
        }
    }

    // Obtiene todos los puntos de venta desde Zoho    
    async obtenerPuntosDeVenta() {
        const response = await this.obtenerDatosModuloZoho('PuntosDeVenta');
        return response.proveedores || [];
    }

    // Obtiene la lista de materiales para presupuestos desde Zoho    
    async obtenerMateriales() {
        try {
            const response = await this.obtenerDatosModuloZoho('PreciosMaterialesYServ');
            
            // Verificar si los datos están en formato esperado
            if (response.proveedores && Array.isArray(response.proveedores)) {
                return response.proveedores;
            } else if (response.data && Array.isArray(response.data)) {
                return response.data;
            } else if (Array.isArray(response)) {
                return response;
            }
            
            console.warn('Los datos de materiales no tienen el formato esperado');
            return [];  
        } catch (error) {
            console.error('Error al obtener materiales:', error);
            return [];
        }      
    }

    // Obtiene la lista de elementos existentes que pueden ser reutilizados     
    async obtenerElementosExistentes() {
        try {
            // Usar obtenerDatosModuloZoho de manera similar a obtenerPuntosDeVenta
            const response = await this.obtenerDatosModuloZoho('ElementosDeEscaparates');
            return response.proveedores || [];
        } catch (error) {
            console.error('Error al obtener elementos existentes:', error);
            // Devolver un array vacío en caso de error para evitar fallos en la UI
            return [];
        }
    }

    // Envía los datos actualizados del presupuesto al backend para generar PDF   
    async enviarPresupuestoActualizado(codigoOT, datos) {
        // Estructurar los datos como espera el backend: {data: {data: [datos]}}
        const datosFormateados = {
            data: {
                data: [datos]
            }
        };
        
        return await this.fetchBlobWithAuth(`/api/descargarPresupuesto`, {
            method: 'POST',
            body: JSON.stringify(datosFormateados)
        });
    }

    // Crea el presupuesto en Notion con los datos actualizados
    async crearPresupuestoEnNotion(codigoOT, datos) {
        // Estructurar los datos como espera el backend: {data: {data: [datos]}}
        const datosFormateados = {
            data: {
                data: [datos]
            }
        };
        
        return await this.fetchWithAuth(`/api/crear/presupuesto/ot`, {
            method: 'POST',
            body: JSON.stringify(datosFormateados)
        });
    }
}

// Crear instancia global
window.apiServices = new ApiServices(); 