// Archivo: controllers/presupuesto_notion_controller.js
import respuesta from '../utils/respuesta_util.js';
import presupuesto_notion_service from '../services/presupuesto_notion_service.js';
// Archivo: controllers/presupuesto_notion_controller.js
import { generarPresupuestoPDF } from '../utils/pdf_presupuesto_utils.js';
import { db } from '../DB/mysqlConnection.js';
import Zoho from '../zoho_api/Zoho.js';
import axios from 'axios';    // Usamos axios para hacer la solicitud HTTP
import { diccionarioCamposZoho } from '../constantes/constantes.js'; // ajusta la ruta si es necesario

import xlsx from 'xlsx';
import fs from 'fs';
import mysql from 'mysql2/promise';


class presupuesto_notion_controller {
    constructor(body) {
        this.body = body;
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
            const otsNotionService = new presupuesto_notion_service(this.body);
            const responseNotion = await otsNotionService.crearFormularioDeOtEscaparate();
            const respuestas = new respuesta(responseNotion.message, responseNotion.data, responseNotion.page, responseNotion.limit);
            const response = respuestas.responder(responseNotion);
            resolve(response);
        });
    }
    //Genera el PDF del presupuesto mediante un objeto JSON que recibimos desde el frontend
    async generarPDFdePresupuesto(req, res) {
        try {
            /*
                Cambiar el cuerpo de la petición mas adelante por solo un data
            */
            const datosOT = req.body.data.data[0];//Esto se cambia dependiendo del cuerpo de la petición

            if (!datosOT || !datosOT.puntos_de_venta) {
                return res.status(400).json({ message: 'Faltan datos de la OT o puntos de venta en el cuerpo de la petición' });
            }

            const rutaPDF = await generarPresupuestoPDF(datosOT);
            res.download(rutaPDF, `presupuesto_${datosOT.C_digo}.pdf`);
        } catch (error) {
            res.status(500).json({ message: 'Error al generar el PDF', error: error.message });
        }
    }

    //Esta lógica permite subir el excel de los materiales de los escaparates (El campo 1 debe ser el nombre del escaparate y el campo 2 el precio)
    async subirPreciosEscaparate(filePath) {
        try {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

            // Conectar a la base de datos MySQL
            const connection = await db.connect();

            for (const row of data) {
                const nombre = row['__EMPTY']?.toString().trim();
                const importe = row['__EMPTY_1'] ?? null;
                const observaciones = row['__EMPTY_3'] ?? null;

                if (!nombre || importe === null) continue;

                // Verificar si ya existe un registro con ese nombre
                const [existing] = await connection.execute(
                    'SELECT importe FROM precio_coste_escaparate WHERE nombre = ?',
                    [nombre]
                );

                if (existing.length === 0) {
                    // No existe, insertar nuevo registro
                    await connection.execute(
                        'INSERT INTO precio_coste_escaparate (nombre, importe, observaciones) VALUES (?, ?, ?)',
                        [nombre, importe, observaciones]
                    );
                } else {
                    const importeActual = existing[0].importe;

                    if (parseFloat(importeActual) !== parseFloat(importe)) {
                        // Existe con distinto importe, actualizar
                        await connection.execute(
                            'UPDATE precio_coste_escaparate SET importe = ?, observaciones = ? WHERE nombre = ?',
                            [importe, observaciones, nombre]
                        );
                    }
                    // Si el importe es el mismo, no se hace nada
                }
            }
            fs.unlinkSync(filePath); // Eliminar el archivo temporal

            return 'Datos procesados correctamente';
        } catch (error) {
            res.status(500).json({ message: 'Error al generar la subida de precios', error: error.message });
        }
    }

    //Esta lógica permite subir el excel de los materiales de los escaparates (El campo 1 debe ser el nombre del escaparate y el campo 2 el precio)
    async getMaterialesMySql() {
        try {
            // Conectar a la base de datos MySQL
            const connection = await db.connect();

            // Verificar si ya existe un registro con ese nombre
            const [rows] = await connection.execute('SELECT * FROM precio_coste_escaparate');


            if (rows.length === 0) {
                return 'No existen registros en la tabla precio_coste_escaparate';
            } else {
                return { materiales: rows };
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al generar la subida de precios', error: error.message });
        }
    }

    //Recogemos todos los puntos de venta de de Zoho y si hay mas de 200 vamos recorriendolos para devolverlos todos sin paginación
    async recogerModuloZoho(endpoint, criteria = null) {
        const modulo = diccionarioCamposZoho[endpoint];
        const zoho = new Zoho();
        let allRecords = [];
        let page = 1;
        let moreRecords = true;

        try {
            const accessToken = await zoho.getAccessToken();

            while (moreRecords) {
                let url = `https://www.zohoapis.eu/crm/v2/${modulo}`;
                if (criteria) {
                    const encodedCriteria = encodeURIComponent(criteria);
                    url = `https://www.zohoapis.eu/crm/v2/${modulo}/search?criteria=${encodedCriteria}&page=${page}`;
                } else {
                    url += `?page=${page}`;
                }
                console.log("URL: ", url)

                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Zoho-oauthtoken ${accessToken}`,
                    },
                });

                const data = response.data?.data || [];
                const info = response.data?.info || {};

                allRecords.push(...data);
                moreRecords = info.more_records === true;
                page++;
            }

            if (allRecords.length > 0) {
                return {
                    success: true,
                    data: allRecords,
                    message: `Se han obtenido ${allRecords.length} registros desde Zoho.`,
                };
            } else {
                return {
                    success: false,
                    message: 'No se encontraron registros en el módulo especificado.',
                };
            }
        } catch (error) {
            console.error('❌ Error al recoger registros de Zoho:', error.message);
            return {
                success: false,
                message: 'Error al recoger los registros desde Zoho.',
                error: error.message,
            };
        }
    }
}

export default presupuesto_notion_controller;