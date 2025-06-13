import respuesta from '../utils/respuesta_util.js';
import a3Erp from '../services/a3_erp_service.js';
import Zoho from '../zoho_api/Zoho.js'; // Ajusta la ruta según la ubicación real del archivo Zoho.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config(); // Cargar variables de entorno
import MongoDB from '../DB/MongoDB.js';

class a3Erp_controller {
    constructor(body) {
        this.body = body;
        // Enlazar métodos para mantener el contexto de `this`
        this.getBody = this.getBody.bind(this);
        this.crearCliente = this.crearCliente.bind(this);
    }

    getBody() {
        return this.body;
    }

    async crearCliente() {
        return new Promise(async (resolve) => {
            const _a3Erp = new a3Erp;
            console.log("Propiedad body del servicio: ", this.body);
            const mongo = new MongoDB;
            const respuestas = new respuesta;
            const response = {};
            const respuestaFinal = {};
            mongo.connect()
                .then((result) => {
                    const bodyForMongo = {
                        data: this.body // Envuelve el objeto en un array dentro de 'data'
                    };
                    mongo.createIfNotExists('clientesA3Post', this.body.C_digo, bodyForMongo)
                        .then((result) => {
                            console.log("Respuesta de MongoDB: ", result);
                            respuestas.message = "Respuesta recibida de MongoDB";

                            respuestaFinal.mongoResponse = result;
                            _a3Erp.post("cliente", this.body)
                                .then((responseA3) => {
                                    console.log("Respuesta de A3ERP: ", responseA3);
                                    respuestas.message += " - Respuesta recibida de A3ERP";
                                    respuestaFinal.a3ErpResponse = responseA3;
                                    respuestas.data = respuestaFinal;
                                    mongo.close();
                                    resolve(respuestas._200());
                                })
                                .catch((error) => {
                                    console.error("Error al crear el cliente en A3ERP: ", error);
                                    respuestas.message = "Error al crear el cliente en A3ERP";
                                    respuestas.data = error.message;
                                    mongo.close();
                                    resolve(respuestas._500());
                                });

                        })
                        .catch((error) => {
                            console.error("Error al crear el cliente en MongoDB: ", error);
                            respuestas.message = "Error al crear el cliente en MongoDB";
                            respuestas.data = error.message;
                            mongo.close();
                            resolve(respuestas._500());
                        });
                })
                .catch((error) => {
                    console.error("Error al conectar con MongoDB: ", error);
                    respuestas.message = "Error al conectar con MongoDB";
                    respuestas.data = error.message;
                    mongo.close();
                    resolve(respuestas._500());
                });

        });
    }
}

export default a3Erp_controller;

//PRUEBAS
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
data.C_digo = data.NIF;
data._id = data.NIF;
const a3ErpController = new a3Erp_controller(data);
a3ErpController.crearCliente()
    .then(response => {
        console.log("Respuesta del controlador: ", response);
    })
    .catch(error => {
        console.error("Error en el controlador: ", error);
    });
*/