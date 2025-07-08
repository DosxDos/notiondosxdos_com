import Zoho from '../zoho_api/Zoho.js'; // Importamos la clase ZohoCRM
import dotenv from 'dotenv';
import axios from 'axios'; // Usamos axios para hacer solicitudes HTTP

class clientes_crmzoho_service {
    constructor() {
        dotenv.config(); // Cargar variables de entorno
        // Establecer campos del CRM
        this.moduloCrm = 'Accounts'; // Módulo clientes de Zoho CRM
        this.camposCrm = 'id, Account_Name, CIF_NIF1, Descuento_montaje, Descuento_realizaci_n, Grupo_contable_cliente, Grupo_contable, Grupo_registro_IVA_neg, N1, Account_Number, Account_Type, Industry'; // Campos a seleccionar en Zoho CRM
        // Enlazar contexto del this
        this.get_cliente = this.get_cliente.bind(this);
        this.obtenerTokenZoho = this.#obtenerTokenZoho.bind(this);
    }

    // Método para obtener un cliente con NIF en Zoho CRM
    async get_cliente(nif) {
        try {
            // Obtener el token de Zoho CRM
            const accessToken = await this.#obtenerTokenZoho(); // Obtener token de Zoho CRM
            // Crear el cuerpo para coql query
            const zohoData = {
                select_query: `SELECT ${this.camposCrm} FROM ${this.moduloCrm} WHERE CIF_NIF1 = '${nif}'`,
            }
            const response = await axios.post('https://www.zohoapis.eu/crm/v3/coql', zohoData, {
                headers: {
                    'Authorization': `Zoho-oauthtoken ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 200) {
                console.log('Búsqueda exitosa:', response.data.data[0]);
                return {
                    status: true,
                    message: 'Cliente encontrado exitosamente en Zoho CRM.',
                    code: 200,
                    data: response.data.data[0] || null,
                };
            } else {
                throw new Error(`Error al buscar el cliente: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            // En caso de error, manejamos la excepción y devolvemos un mensaje de error
            console.error('Error al buscar el cliente en la API del CRM:', error);
            return {
                status: false,
                message: error.message || 'Error desconocido al buscar el cliente en la API del CRM.',
                code: 500,
                data: error.stack || error,
            };
        }
    }

    // Método para actualizar un cliente en Zoho CRM
    async put_cliente(objeto) {
        try {
            // Obtener el token de Zoho CRM
            const accessToken = await this.#obtenerTokenZoho(); // Obtener token de Zoho CRM
            // Crear el cuerpo para coql query
            const zohoData = {
                data: [
                    objeto // El objeto que contiene los datos del cliente a actualizar, se debe pasar la popiedad 'id' para identificar el cliente, y luego se pueden pasar los campos que se quieran actualizar, las propiedades deben coincidir con los nombres API de los campos en Zoho CRM. Ver ejemplo al final en PRUEBAS DEL SERVICIO.
                ]
            }
            const response = await axios.put('https://www.zohoapis.eu/crm/v3/Accounts', zohoData, {
                headers: {
                    'Authorization': `Zoho-oauthtoken ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 200) {
                console.log('Actualización de cliente exitosa en CRM ZOHO:', response.data.data[0]);
                return {
                    status: true,
                    message: 'Actualización de cliente exitosa en CRM ZOHO.',
                    code: 200,
                    data: response.data.data[0] || null,
                };
            } else {
                throw new Error(`Error al actualizar el cliente en CRM ZOHO: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            // En caso de error, manejamos la excepción y devolvemos un mensaje de error
            console.error('Error al actualizar el cliente en CRM ZOHO:', error);
            return {
                status: false,
                message: error.message || 'Error desconocido al actualizar el cliente en CRM ZOHO.',
                code: 500,
                data: error.stack || error,
            };
        }
    }


    // Método privado para obtener el token de acceso a Zoho CRM
    async #obtenerTokenZoho() {
        const zoho = new Zoho();
        const accessToken = await zoho.getZohoAccessToken();

        if (!accessToken) {
            throw new Error('No se pudo obtener el token de acceso a Zoho CRM.');
        }

        return accessToken;
    }
}

// PRUEBAS DEL SERVICIO


// GET CLIENTE POR NIF
/*
const cliente = new clientes_crmzoho_service();
await cliente.get_cliente('Y0049134C1');
*/

// PUT CLIENTE
/*
const cliente = new clientes_crmzoho_service();
const data = {
    id: '707987000019110104',
    N1: '43000042'
}
await cliente.put_cliente(data);
*/

export default clientes_crmzoho_service;
