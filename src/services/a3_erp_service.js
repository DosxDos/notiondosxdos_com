import dotenv from 'dotenv';
dotenv.config(); 

class a3Erp {
    #baseUrl;
    #apiKey;
    error = null;

    constructor() {
        try {
            if (!process.env.A3ERP_URI) {
                console.error("A3ERP_URI no está definida en las variables de entorno");
                throw new Error("A3ERP_URI no está definida");
            }
            if (!process.env.A3ERP_API_KEY) {
                console.error("A3ERP_API_KEY no está definida en las variables de entorno");
                throw new Error("A3ERP_API_KEY no está definida");
            }
            this.#baseUrl = process.env.A3ERP_URI;
            this.#apiKey = process.env.A3ERP_API_KEY;

            // Enlazar contexto si es necesario
            this.crearOt = this.#execute.bind(this);
            this.putOt = this.#handleError.bind(this);
            this.deleteOt = this.get.bind(this);
            this.deleteOt = this.post.bind(this);
            this.deleteOt = this.put.bind(this);
            this.deleteOt = this.delete.bind(this);
        } catch (e) {
            this.#handleError(e);
        }
    }

    async #execute(method, endpoint, data = {}, extraHeaders = []) {
        try {
            const url = this.#baseUrl + endpoint.replace(/^\/+/, '');
            const headers = {
                'ApiKey': this.#apiKey,
                'Accept': 'application/json;odata=verbose',
                ...extraHeaders.reduce((acc, h) => {
                    const [k, v] = h.split(':').map(x => x.trim());
                    acc[k] = v;
                    return acc;
                }, {})
            };

            const options = {
                method: method.toUpperCase(),
                headers,
            };

            if (['POST', 'PUT', 'DELETE'].includes(method.toUpperCase()) && Object.keys(data).length > 0) {
                options.body = JSON.stringify(data);
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(url, options);
            const json = await response.json();
            return json;
        } catch (e) {
            this.#handleError(e);
            return null;
        }
    }

    #handleError(e) {
        this.error = {
            line: e?.lineNumber || null,
            file: e?.fileName || null,
            message: e.message || 'Error desconocido'
        };
        console.error(this.error);
    }

    get(endpoint, headers = []) {
        return this.#execute('GET', endpoint, {}, headers);
    }

    post(endpoint, data = {}, headers = []) {
        return this.#execute('POST', endpoint, data, headers);
    }

    put(endpoint, data = {}, headers = []) {
        return this.#execute('PUT', endpoint, data, headers);
    }

    delete(endpoint, data = {}, headers = []) {
        return this.#execute('DELETE', endpoint, data, headers);
    }
}

//PRUEBAS Y EJEMPLOS DE USO (sintaxis OData v3)
/*
// GET de todos los clientes
const a3erp = new a3Erp();
a3erp.get('cliente?externalFields=true')
    .then(response => console.log(response))
    .catch(error => console.error(error));
*/
// GET DE CLIENTE USANDO FILTROS (sintaxis OData v3)
/*
const a3erp = new a3Erp();
a3erp.get("cliente?externalFields=true&$filter=NIF eq 'A28050359'")
    .then(response => console.log(response))
    .catch(error => console.error(error));
*/
// POST DE CLIENTE 
/*
const data = {
    Nombre: "Andrés Felipe González Builes",
    NIF: "Y0049134C",
    Direccion: "Calle Juan Manuel Durán González 52, Escalera 2 , Piso 4E , Las Palmas de Gran Canaria",
    TipoImpuesto: "IGIC7",
    Email: "anfego1@hotmail.com",
    TipoOperacion: "VIGIC",
    FormaPago: "30",
    DocumentoPago: "TR",
    Obsoleto: "F",
    CodigoPais: "ES",
    CodigoPostal: "35010",
    Telefono: "691667081",
    Telefono2: "691667082",
    Fax: "92445454545",
    Param1: "Anfego Anfego Anfego",
    Param2: "15",
    Param3: "40",
    Param4: "Nacional",
    Direccion2: "Calle Doctor Sventenius 12, 3 izquierda, Las Palmas de Gran Canaria",
    CodigoMoneda: "EURO",
    Caracteristica1: "E COMER",
    Caracteristica2: "PRF",
    Representante: "2"
}
const a3erp = new a3Erp();
a3erp.post("cliente", data)
    .then(response => console.log(response))
    .catch(error => console.error(error));
*/