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
    
                // Peticiones simuladas a Contacto y Cliente
                const contactoRes = await axios.get(`https://www.zohoapis.eu/crm/v2/Contacts/search?criteria=(id:equals:${ot.Contact_Name.id})`, headers);
                const clienteRes = await axios.get(`https://www.zohoapis.eu/crm/v2/Accounts/search?criteria=(id:equals:${ot.Account_Name.id})`, headers);
    
                //console.log('Cliente:', ot.Account_Name.id);
                //console.log('Contacto:', ot.Contact_Name.id);

                const contacto = contactoRes.data?.data[0] || null;
                const cliente = clienteRes.data?.data[0] || null;
    
                // Petición 2: Puntos de venta
                const pdvsRes = await axios.get(`https://www.zohoapis.eu/crm/v2/OT_PDV/search?criteria=(C_digo_de_OT:equals:${codigoOT})&fields=PDV_relacionados`, headers);
                const pdvs = pdvsRes.data.data;
    
                // Petición 3: Lineas de OT
                const lineasOTRes = await axios.get(`https://www.zohoapis.eu/crm/v2/Products/search?criteria=(C_digo_de_OT_relacionada:equals:${codigoOT})&fields=Descuento_de_Montaje,Descuento_realizado,Product_Name,Punto_de_venta,Incluir,Porcentaje_Descuento_Realizaci_n,Tipo_de_trabajo,Sin_cargo,Porcentaje_Descuento_Montaje,Horas_actuaci_n,D_as_actuaci_n,Fotos,Minutos_actuaci_n,Descuento_Realizaci_n,Urgente`, headers);
                const lineasOT = lineasOTRes.data.data;
    
                // Buscar escaparates
                const pdvNames = pdvs.map(pdv => pdv.PDV_relacionados?.name).filter(Boolean);
                const escaparatesPorPDV = {};
                for (const originalName of pdvNames) {
                    try {
                        const pdvName = originalName.replace(/[()]/g, '').trim();
                        const url = `https://www.zohoapis.eu/crm/v2/Escaparates/search?criteria=(PDV_relacionado:equals:"${pdvName}")&fields=Imagen_del_escaparate,Nombre_del_escaparate,Tipo_de_escaparate,Name,C_digo_del_escaparate,Nombre_de_Dise_o,Superior,Inferior,Lateral_Derecho,Lateral_Izquierdo,Ancho_del_Suelo,Alto_del_Suelo,Enmarque,Caras_del_PLV,Elemento1,Material1,Acabado1,UD1,ANC1,ALT1,Elemento2,Material2,Acabado2,UD2,ANC2,ALT2,Elemento3,Material3,Acabado3,UD3,ANC3,ALT3,Elemento4,Material4,Acabado4,UD4,ANC4,ALT4,Elemento5,Material5,Acabado5,UD5,ANC5,ALT5,Elemento6,Material6,Acabado6,UD6,ANC6,ALT6,Elemento7,Material7,Acabado7,UD7,ANC7,ALT7,Elemento8,Material8,Acabado8,UD8,ANC8,ALT8,Elemento9,Material9,Acabado9,UD9,ANC9,ALT9,Elemento10,Material10,Acabado10,UD10,ANC10,ALT10`;
                        const res = await axios.get(url, headers);
                        escaparatesPorPDV[pdvName] = res.data.data;
                    } catch (err) {
                        escaparatesPorPDV[pdvName] = [];
                    }
                }
    
                const resultado = {
                    data: [
                        {
                            ...ot,
                            contacto,  // ← Añadido aquí
                            cliente,   // ← Añadido aquí
                            puntos_de_venta: pdvs.map(pdv => {
                                const pdvName = pdv.PDV_relacionados?.name;
                                const pdvId = pdv.PDV_relacionados?.id;
                                const lineasDeEstePDV = lineasOT.filter(linea => linea.Punto_de_venta?.id === pdvId);
                                return {
                                    ...pdv,
                                    escaparates: escaparatesPorPDV[pdvName] || [],
                                    lineas: lineasDeEstePDV
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