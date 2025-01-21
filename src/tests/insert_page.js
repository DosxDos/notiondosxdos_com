async function nuevaOt(crm) {
  return new Promise(async (resolve, reject) => {
    try {
      const { Client } = require("@notionhq/client");
      require('dotenv').config();
      const notion = new Client({
        auth: process.env.API_KEY,
      });
      let departamentos = crm.DepartamentosRelacionados;
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
            // Tipo de la OT
            rich_text: [
              {
                text: {
                  content: crm.TipoDeOT,
                },
              },
            ],
          },
          [process.env.SUBTIPO_ID]: {
            // Subtipo de la OT
            rich_text: [
              {
                text: {
                  content: crm.SubtipoDeOT,
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
              start: crm.FechaDePrevision || "1970-01-01",
            },
          },
          [process.env.PHOTOAPP_ID]: {
            // PhotoApp
            url: crm.FotosDeOT || "dosxdos.app",
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
              "content": crm.Observaciones
            }
          }
        ]
      }
      const response2 = await notion.comments.create(solicitud2);
      resolve(response2);
    } catch (error) {
      reject(error);
    }
  });
}
module.exports = { nuevaOt };