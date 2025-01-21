import respuesta from '../utils/respuesta_util.js';

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

    crearOt() {
        return new promise (async (resolve, reject) => {
            try {
                
            } catch (error) {
                
            }
        });
        
    }

}

export default ots_notion_controller;