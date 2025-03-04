import axios from 'axios';
import MongoDB from './../DB/MongoDB.js'; // Importamos la clase MongoDB
import Zoho from '../zoho_api/Zoho.js'; // Importamos la clase ZohoCRM

class ots_crmzoho_service {
    constructor(body) {
        this.body = body;
    }

    // Método principal para procesar la OT
    async procesarOT() {
        try {
            const accessToken = await this._obtenerTokenZoho(); // Obtener token de Zoho CRM
            const zohoData = this._mapearDatos(); // Mapear datos de la OT para Zoho CRM

            const resultadoMongo = await this._guardarEnMongoDB(zohoData);

            if (resultadoMongo) {
                // Solo intenta crear en Zoho si la OT fue efectivamente insertada o actualizada en MongoDB
                return await this._crearOTenZoho(zohoData, accessToken);
            } else {
                return {
                    status: true,
                    message: 'La OT ya existía en la base de datos y no se envió a Zoho CRM.',
                    code: 200,
                    data: 'No hubo cambios en la OT, por lo que no se sincronizó con Zoho CRM.',
                };
            }
        } catch (error) {
            console.error('Error al procesar la OT:', error);
            return {
                status: false,
                message: error.message || 'Error desconocido al procesar la OT.',
                code: 500,
                data: error.stack || error,
            };
        }
    }

    // Método privado para obtener el token de acceso a Zoho CRM
    async _obtenerTokenZoho() {
        const zoho = new Zoho();
        const accessToken = await zoho.getZohoAccessToken();

        if (!accessToken) {
            throw new Error('No se pudo obtener el token de acceso a Zoho CRM.');
        }

        console.log('Token de acceso obtenido:', accessToken);
        return accessToken;
    }

    // Método privado para mapear los datos de la OT para Zoho CRM
    _mapearDatos() {
        return {
            data: [
                {
                    "Deal_Name": this.body.nombreDeOT,            // Nombre de la OT
                    "C_digo": this.body.codigo,                   // Código de la OT
                    "clienteNotion": this.body.clienteNotion,     // Cliente de la OT
                    "Firma": this.body.firma,                     // Firma de la OT
                    "Tipo_de_OT": this.body.tipoDeOT,             // Tipo de la OT
                    "Subtipo_de_la_OT": this.body.subtipoDeOT,    // Subtipo de la OT
                    "Fecha_de_previsi_n": this.body.fechaDePrevision, // Fecha de previsión
                    "Fotos_de_la_OT": this.body.fotosDeOT,        // Fotos de la OT
                    "Comentario": this.body.comentarios,          // Comentarios
                }
            ]
        };
    }

    // Método privado para guardar o actualizar la OT en MongoDB
    async _guardarEnMongoDB(zohoData) {
        const mongo = new MongoDB();
        await mongo.connect();
        console.log('Conexión a MongoDB exitosa.');

        // Llamar a createIfNotExists para verificar si el documento existe
        const result = await mongo.createIfNotExists('ot', this.body.codigo, zohoData);
        console.log('Resultado de la inserción/actualización en MongoDB:', result);

        await mongo.close();

        // Devuelve verdadero si la OT fue creada o actualizada, falso si ya existía
        return result !== false;
    }

    // Método privado para crear la OT en Zoho CRM
    async _crearOTenZoho(zohoData, accessToken) {
        try {
            const response = await axios.post('https://www.zohoapis.eu/crm/v2/Deals', zohoData, {
                headers: {
                    'Authorization': `Zoho-oauthtoken ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Respuesta de Zoho CRM:', response.data);

            // Verificar si la respuesta fue exitosa
            if (response.status === 201 && response.data.data && response.data.data.length > 0) {
                const zohoId = response.data.data[0].details.id; // Obtener el id generado en Zoho CRM

                // Llamar a la API de Zoho CRM para obtener el C_digo de la OT
                const zohoDetails = await this._obtenerDatosDeZoho(zohoId, accessToken);

                // Actualizamos MongoDB con el nuevo C_digo (id de Zoho CRM)
                await this._actualizarMongoDB(zohoDetails.C_digo);

                return {
                    status: true,
                    message: 'OT creada exitosamente en Zoho CRM y MongoDB actualizado.',
                    code: 201,
                    data: response.data,
                };
            } else {
                return {
                    status: false,
                    message: 'Error al crear la OT en Zoho CRM. No se obtuvo un id.',
                    code: 500,
                    data: response.data,
                };
            }
        } catch (error) {
            console.error('Error al crear la OT en Zoho CRM:', error);

            return {
                status: false,
                message: error.message || 'Error desconocido al crear la OT en Zoho CRM.',
                code: 500,
                data: error.stack || error,
            };
        }
    }

    // Método privado para obtener los detalles de una OT desde Zoho CRM usando el id
    async _obtenerDatosDeZoho(zohoId, accessToken) {
        try {
            // Llamada a la API para obtener los detalles de la OT
            const response = await axios.get(`https://www.zohoapis.eu/crm/v2/Deals/${zohoId}`, {
                headers: {
                    'Authorization': `Zoho-oauthtoken ${accessToken}`,
                },
            });

            console.log('Datos de la OT desde Zoho CRM:', response.data);

            // Verificamos que la respuesta contiene los datos esperados
            if (response.data && response.data.data && response.data.data.length > 0) {
                const otDetails = response.data.data[0];

                // Aseguramos que existe el campo 'C_digo' en los detalles de la OT
                if (otDetails && otDetails.C_digo) {
                    return { C_digo: otDetails.C_digo }; // Retornamos el C_digo que es el identificador
                } else {
                    throw new Error('El campo "C_digo" no se encuentra en los detalles de la OT en Zoho CRM.');
                }
            } else {
                throw new Error('No se encontraron datos para la OT en Zoho CRM.');
            }
        } catch (error) {
            console.error('Error al obtener los datos de Zoho CRM:', error);
            throw error; // Lanza el error para que el flujo se detenga
        }
    }

    // Método para actualizar el C_digo en MongoDB con el id de Zoho CRM
    async _actualizarMongoDB(zohoId) {
        const mongo = new MongoDB();
        await mongo.connect();
        console.log('Conexión a MongoDB exitosa.');

        // Actualizamos el campo C_digo en MongoDB con el id de Zoho CRM
        const result = await mongo.db.collection('ot').updateOne(
            { 'data.C_digo': this.body.codigo }, // Buscamos por el C_digo original (00000)
            { $set: { 'data.$.C_digo': zohoId } } // Actualizamos el campo C_digo con el id de Zoho
        );

        console.log('MongoDB actualizado:', result);

        await mongo.close();
    }
}

export default ots_crmzoho_service;
