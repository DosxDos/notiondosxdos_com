// Archivo: controllers/presupuesto_notion_controller.js
import respuesta from '../utils/respuesta_util.js';
import presupuesto_notion_service from '../services/presupuesto_notion_service.js';

class presupuesto_notion_controller {
    constructor(body) {
        this.body = body;

        this.getBody = this.getBody.bind(this);
        this.crearFormularioDeOtEscaparate = this.crearFormularioDeOtEscaparate.bind(this);
        this.actualizarOt = this.putOt?.bind(this);
        this.deleteOt = this.deleteOt?.bind(this);
    }

    getBody() {
        return this.body;
    }

    async crearFormularioDeOtEscaparate() {
        return new Promise(async (resolve) => {
            const otsNotionService = new presupuesto_notion_service(this.body);
            const responseNotion = await otsNotionService.crearFormularioDeOtEscaparate();
            const respuestas = new respuesta(responseNotion.message, responseNotion.data, responseNotion.page, responseNotion.limit);
            const response = respuestas.responder(responseNotion);
            resolve(response);
        });
    }
}

export default presupuesto_notion_controller;