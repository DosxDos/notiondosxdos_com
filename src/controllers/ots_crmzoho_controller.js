import respuesta from '../utils/respuesta_util.js';
import ots_crmzoho_service from '../services/ots_crmzoho_service.js'; // Importamos el servicio correctamente

class ots_crmzoho_controller {
    constructor(body) {
        this.body = body;
        this.otsService = new ots_crmzoho_service(body); // Se crea la instancia correctamente
    }

    async crearOt() {
        try {
            const response = await this.otsService.procesarOT(); // Asegurarse de usar el método correcto
            const respuestas = new respuesta(response.message, response.data);
            return respuestas.responder(response);
        } catch (error) {
            console.error('Error en crearOt:', error);
            return new respuesta('Error al procesar la OT en Zoho CRM', null)._500();
        }
    }
}

export default ots_crmzoho_controller;
