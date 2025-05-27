//Función Mapper para las OTs que vengan del objeto de presupuesto (pasar el objeto ya del data)
export function mapearPresupuestosOT(presupuesto) {
  return {
    'Nº': presupuesto?.C_digo || "",
    '*Navision': presupuesto?.Navision || "",
    '*Firma': presupuesto?.Firma || "",
    '%40Otl': presupuesto?.Deal_Name || "",
    '*Cliente': presupuesto?.Empresa?.name || "",
    'ID_CRM': presupuesto?.id || "",
    'Departamentos_relacionados': presupuesto.COMMA?.split(',').map(nombre => nombre.trim()).filter(Boolean) || [],
    '*Subtipo': "ESCAPARATES",//Los presupuestos que pasan por aquí normalmente son siempre de escaparates (Cambiar si no es así: añadir al filtro de la llamada)
    '*Prefijo': presupuesto?.Prefijo || "",
    '*Tipo de OT': presupuesto?.Tipo_de_OT || "",
    'Fecha de previsión': presupuesto?.Fecha_de_previsi_n || "",
    'Estado': "Nuevo registro",
    'Estado en almacén': "Nuevo",
    'Estado en compras': "Nuevo",
    'Estado en diseño': "Nuevo",
    'Estado rutas': "Nuevo",
    'Estado en clientes': "Nuevo",
  };
}
