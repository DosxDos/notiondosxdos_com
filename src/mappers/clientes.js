export function mapearPresupuestosClientes(clientes) {
    return {
      "Estado de envío": clientes?.Shipping_State || "", // Campo Shipping_State de Zoho
      "Ciudad de envío": clientes?.Shipping_City || "",          
      "Nº": clientes?.N1 || "",
      "Fax": clientes?.Fax || "",
      "Código de facturación": clientes?.Billing_Code || "", 
      "Clase de cliente": clientes?.Tipo_de_empresa || "",
      "Domicilio de envío": clientes?.Shipping_Street || "", 
      "Correo electrónico": clientes?.Correo_electr_nico || "", 
      "Teléfono": clientes?.Phone_2 || "",
      "Código  términos pago": clientes?.C_digo_t_rminos_pago,
      "Impuesto": clientes?.Grupo_registro_IVA_neg || "", 
      "Ciudad de facturación": clientes?.Billing_City || "",
      "Grupo contable cliente": clientes?.Grupo_contable_cliente || "",
      "Descuento realización": parseFloat(clientes?.Descuento_realizaci_n) || 0,
      "Cód. forma pago":clientes?.C_d_forma_pago || "",
      "Contacto":clientes?.Contacto1 || "",
      "ID de registro": clientes.id ? "zcrm_"+clientes?.id : "",
      "Código de envío":clientes?.Shipping_Code || "",
      "Grupo contable negocio":clientes?.Grupo_contable || "",
      "CIF/ NIF": clientes?.CIF_NIF1 || "", 
      "Contacto relacionado": clientes?.Contacto_relacionado || "",
      "Teléfono 2": clientes?.Phone_2 || "",
      "Descuento montaje": parseFloat(clientes?.Descuento_montaje) || 0,
      "País de facturación": clientes?.Billing_Country || "",
      "Domicilio de facturación":clientes?.Billing_Street || "", 
      "Estado de facturación":clientes?.Billing_State || "",
      "Nombre": clientes.Account_Name || "",
    };
  }
  