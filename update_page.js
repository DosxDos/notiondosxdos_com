const { Client } = require('@notionhq/client');

require("dotenv").config(); // Loading environment variables from .env fil

const notion = new Client({
    auth: process.env.API_KEY, //Initializing client using integration token
});



const crm = {
    Codigo: "27374",
    Prefijo: "V",
    Navision: "OT-13242",
    NombreDeOT: "Arreglo luces Logo DIOR",
    clienteNotion: "DECOPERFUMS, S.L.",
    Firma: "DIOR",
    TipoDeOT: "ESC",
    SubtipoDeOT: "MAN",
    DepartamentosRelacionados: "Diseño;Estudio;Taller",
    FechaDePrevision: "2024-07-30",
    FotosDeOT: "www.dosxdos.com",
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
    const pageId = '59d8f25e4e1f4a169a55a064dbfa8be1';
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
                    start: crm.FechaDePrevision || null,
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