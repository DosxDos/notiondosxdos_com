import express from 'express';
import axios from 'axios';
const frontendRouter = express.Router();
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config(); // Cargar variables de entorno

// Middleware para verificar autenticación adicional en el frontend
const verificarAutenticacion = (req, res, next) => {
  // Verificar si el usuario está autenticado
  if (!req.user) {
    console.log('[Frontend] Acceso no autorizado a ruta protegida');
    return res.redirect('/login');
  }
  
  // Verificar si el token en las cookies es válido
  try {
    const token = req.cookies.token || 
                 (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    
    if (!token) {
      console.log('[Frontend] No se encontró token válido');
      return res.redirect('/login');
    }

    // Verificar el token con la clave secreta
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    console.error('[Frontend] Error verificando token:', error.message);
    return res.redirect('/login');
  }
};

// Rutas protegidas
frontendRouter.get('/presupuestos', verificarAutenticacion, (req, res) => {
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

frontendRouter.get('/nueva-ot', verificarAutenticacion, (req, res) => {
  res.render('nueva_ot', {
    layout: 'main',
    title: 'Nueva OT'
  });
});

frontendRouter.get('/presupuesto/:codigoOT', verificarAutenticacion, (req, res) => {
  console.log('Ruta /presupuesto/:codigoOT accedida con código:', req.params.codigoOT);
  res.render('ot_existente', {
    layout: 'main',
    title: 'OT Existente',
    codigoOT: req.params.codigoOT
  });
});

export default frontendRouter;