import express from 'express';
import axios from 'axios';
const frontendRouter = express.Router();
import dotenv from 'dotenv';
dotenv.config(); // Cargar variables de entorno

// Ruta de login
frontendRouter.get('/login', (req, res) => {
    res.render('login', { 
        layout: 'main',
        title: 'Login'
    });
});

// Ruta de presupuestos
frontendRouter.get('/presupuestos', (req, res) => {
    try {
        res.render('dashboard', { 
            layout: 'main',
            title: 'Presupuestos'
        });
    } catch (error) {
        console.error('Error al renderizar dashboard:', error);
        res.status(500).send('Error al cargar la página: ' + error.message);
    }
});

// Ruta de nueva OT
frontendRouter.get('/nueva-ot', (req, res) => {
    res.render('nueva_ot', {
        layout: 'main',
        title: 'Nueva OT'
    });
});

<<<<<<< HEAD
frontendRouter.get('/presupuesto/:codigoOT', (req, res) => {
  console.log('Ruta /presupuesto/:codigoOT accedida con código:', req.params.codigoOT);
  res.render('ot_existente', {
    layout: 'main',
    title: 'OT Existente',
    codigoOT: req.params.codigoOT
  });
=======
// Ruta de presupuesto específico
frontendRouter.get('/presupuesto/:codigoOT', async (req, res) => {
    try {
        const codigoOT = req.params.codigoOT;
        const apiRes = await axios.get(`http://localhost:${process.env.PORT}/api/presupuestoEscaparate/${codigoOT}`);
        const result = apiRes.data;

        if (!result.status) throw new Error(result.message);

        const datos = result.data?.data?.[0];
        if (!datos) return res.status(500).send('No se encontraron datos de la OT');

        res.render('ot_existente', {
            layout: 'main',
            ot: datos,
        });
    } catch (err) {
        console.error('❌ Error en /presupuesto/:codigoOT:', err);
        res.status(500).send('Error al cargar el presupuesto');
    }
>>>>>>> bcd6a41bece50b3fabbf1477829843c3f653401b
});

export default frontendRouter;