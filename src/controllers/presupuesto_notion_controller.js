// Archivo: controllers/presupuesto_notion_controller.js
import respuesta from '../utils/respuesta_util.js';
import presupuesto_notion_service from '../services/presupuesto_notion_service.js';
// Archivo: controllers/presupuesto_notion_controller.js
import { generarPresupuestoPDF } from '../utils/pdf_presupuesto_utils.js';
import { db } from '../DB/mysqlConnection.js'; // ✅ ahora sí es una exportación válida


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
            throw error;
        }
    }    
}

export default presupuesto_notion_controller;