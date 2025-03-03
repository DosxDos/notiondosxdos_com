import axios from 'axios';
import MongoDB from './../DB/MongoDB.js'; // Importamos la clase MongoDB
import Zoho from '../zoho_api/Zoho.js'; // Importamos la clase ZohoCRM

class ots_crmzoho_service {

    constructor(body) {
        this.body = body;
    }

    // Método para enviar la OT a Zoho CRM
    async crearOT() {
        const mongo = new MongoDB();
        const zoho = new Zoho();

        try {
            // Obtener el token de acceso
            const accessToken = await zoho.getZohoAccessToken(); // Obtener el access token
            console.log('Token de acceso obtenido:', accessToken);

            // Validar si el token de acceso fue obtenido correctamente
            if (!accessToken) {
                throw new Error('No se pudo obtener el token de acceso a Zoho.');
            }

            // Mapear los datos de la OT para Zoho CRM
            const zohoData = {
                data: [
                    {
                        "Deal_Name": this.body.nombreDeOT,            // Nombre de la OT
                        "C_digo": this.body.codigo,                    // Código de la OT
                        "clienteNotion": this.body.clienteNotion,     // Cliente de la OT
                        "Firma": this.body.firma,                      // Firma de la OT
                        "Tipo_de_OT": this.body.tipoDeOT,              // Tipo de la OT
                        "Subtipo_de_la_OT": this.body.subtipoDeOT,     // Subtipo de la OT
                        "Fecha_de_previsi_n": this.body.fechaDePrevision, // Fecha de previsión
                        "Fotos_de_la_OT": this.body.fotosDeOT,         // Fotos de la OT
                        "Comentario": this.body.comentarios           // Comentarios
                    }
                ]
            };

            // Conectar a la base de datos
            await mongo.connect();
            console.log('Conexión a MongoDB exitosa.');

            // Usamos el método upsertByCodigo para manejar la lógica de inserción
            const result = await mongo.upsertByCodigo('ot', this.body.codigo, zohoData);
            console.log('Resultado de la inserción/actualización en MongoDB:', result);

            // Cerrar la conexión a MongoDB
            await mongo.close();

            // Si la base de datos fue actualizada exitosamente
            if (result !== false) {
                // Hacer la solicitud POST a Zoho CRM para crear la OT como un "Deal"
                const responseZoho = await axios.post('https://www.zohoapis.eu/crm/v2/Deals', zohoData, {
                    headers: {
                        'Authorization': `Zoho-oauthtoken ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                console.log('Respuesta de Zoho CRM:', responseZoho.data);

                // Retornar la respuesta de Zoho CRM
                return {
                    status: true,
                    message: 'OT creada exitosamente en Zoho CRM.',
                    code: 201,
                    data: responseZoho.data,
                };
            } else {
                return {
                    status: true,
                    message: 'La actualización de la OT en la base de datos fue exitosa, pero no se envió a Zoho CRM.',
                    code: 200,
                    data: 'La base de datos se ha actualizado correctamente, pero no se ha enviado a Zoho CRM.',
                };
            }
        } catch (error) {
            console.error('Error al enviar la OT a Zoho CRM:', error);

            // Mejorar el manejo de errores
            return {
                status: false,
                message: error.message || 'Error desconocido al crear la OT en Zoho CRM',
                code: 500,
                data: error.stack || error,
            };
        }
    }
}

export default ots_crmzoho_service;
