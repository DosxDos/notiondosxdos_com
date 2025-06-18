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
                            const idEscaparate = escaparate.id;
                            const elementos = [];
                
                            // Paso 1: Obtener los elementos relacionados
                            const interRes = await axios.get(
                                `https://www.zohoapis.eu/crm/v2/ESCAPARATES_ELEMENTOS/search?criteria=(ELEMENTOS_ESCAPARATES_RELACIONADOS.id:equals:${idEscaparate})&fields=ELEMENTOS_ESCAPARATES_RELACIONADOS,Elementos_relacionados`,
                                headers
                            );
                
                            for (const relacion of interRes.data?.data || []) {
                                const idElemento = relacion.Elementos_relacionados?.id;
                                if (!idElemento) continue;
                
                                // Paso 2: Obtener info del elemento
                                const elemRes = await axios.get(
                                    `https://www.zohoapis.eu/crm/v2/Elementos_de_escaparates/search?criteria=(id:equals:${idElemento})&fields=Nombre_del_elemento,Escaparate,Nombre_del_escaparate,Materiales,Acabado,Nombre_de_acabado,Ancho_del_elemento,Alto_del_elemento,Unidades`,
                                    headers
                                );
                                const elemento = elemRes.data?.data?.[0];
                                if (!elemento) continue;
                
                                const materiales = [];
                
                                // Paso 3: Buscar materiales asociados en tabla intermedia
                                const matMapRes = await axios.get(
                                    `https://www.zohoapis.eu/crm/v2/ESCAPARATES_MATERIALES/search?criteria=(Material_de_escaparate.id:equals:${idElemento})&fields=Material_de_escaparate,Materiales`,
                                    headers
                                );
                
                                for (const matMap of matMapRes.data?.data || []) {
                                    const materialName = matMap.Materiales?.name;
                                    if (!materialName) continue;
                
                                    // Paso 4: Buscar precio del material
                                    const matRealRes = await axios.get(
                                        `https://www.zohoapis.eu/crm/v2/Precios_Materiales/search?criteria=(Name:equals:${materialName})&fields=C_digo_del_precio,Material,Material_de_escaparate,Precio,Tipo,idA3Erp,Abreviatura`,
                                        headers
                                    );
                                    const materialReal = matRealRes.data?.data?.[0];
                                    if (materialReal) materiales.push(materialReal);
                                }
                
                                // Añadir al array de elementos
                                elementos.push({
                                    ...elemento,
                                    materiales
                                });
                            }
                
                            // Vincular todos los elementos al escaparate
                            escaparate.elementos = elementos;
                        }
                
                        escaparatesPorPDV[pdvName] = escaparates;
                    } catch (err) {
                        escaparatesPorPDV[originalName] = [];
                        console.warn(`Error con el PDV ${originalName}:`, err.message);
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