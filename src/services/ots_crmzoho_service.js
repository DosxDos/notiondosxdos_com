//CREO QUE LA LÓGICA AQUÍ DIO MUCHAS VUELTAS, NO ES MÁS PRÁCTICO SIMPLEMENTE LUEGO DE CREAR LA OT EN EL CRM, OBTENER EL CÓDGIO DE LA OT PARA CREARLA EN MONGO DB Y NOTION? ASÍ NOS AHORRARÍAMOS LLAMADAS DE ACTUALIZACIÓN A MONGO Y NOTION - ANDRÉS
import axios from 'axios';
import MongoDB from './../DB/MongoDB.js'; // Importamos la clase MongoDB
import Zoho from '../zoho_api/Zoho.js'; // Importamos la clase ZohoCRM
import dotenv from 'dotenv';
import respuesta from '../utils/respuesta_util.js';

class ots_crmzoho_service {
    constructor(body) {
        dotenv.config(); // Cargar variables de entorno
        this.body = body;
    }

    // Método principal para procesar la OT
    async procesarOT() {
        try {
            // Paso 1: Obtener el token de Zoho CRM
            const accessToken = await this._obtenerTokenZoho(); // Obtener token de Zoho CRM
            const zohoData = this._mapearDatos(); // Mapear datos de la OT para Zoho CRM

            // Paso 2: Guardar o actualizar la OT en MongoDB
            const resultadoMongo = await this._guardarEnMongoDB(zohoData);

            if (resultadoMongo) {
                // Paso 3: Crear la OT en Zoho CRM
                const zohoResponse = await this._crearOTenZoho(zohoData, accessToken);

                // Verificamos que la creación de la OT fue exitosa
                if (zohoResponse.status) {
                    // Paso 4: Obtener el ID de la OT creada en Zoho
                    //const zohoId = zohoResponse.data.data[0].details.id;  // Obtenemos el ID de la OT

                    //console.log('ID de la OT en Zoho:', zohoId);

                    // Paso 5: Obtener el código real de la OT desde Zoho usando el ID
                    //const nuevoCodigo = await this._obtenerCodigoRealDeZoho(zohoId, accessToken);

                    //console.log('Nuevo código de Zoho:', nuevoCodigo);

                    // Paso 6: Actualizamos el código en MongoDB y Notion con el nuevo código
                    //await this._actualizarCodigoMongo(nuevoCodigo); // Actualizamos el código en MongoDB
                    //await this._actualizarCodigoNotion(nuevoCodigo); // Actualizamos el código en Notion

                    return zohoResponse;
                }

                // Si no se pudo crear la OT en Zoho, devolvemos una respuesta de error
                return {
                    status: false,
                    message: 'Error al crear la OT en Zoho CRM. No se obtuvo un id.',
                    code: 500,
                    data: zohoResponse.data,
                };
            } else {
                // Si la OT ya existía en MongoDB, devolvemos un mensaje indicando que no se enviaron cambios a Zoho CRM
                return {
                    status: true,
                    message: 'La OT ya existía en la base de datos y no se envió a Zoho CRM.',
                    code: 200,
                    data: 'No hubo cambios en la OT, por lo que no se sincronizó con Zoho CRM.',
                };
            }

        } catch (error) {
            // En caso de error, manejamos la excepción y devolvemos un mensaje de error
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

        return accessToken;
    }

    // Método privado para mapear los datos de la OT para Zoho CRM
    _mapearDatos() {
        return {
            data: [
                {
                    "Deal_Name": this._getPropertyValue(' '), // Número de OT
                    "C_digo": this._getPropertyValue('Nº'),    // Código de la OT
                    "clienteNotion": this._getPropertyValue('*Cliente'),  // Cliente de la OT
                    "Firma": this._getPropertyValue('*Firma'),  // Firma de la OT
                    "Tipo_de_OT": this._getPropertyValue('*Tipo de OT'), // Tipo de la OT
                    "Subtipo_de_la_OT": this._getPropertyValue('*Subtipo'), // Subtipo de la OT
                    "Fecha_de_previsi_n": this._getPropertyValue('Fecha de previsión'), // Fecha de previsión
                    "Fotos_de_la_OT": this._getPropertyValue('*PhotoApp'), // URL de la foto
                    "Comentario": this.body.comentarios || '', // Comentarios (asumido de otro lugar)
                    "Departamentos_relacionados": this._getPropertyValue('Departamentos_relacionados'), // Departamentos relacionados
                    "Prefijo": this._getPropertyValue('*Prefijo'),  // Prefijo
                    "Navision": this._getPropertyValue('*Navision'), // Navision
                    "Observaciones": this.body.observaciones || ''   // Observaciones (asumido de otro lugar)
                }
            ]
        };
    }

    // Función auxiliar para extraer el valor de una propiedad en el webhook
    _getPropertyValue(propertyName) {
        // Verificar si la propiedad existe en el cuerpo del webhook
        if (this.body.data.properties && this.body.data.properties[propertyName]) {
            const property = this.body.data.properties[propertyName];

            // Si es texto (rich_text), obtenemos el texto
            if (property.type === 'rich_text' && property.rich_text.length > 0) {
                return property.rich_text[0].text.content;
            }

            // Si es una fecha (date), obtenemos la fecha de inicio
            if (property.type === 'date' && property.date && property.date.start) {
                return property.date.start;
            }

            // Si es una selección (select), obtenemos el nombre seleccionado
            if (property.type === 'select' && property.select) {
                return property.select.name;
            }

            // Si es una selección (muiltiselect), obtenemos los nombres seleccionados
            if (property.type === 'multi_select' && property.multi_select) {
                return property.multi_select.map(item => item.name);
            }

            // Si es un URL, simplemente obtenemos la URL
            if (property.type === 'url' && property.url) {
                return property.url;
            }

            // Si es un título (title), extraemos el texto
            if (property.type === 'title' && property.title.length > 0) {
                return property.title[0].text.content;
            }
        }
        return '';  // Si no se encuentra el valor o no hay contenido, devolvemos una cadena vacía
    }

    // Método privado para guardar o actualizar la OT en MongoDB
    async _guardarEnMongoDB(zohoData) {
        const mongo = new MongoDB();
        //await mongo.connect();
        console.log('Conexión a MongoDB exitosa.');

        // Llamar a createIfNotExists para verificar si el documento existe
        const result = await mongo.createIfNotExists('ot', this.body.codigo, zohoData);
        console.log('Resultado de la inserción/actualización en MongoDB:', result);

        //await mongo.close();

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

            console.log('Respuesta de Zoho CRM:', JSON.stringify(response.data, null, 2));

            // Verificar si la respuesta fue exitosa
            if (response.status === 201 && response.data.data && response.data.data.length > 0) {
                const zohoId = response.data.data[0].details.id; // Obtener el id generado en Zoho CRM
                const nuevoCodigo = zohoId; // Este es el código proporcionado por Zoho CRM

                console.log('Nuevo código de Zoho:', nuevoCodigo);

                // Realizar una segunda consulta a Zoho para obtener el código real de la OT
                const codigoReal = await this._obtenerCodigoRealDeZoho(zohoId, accessToken);

                console.log('Código real obtenido de Zoho:', codigoReal);

                // Aquí actualizaríamos MongoDB y Notion con el nuevo código real
                await this._actualizarCodigoMongo(codigoReal);  // Actualiza MongoDB
                await this._actualizarCodigoNotion(codigoReal);  // Actualiza Notion

                return {
                    status: true,
                    message: 'OT creada exitosamente en Zoho CRM y MongoDB y Notion actualizados.',
                    code: 201,
                    data: response.data,
                    nuevoCodigo: codigoReal // Se incluye el código real en la respuesta
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

    // Método privado para obtener el código real de la OT desde Zoho CRM usando el ID de la OT
    async _obtenerCodigoRealDeZoho(zohoId, accessToken) {
        try {
            // Realizamos una solicitud GET para obtener más detalles del registro usando su ID
            const response = await axios.get(`https://www.zohoapis.eu/crm/v2/Deals/${zohoId}`, {
                headers: {
                    'Authorization': `Zoho-oauthtoken ${accessToken}`,
                },
            });

            console.log('Detalles de la OT desde Zoho CRM:', JSON.stringify(response.data, null, 2));

            // Verificamos que la respuesta contenga los datos esperados
            if (response.data && response.data.data && response.data.data.length > 0) {
                const otDetails = response.data.data[0];

                // Extraemos el código real de la OT desde Zoho (por ejemplo, en 'C_digo')
                const codigoReal = otDetails.C_digo || ''; // Suponiendo que el código real está en el campo 'C_digo'

                return codigoReal; // Retornamos el código real para actualizar MongoDB y Notion
            } else {
                throw new Error('No se encontraron datos para la OT en Zoho CRM.');
            }
        } catch (error) {
            console.error('Error al obtener el código real de Zoho:', error);
            throw error; // Lanza el error para que el flujo se detenga
        }
    }


    async _obtenerCodigoRealDeZoho(zohoId, accessToken) {
        try {
            // Realizamos una solicitud GET para obtener más detalles del registro usando su ID
            const response = await axios.get(`https://www.zohoapis.eu/crm/v2/Deals/${zohoId}`, {
                headers: {
                    'Authorization': `Zoho-oauthtoken ${accessToken}`,
                },
            });

            console.log('Detalles de la OT desde Zoho CRM:', JSON.stringify(response.data, null, 2));

            // Verificamos que la respuesta contenga los datos esperados
            if (response.data && response.data.data && response.data.data.length > 0) {
                const otDetails = response.data.data[0];

                // Extraemos el código real de la OT desde Zoho (por ejemplo, en 'C_digo')
                const codigoReal = otDetails.C_digo || ''; // Suponiendo que el código real está en el campo 'C_digo'

                return codigoReal; // Retornamos el código real para actualizar MongoDB y Notion
            } else {
                throw new Error('No se encontraron datos para la OT en Zoho CRM.');
            }
        } catch (error) {
            console.error('Error al obtener el código real de Zoho:', error);
            throw error; // Lanza el error para que el flujo se detenga
        }
    }

    // Método privado para actualizar el C_digo en MongoDB con el nuevo código de Zoho CRM
    async _actualizarCodigoMongo(nuevoCodigo) {
        const mongo = new MongoDB();
        console.log('Actualizando código en MongoDB');

        const actualizar = await mongo._actualizarCodigoMongo(nuevoCodigo);

        if (actualizar == false) {
            console.log("No se ha podido actualizar el C_digo de mongoDB");
        }
        console.log('Se actualizo el código');

    }

    // Método privado para actualizar el código de la OT en Notion con el nuevo código
    async _actualizarCodigoNotion(nuevoCodigo) {
        // Verificar si el ID de la página de Notion está presente
        if (!this.body.data.id) {
            console.error('Error: El ID de la página de Notion no está presente.');
            return;
        }

        // Eliminar los guiones del ID de la página de Notion
        const notionPageId = this.body.data.id.replace(/-/g, '');  // Eliminar todos los guiones

        // Mostrar el ID sin guiones
        console.log('Actualizando código en Notion para la página ID (sin guiones):', notionPageId);

        // Construir la URL de la API de Notion
        const notionApiUrl = 'https://api.notion.com/v1/pages/' + notionPageId;

        const updateData = {
            "parent": {
                "type": "database_id",
                "database_id": process.env.PROYECTOS_NOTION //Este es el id de la base de datos de "Proyectos" en Notion
            },
            "properties": {
                "Nº": {
                    "title": [
                        {
                            "text": {
                                "content": nuevoCodigo
                            }
                        }
                    ]
                }
            }
        };

        console.log('updateData :', JSON.stringify(updateData));

        try {
            const response = await axios.patch(notionApiUrl, updateData, {
                headers: {
                    'Authorization': `Bearer ${process.env.API_KEY}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json',
                },
            });
            console.log('Código actualizado en Notion:', response.data);
        } catch (error) {
            console.error('Error al actualizar el código en Notion:', error);
        }
    }
}

export default ots_crmzoho_service;
