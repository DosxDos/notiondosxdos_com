//Función que se utiliza para mapear los materiales de un presupuesto a la estructura de Notion
export function mapearPresupuestosMaterial(material) {
    return {
        "Nombre material": material?.Material || "", // nombre principal
        "Precio material": parseFloat(material?.Precio_material) || null, // el  id es K%3DMc
    };
}