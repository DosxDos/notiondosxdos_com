/**
 * Genera el HTML para una tarjeta de OT.
 * Esta función centraliza la representación visual de una OT para evitar duplicación de código.
 * 
 * @param {Object} ot - Objeto con los datos de la OT
 * @returns {string} - HTML para mostrar la tarjeta de OT
 */
function generarTarjetaOT(ot) {
    return `
        <div class="flex justify-between items-start mb-4">
            <h2 class="text-lg font-semibold text-gray-900">${ot.Deal_Name || 'OT sin nombre'}</h2>
            <span class="px-2 py-1 text-sm bg-gray-100 text-gray-600 rounded">${ot.C_digo || 'Sin código'}</span>
        </div>
        <div class="space-y-2 text-sm text-gray-600">
            <p><span class="font-medium">Cliente:</span> ${ot.Account_Name?.name || 'Sin cliente'}</p>
            <p><span class="font-medium">Estado:</span> ${ot.Stage || 'Sin estado'}</p>
            <p><span class="font-medium">Firma:</span> ${ot.Firma || 'Sin firma'}</p>
        </div>
        <div class="mt-4 flex justify-end">
            <a href="/presupuesto/${ot.C_digo}" class="text-red-700 hover:text-red-800 font-medium">
                Ver detalles →
            </a>
        </div>
    `;
}

// Exportar la función para que esté disponible globalmente
if (typeof window !== 'undefined') {
    window.generarTarjetaOT = generarTarjetaOT;
}