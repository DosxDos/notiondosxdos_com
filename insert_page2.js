const { Client } = require("@notionhq/client"); //Installing Notion SDK for JavaScript

require("dotenv").config(); // Loading environment variables from .env file

const crmQuery = "SubtipoDeOT=ASESOR&DepartamentosRelacionados=Dise%C3%B1o%3BProducci%C3%B3n%3BRutas%3BTaller%3BAlmac%C3%A9n%3BClientes&Codigo=30438&NombreDeOT=testear+un+mill%C3%B3n&Firma=ABERCROMBIE&Navision=V-77777&Prefijo=OT&TipoDeOT=ASESOR&clienteNotion=La+Luz+Autoport+Terminal%2C+S.L&Observaciones=a%C3%B1lksdjf+l%C3%B1aksjdf+%C3%B1laskdjf%C3%B1l+askdjflkasj+dflaskdj+f%C3%B1laskjdf+laskdjf%C3%B1l+aksdj+fl%C3%B1askd+jf&id=707987000002441351&FechaDePrevision=2024-07-31&FotosDeOT=dosxdos.app";

function decodeUrlToObj(encodedUrl) {
  const decodedStr = decodeURIComponent(encodedUrl);
  const params = new URLSearchParams(decodedStr);
  const result = {};
  for (const [key, value] of params.entries()) {
      result[key] = value;
  }
  return result;
}

const crm = decodeUrlToObj(crmQuery);

console.log(crm);

departamentos = crm.DepartamentosRelacionados;

const arrayOfObjects = departamentos.split(';').map(value => {
  return { name: value };
});

const notion = new Client({
  auth: process.env.API_KEY, //Initializing client using integration token
});

(async () => {
  const response = await notion.pages.create({
    //creating a new page in a database
    icon: {
      type: "emoji",
      emoji: "💙", // *item icon -> not working
    },
    parent: {
      type: "database_id",
      database_id: process.env.NOTION_DATABASE_ID,
    },
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
  console.log(response); //Sending the new item to Notion
  const response2 = await notion.comments.create({
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
    });
  
  console.log(response2);
})();


