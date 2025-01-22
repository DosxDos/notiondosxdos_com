import respuesta from '../utils/respuesta_util.js';
import ots_notion_service from '../services/ots_notion_service.js';

class ots_notion_controller {
    constructor(body) {
        this.body = body;

        // Enlazar métodos para mantener el contexto de `this`
        this.getBody = this.getBody.bind(this);
        this.crearOt = this.crearOt.bind(this);
    }

    getBody() {
        return this.body;
    }

    async crearOt() {
        return new Promise(async (resolve) => {
            const otsNotionService = new ots_notion_service(this.body);
            const responseNotion = await otsNotionService.crearOt();
            const respuestas = new respuesta(responseNotion.message, responseNotion.data, responseNotion.page, responseNotion.limit);
            const response = respuestas.responder(responseNotion);
            resolve(response);
        });
    }

}

export default ots_notion_controller;