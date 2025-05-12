// Archivo: controllers/presupuesto_notion_controller.js
import respuesta from '../utils/respuesta_util.js';
import presupuesto_notion_service from '../services/presupuesto_notion_service.js';
// Archivo: controllers/presupuesto_notion_controller.js
import { generarPresupuestoPDF } from '../utils/pdf_presupuesto_utils.js';

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
}

export default presupuesto_notion_controller;