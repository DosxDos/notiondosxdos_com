/**
 * Módulo de templates para generación de HTML dinámico
 * Centraliza todas las funciones de generación de HTML para mantener la UI consistente
 */

/**
 * Genera el template HTML para un punto de venta
 * @param {number} index - Índice del PDV
 * @param {Function} obtenerNombrePDV - Función para obtener el nombre del PDV
 * @returns {string} Template HTML del PDV
 */
function generarTemplatePDV(index, obtenerNombrePDV) {
    // Comprobar si tenemos datos de puntos de venta disponibles
    const nombrePDV = obtenerNombrePDV ? obtenerNombrePDV(index) : null;
    
    // Si tenemos un nombre de PDV, lo mostramos directamente, sino mostramos un select
    const pdvDisplay = nombrePDV ? 
        `<div class="mb-4 w-full p-3 border rounded bg-gray-50 text-sm font-semibold">${nombrePDV}</div>` :
        `<div class="mb-4 w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Punto de Venta</label>
            <select class="nombre-pdv w-full p-3 border rounded bg-gray-50 text-sm" data-pdv-index="${index}">
                <option value="">Seleccionar Punto de Venta</option>
                <!-- Las opciones se cargarán dinámicamente -->
            </select>
         </div>`;
        
    return `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-800">PDV</h2>
            <button class="eliminar-pdv text-red-600 hover:text-red-800">
                <i class="fas fa-trash"></i> Eliminar PDV
            </button>
        </div>
        ${pdvDisplay}

        <!-- Información general del PDV -->
        <div class="grid grid-cols-3 gap-4 mb-4">
            <div class="p-2 border rounded">
                <label class="block text-sm font-medium text-gray-700 mb-1">Foto</label>
                <div class="flex flex-col space-y-2">
                    <div class="flex items-center">
                        <input type="file" class="file-input-pdv hidden">
                        <button class="upload-btn-pdv w-full p-1.5 text-sm border border-gray-300 rounded bg-gray-50">
                            Subir foto
                        </button>
                    </div>
                    <div class="enlace-fotos-container">
                        <!-- Aquí se añadirá el enlace a las fotos dinámicamente -->
                    </div>
                </div>
            </div>
            <div class="p-2 border rounded">
                <label class="block text-sm font-medium text-gray-700 mb-1">Isla</label>
                <select class="isla-pdv w-full p-1.5 border rounded">
                    <option value="">Seleccionar</option>
                    <option value="GC">GC</option>
                    <option value="TFE">TFE</option>
                    <option value="LZT">LZT</option>
                    <option value="FTV">FTV</option>
                    <option value="HIERRO">HIERRO</option>
                    <option value="GOMERA">GOMERA</option>
                    <option value="PALMA">PALMA</option>
                </select>
            </div>
            <div class="p-2 border rounded">
                <label class="block text-sm font-medium text-gray-700 mb-1">Montaje</label>
                <input type="text" inputmode="decimal" class="montaje-pdv w-full p-1.5 border rounded">
            </div>
        </div>
        <div class="grid grid-cols-1 gap-4 mb-6">
            <div class="p-2 border rounded">
                <label class="block text-sm font-medium text-gray-700 mb-1">OBS</label>
                <textarea class="obs-pdv w-full p-1.5 border rounded" rows="2"></textarea>
            </div>
        </div>

        <!-- Totales del PDV -->
        <div class="p-3 bg-gray-50 rounded mb-4">
            <div class="p-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Total Escaparates</label>
                <input type="text" inputmode="decimal" class="total-escaparates-pdv w-full p-1.5 border rounded">
            </div>
        </div>

        <!-- Botón para desplegar/colapsar escaparates -->
        <div class="mb-4">
            <button class="toggle-escaparates w-full p-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded flex justify-between items-center" 
                    data-pdv-index="${index}" 
                    aria-expanded="false">
                <span class="font-medium">Desplegar escaparates</span>
                <i class="fas fa-chevron-down toggle-icon transition-transform duration-300"></i>
            </button>
        </div>

        <!-- Sección de escaparates (colapsada por defecto) -->
        <div class="escaparates-container mb-4 hidden">
            <div id="escaparates-pdv-${index}" class="space-y-4">
                <!-- Aquí se añadirán los escaparates dinámicamente -->
            </div>
            <div class="flex justify-end mt-2">
                <button class="add-escaparate bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                        data-pdv-index="${index}">
                    + Añadir escaparate
                </button>
            </div>
        </div>
    `;
}

/**
 * Genera el template HTML para un escaparate dentro de un PDV
 * @param {number} pdvIndex - Índice del PDV al que pertenece
 * @param {number} escaparateIndex - Índice del escaparate
 * @returns {string} Template HTML del escaparate
 */
function generarTemplateEscaparate(pdvIndex, escaparateIndex) {
    return `
        <div class="escaparate-item border rounded p-3 bg-white" data-escaparate-index="${escaparateIndex}">
            <div class="flex justify-between items-center mb-3">
                <h4 class="text-md font-medium text-gray-800">Escaparate ${escaparateIndex + 1}</h4>
                <button class="eliminar-escaparate text-red-600 hover:text-red-800">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="grid grid-cols-3 gap-4 mb-3">
                <div class="p-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Escaparate</label>
                    <input type="text" class="nombre-escaparate w-full p-1.5 border rounded">
                </div>
                <div class="p-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Escaparate</label>
                    <input type="text" class="tipo-escaparate w-full p-1.5 border rounded">
                </div>
                <div class="p-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Total Escaparate</label>
                    <input type="text" inputmode="decimal" class="total-escaparate w-full p-1.5 border rounded">
                </div>
            </div>

            <!-- Tabla de elementos del escaparate -->
            <table class="w-full text-sm bg-white rounded-md shadow border border-gray-200 mb-3 tabla-elementos-escaparate">
                <thead class="bg-red-700 text-white text-sm text-center">
                    <tr>
                        <th class="p-2 w-[18%]">Concepto</th>
                        <th class="p-2 w-[8%]">Alto</th>
                        <th class="p-2 w-[8%]">Ancho</th>
                        <th class="p-2 w-[18%]">Material</th>
                        <th class="p-2 w-[12%]">Precio/M.Prima</th>
                        <th class="p-2 w-[12%]">Precio Unitario</th>
                        <th class="p-2 w-[8%]">Unidades</th>
                        <th class="p-2 w-[12%]">Total</th>
                        <th class="p-2 w-[4%]"></th> <!-- Columna oculta para acciones sin encabezado -->
                    </tr>
                </thead>
                <tbody class="elementos-container">
                    <!-- Aquí se añadirán los elementos dinámicamente -->
                </tbody>
                <tfoot class="bg-gray-50">
                    <tr>
                        <td colspan="7" class="text-right pr-3 font-medium">Total Escaparate:</td>
                        <td class="p-2">
                            <input type="text" inputmode="decimal" class="total-elementos w-full p-1 border rounded">
                        </td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>

            <div class="flex justify-end space-x-2">
                <button class="add-elemento-nuevo bg-red-700 text-white px-3 py-1 rounded hover:bg-red-800 transition"
                        data-pdv-index="${pdvIndex}"
                        data-escaparate-index="${escaparateIndex}">
                    + Añadir elemento nuevo
                </button>
                <button class="add-elemento-existente bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                        data-pdv-index="${pdvIndex}" 
                        data-escaparate-index="${escaparateIndex}">
                    + Añadir elemento existente
                </button>
            </div>
        </div>
    `;
}

/**
 * Genera el template HTML para un elemento de escaparate
 * @param {boolean} esFilaInicial - Indica si es la primera fila del escaparate
 * @param {Function} generarOpcionesMateriales - Función para generar las opciones de materiales
 * @returns {string} Template HTML del elemento
 */
function generarTemplateElemento(esFilaInicial = true, generarOpcionesMateriales) {
    return `
        <tr class="border-b text-center elemento-escaparate">
            <td class="p-2">
                <input type="text" class="concepto w-full p-1.5 border rounded text-sm" placeholder="Concepto">
            </td>
            <td class="p-2">
                <input type="text" inputmode="decimal" class="dimension alto w-full p-1.5 border rounded text-sm" placeholder="Alto">
            </td>
            <td class="p-2">
                <input type="text" inputmode="decimal" class="dimension ancho w-full p-1.5 border rounded text-sm" placeholder="Ancho">
            </td>
            <td class="p-2">
                <select class="material w-full p-1.5 border rounded">
                    <option value="">Seleccionar</option>
                    ${generarOpcionesMateriales ? generarOpcionesMateriales() : ''}
                </select>
            </td>
            <td class="p-2">
                <input type="text" inputmode="decimal" class="precio-mp w-full p-1.5 border rounded">
            </td>
            <td class="p-2">
                <input type="text" inputmode="decimal" class="precio-unitario w-full p-1.5 border rounded">
            </td>
            <td class="p-2">
                <input type="text" inputmode="decimal" class="unidades w-full p-1.5 border rounded text-sm" value="1">
            </td>
            <td class="p-2">
                <input type="text" inputmode="decimal" class="total-elemento w-full p-1.5 border rounded">
            </td>
            <td class="p-2 w-0 text-center">
                <button class="eliminar-elemento text-red-500 hover:text-red-700">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        </tr>
    `;
}

/**
 * Genera el template HTML para un elemento de escaparate con select de conceptos existentes
 * @param {boolean} esFilaInicial - Indica si es la primera fila del escaparate
 * @param {Function} generarOpcionesMateriales - Función para generar las opciones de materiales
 * @param {Function} generarOpcionesConceptos - Función para generar opciones de conceptos existentes
 * @returns {string} Template HTML del elemento
 */
function generarTemplateElementoExistente(esFilaInicial = true, generarOpcionesMateriales, generarOpcionesConceptos) {
    return `
        <tr class="border-b text-center elemento-escaparate">
            <td class="p-2">
                <select class="concepto-select w-full p-1.5 border rounded text-sm">
                    <option value="">Seleccionar concepto</option>
                    ${generarOpcionesConceptos ? generarOpcionesConceptos() : ''}
                </select>
            </td>
            <td class="p-2">
                <input type="text" inputmode="decimal" class="dimension alto w-full p-1.5 border rounded text-sm" placeholder="Alto">
            </td>
            <td class="p-2">
                <input type="text" inputmode="decimal" class="dimension ancho w-full p-1.5 border rounded text-sm" placeholder="Ancho">
            </td>
            <td class="p-2">
                <select class="material w-full p-1.5 border rounded">
                    <option value="">Seleccionar</option>
                    ${generarOpcionesMateriales ? generarOpcionesMateriales() : ''}
                </select>
            </td>
            <td class="p-2">
                <input type="text" inputmode="decimal" class="precio-mp w-full p-1.5 border rounded">
            </td>
            <td class="p-2">
                <input type="text" inputmode="decimal" class="precio-unitario w-full p-1.5 border rounded">
            </td>
            <td class="p-2">
                <input type="text" inputmode="decimal" class="unidades w-full p-1.5 border rounded text-sm" value="1">
            </td>
            <td class="p-2">
                <input type="text" inputmode="decimal" class="total-elemento w-full p-1.5 border rounded">
            </td>
            <td class="p-2 w-0 text-center">
                <button class="eliminar-elemento text-red-500 hover:text-red-700">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        </tr>
    `;
}

/**
 * Genera el template HTML para una fila de PDV (DEPRECATED - Usar nueva estructura)
 * @param {boolean} esFilaInicial - Indica si es la primera fila de la tabla
 * @param {Function} generarOpcionesMateriales - Función para generar las opciones de materiales
 * @returns {string} Template HTML de la fila
 */
function generarTemplateFilaPDV(esFilaInicial = false, generarOpcionesMateriales) {
    return `
        <td class="p-2">
            ${esFilaInicial ? `
                <input type="file" class="file-input hidden">
                <button class="upload-btn w-full p-1.5 text-sm border border-gray-300 rounded bg-gray-50">
                    Subir foto
                </button>
            ` : ''}
        </td>
        <td class="p-2">
            ${esFilaInicial ? `
                <select class="isla w-full p-1.5 border rounded">
                    <option value="">Seleccionar</option>
                    <option value="GC">GC</option>
                    <option value="TFE">TFE</option>
                    <option value="LZT">LZT</option>
                    <option value="FTV">FTV</option>
                    <option value="HIERRO">HIERRO</option>
                    <option value="GOMERA">GOMERA</option>
                    <option value="PALMA">PALMA</option>
                </select>
            ` : ''}
        </td>
        <td class="p-2">
            <input type="text" class="w-full p-1.5 border rounded text-sm" placeholder="Concepto">
        </td>
        <td class="p-2">
            <input type="number" step="0.01" class="dimension w-16 p-1.5 border rounded text-sm" placeholder="Alto">
        </td>
        <td class="p-2">
            <input type="number" step="0.01" class="dimension w-16 p-1.5 border rounded text-sm" placeholder="Ancho">
        </td>
        <td class="p-2">
            <select class="material w-full p-1.5 border rounded">
                <option value="">Seleccionar</option>
                ${generarOpcionesMateriales ? generarOpcionesMateriales() : ''}
            </select>
        </td>
        <td class="p-2">
            <input type="number" step="0.01" class="precio-mp w-20 p-1.5 border rounded">
        </td>
        <td class="p-2">
            <input type="number" step="0.01" class="precio-unitario w-20 p-1.5 border rounded">
        </td>
        <td class="p-2">
            <input type="number" class="unidades w-16 p-1.5 border rounded text-sm" value="1">
        </td>
        <td class="p-2">
            <input type="number" step="0.01" class="margen w-20 p-1.5 border rounded">
        </td>
        <td class="p-2">
            <input type="number" step="0.01" class="total w-20 p-1.5 border rounded">
        </td>
        <td class="p-2">
            ${esFilaInicial ? `
                <input type="text" class="escaparate w-24 p-1.5 border rounded">
            ` : ''}
        </td>
        <td class="p-2">
            ${esFilaInicial ? `
                <input type="number" step="0.01" class="total-escaparate w-24 p-1.5 border rounded">
            ` : ''}
        </td>
        <td class="p-2">
            ${esFilaInicial ? `
                <input type="number" step="0.01" class="montaje w-20 p-1.5 border rounded">
            ` : ''}
        </td>
        <td class="p-2">
            ${esFilaInicial ? `
                <input type="text" class="obs w-20 p-1.5 border rounded">
            ` : ''}
        </td>
        <td class="p-2">
            <button class="eliminar-fila text-red-500 hover:text-red-700">
                <i class="fas fa-times"></i>
            </button>
        </td>
    `;
}

// Exponer las funciones globalmente
window.Templates = {
    generarTemplatePDV,
    generarTemplateFilaPDV,
    generarTemplateEscaparate,
    generarTemplateElemento,
    generarTemplateElementoExistente
}; 