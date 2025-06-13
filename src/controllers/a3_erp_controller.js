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
                    //Tratamos los datos del cuerpo para que sea compatible con A3
                    //Homologación del tipo de impuesto en A3
                    switch (this.body.TipoOperacion) {
                        case "IGIC":
                            this.body.TipoOperacion = "VIGIC";
                            this.body.TipoImpuesto = "IGIC7";
                            break;
                        case "IVA":
                            this.body.TipoOperacion = "VNAC";
                            this.body.TipoImpuesto = "ORD21";
                            break;
                        case "UE":
                            this.body.TipoOperacion = "VNOSUJ";
                            this.body.TipoImpuesto = "NOSUJETO";
                            break;
                        case "EXENTO":
                            this.body.TipoOperacion = "VNOSUJ";
                            this.body.TipoImpuesto = "NOSUJETO";
                            break;
                        case "NO SUJETO IVA":
                            this.body.TipoOperacion = "VNOSUJ";
                            this.body.TipoImpuesto = "NOSUJETO";
                            break;
                        case "NO SUJETO IGIC":
                            this.body.TipoOperacion = "VNOSUJ";
                            this.body.TipoImpuesto = "NOSUJETO";
                            break;
                    }
                    //Homologación de los términos de pago
                    switch (this.body.FormaPago) {
                        case "Net 15":
                            this.body.FormaPago = "15";
                            break;
                        case "Net 30":
                            this.body.FormaPago = "30";
                            break;
                        case "Net 45":
                            this.body.FormaPago = "45";
                            break;
                        case "Net 60":
                            this.body.FormaPago = "60";
                            break;
                        case "Net 80":
                            this.body.FormaPago = "3062";
                            break;
                        case "Net 90":
                            this.body.FormaPago = "90";
                            break;
                        case "Net 120":
                            this.body.FormaPago = "120";
                            break;
                        case "Net 150":
                            this.body.FormaPago = "150";
                            break;
                        case "Due on receipt":
                            this.body.FormaPago = "3061";
                            break;
                    }
                    // Homologación de los documentos de pago (formas de pago)
                    switch (this.body.DocumentoPago) {
                        case "CONTADO":
                            this.body.DocumentoPago = "C";
                            break;
                        case "CONFIRMING":
                            this.body.DocumentoPago = "CONF";
                            break;
                        case "TALÓN":
                            this.body.DocumentoPago = "T";
                            break;
                        case "PAGARE":
                            this.body.DocumentoPago = "P";
                            break;
                        case "TRANSF":
                            this.body.DocumentoPago = "TR";
                            break;
                        case "FACTORING":
                            this.body.DocumentoPago = "FA";
                            break;
                        case "RECIBO":
                            this.body.DocumentoPago = "R";
                            break;
                    }
                    // Homologación del grupo contable
                    switch (this.body.Caracteristica1) {
                        case "ALUVISION":
                            this.body.Caracteristica1 = "ALUVISIO";
                            break;
                        case "PARTICULARES":
                            this.body.Caracteristica1 = "PARTICUL";
                            break;
                    }
                    // Homologación de la clase de cliente
                    switch (this.body.Caracteristica2) {
                        case "Marca de lujo":
                            this.body.Caracteristica2 = "MDL";
                            break;
                        case "Perfumería":
                            this.body.Caracteristica2 = "PRF";
                            break;
                    }
                    // Homologación del representante comercial
                    switch (this.body.Representante) {
                        case null:
                            this.body.Representante = "1";
                            break;
                        case "":
                            this.body.Representante = "1";
                            break;
                    }
                    //Tratamos los datos del cuerpo para que sea compatible con Mongo
                    const bodyForMongo = {
                        data: this.body // Envuelve el objeto en un array dentro de 'data'
                    };
                    bodyForMongo.data.C_digo = this.body.NIF;
                    bodyForMongo.data._id = this.body.NIF;
                    // Creamos el cliente en el sincronizador de Mongo con el _id = NIF
                    mongo.createIfNotExists('clientesA3Post', this.body.C_digo, bodyForMongo)
                        .then((result) => {
                            console.log("Respuesta de MongoDB: ", result);
                            respuestas.message = "Respuesta recibida de MongoDB";
                            respuestaFinal.mongoResponse = result;
                            // Si en el sincronizador de Mongo no hay errores entonces creamos el cliente en A3Erp
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
