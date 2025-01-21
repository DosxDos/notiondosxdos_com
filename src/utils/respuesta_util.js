class respuesta {

    constructor(res, message = null, data = null, page = null, limit = null) {
        this.body = res.body;
        this.res = res;
        this.status = null;
        this.code = null;
        this.message = message;
        this.data = data;
        this.page = page;
        this.limit = limit;
    }

    getBody() {
        return this.body;
    }

    getRes() {
        return this.res;
    }

    getStatus() {
        return this.status;
    }

    getCode() {
        return this.code;
    }

    getMessage() {
        return this.message;
    }

    getData() {
        return this.data;
    }

    getPage() {
        return this.page;
    }

    getLimit() {
        return this.limit;
    }

    _200() {
        const response = {
            status: true,
            code: 200,
            message: this.message || 'Solicitud exitosa',
            data: this.data,
        };

        if (this.page && this.limit) {
            response.page = this.page;
            response.limit = this.limit;
        }

        this.res.status(200).json(response);
    }

    _201() {
        const response = {
            status: true,
            code: 201,
            message: this.message || 'Recurso creado con éxito',
            data: this.data,
        };

        this.res.status(201).json(response);
    }

    _400() {
        const response = {
            status: false,
            code: 400,
            message: this.message || 'Solicitud incorrecta',
            data: this.data,
        };

        this.res.status(400).json(response);
    }

    _401() {
        const response = {
            status: false,
            code: 401,
            message: this.message || 'No autorizado',
            data: this.data,
        };

        this.res.status(401).json(response);
    }

    _403() {
        const response = {
            status: false,
            code: 403,
            message: this.message || 'Prohibido',
            data: this.data,
        };

        this.res.status(403).json(response);
    }

    _404() {
        const response = {
            status: false,
            code: 404,
            message: this.message || 'No encontrado',
            data: this.data,
        };

        this.res.status(404).json(response);
    }

    _500() {
        const response = {
            status: false,
            code: 500,
            message: this.message || 'Error interno del servidor',
            data: this.data,
        };

        if (this.page && this.limit) {
            response.page = this.page;
            response.limit = this.limit;
        }

        this.res.status(500).json(response);
    }

    _503() {
        const response = {
            status: false,
            code: 503,
            message: this.message || 'Servicio no disponible',
            data: this.data,
        };

        this.res.status(503).json(response);
    }

}

export default respuesta;