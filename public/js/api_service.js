class ApiService {
    constructor() {
        this.baseUrl = '/api';
    }

    // Método para hacer peticiones autenticadas
    async fetchWithAuth(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        
        // Código de autenticación (comentado temporalmente para desarrollo)
        /*
        if (!token) {
            window.location.href = '/login';
            return;
        }
        */
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
                // 'Authorization': `Bearer ${token}` // Comentado temporalmente
            }
        };

        // Solo agregar el token si existe
        if (token) {
            defaultOptions.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...defaultOptions,
                ...options,
                headers: {
                    ...defaultOptions.headers,
                    ...options.headers
                }
            });

            // Código de redirección (comentado temporalmente para desarrollo)
            /*
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
                return;
            }
            */

            // Solo redirigir si la respuesta es 401 y hay un token
            if (response.status === 401 && token) {
                localStorage.removeItem('token');
                window.location.href = '/login';
                return;
            }

            return response;
        } catch (error) {
            console.error('Error en la petición:', error);
            throw error;
        }
    }

    // Método para obtener materiales del presupuesto
    async getMaterialesPresupuesto() {
        const response = await this.fetchWithAuth('/materialesPresupuesto');
        if (!response.ok) throw new Error('Error al obtener materiales');
        return response.json();
    }

    // Método para obtener datos de Zoho
    async getDatosZoho(modulo, criteria = null) {
        let url = `/recogerModuloZoho?modulo=${encodeURIComponent(modulo)}`;
        if (criteria) {
            url += `&criteria=${encodeURIComponent(JSON.stringify(criteria))}`;
        }
        const response = await this.fetchWithAuth(url);
        if (!response.ok) throw new Error('Error al obtener datos de Zoho');
        return response.json();
    }

    // Método para obtener datos de un presupuesto específico
    async getPresupuestoEscaparate(codigoOT) {
        const response = await this.fetchWithAuth(`/presupuestoEscaparate/${codigoOT}`);
        if (!response.ok) throw new Error('Error al obtener presupuesto');
        return response.json();
    }

    // Método para generar PDF de presupuesto
    async generarPDFPresupuesto(presupuestoData) {
        const response = await this.fetchWithAuth('/descargarPresupuesto', {
            method: 'POST',
            body: JSON.stringify(presupuestoData)
        });
        if (!response.ok) throw new Error('Error al generar PDF');
        return response.blob();
    }

    // Método para crear OT en Notion
    async crearOTNotion(otData) {
        const response = await this.fetchWithAuth('/ots_notion', {
            method: 'POST',
            body: JSON.stringify(otData)
        });
        if (!response.ok) throw new Error('Error al crear OT en Notion');
        return response.json();
    }

    // Método para actualizar OT en Notion
    async actualizarOTNotion(otData) {
        const response = await this.fetchWithAuth('/ots_notion', {
            method: 'PUT',
            body: JSON.stringify(otData)
        });
        if (!response.ok) throw new Error('Error al actualizar OT en Notion');
        return response.json();
    }

    // Método para eliminar OT en Notion
    async eliminarOTNotion(otData) {
        const response = await this.fetchWithAuth('/ots_notion', {
            method: 'DELETE',
            body: JSON.stringify(otData)
        });
        if (!response.ok) throw new Error('Error al eliminar OT en Notion');
        return response.json();
    }

    // Método para crear OT en Zoho CRM
    async crearOTZoho(otData) {
        const response = await this.fetchWithAuth('/ots_crm', {
            method: 'POST',
            body: JSON.stringify(otData)
        });
        if (!response.ok) throw new Error('Error al crear OT en Zoho');
        return response.json();
    }

    // Método para actualizar OT en Zoho CRM
    async actualizarOTZoho(otData) {
        const response = await this.fetchWithAuth('/ots_crm', {
            method: 'PUT',
            body: JSON.stringify(otData)
        });
        if (!response.ok) throw new Error('Error al actualizar OT en Zoho');
        return response.json();
    }

    // Método para eliminar OT en Zoho CRM
    async eliminarOTZoho(otData) {
        const response = await this.fetchWithAuth('/ots_crm', {
            method: 'DELETE',
            body: JSON.stringify(otData)
        });
        if (!response.ok) throw new Error('Error al eliminar OT en Zoho');
        return response.json();
    }
}

// Exportar una instancia única del servicio
window.apiService = new ApiService(); 