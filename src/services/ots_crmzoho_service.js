import axios from 'axios';
import MongoDB from './../DB/MongoDB.js'; // Importamos la clase MongoDB
import Zoho from '../zoho_api/Zoho.js'; // Importamos la clase ZohoCRM

class ots_crmzoho_service {

    constructor(body) {
        this.body = body;
    }

    // Método para enviar la OT a Zoho CRM
    async crearOT() {
        try {
            const mongo = new MongoDB();
            // Obtener el token de acceso
            const zoho = new Zoho();
            const accessToken = await zoho.getZohoAccessToken(); // Obtener el access token

            console.log('Token de acceso obtenido:', accessToken);

            // Mapear los datos de la OT
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
            
            await mongo.connect(); // Conectar a la base de datos

            // Usamos el método upsertByCodigo para manejar la lógica
            const result = await mongo.upsertByCodigo('ot', this.body.codigo, zohoData.data);
            console.log(result);
            await mongo.close(); // Cerramos la conexión

            // Hacer la solicitud POST a Zoho CRM para crear la OT como un "Deal"
            const responseZoho = await axios.post('https://www.zohoapis.eu/crm/v2/Deals', zohoData, {
                headers: {
                    'Authorization': `Zoho-oauthtoken ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            // Retornar la respuesta de Zoho CRM
            return {
                status: true,
                message: 'OT creada exitosamente en Zoho CRM.',
                code: 200,
                data: responseZoho.data,
            };
        } catch (error) {
            console.error('Error al enviar la OT a Zoho CRM:', error);
            return {
                status: false,
                message: 'Error al crear la OT en Zoho CRM',
                code: 500,
                data: error.message,
            };
        }
    }
}

export default ots_crmzoho_service;
