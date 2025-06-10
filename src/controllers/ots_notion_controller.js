import respuesta from '../utils/respuesta_util.js';
import ots_notion_service from '../services/ots_notion_service.js';
import Zoho from './../zoho_api/Zoho.js'; // Ajusta la ruta según la ubicación real del archivo Zoho.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config(); // Cargar variables de entorno

class ots_notion_controller {
    constructor(body) {
        this.body = body;

        // Enlazar métodos para mantener el contexto de `this`
        this.getBody = this.getBody.bind(this);
        this.crearOt = this.crearOt.bind(this);
        this.actualizarOt = this.putOt.bind(this);
        this.deleteOt = this.deleteOt.bind(this); // Método para eliminar la OT
    }

    getBody() {
        return this.body;
    }
    async crearOt() {
        return new Promise(async (resolve) => {
            const otsNotionService = new ots_notion_service(this.body);
            console.log("Propiedad db del servicio: ", otsNotionService.db);
            console.log("Objeto Cliente de Notion: ", otsNotionService.notion);
            const responseNotion = await otsNotionService.crearOt();
            const respuestas = new respuesta(responseNotion.message, responseNotion.data, responseNotion.page, responseNotion.limit);
            const response = respuestas.responder(responseNotion);
            resolve(response);
        });
    }

    async putOt() {
        return new Promise(async (resolve) => {
            const otsNotionService = new ots_notion_service(this.body);
            const responseNotion = await otsNotionService.putOt();
            const respuestas = new respuesta(responseNotion.message, responseNotion.data, responseNotion.page, responseNotion.limit);
            const response = respuestas.responder(responseNotion);
            resolve(response);
        });
    }

    // Método para manejar la eliminación de la OT
    async deleteOt() {
        const otsNotionService = new ots_notion_service(this.body);
        const responseNotion = await otsNotionService.deleteOt();
        const respuestas = new respuesta(responseNotion.message, responseNotion.data, responseNotion.page, responseNotion.limit);
        const response = respuestas.responder(responseNotion);
        return response;
    }

    async crearOtEscaparate() {
        const otsNotionService = new ots_notion_service(this.body);
      
        console.log("✅ OTs en Notion (test):");
      
        // 1. Crear o relacionar la OT (una vez)
        const OTRelacionada = await otsNotionService.siNoExisteOtCrearSinoRelacionar();

        //1.5 Crear o relacionar el Cliente (una vez)
        const ClienteRelacionado = await otsNotionService.siNoExisteClienteCrearSinoRelacionar();
      
        // 2. Guardamos en el body el código de la OT
        this.body.data.data[0].C_digo = OTRelacionada;
      
        // 3. Recorremos cada PDV
        const puntosDeVenta = this.body.data.data[0].puntos_de_venta;
      
        if (!Array.isArray(puntosDeVenta)) {
          console.error("No se encontraron puntos de venta en el objeto.");
          return;
        }
      
        // 4. Recorremos todos los puntos de venta y los relacionamos
        const resultadosPDV = [];
        const zoho = new Zoho();
        const token = await zoho.getAccessToken();
        const headers = { headers: { Authorization: `Zoho-oauthtoken ${token}` } };
      
        try {
          for (const pdv of puntosDeVenta) {
            const pdvId = pdv.PDV_relacionados?.id;
            const pdvName = pdv.PDV_relacionados?.name;
      
            if (!pdvId) continue;
      
            let pdvCompleto = null;
      
            try {
              const detallePDV = await axios.get(
                `https://www.zohoapis.eu/crm/v2/Puntos_de_venta/${pdvId}`,
                headers
              );
              pdvCompleto = detallePDV?.data?.data?.[0] || null;
            } catch (error) {
              console.error(`❌ No se pudo obtener el PDV con ID ${pdvId}`, error.message);
              continue;
            }
      
            const PuntoDeVentaRelacionado = await otsNotionService.siNoExistePuntoDeVentaCrearSinoRelacionar(pdvCompleto);
      
            const materialesRelacionados = [];
      
            // 5. Obtenemos los materiales y creamos presupuestos
            if (Array.isArray(pdv.escaparates)) {
              for (const escaparate of pdv.escaparates) {
                const materialId = await otsNotionService.siNoExisteMaterialaCrearSinoRelacionar(escaparate);
                if (!materialId) continue;
      
                materialesRelacionados.push(materialId);
      
                // ✅ 6. Crear presupuesto individual relacionado
                const presupuestoData = {
                    "Cliente": "Automatización en curso...",
                    "Foto": pdv?.lineas[0].Fotos || null,
                    "Clientes": ClienteRelacionado,
                    "Numero de OT": OTRelacionada,
                    "Punto de venta": PuntoDeVentaRelacionado,
                    "Material": materialId,
                    "Concepto": escaparate?.Concepto_material || "Sin concepto",
                    "Alto(m)": escaparate?.Alto_material || null,
                    "Ancho": escaparate?.Ancho_material || null,
                    "Unidades": escaparate?.unidades_material || 1,
                    "Coste Esc.": escaparate?.Precio_material || null,
                    "Coste Montaje": pdv?.montaje || null,
                    "Observaciones": pdv?.OBS || "",
                  };                  
      
                await otsNotionService.crearPresupuestoEscaparate(presupuestoData);
              }
            }
      
            resultadosPDV.push({
              puntoDeVenta: PuntoDeVentaRelacionado,
              materiales: materialesRelacionados
            });
          }
      
          // Resultado final
          return {
            status: true,
            code: 200,
            message: "OT, puntos de venta y presupuestos procesados correctamente.",
            data: {
              ot_id: OTRelacionada,
              cliente_id: ClienteRelacionado,
              puntos_de_venta: resultadosPDV,
            },
          };
        } catch (error) {
          console.error("Error en crearOtEscaparate:", error);
      
          return {
            status: false,
            code: 400,
            message: "Ha ocurrido un error al crear o relacionar la OT, PDVs o presupuestos.",
            error: error.message || error,
          };
        }
      }
      



}

export default ots_notion_controller;