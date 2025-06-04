/**
 * Calculadora.js
 * Clase para centralizar todas las operaciones relacionadas con cálculos 
 * de presupuestos, totales, precios, etc.
 */
class Calculadora {
    constructor() {
        this.materialesDisponibles = {};
    }

    /**
     * Actualiza el precio de materia prima basado en el material seleccionado
     * @param {Element} elementoRow - Fila del elemento
     * @param {number} pdvIndex - Índice del PDV
     * @param {number} escaparateIndex - Índice del escaparate
     */
    actualizarPrecioMP(elementoRow, pdvIndex, escaparateIndex) {
        const material = elementoRow.querySelector('.material');
        const precioMP = elementoRow.querySelector('.precio-mp');
        if (material && precioMP) {
            const materialSeleccionado = material.value;
            precioMP.value = this.materialesDisponibles[materialSeleccionado] || '';
            this.calcularPrecioUnitario(elementoRow, pdvIndex, escaparateIndex);
        }
    }

    /**
     * Calcula el precio unitario basado en dimensiones y precio MP
     * @param {Element} elementoRow - Fila del elemento
     * @param {number} pdvIndex - Índice del PDV
     * @param {number} escaparateIndex - Índice del escaparate
     */
    calcularPrecioUnitario(elementoRow, pdvIndex, escaparateIndex) {
        const alto = parseFloat(elementoRow.querySelector('.alto').value.replace(',', '.')) || 0;
        const ancho = parseFloat(elementoRow.querySelector('.ancho').value.replace(',', '.')) || 0;
        const precioMP = parseFloat(elementoRow.querySelector('.precio-mp').value.replace(',', '.')) || 0;
        
        // Calcular precio unitario como (alto/100 * ancho/100) * precioMP
        const precioUnitario = ((alto / 100) * (ancho / 100) * precioMP).toFixed(2);
        elementoRow.querySelector('.precio-unitario').value = precioUnitario;
        
        this.calcularTotalesElemento(elementoRow, pdvIndex, escaparateIndex);
    }

    /**
     * Calcula los totales para un elemento (fila) específico
     * @param {Element} elementoRow - Fila del elemento
     * @param {number} pdvIndex - Índice del PDV
     * @param {number} escaparateIndex - Índice del escaparate
     */
    calcularTotalesElemento(elementoRow, pdvIndex, escaparateIndex) {
        const precioUnitario = parseFloat(elementoRow.querySelector('.precio-unitario').value.replace(',', '.')) || 0;
        const unidades = parseInt(elementoRow.querySelector('.unidades').value.replace(',', '.')) || 1;

        const total = (precioUnitario * unidades).toFixed(2);
        elementoRow.querySelector('.total-elemento').value = total;

        this.actualizarTotalEscaparate(pdvIndex, escaparateIndex);
    }

    /**
     * Actualiza el total de un escaparate sumando todos sus elementos
     * @param {number} pdvIndex - Índice del PDV
     * @param {number} escaparateIndex - Índice del escaparate
     */
    actualizarTotalEscaparate(pdvIndex, escaparateIndex) {
        const pdvDiv = document.querySelector(`.tabla-pdv[data-pdv-index="${pdvIndex}"]`);
        if (!pdvDiv) return;

        const escaparateItem = pdvDiv.querySelector(`.escaparate-item[data-escaparate-index="${escaparateIndex}"]`);
        if (!escaparateItem) return;

        const totales = Array.from(escaparateItem.querySelectorAll('.total-elemento'))
            .map(input => parseFloat(input.value.replace(',', '.')) || 0);
        
        const totalEscaparate = totales.reduce((sum, value) => sum + value, 0).toFixed(2);
        
        // Actualizar total en el footer de la tabla
        const totalElementosInput = escaparateItem.querySelector('.total-elementos');
        if (totalElementosInput) {
            totalElementosInput.value = totalEscaparate;
        }
        
        // Actualizar total en el header del escaparate
        const totalEscaparateInput = escaparateItem.querySelector('.total-escaparate');
        if (totalEscaparateInput) {
            totalEscaparateInput.value = totalEscaparate;
        }

        this.actualizarTotalPDV(pdvIndex);
    }

    /**
     * Actualiza el total de un PDV sumando todos sus escaparates y el montaje
     * @param {number} pdvIndex - Índice del PDV
     */
    actualizarTotalPDV(pdvIndex) {
        const pdvDiv = document.querySelector(`.tabla-pdv[data-pdv-index="${pdvIndex}"]`);
        if (!pdvDiv) return;

        // Sumar totales de todos los escaparates
        const totalesEscaparates = Array.from(pdvDiv.querySelectorAll('.total-escaparate'))
            .map(input => parseFloat(input.value.replace(',', '.')) || 0);
        
        const totalEscaparates = totalesEscaparates.reduce((sum, value) => sum + value, 0);
        
        // Actualizar campos
        const totalEscaparatesInput = pdvDiv.querySelector('.total-escaparates-pdv');
        if (totalEscaparatesInput) {
            totalEscaparatesInput.value = totalEscaparates.toFixed(2);
        }
        
        // Ya no calculamos ni mostramos el Total PDV
        // Actualizar precios de materiales para cada escaparate
        pdvDiv.querySelectorAll('.escaparate-item').forEach(escaparateItem => {
            const escaparateIndex = parseInt(escaparateItem.dataset.escaparateIndex);
            const totalEscaparate = parseFloat(escaparateItem.querySelector('.total-escaparate').value.replace(',', '.')) || 0;
            const numElementos = escaparateItem.querySelectorAll('.elemento-escaparate').length || 1;
            
            // Guardar el precio material (que se usará como importe unitario en el PDF)
            const precioMaterial = totalEscaparate / numElementos;
            escaparateItem.setAttribute('data-precio-material', precioMaterial.toFixed(2));
            escaparateItem.setAttribute('data-unidades-material', '1');
        });
        
        this.recalcularTotales();
    }

    /**
     * Recalcula el total general sumando todos los PDVs
     */
    recalcularTotales() {
        // Calcular el total general sumando todos los totales de escaparates
        const totalesEscaparates = Array.from(document.querySelectorAll('.total-escaparates-pdv'))
            .map(input => parseFloat(input.value.replace(',', '.')) || 0);
        
        const totalGeneral = totalesEscaparates.reduce((sum, value) => sum + value, 0).toFixed(2);
        
        // Actualizar total general si existe un elemento para ello
        const totalGeneralInput = document.getElementById('total-general');
        if (totalGeneralInput) {
            totalGeneralInput.value = totalGeneral;
        }
    }

    /**
     * Inicializa los cálculos para todos los elementos de la página
     * Recalcula automáticamente precios unitarios y totales sin necesidad de modificar los campos
     */
    inicializarCalculos() {
        // Procesar cada PDV
        document.querySelectorAll('.tabla-pdv').forEach(pdvDiv => {
            const pdvIndex = parseInt(pdvDiv.dataset.pdvIndex);
            
            // Procesar cada escaparate dentro del PDV
            pdvDiv.querySelectorAll('.escaparate-item').forEach(escaparateItem => {
                const escaparateIndex = parseInt(escaparateItem.dataset.escaparateIndex);
                
                // Procesar cada elemento del escaparate
                escaparateItem.querySelectorAll('.elemento-escaparate').forEach(elementoRow => {
                    // Calcular precio unitario basado en las dimensiones y precio MP actuales
                    this.calcularPrecioUnitario(elementoRow, pdvIndex, escaparateIndex);
                });
                
                // Actualizar total del escaparate
                this.actualizarTotalEscaparate(pdvIndex, escaparateIndex);
            });
            
            // Actualizar total del PDV
            this.actualizarTotalPDV(pdvIndex);
        });
        
        // Actualizar total general
        this.recalcularTotales();
    }

    /**
     * Genera las opciones HTML para el selector de materiales
     * @returns {string} - HTML con las opciones de materiales
     */
    generarOpcionesMateriales() {
        return Object.entries(this.materialesDisponibles)
            .map(([nombre, precio]) => `<option value="${nombre}">${nombre}</option>`)
            .join('');
    }

    /**
     * Actualiza la lista de materiales disponibles con los datos del servidor
     * @param {Object} data - Datos recibidos del servidor
     */
    actualizarMaterialesDisponibles(data) {
        this.materialesDisponibles = {};
        if (data.materiales && Array.isArray(data.materiales)) {
            data.materiales.forEach(material => {
                if (material.nombre && material.importe !== undefined) {
                    this.materialesDisponibles[material.nombre] = material.importe;
                }
            });
        }
    }

    /**
     * Actualiza los selectores de materiales en el DOM
     */
    actualizarSelectoresMateriales() {
        document.querySelectorAll('.material').forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Seleccionar</option>' +
                Object.entries(this.materialesDisponibles)
                    .map(([nombre, precio]) => `<option value="${nombre}">${nombre}</option>`)
                    .join('');
            
            // Restaurar el valor seleccionado si aún existe
            if (currentValue && this.materialesDisponibles[currentValue]) {
                select.value = currentValue;
            }

            // Actualizar el precio si hay un material seleccionado
            if (select.value) {
                const elementoRow = select.closest('tr');
                if (elementoRow) {
                    const pdvDiv = select.closest('.tabla-pdv');
                    const escaparateItem = select.closest('.escaparate-item');
                    
                    if (pdvDiv && escaparateItem) {
                        const pdvIndex = parseInt(pdvDiv.dataset.pdvIndex);
                        const escaparateIndex = parseInt(escaparateItem.dataset.escaparateIndex);
                        
                        this.actualizarPrecioMP(elementoRow, pdvIndex, escaparateIndex);
                    }
                }
            }
        });
    }
}

// Crear instancia global
window.calculadora = new Calculadora(); 