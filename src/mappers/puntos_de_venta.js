export function mapearPresupuestosPuntoDeVenta(pdv) {
  return {
    "Punto de venta": pdv?.Name || "",
    "crmId": pdv?.id ? `zcrm_${pdv.id}` : "",
    "Nº": pdv?.N || "",
    "Dirección": pdv?.Direcci_n || "",
    "Código postal": Number(pdv?.C_digo_postal) || null,
    "Área": pdv?.rea || "",
    "ZONA": pdv?.Zona || "",
    "Sector": pdv?.Sector || "",
    "Clasificación": pdv?.Clasificaci_n
      ? pdv.Clasificaci_n.split(",").map((val) => val.trim()).filter(Boolean)
      : [],
    "Actualizada": Boolean(pdv?.Actualizada),
    "Cerrado": Boolean(pdv?.Cerrado),
    "lat": parseFloat(pdv?.lat?.replace(",", ".")) || null,
    "lng": parseFloat(pdv?.lng?.replace(",", ".")) || null,
    "Nº teléfono": pdv?.N_tel_fono || "",
  };
}
