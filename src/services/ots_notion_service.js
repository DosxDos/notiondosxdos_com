import { Client } from '@notionhq/client';
import MongoDB from './../DB/MongoDB.js'; // Importamos la clase MongoDB

class ots_notion_service {
    constructor(body) {
        this.body = body;

        // Verificar si la API_KEY está definida correctamente
        if (!process.env.API_KEY) {
            console.error("API_KEY no está definida en las variables de entorno");
            throw new Error("API_KEY no está definida");
        }

        this.notion = new Client({
            auth: process.env.API_KEY,
        });

        // Enlazar métodos para asegurar el contexto de `this`
        this.getBody = this.getBody.bind(this);
        this.crearOt = this.crearOt.bind(this);
        this.putOt = this.putOt.bind(this);
        this.deleteOt = this.deleteOt.bind(this); // Método para eliminar la OT
    }

    getBody() {
        return this.body;
    }

    crearOt() {
        const mongo = new MongoDB();
        return new Promise(async (resolve) => {
            try {

                //await mongo.connect(); // Conectar a la base de datos

                if (this.body.hasOwnProperty("departamentosRelacionados") &&
                    this.body.hasOwnProperty("codigo") &&
                    this.body.hasOwnProperty("prefijo") &&
                    this.body.hasOwnProperty("navision") &&
                    this.body.hasOwnProperty("nombreDeOT") &&
                    this.body.hasOwnProperty("clienteNotion") &&
                    this.body.hasOwnProperty("firma") &&
                    this.body.hasOwnProperty("tipoDeOT") &&
                    this.body.hasOwnProperty("subtipoDeOT") &&
                    this.body.hasOwnProperty("fechaDePrevision") &&
                    this.body.hasOwnProperty("fotosDeOT") &&
                    this.body.hasOwnProperty("id")) {

                    await mongo.connect(); // Conectar a la base de datos

                    const mapearDatos = await this._mapearDatos(this.body);

                    // Verificar si 'data' existe en mapearDatos y es iterable
                    if (Array.isArray(mapearDatos.data)) {
                        // Si es iterable, lo pasamos a la función mongo.createIfNotExists
                        let otGuardada = await mongo.createIfNotExists("ot", this.body.codigo, mapearDatos);

                        console.log("otGuardada:", otGuardada);

                        if (otGuardada == false) {
                            //comprobamos si la OT ya existe en la base de datos
                            const response = await this.notion.databases.query({
                                database_id: process.env.NOTION_DATABASE_ID,
                                filter: {
                                    property: process.env.NUMERO_ID,
                                    title: {
                                        equals: this.body.codigo, // Filtra por el código de la OT (ej. 0001)
                                    },
                                },
                            });
                            // Si la OT ya existe en la base de datos, respondemos con un error
                            if (response.results.length > 0) {
                                const response = {};
                                response.status = false;
                                response.message = 'La OT ya existe en la base de datos y no se envió a Notion.';
                                response.code = 200;
                                response.data = 'No hubo cambios en la OT, por lo que no se sincronizó con Notion.';
                                response.page = null;
                                response.limit = null;
                                resolve(response);
                                return;
                            }
                        }
                    } else {
                        // Si no es un array, asignamos un valor predeterminado o retornamos un error
                        throw new Error("data no es un array o no está definido correctamente.");
                    }


                    const notion = new Client({
                        auth: process.env.API_KEY,
                    });
                    let departamentos = this.body.departamentosRelacionados;
                    let arrayOfObjects;
                    if (departamentos) {
                        arrayOfObjects = departamentos.split(';').map(value => {
                            return { name: value };
                        });
                    } else {
                        arrayOfObjects = [];
                    }
                    const solicitud1 = {
                        // Creando una nueva página en una base de datos
                        icon: {
                            type: "emoji",
                            emoji: "📁", // icono del elemento
                        },
                        parent: {
                            type: "database_id",
                            database_id: process.env.NOTION_DATABASE_ID,
                        },
                        properties: {
                            [process.env.NUMERO_ID]: {
                                // Título de la página
                                title: [
                                    {
                                        text: {
                                            content: this.body.codigo,
                                        },
                                    },
                                ],
                            },
                            [process.env.PREFIJO_ID]: {
                                // Prefijo
                                rich_text: [
                                    {
                                        text: {
                                            content: this.body.prefijo,
                                        },
                                    },
                                ],
                            },
                            [process.env.NAVISION_ID]: {
                                rich_text: [
                                    {
                                        text: {
                                            content: this.body.navision,
                                        },
                                    },
                                ],
                            },
                            [process.env.NOMBRE_ID]: {
                                // Nombre
                                rich_text: [
                                    {
                                        text: {
                                            content: this.body.nombreDeOT,
                                        },
                                    },
                                ],
                            },
                            [process.env.CLIENTE_ID]: {
                                // Cliente
                                rich_text: [
                                    {
                                        text: {
                                            content: this.body.clienteNotion,
                                        },
                                    },
                                ],
                            },
                            [process.env.FIRMA_ID]: {
                                // Firma
                                rich_text: [
                                    {
                                        text: {
                                            content: this.body.firma,
                                        },
                                    },
                                ],
                            },
                            [process.env.TIPO_DE_OT_ID]: {
                                // Tipo de la OT
                                rich_text: [
                                    {
                                        text: {
                                            content: this.body.tipoDeOT,
                                        },
                                    },
                                ],
                            },
                            [process.env.SUBTIPO_ID]: {
                                // Subtipo de la OT
                                rich_text: [
                                    {
                                        text: {
                                            content: this.body.subtipoDeOT,
                                        },
                                    },
                                ],
                            },
                            [process.env.DEPARTAMENTO_RELACIONADO_ID]: {
                                // Departamentos - Reemplazar por arrayOfObjects si es necesario
                                multi_select: arrayOfObjects,
                            },
                            [process.env.FECHA_DE_MONTAJE_ID]: {
                                // Fecha de montaje
                                date: {
                                    start: this.body.fechaDePrevision || "1970-01-01",
                                },
                            },
                            [process.env.PHOTOAPP_ID]: {
                                // PhotoApp
                                url: this.body.fotosDeOT || "dosxdos.app",
                            },
                            [process.env.CRM_ID]: {
                                rich_text: [
                                    {
                                        text: {
                                            content: this.body.id,
                                        },
                                    },
                                ],
                            },
                        },
                    };
                    // Llamada a la API de Notion
                    const response = await notion.pages.create(solicitud1);
                    const solicitud2 = {
                        "parent": {
                            "page_id": response.id
                        },
                        "rich_text": [
                            {
                                "text": {
                                    "content": this.body.observaciones
                                }
                            }
                        ]
                    }
                    const response2 = await notion.comments.create(solicitud2);
                    const finalResponse = {};
                    finalResponse.status = true;
                    finalResponse.message = 'Se ha enviado exitosamente la solicitud a NOTION para crear la nueva OT';
                    finalResponse.code = 200;
                    finalResponse.data = {};
                    finalResponse.data.response1 = response;
                    finalResponse.data.response2 = response2;
                    finalResponse.page = null;
                    finalResponse.limit = null;
                    resolve(finalResponse);
                    //}
                } else {
                    const response = {};
                    response.status = false;
                    response.message = 'No se han enviado en el cuerpo de la solicitud todas las variables necesarias';
                    response.code = 400;
                    response.data = null;
                    response.page = null;
                    response.limit = null;
                    resolve(response);
                }
            } catch (error) {
                console.error("Error en crearOt():", error);
                const response = {};
                response.status = false;
                response.message = error.message + " - Error en catch al intentar crear la nueva OT en NOTION. ots_notion_service.js. crearOt() - ";
                response.code = 500;
                response.data = error.stack || error;
                response.page = null;
                response.limit = null;
                resolve(response);
            }
        });
    }
    // Método para actualizar la OT en Notion
    async putOt() {
        return new Promise(async (resolve) => {
            try {
                // Filtramos directamente por el código único (this.body.codigo)
                const response = await this.notion.databases.query({
                    database_id: process.env.NOTION_DATABASE_ID,
                    filter: {
                        property: process.env.NUMERO_ID,
                        title: {
                            equals: this.body.codigo, // Filtra por el código de la OT (ej. 0001)
                        },
                    },
                });

                if (response.results.length > 0) {
                    // Si existe, obtenemos el ID de la página
                    const pageId = response.results[0].id;

                    // Preparar los datos para actualizar la página
                    const solicitud = {
                        page_id: pageId,
                        properties: {
                            [process.env.PREFIJO_ID]: {
                                rich_text: [{ text: { content: this.body.prefijo } }],
                            },
                            [process.env.NAVISION_ID]: {
                                rich_text: [{ text: { content: this.body.navision } }],
                            },
                            [process.env.NOMBRE_ID]: {
                                rich_text: [{ text: { content: this.body.nombreDeOT } }],
                            },
                            [process.env.CLIENTE_ID]: {
                                rich_text: [{ text: { content: this.body.clienteNotion } }],
                            },
                            [process.env.FIRMA_ID]: {
                                rich_text: [{ text: { content: this.body.firma } }],
                            },
                            [process.env.TIPO_DE_OT_ID]: {
                                rich_text: [{ text: { content: this.body.tipoDeOT } }],
                            },
                            [process.env.SUBTIPO_ID]: {
                                rich_text: [{ text: { content: this.body.subtipoDeOT } }],
                            },
                            [process.env.DEPARTAMENTO_RELACIONADO_ID]: {
                                multi_select: this.body.departamentosRelacionados.split(';').map(value => ({ name: value })),
                            },
                            [process.env.FECHA_DE_MONTAJE_ID]: {
                                date: { start: this.body.fechaDePrevision || "1970-01-01" },
                            },
                            [process.env.PHOTOAPP_ID]: {
                                url: this.body.fotosDeOT || "dosxdos.app",
                            },
                        },
                    };

                    // Llamamos a la API para actualizar la página
                    const updateResponse = await this.notion.pages.update(solicitud);

                    // Responder con éxito
                    resolve({
                        status: true,
                        message: 'OT actualizada correctamente en Notion.',
                        code: 200,
                        data: updateResponse,
                    });
                } else {
                    // Si no se encuentra la OT con el código, respondemos con error
                    resolve({
                        status: false,
                        message: 'No se encontró una OT con ese código.',
                        code: 404,
                        data: null,
                    });
                }
            } catch (error) {
                // Manejo de errores
                console.error('Error al actualizar la OT en Notion:', error);
                resolve({
                    status: false,
                    message: error.message,
                    code: 500,
                    data: error.stack || error,
                });
            }
        });
    }

    // Método para eliminar la OT (archivándola en Notion)
    deleteOt() {
        return new Promise(async (resolve) => {
            try {
                // Filtramos por el código único (this.body.codigo)
                const response = await this.notion.databases.query({
                    database_id: process.env.NOTION_DATABASE_ID,
                    filter: {
                        property: process.env.NUMERO_ID,
                        title: {
                            equals: this.body.codigo, // Filtra por el código de la OT (ej. 0001)
                        },
                    },
                });

                if (response.results.length > 0) {
                    // Si existe, obtenemos el ID de la página
                    const pageId = response.results[0].id;

                    // Preparar los datos para archivar la página (marcarla como "archived": true)
                    const solicitud = {
                        page_id: pageId,
                        archived: true, // Marcamos la página como archivada
                    };

                    // Llamamos a la API para archivar la página
                    const deleteResponse = await this.notion.pages.update(solicitud);

                    // Responder con éxito
                    resolve({
                        status: true,
                        message: 'OT archivada correctamente en Notion.',
                        code: 200,
                        data: deleteResponse,
                    });
                } else {
                    // Si no se encuentra la OT con el código, respondemos con error
                    resolve({
                        status: false,
                        message: 'No se encontró una OT con ese código.',
                        code: 404,
                        data: null,
                    });
                }
            } catch (error) {
                // Manejo de errores
                console.error('Error al archivar la OT en Notion:', error);
                resolve({
                    status: false,
                    message: error.message,
                    code: 500,
                    data: error.stack || error,
                });
            }
        });
    }
    async _mapearDatos($body) {
        return {
            data: [
                {
                    "Deal_Name": $body.nombreDeOT,            // Nombre de la OT
                    "C_digo": $body.codigo,                   // Código de la OT
                    "clienteNotion": $body.clienteNotion,     // Cliente de la OT
                    "Firma": $body.firma,                     // Firma de la OT
                    "Tipo_de_OT": $body.tipoDeOT,             // Tipo de la OT
                    "Subtipo_de_la_OT": $body.subtipoDeOT,    // Subtipo de la OT
                    "Fecha_de_previsi_n": $body.fechaDePrevision, // Fecha de previsión
                    "Fotos_de_la_OT": $body.fotosDeOT,        // Fotos de la OT
                    "Comentario": $body.comentarios,          // Comentarios
                    "Departamentos_afectados": $body.departamentosRelacionados,
                    "Prefijo": $body.prefijo,
                    "Navision": $body.navision,
                    "id": $body.id
                }
            ]
        };
    }
}

export default ots_notion_service;