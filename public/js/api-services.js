/**
 * Servicio centralizado para todas las llamadas a la API
 */
class ApiServices {
    constructor() {
        this.baseUrl = ''; // URL base para las peticiones, vacío si es relativo
    }

    /**
     * Obtiene el token de autorización de la URL
     * @returns {string|null} El token o null si no se encuentra
     */
    getAuthToken() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (!token) {
            console.error('Token no encontrado en la URL');
        }
        
        return token;
    }

    /**
     * Realizar una petición a la API con el token de autorización
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} options - Opciones de fetch (method, body, etc)
     * @returns {Promise<Object>} - La respuesta en formato JSON
     */
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

    /**
     * Obtiene los datos del presupuesto por código OT
     * @param {string} codigoOT - Código de la OT
     * @returns {Promise<Object>} - Los datos del presupuesto
     */
    async obtenerPresupuestoPorOT(codigoOT) {
        return await this.fetchWithAuth(`/api/presupuestoEscaparate/${codigoOT}`);
    }

    /**
     * Obtiene la lista de materiales para presupuestos
     * @returns {Promise<Object>} - Lista de materiales
     */
    async obtenerMateriales() {
        return await this.fetchWithAuth('/api/materialesPresupuesto');
    }

    /**
     * Obtiene datos de un módulo específico de Zoho
     * @param {string} modulo - Nombre del módulo a consultar
     * @param {string} criteria - Criterios de búsqueda (opcional)
     * @returns {Promise<Object>} - Datos del módulo
     */
    async obtenerDatosModuloZoho(modulo, criteria = null) {
        let endpoint = `/api/recogerModuloZoho?modulo=${modulo}`;
        
        if (criteria) {
            endpoint += `&criteria=${encodeURIComponent(criteria)}`;
        }
        
        return await this.fetchWithAuth(endpoint);
    }

    /**
     * Obtiene todos los puntos de venta desde Zoho
     * @returns {Promise<Array>} - Array de puntos de venta
     */
    async obtenerPuntosDeVenta() {
        const response = await this.obtenerDatosModuloZoho('PuntosDeVenta');
        return response.proveedores || [];
    }

    /**
     * Obtiene la lista de elementos existentes que pueden ser reutilizados
     * @returns {Promise<Array>} - Array de elementos existentes
     */
    async obtenerElementosExistentes() {
        try {
            // Usar obtenerDatosModuloZoho de manera similar a obtenerPuntosDeVenta
            // Asumimos que el módulo se llama "Elementos_Escaparate" o algo similar
            const response = await this.obtenerDatosModuloZoho('ElementosDeEscaparates');
            return response.proveedores || [];
        } catch (error) {
            console.error('Error al obtener elementos existentes:', error);
            // Devolver un array vacío en caso de error para evitar fallos en la UI
            return [];
        }
    }
}

// Crear instancia global
window.apiServices = new ApiServices(); 