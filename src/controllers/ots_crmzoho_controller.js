import ots_crmzoho_service from '../services/ots_crmzoho_service.js';

class ots_notion_controller {
    constructor(body) {
        this.body = body;
        this.otsService = new ots_crmzoho_service(this.body); // Instanciamos el servicio
    }

    // Método que se encarga de llamar al servicio para crear la OT
    async crearOt() {
        try {
            const response = await this.otsService.crearOT(); // Llamamos al servicio para procesar la OT
            return response;
        } catch (error) {
            return {
                status: false,
                message: error.message,
                code: 500,
                data: error.stack || error,
            };
        }
    }
}

export default ots_notion_controller;
