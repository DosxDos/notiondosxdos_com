import express from 'express';
import axios from 'axios';
const frontendRouter = express.Router();
import dotenv from 'dotenv';
dotenv.config(); // Cargar variables de entorno

// Rutas protegidas
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

frontendRouter.get('/nueva-ot', (req, res) => {
  res.render('nueva_ot', {
    layout: 'main',
    title: 'Nueva OT'
  });
});

frontendRouter.get('/presupuesto/:codigoOT', (req, res) => {
  console.log('Ruta /presupuesto/:codigoOT accedida con código:', req.params.codigoOT);
  res.render('ot_existente', {
    layout: 'main',
    title: 'OT Existente',
    codigoOT: req.params.codigoOT
  });
});

export default frontendRouter;