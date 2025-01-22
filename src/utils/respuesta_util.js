class respuesta {
    constructor(message = null, data = null, page = null, limit = null) {
        this.status = null;
        this.code = null;
        this.message = message;
        this.data = data;
        this.page = page;
        this.limit = limit;

        // Enlazar métodos para asegurar el contexto de `this`
        this.responder = this.responder.bind(this);
        this._200 = this._200.bind(this);
        this._201 = this._201.bind(this);
        this._400 = this._400.bind(this);
        this._401 = this._401.bind(this);
        this._403 = this._403.bind(this);
        this._404 = this._404.bind(this);
        this._500 = this._500.bind(this);
        this._503 = this._503.bind(this);
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

    responder(objeto) {
        if (objeto) {
            if (objeto.status) {
                switch (objeto.code) {
                    case 200:
                        return this._200();
                    case 201:
                        return this._201();
                    default:
                        return this._200();
                }
            } else {
                switch (objeto.code) {
                    case 400:
                        return this._400();
                    case 401:
                        return this._401();
                    case 403:
                        return this._403();
                    case 404:
                        return this._404();
                    case 500:
                        return this._500();
                    case 503:
                        return this._503();
                    default:
                        return this._500();
                }
            }
        } else {
            this.message = 'No se ha recibido un objeto en la función responder() del objeto de respuesta';
            return this._500();
        }
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

        return response;
    }

    _201() {
        return {
            status: true,
            code: 201,
            message: this.message || 'Recurso creado con éxito',
            data: this.data,
        };
    }

    _400() {
        return {
            status: false,
            code: 400,
            message: this.message || 'Solicitud incorrecta',
            data: this.data,
        };
    }

    _401() {
        return {
            status: false,
            code: 401,
            message: this.message || 'No autorizado',
            data: this.data,
        };
    }

    _403() {
        return {
            status: false,
            code: 403,
            message: this.message || 'Prohibido',
            data: this.data,
        };
    }

    _404() {
        return {
            status: false,
            code: 404,
            message: this.message || 'No encontrado',
            data: this.data,
        };
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

        return response;
    }

    _503() {
        return {
            status: false,
            code: 503,
            message: this.message || 'Servicio no disponible',
            data: this.data,
        };
    }
}

export default respuesta;
