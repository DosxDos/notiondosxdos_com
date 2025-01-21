import respuesta from '../utils/respuesta_util.js';
import ots_notion_service from '../services/ots_notion_service.js';

class ots_notion_controller {
    constructor(res, req) {
        this.body = res.body;
        this.res = res;
        this.req = req;
    }

    getBody() {
        return this.body;
    }

    getRes() {
        return this.res;
    }

    getReq() {
        return this.req;
    }

    async crearOt() {
        try {
            const otsNotionService = new ots_notion_service(this.body);
            const response = await otsNotionService.crearOt();
            const finalResponse = new respuesta(this.res, response.message, response.data, response.page, response.limit);
            finalResponse.reponder(response);
        } catch (error) {
            const finalResponse = new respuesta(this.res, error.message, error);
            finalResponse._500();
        }
    }

}

export default ots_notion_controller;