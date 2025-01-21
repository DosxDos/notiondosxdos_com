import { Client } from '@notionhq/client';

class ots_notion_service {
    constructor(body) {
        this.body = body;
    }

    getBody() {
        return this.body;
    }

    crearOt() {
        return new promise(async (resolve, reject) => {
            try {
                if (this.body.hasOwnProperty("DepartamentosRelacionados") && this.body.hasOwnProperty("Codigo") && this.body.hasOwnProperty("Prefijo") && this.body.hasOwnProperty("Navision") && this.body.hasOwnProperty("NombreDeOT") && this.body.hasOwnProperty("clienteNotion") && this.body.hasOwnProperty("Firma") && this.body.hasOwnProperty("TipoDeOT") && this.body.hasOwnProperty("SubtipoDeOT") && this.body.hasOwnProperty("FechaDePrevision") && this.body.hasOwnProperty("FotosDeOT") && this.body.hasOwnProperty("id")) {
                    const notion = new Client({
                        auth: process.env.API_KEY,
                    });
                    let departamentos = this.body.DepartamentosRelacionados;
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
                                            content: this.body.Codigo,
                                        },
                                    },
                                ],
                            },
                            [process.env.PREFIJO_ID]: {
                                // Prefijo
                                rich_text: [
                                    {
                                        text: {
                                            content: this.body.Prefijo,
                                        },
                                    },
                                ],
                            },
                            [process.env.NAVISION_ID]: {
                                rich_text: [
                                    {
                                        text: {
                                            content: this.body.Navision,
                                        },
                                    },
                                ],
                            },
                            [process.env.NOMBRE_ID]: {
                                // Nombre
                                rich_text: [
                                    {
                                        text: {
                                            content: this.body.NombreDeOT,
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
                                            content: this.body.Firma,
                                        },
                                    },
                                ],
                            },
                            [process.env.TIPO_DE_OT_ID]: {
                                // Tipo de la OT
                                rich_text: [
                                    {
                                        text: {
                                            content: this.body.TipoDeOT,
                                        },
                                    },
                                ],
                            },
                            [process.env.SUBTIPO_ID]: {
                                // Subtipo de la OT
                                rich_text: [
                                    {
                                        text: {
                                            content: this.body.SubtipoDeOT,
                                        },
                                    },
                                ],
                            },
                            [process.env.DEPARTAMENTO_RELACIONADO_ID]: {
                                // Departamentos
                                multi_select: arrayOfObjects,
                            },
                            [process.env.FECHA_DE_MONTAJE_ID]: {
                                // Fecha de montaje
                                date: {
                                    start: this.body.FechaDePrevision || "1970-01-01",
                                },
                            },
                            [process.env.PHOTOAPP_ID]: {
                                // PhotoApp
                                url: this.body.FotosDeOT || "dosxdos.app",
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
                                    "content": this.body.Observaciones
                                }
                            }
                        ]
                    }
                    const response2 = await notion.comments.create(solicitud2);
                    resolve(response2);
                } else {
                    const response = [];
                    response[0] = false;
                    response[1] = 'No se han enviado en el cuerpo de la solicitud todas las variables necesarias';
                    response[2] = 400;
                    resolve(response);
                }
            } catch (error) {
                const response = [];
                response[0] = false;
                response[1] = error.massage;
                response[2] = 500;
                resolve(response);
            }
        });
    }
}

export default ots_notion_service;