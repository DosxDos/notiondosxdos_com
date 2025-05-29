import { Client } from "@notionhq/client";
import { diccionarioCamposNotion } from "./../constantes/constantes.js";

export class Notion {
  notion;
  db;

  constructor(databaseIds) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY no está definida");
    }

    this.notion = new Client({ auth: process.env.API_KEY });
    this.db = databaseIds;
  }

  /**
   * Crea una página en Notion
   */
  async crearPagina(modulo, datosOrigen, extras = {}) {
    if (!this.db[modulo]) {
      throw new Error(`No se ha definido database_id para el módulo: ${modulo}`);
    }

    const properties = this.construirPropertiesNotion(modulo, datosOrigen, extras);

    const pagina = await this.notion.pages.create({
      parent: { database_id: this.db[modulo] },
      properties,
    });

    return pagina.id;
  }

  /**
   * Busca si ya existe una página en Notion por un campo concreto
   */
  async buscarPorCampo(modulo, campo, valor) {
    console.log("Buscando en Notion por campo:", campo, "con valor:", valor);
    const respuesta = await this.notion.databases.query({
      database_id: this.db[modulo],
      filter: {
        property: campo,
        title: { equals: valor },
      },
    });

    if (respuesta.results.length > 0) {
      return respuesta.results[0].id;
    }

    return null;
  }

  /**
   * Construye automáticamente los properties de una página Notion
   */
  construirPropertiesNotion(modulo, datosCRM, extras = {}) {
    console.log("Construyendo properties para el módulo:", modulo);
    console.log("Datos CRM:", datosCRM);
    const campos = diccionarioCamposNotion[modulo];
    console.log("Campos definidos:", campos);
    const properties = {};

    for (const [campo, tipo] of Object.entries(campos)) {
      const valor =
        extras?.[campo] ??
        datosCRM?.[campo] ??
        null;

      if (valor === null || valor === undefined) continue;

      switch (tipo) {
        case "title":
          properties[campo] = {
            title: [{ text: { content: valor.toString() } }],
          };
          break;
        case "rich_text":
          properties[campo] = {
            rich_text: [{ text: { content: valor.toString() } }],
          };
          break;
        case "email":
          properties[campo] = {
            email: valor ? valor.toString() : null,
          };
        break;
        case "date":
          properties[campo] = {
            date: {
              start: valor instanceof Date
                ? valor.toISOString().split("T")[0]
                : valor.toString().split("T")[0],
            },
          };
          break;
        case "status":
          properties[campo] = {
            status: { name: valor },
          };
          break;
        case "select":
          properties[campo] = {
            select: { name: valor },
          };
          break;
        case "multi_select":
          properties[campo] = {
            multi_select: valor.map((v) => ({ name: v })),
          };
          break;
        case "checkbox":
          properties[campo] = {
            checkbox: Boolean(valor),
          };
          break;
        case "number":
          properties[campo] = {
            number: Number(valor),
          };
          break;
        case "url":
          properties[campo] = {
            url: valor,
          };
          break;
        case "relation":
          properties[campo] = {
            relation: Array.isArray(valor)
              ? valor.map((id) => ({ id }))
              : [{ id: valor }],
          };
          break;
        default:
          properties[campo] = {
            rich_text: [{ text: { content: valor.toString() } }],
          };
      }
    }

    return properties;
  }
}

export default Notion;
