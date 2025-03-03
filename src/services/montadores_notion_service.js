import { Client } from '@notionhq/client';

class montadores_notion_service {
    constructor(body) {
        this.body = body;

        // Enlazar métodos para asegurar el contexto de `this`
        this.getBody = this.getBody.bind(this);
        this.crearOt = this.crearOt.bind(this);
    }

    getBody() {
        return this.body;
    }

    crearMontador() {
        return new Promise(async (resolve) => {
            try {
                //Pasamos todos los campos en un array de constantes
                const requiredFields = [
                    "Apellido_del_montador", 
                    "Email", 
                    "Secondary_Email", 
                    "Created_By", 
                    "C_digo_del_montador", 
                    "Tag", 
                    "idApp", 
                    "Record_Image", 
                    "Modified_By", 
                    "Owner", 
                    "Email_Opt_Out", 
                    "Name", 
                    "Rutas", 
                    "Tel_fono_del_montador"
                ];
                //Comprobamos que todos existen
                const allFieldsExist = requiredFields.every(field => this.body.hasOwnProperty(field));
                if (allFieldsExist) {
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
}

export default montadores_notion_service;