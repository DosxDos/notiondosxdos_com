import respuesta from '../utils/respuesta_util.js';
import ots_notion_service from '../services/ots_notion_service.js';

class ots_notion_controller {
    constructor(body) {
        this.body = body;

        // Enlazar métodos para mantener el contexto de `this`
        this.getBody = this.getBody.bind(this);
        this.crearOt = this.crearOt.bind(this);
        this.actualizarOt = this.putOt.bind(this);
        this.deleteOt = this.deleteOt.bind(this); // Método para eliminar la OT
        this.enviarACRM = this.enviarACRM.bind(this); // Método para enviar a Zoho
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

    async putOt() {
        return new Promise(async (resolve) => {
            const otsNotionService = new ots_notion_service(this.body);
            const responseNotion = await otsNotionService.putOt();
            const respuestas = new respuesta(responseNotion.message, responseNotion.data, responseNotion.page, responseNotion.limit);
            const response = respuestas.responder(responseNotion);
            resolve(response);
        });
    }

     // Método para manejar la eliminación de la OT
     async deleteOt() {
        const otsNotionService = new ots_notion_service(this.body);
        const responseNotion = await otsNotionService.deleteOt();
        const respuestas = new respuesta(responseNotion.message, responseNotion.data, responseNotion.page, responseNotion.limit);
        const response = respuestas.responder(responseNotion);
        return response;
    }


}

export default ots_notion_controller;