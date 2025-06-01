
export const diccionarioCamposZoho = {
    'LineasDeOt': 'Products',
    'OTs': 'Deals',
    'Rutas': 'Rutas',
    'Montadores': 'Montadores',
    'PuntosDeVenta': 'Puntos_de_venta',
    'Contactos': 'Contacts',
    'Clientes': 'Accounts',
    'NotificacionesRutas': 'Notificaciones_Rutas',
    'Incidencias': 'Incidencias',
    'Escaparates': 'Escaparates',
    'Impuestos': 'Impuestos',
    'PreciosMaterialesYServ': 'Precios_Materiales',
    'PreciosLogos': 'Precios_Logos',
    'PrecioMontajeImagenes': 'Precios_Montaje_Im_genes',
    'PreciosMontajeLogos': 'Precios_Montaje_Logos',
    'DescuentoMontajeLogos': 'Descuento_Montaje_Logos',
    'Analisis': 'Analytics',
    'MisTrabajos': 'Approvals',
    'MontadoresRutas': 'Montadores_Rutas',
    'OTPDV': 'OT_PDV',
    'Variables': 'Variables',
    "ElementosDeEscaparates": 'Elementos_de_Escaparates',
}

export const diccionarioCamposNotion = {
    OT: {
      "Nº": "title",
      "%40Otl": "rich_text", //Este campo es el identificador del nombre del proyecto ya que este no tiene nombre en Notion
      "*Navision": "rich_text",
      "*Firma": "rich_text",
      "Departamentos_relacionados": "multi_select",
      "*Cliente": "rich_text",
      "ID_CRM": "rich_text",
      "*Subtipo": "rich_text",
      "*Prefijo": "rich_text",
      "*Tipo de OT": "rich_text",
      "Fecha de previsión": "date",
      "Estado": "status",
      "Estado en almacén": "status",
      "Estado en compras": "status",
      "Estado en diseño": "status",
      "Estado rutas": "status",
      "Estado en clientes": "status"
    },
  
    PDV: {
      "Punto de venta": "title",                    // Del campo "Name" de Zoho
      "crmId": "rich_text",                         // Del campo "id" de Zoho, con prefijo "zcrm_"
      "Nº": "rich_text",                            // Del campo "N" de Zoho
      "Dirección": "rich_text",                     // Del campo "Direcci_n"
      "Código postal": "number",                    // Del campo "C_digo_postal"
      "Área": "select",                             // Del campo "rea"
      "ZONA": "select",                             // Del campo "Zona"
      "Sector": "select",                           // Del campo "Sector"
      "Clasificación": "multi_select",              // Del campo "Clasificaci_n"
      "Actualizada": "checkbox",                    // Del campo "Actualizada"
      "Cerrado": "checkbox",                        // Del campo "Cerrado"
      "lat": "number",                              // Del campo "lat"
      "lng": "number",                              // Del campo "lng"
      "Nº teléfono": "rich_text",                   // Del campo "N_tel_fono"
    },
    
    Clientes: {
      "Estado de envío": "rich_text",
      "Ciudad de envío": "rich_text",          
      "Nº": "rich_text",
      "Fax": "rich_text",
      "Código de facturación": "rich_text", 
      "Clase de cliente": "select",
      "Domicilio de envío": "rich_text", 
      "Correo electrónico": "email", 
      "Teléfono": "rich_text",
      "Código  términos pago": "select",
      "Impuesto": "select", 
      "Ciudad de facturación": "rich_text",
      "Grupo contable cliente": "select",
      "Descuento realización":"number",
      "Cód. forma pago":"select",
      "Contacto":"rich_text",
      "ID de registro":"rich_text",
      "Código de envío":"number",
      "Grupo contable negocio":"select",
      "CIF/ NIF": "rich_text", 
      "Contacto relacionado": "rich_text",
      "Teléfono 2": "rich_text",
      "Descuento montaje":"number",
      "País de facturación": "select",
      "Domicilio de facturación":"rich_text", 
      "Estado de facturación":"rich_text",
      "Nombre": "title",
    },
  
    Material: {
      "Nombre material": "title",           // Título principal del material
      "Precio material": "number",          // Precio actual
      "Medida": "select",                   // Unidad de medida (por ejemplo: M2, unidad, ML...)
      "Observaciones": "rich_text",         // Comentarios adicionales
      "Código_escaparate": "rich_text",     // Código único del escaparate (si lo usas como identificador)
      "Concepto_material": "rich_text",     // Descripción del uso del material (opcional)
      "Material": "rich_text",              // Tipo de material
      "Alto_material": "number",            // Alto en cm o m
      "Ancho_material": "number",           // Ancho en cm o m
      "Unidades_material": "number"         // Número de unidades utilizadas
    },    
  
    Presupuesto: {
      "Cliente": "title",       // ✅ Campo de título principal
      "Foto": "url",                          
      "Numero de OT": "relation",
      "Clientes": "relation",       
      "Isla":"select", 
      "Coste Esc.": "number",                
      "Coste Montaje": "number",           
      "Observaciones": "rich_text",         
      "Punto de venta": "relation",
      "Concepto": "rich_text",               
      "Alto(m)": "number",                    
      "Ancho": "number",                      
      "Unidades": "number",               
      "Material": "relation",                      
    }
  };