const { Client } = require('@notionhq/client');

require("dotenv").config(); // Loading environment variables from .env fil

const notion = new Client({
    auth: process.env.API_KEY, //Initializing client using integration token
});



const crm = {
    Codigo: "00000",
    Prefijo: "V",
    Navision: "OT-12345",
    NombreDeOT: "Arreglo luces Logo DIOR",
    clienteNotion: "DECOPERFUMS, S.L.",
    Firma: "DIOR",
    TipoDeOT: "ESC",
    SubtipoDeOT: "MAN",
    DepartamentosRelacionados: "Clientes;Administración;Taller",
    FechaDePrevision: "2024-07-30",
    FotosDeOT: "www.notion.so",
    id: "200000"

}
console.log(crm);

let departamentos = crm.DepartamentosRelacionados;
let arrayOfObjects;
if (departamentos) {
    arrayOfObjects = departamentos.split(';').map(value => {
        return { name: value };
    });
}

(async () => {
    const pageId = '12e6c3d1563e80b38d79d4da7a61aa7a';
    const response = await notion.pages.update({
        page_id: pageId,
        properties: {
            [process.env.NUMERO_ID]: {
                // Page title
                title: [
                    {
                        text: {
                            content: crm.Codigo,
                        },
                    },
                ],
            },
            [process.env.PREFIJO_ID]: {
                // Prefijo
                rich_text: [
                    {
                        text: {
                            content: crm.Prefijo,
                        },
                    },
                ],
            },
            [process.env.NAVISION_ID]: {
                rich_text: [
                    {
                        text: {
                            content: crm.Navision,
                        },
                    },
                ],
            },
            [process.env.NOMBRE_ID]: {
                // Nombre
                rich_text: [
                    {
                        text: {
                            content: crm.NombreDeOT,
                        },
                    },
                ],
            },
            [process.env.CLIENTE_ID]: {
                // Cliente
                rich_text: [
                    {
                        text: {
                            content: crm.clienteNotion,
                        },
                    },
                ],
            },

            [process.env.FIRMA_ID]: {
                // Firma
                rich_text: [
                    {
                        text: {
                            content: crm.Firma,
                        },
                    },
                ],
            },
            [process.env.TIPO_DE_OT_ID]: {
                //Tipo de la OT
                rich_text: [
                    {
                        text: {
                            content: crm.TipoDeOT,
                        },
                    },
                ],
            },
            [process.env.SUBTIPO_ID]: {
                //Subtipo de la OT
                rich_text: [
                    {
                        text: {
                            content: crm.SubtipoDeOT,
                        },
                    },
                ],
            },
            [process.env.DEPARTAMENTO_RELACIONADO_ID]: {
                //Departamentos
                multi_select: arrayOfObjects,
            },
            [process.env.FECHA_DE_MONTAJE_ID]: {
                //Fecha de montaje
                date: {
                    start: crm.FechaDePrevision,
                },
            },
            [process.env.PHOTOAPP_ID]: {
                //PhotoApp
                url: crm.FotosDeOT,
            },
            [process.env.CRM_ID]: {
                rich_text: [
                    {
                        text: {
                            content: crm.id,
                        },
                    },
                ],
            },
        },
    });
    console.log(response);
})();