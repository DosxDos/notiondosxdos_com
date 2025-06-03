/**
 * Utilidades y funciones de soporte para tablas de presupuestos
 * 
 * NOTA: Las funciones de generación de HTML se han movido a templates.js
 * y están disponibles a través del objeto global window.Templates
 */

// Mantener compatibilidad con el código existente redirigiendo a Templates
window.generarTemplatePDV = (index, obtenerNombrePDV) => window.Templates.generarTemplatePDV(index, obtenerNombrePDV);
window.generarTemplateFilaPDV = (esFilaInicial, generarOpcionesMateriales) => window.Templates.generarTemplateFilaPDV(esFilaInicial, generarOpcionesMateriales);
window.generarTemplateEscaparate = (pdvIndex, escaparateIndex) => window.Templates.generarTemplateEscaparate(pdvIndex, escaparateIndex);
window.generarTemplateElemento = (esFilaInicial, generarOpcionesMateriales) => window.Templates.generarTemplateElemento(esFilaInicial, generarOpcionesMateriales);

/**
 * Utilidades para tablas de presupuestos
 */
class TableUtils {
    /**
     * Maneja la subida de archivos y actualiza el botón
     * @param {Event} event - Evento de cambio del input file
     * @param {HTMLElement} button - Botón de subida que se actualizará
     */
    static handleFileUpload(event, button) {
        const file = event.target.files[0];
        if (file) {
            button.textContent = file.name;
            button.classList.add('bg-green-50', 'text-green-700', 'border-green-300');
        }
    }
    
    /**
     * Actualiza los índices de todos los PDVs para mantener la coherencia
     * después de eliminar un PDV
     */
    static actualizarIndicesPDV() {
        // Obtener todos los elementos PDV en el DOM
        const pdvDivs = document.querySelectorAll('.tabla-pdv');
        
        // Recorrer y actualizar sus índices secuencialmente
        pdvDivs.forEach((pdvDiv, nuevoIndex) => {
            const viejoIndex = parseInt(pdvDiv.dataset.pdvIndex);
            
            // Solo actualizar si el índice ha cambiado
            if (nuevoIndex !== viejoIndex) {
                // Actualizar el atributo data-pdv-index
                pdvDiv.dataset.pdvIndex = nuevoIndex;
                
                // Actualizar los data-pdv-index en los botones internos
                const botonesConIndex = pdvDiv.querySelectorAll('[data-pdv-index]');
                botonesConIndex.forEach(btn => {
                    btn.dataset.pdvIndex = nuevoIndex;
                });
                
                // Actualizar el ID del contenedor de escaparates
                const escaparatesContainer = pdvDiv.querySelector(`#escaparates-pdv-${viejoIndex}`);
                if (escaparatesContainer) {
                    escaparatesContainer.id = `escaparates-pdv-${nuevoIndex}`;
                }
                
                // Si hay datos en el presupuesto y se movió un PDV, actualizar sus datos
                if (window.presupuestoLoader && window.presupuestoLoader.datosPresupuesto) {
                    const puntosDeVenta = window.presupuestoLoader.datosPresupuesto.puntos_de_venta;
                    if (Array.isArray(puntosDeVenta) && puntosDeVenta[viejoIndex]) {
                        // Solo es necesario hacer algo si los índices no coinciden
                        // Los datos ya fueron reordenados por el splice anterior
                    }
                }
            }
        });
    }
    
    /**
     * Actualiza un select con opciones a partir de un array de datos
     * @param {HTMLSelectElement} selectElement - Elemento select a actualizar
     * @param {Array} opciones - Array de opciones (objetos con id y nombre)
     * @param {Function} obtenerTexto - Función para obtener el texto de la opción
     * @param {Function} obtenerValor - Función para obtener el valor de la opción
     * @param {boolean} mantenerPrimeraOpcion - Si se debe mantener la primera opción del select
     */
    static actualizarSelect(selectElement, opciones, obtenerTexto, obtenerValor, mantenerPrimeraOpcion = true) {
        if (!selectElement || !Array.isArray(opciones)) return;
        
        // Guardar el valor actual
        const currentSelected = selectElement.value;
        
        // Limpiar opciones actuales excepto la primera si se indica
        const startIndex = mantenerPrimeraOpcion ? 1 : 0;
        while (selectElement.options.length > startIndex) {
            selectElement.remove(startIndex);
        }
        
        // Añadir nuevas opciones
        opciones.forEach(opcion => {
            const option = document.createElement('option');
            option.value = obtenerValor(opcion);
            option.textContent = obtenerTexto(opcion);
            selectElement.appendChild(option);
        });
        
        // Restaurar el valor seleccionado si aún existe
        if (currentSelected) {
            selectElement.value = currentSelected;
        }
    }
    
    /**
     * Encuentra un elemento específico dentro de la estructura de PDVs
     * @param {number} pdvIndex - Índice del PDV
     * @param {number} escaparateIndex - Índice del escaparate (opcional)
     * @returns {Object} Objeto con referencias a los elementos encontrados
     */
    static encontrarElementos(pdvIndex, escaparateIndex = null) {
        const pdvDiv = document.querySelector(`.tabla-pdv[data-pdv-index="${pdvIndex}"]`);
        if (!pdvDiv) return { pdvDiv: null };
        
        const result = { pdvDiv };
        
        if (escaparateIndex !== null) {
            const escaparateItem = pdvDiv.querySelector(`.escaparate-item[data-escaparate-index="${escaparateIndex}"]`);
            if (escaparateItem) {
                result.escaparateItem = escaparateItem;
                result.elementosContainer = escaparateItem.querySelector('.elementos-container');
            }
        }
        
        return result;
    }
    
    /**
     * Ordena un array de objetos por una propiedad específica
     * @param {Array} array - Array a ordenar
     * @param {string|Function} propOrFn - Propiedad o función para obtener el valor de ordenación
     * @param {boolean} ascending - Si el orden es ascendente (true) o descendente (false)
     * @returns {Array} Array ordenado
     */
    static ordenarArray(array, propOrFn, ascending = true) {
        if (!Array.isArray(array)) return [];
        
        return [...array].sort((a, b) => {
            let valA, valB;
            
            if (typeof propOrFn === 'function') {
                valA = propOrFn(a);
                valB = propOrFn(b);
            } else {
                valA = a[propOrFn];
                valB = b[propOrFn];
            }
            
            // Manejar posibles valores nulos o undefined
            if (valA === undefined || valA === null) valA = '';
            if (valB === undefined || valB === null) valB = '';
            
            // Convertir a minúsculas si son strings
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            
            // Ordenar
            if (valA < valB) return ascending ? -1 : 1;
            if (valA > valB) return ascending ? 1 : -1;
            return 0;
        });
    }
}

// Exponer la clase globalmente
window.TableUtils = TableUtils;

/**
 * Manejadores de eventos para elementos de las tablas de presupuestos
 * Esta clase ayuda a reducir la duplicación en presupuestos-tabla.js
 */
class EventHandlers {
    /**
     * Inicializa todos los eventos para un elemento (fila)
     * @param {Element} elementoRow - Fila del elemento
     * @param {number} pdvIndex - Índice del PDV
     * @param {number} escaparateIndex - Índice del escaparate
     */
    static initializeElementoEvents(elementoRow, pdvIndex, escaparateIndex) {
        // Manejo de cálculos
        const material = elementoRow.querySelector('.material');
        if (material) {
            material.addEventListener('change', () => window.calculadora.actualizarPrecioMP(elementoRow, pdvIndex, escaparateIndex));
        }

        // Eventos para actualizar precio unitario automáticamente
        ['alto', 'ancho', 'precio-mp'].forEach(className => {
            const input = elementoRow.querySelector(`.${className}`);
            if (input) {
                input.addEventListener('input', () => window.calculadora.calcularPrecioUnitario(elementoRow, pdvIndex, escaparateIndex));
            }
        });
        
        // Eventos para cálculos de totales
        const unidadesInput = elementoRow.querySelector('.unidades');
        if (unidadesInput) {
            unidadesInput.addEventListener('input', () => window.calculadora.calcularTotalesElemento(elementoRow, pdvIndex, escaparateIndex));
        }
        
        // Evento para actualizar totales si se modifica manualmente el precio unitario
        const precioUnitarioInput = elementoRow.querySelector('.precio-unitario');
        if (precioUnitarioInput) {
            precioUnitarioInput.addEventListener('input', () => window.calculadora.calcularTotalesElemento(elementoRow, pdvIndex, escaparateIndex));
        }
        
        // Evento para actualizar totales si se modifica manualmente el total del elemento
        const totalElementoInput = elementoRow.querySelector('.total-elemento');
        if (totalElementoInput) {
            totalElementoInput.addEventListener('input', () => window.calculadora.actualizarTotalEscaparate(pdvIndex, escaparateIndex));
        }
        
        // Botón para eliminar elemento
        const eliminarBtn = elementoRow.querySelector('.eliminar-elemento');
        if (eliminarBtn) {
            eliminarBtn.addEventListener('click', () => {
                elementoRow.remove();
                window.calculadora.actualizarTotalEscaparate(pdvIndex, escaparateIndex);
            });
        }
    }
    
    /**
     * Inicializa eventos para campos específicos del elemento existente
     * @param {Element} elementoRow - Fila del elemento
     * @param {number} pdvIndex - Índice del PDV
     * @param {number} escaparateIndex - Índice del escaparate
     * @param {Function} actualizarCamposCallback - Función para actualizar campos
     */
    static initializeElementoExistenteEvents(elementoRow, pdvIndex, escaparateIndex, actualizarCamposCallback) {
        // Evento para seleccionar concepto existente
        const conceptoSelect = elementoRow.querySelector('.concepto-select');
        if (conceptoSelect && typeof actualizarCamposCallback === 'function') {
            conceptoSelect.addEventListener('change', () => {
                actualizarCamposCallback(elementoRow, conceptoSelect.value, pdvIndex, escaparateIndex);
            });
        }

        // Inicializar los eventos comunes
        this.initializeElementoEvents(elementoRow, pdvIndex, escaparateIndex);
    }
    
    /**
     * Inicializa eventos para un escaparate
     * @param {Element} escaparateItem - Elemento del escaparate
     * @param {number} pdvIndex - Índice del PDV
     * @param {number} escaparateIndex - Índice del escaparate
     * @param {Object} callbacks - Callbacks para eventos: agregarElemento, agregarElementoExistente
     */
    static initializeEscaparateEvents(escaparateItem, pdvIndex, escaparateIndex, callbacks) {
        if (!escaparateItem) return;
        
        // Botón para agregar elemento nuevo
        const addElementoNuevoBtn = escaparateItem.querySelector('.add-elemento-nuevo');
        if (addElementoNuevoBtn && callbacks.agregarElemento) {
            addElementoNuevoBtn.addEventListener('click', () => callbacks.agregarElemento(pdvIndex, escaparateIndex));
        }

        // Botón para agregar elemento existente
        const addElementoExistenteBtn = escaparateItem.querySelector('.add-elemento-existente');
        if (addElementoExistenteBtn && callbacks.agregarElementoExistente) {
            addElementoExistenteBtn.addEventListener('click', () => callbacks.agregarElementoExistente(pdvIndex, escaparateIndex));
        }

        // Botón para eliminar escaparate
        const deleteBtn = escaparateItem.querySelector('.eliminar-escaparate');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                escaparateItem.remove();
                window.calculadora.actualizarTotalPDV(pdvIndex);
            });
        }

        // Actualizar total cuando cambia el nombre del escaparate
        const nombreEscaparate = escaparateItem.querySelector('.nombre-escaparate');
        if (nombreEscaparate) {
            nombreEscaparate.addEventListener('input', () => {
                // Posible lógica para manejar cambios en el nombre
            });
        }
        
        // Evento para actualizar totales si se modifica manualmente el total del escaparate
        const totalEscaparateInput = escaparateItem.querySelector('.total-escaparate');
        if (totalEscaparateInput) {
            totalEscaparateInput.addEventListener('input', () => window.calculadora.actualizarTotalPDV(pdvIndex));
        }
        
        // Evento para actualizar totales si se modifica manualmente el total en el footer
        const totalElementosInput = escaparateItem.querySelector('.total-elementos');
        if (totalElementosInput) {
            totalElementosInput.addEventListener('input', () => {
                // Actualizar el total del escaparate en el header
                if (totalEscaparateInput) {
                    totalEscaparateInput.value = totalElementosInput.value;
                }
                window.calculadora.actualizarTotalPDV(pdvIndex);
            });
        }
    }
    
    /**
     * Inicializa eventos para un PDV
     * @param {Element} pdvDiv - Elemento del PDV
     * @param {number} pdvIndex - Índice del PDV
     * @param {Object} callbacks - Callbacks para eventos: agregarEscaparate, cargarOpcionesPDV
     */
    static initializePDVEvents(pdvDiv, pdvIndex, callbacks) {
        if (!pdvDiv) return;
        
        // Botón para agregar escaparate
        const addEscaparateBtn = pdvDiv.querySelector('.add-escaparate');
        if (addEscaparateBtn && callbacks.agregarEscaparate) {
            addEscaparateBtn.addEventListener('click', () => callbacks.agregarEscaparate(pdvIndex));
        }

        // Botón para eliminar PDV
        const deleteBtn = pdvDiv.querySelector('.eliminar-pdv');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                // Obtener el índice actual del PDV
                const currentIndex = parseInt(pdvDiv.dataset.pdvIndex);
                
                // Eliminar el PDV del DOM
                pdvDiv.remove();
                
                // Eliminar los datos del PDV del array en datosPresupuesto
                if (window.presupuestoLoader && window.presupuestoLoader.datosPresupuesto) {
                    const puntosDeVenta = window.presupuestoLoader.datosPresupuesto.puntos_de_venta;
                    if (Array.isArray(puntosDeVenta) && puntosDeVenta.length > currentIndex) {
                        // Eliminar el PDV del array
                        puntosDeVenta.splice(currentIndex, 1);
                    }
                }
                
                // Actualizar los índices de los PDVs restantes
                window.TableUtils.actualizarIndicesPDV();
                
                // Recalcular totales
                window.calculadora.recalcularTotales();
            });
        }

        // Gestión de la foto
        const uploadBtn = pdvDiv.querySelector('.upload-btn-pdv');
        const fileInput = pdvDiv.querySelector('.file-input-pdv');
        
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => window.TableUtils.handleFileUpload(e, uploadBtn));
        }

        // Campos que actualizan totales
        const montagePdv = pdvDiv.querySelector('.montaje-pdv');
        if (montagePdv) {
            montagePdv.addEventListener('input', () => window.calculadora.actualizarTotalPDV(pdvIndex));
        }
        
        // Eventos para actualizar totales si se modifican manualmente los totales del PDV
        const totalEscaparatesPdv = pdvDiv.querySelector('.total-escaparates-pdv');
        if (totalEscaparatesPdv) {
            totalEscaparatesPdv.addEventListener('input', () => window.calculadora.recalcularTotales());
        }
        
        const totalPdv = pdvDiv.querySelector('.total-pdv');
        if (totalPdv) {
            totalPdv.addEventListener('input', () => window.calculadora.recalcularTotales());
        }

        // Botón para desplegar/colapsar escaparates
        const toggleEscaparatesBtn = pdvDiv.querySelector('.toggle-escaparates');
        if (toggleEscaparatesBtn) {
            toggleEscaparatesBtn.addEventListener('click', () => {
                const escaparatesContainer = pdvDiv.querySelector('.escaparates-container');
                const toggleIcon = toggleEscaparatesBtn.querySelector('.toggle-icon');
                const isExpanded = toggleEscaparatesBtn.getAttribute('aria-expanded') === 'true';
                
                if (escaparatesContainer) {
                    if (isExpanded) {
                        // Colapsar
                        escaparatesContainer.classList.add('hidden');
                        toggleEscaparatesBtn.setAttribute('aria-expanded', 'false');
                        toggleEscaparatesBtn.querySelector('span').textContent = 'Desplegar escaparates';
                        toggleIcon.classList.remove('transform', 'rotate-180');
                    } else {
                        // Desplegar
                        escaparatesContainer.classList.remove('hidden');
                        toggleEscaparatesBtn.setAttribute('aria-expanded', 'true');
                        toggleEscaparatesBtn.querySelector('span').textContent = 'Colapsar escaparates';
                        toggleIcon.classList.add('transform', 'rotate-180');
                    }
                }
            });
        }

        // Manejo del select de puntos de venta si existe
        const selectPDV = pdvDiv.querySelector('.nombre-pdv');
        if (selectPDV && callbacks.cargarOpcionesPDV) {
            // Cargar las opciones del select
            callbacks.cargarOpcionesPDV(selectPDV);
            
            // Añadir evento de cambio
            selectPDV.addEventListener('change', () => {
                const selectedOption = selectPDV.options[selectPDV.selectedIndex];
                const pdvId = selectPDV.value;
                const pdvName = selectedOption.textContent;
                
                // Si tenemos un presupuesto cargado, actualizamos los datos
                if (window.presupuestoLoader && window.presupuestoLoader.datosPresupuesto) {
                    const puntosDeVenta = window.presupuestoLoader.datosPresupuesto.puntos_de_venta || [];
                    
                    // Si no existe el array de puntos de venta, lo creamos
                    if (!Array.isArray(puntosDeVenta)) {
                        window.presupuestoLoader.datosPresupuesto.puntos_de_venta = [];
                    }
                    
                    // Si no existe el punto de venta en el índice actual, creamos un objeto vacío
                    if (!puntosDeVenta[pdvIndex]) {
                        puntosDeVenta[pdvIndex] = {};
                    }
                    
                    // Actualizamos la información del PDV seleccionado
                    puntosDeVenta[pdvIndex].PDV_relacionados = {
                        id: pdvId,
                        name: pdvName
                    };
                }
            });
        }
    }
}

// Exponer la clase globalmente
window.EventHandlers = EventHandlers; 