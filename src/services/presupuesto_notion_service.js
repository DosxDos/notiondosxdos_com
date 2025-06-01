// Archivo: services/presupuesto_notion_service.js
import respuesta from '../utils/respuesta_util.js';
import Zoho from '../zoho_api/Zoho.js';
import axios from 'axios';

class presupuesto_notion_service {
    constructor(body) {
        this.body = body;
        this.respuesta = new respuesta();

        this.getBody = this.getBody.bind(this);
        this.crearFormularioDeOtEscaparate = this.crearFormularioDeOtEscaparate.bind(this);
        this.actualizarOt = this.putOt?.bind(this);
        this.deleteOt = this.deleteOt?.bind(this);
    }

    getBody() {
        return this.body;
    }

    async crearFormularioDeOtEscaparate() {
        return new Promise(async (resolve) => {
            try {
                const zoho = new Zoho();
                const token = await zoho.getAccessToken();
                const { codigoOT } = this.body;
    
                const headers = { headers: { Authorization: `Zoho-oauthtoken ${token}` } };
    
                // Petición 1: Datos de la OT
                const otRes = await axios.get(`https://www.zohoapis.eu/crm/v2/Deals/search?criteria=(C_digo:equals:${codigoOT})&fields=Deal_Name,C_digo,Stage,id,N_mero_del_cliente,C_digo_postal_de_facturaci_n,Pa_s_de_facturaci_n,Ciudad_de_facturaci_n,Comunidad,Firma,Navision,Account_Name,Provincia_de_facturaci_n,Empresa,Contact_Name,Tipo_de_OT,Prefijo,Fecha_de_previsi_n,COMMA`, headers);
                const ot = otRes.data.data[0];
    
                const contactoRes = await axios.get(`https://www.zohoapis.eu/crm/v2/Contacts/search?criteria=(id:equals:${ot.Contact_Name.id})`, headers);
                const clienteRes = await axios.get(`https://www.zohoapis.eu/crm/v2/Accounts/search?criteria=(id:equals:${ot.Account_Name.id})`, headers);
    
                const contacto = contactoRes.data?.data[0] || null;
                const cliente = clienteRes.data?.data[0] || null;
    
                // Petición 2: Puntos de venta
                const pdvsRes = await axios.get(`https://www.zohoapis.eu/crm/v2/OT_PDV/search?criteria=(C_digo_de_OT:equals:${codigoOT})&fields=PDV_relacionados`, headers);
                const pdvs = pdvsRes.data.data;
    
                // Petición 3: Líneas de OT
                const lineasOTRes = await axios.get(`https://www.zohoapis.eu/crm/v2/Products/search?criteria=(C_digo_de_OT_relacionada:equals:${codigoOT})&fields=Descuento_de_Montaje,Descuento_realizado,Product_Name,Punto_de_venta,Incluir,Porcentaje_Descuento_Realizaci_n,Tipo_de_trabajo,Sin_cargo,Porcentaje_Descuento_Montaje,Horas_actuaci_n,D_as_actuaci_n,Fotos,Minutos_actuaci_n,Descuento_Realizaci_n,Urgente`, headers);
                const lineasOT = lineasOTRes.data.data;
    
                const pdvNames = pdvs.map(pdv => pdv.PDV_relacionados?.name).filter(Boolean);
                const escaparatesPorPDV = {};
    
                for (const originalName of pdvNames) {
                    try {
                        const pdvName = originalName.replace(/[()]/g, '').trim();
                        const url = `https://www.zohoapis.eu/crm/v2/Escaparates/search?criteria=(PDV_relacionado:equals:"${pdvName}")&fields=Imagen_del_escaparate,Nombre_del_escaparate,Tipo_de_escaparate,Name,C_digo_del_escaparate,Nombre_de_Dise_o,Superior,Inferior,Lateral_Derecho,Lateral_Izquierdo,Ancho_del_Suelo,Alto_del_Suelo,Enmarque,Caras_del_PLV,Elemento`;
                        const res = await axios.get(url, headers);
                        const escaparates = res.data.data;
                
                        for (const escaparate of escaparates) {
                            const idElemento = escaparate.Elemento?.id;
                            if (idElemento) {
                                console.log(`Obteniendo materiales para el elemento del escaparate: ${idElemento}`);
                
                                // 1. Tabla intermedia
                                const puenteRes = await axios.get(
                                    `https://www.zohoapis.eu/crm/v2/ESCAPARATES_MATERIALES/search?criteria=(Material_de_escaparate.id:equals:${idElemento})`,
                                    headers
                                );
                                const materiales = [];
                
                                for (const item of puenteRes.data?.data || []) {
                                    const idMaterial = item.Materiales?.id;
                                    if (idMaterial) {
                                        try {
                                            const matRes = await axios.get(
                                                `https://www.zohoapis.eu/crm/v2/Precios_Materiales/${idMaterial}`,
                                                headers
                                            );
                                            const materialReal = matRes.data?.data?.[0];
                                            if (materialReal) materiales.push(materialReal);
                                        } catch (err) {
                                            console.warn(`Error al obtener material con id ${idMaterial}:`, err.message);
                                        }
                                    }
                                }
                
                                // 2. Añadir al escaparate
                                escaparate.elemento_de_escaparate = {
                                    ...escaparate.Elemento,
                                    materiales
                                };
                            } else {
                                escaparate.elemento_de_escaparate = null;
                            }
                        }
                
                        escaparatesPorPDV[pdvName] = escaparates;
                    } catch (err) {
                        escaparatesPorPDV[originalName] = [];
                    }
                }
                
                
                
    
                const resultado = {
                    data: [
                        {
                            ...ot,
                            contacto,
                            cliente,
                            puntos_de_venta: pdvs.map(pdv => {
                                const pdvName = pdv.PDV_relacionados?.name;
                                const pdvId = pdv.PDV_relacionados?.id;
                                const lineasDeEstePDV = lineasOT.filter(linea => linea.Punto_de_venta?.id === pdvId);
                                return {
                                    ...pdv,
                                    lineas: lineasDeEstePDV,
                                    escaparates: (escaparatesPorPDV[pdvName] || []).map(escaparate => ({
                                        ...escaparate,
                                        // Ya tiene incluido el campo escaparate.elemento_de_escaparate
                                    }))
                                };
                            })
                        }
                    ]
                };                
    
                resolve({ status: true, code: 200, message: 'Datos obtenidos correctamente', data: resultado });
            } catch (error) {
                resolve({ status: false, code: 500, message: error.message, data: error.stack });
            }
        });
    }       
}

export default presupuesto_notion_service;