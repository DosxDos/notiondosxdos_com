/**
 * Clase para gestionar las tablas de presupuestos de PDVs y escaparates
 */
class PresupuestosTabla {
    constructor() {
        this.materialesDisponibles = {};

        // Inicializar cuando el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', async () => {
                await this.initializeEventListeners();
                await this.cargarMateriales();
            });
        } else {
            this.initializeEventListeners();
            this.cargarMateriales();
        }
    }

    async initializeEventListeners() {
        // Botón para agregar nuevo PDV
        const btnAgregarPDV = document.getElementById('agregar-pdv-manual');
        if (btnAgregarPDV) {
            btnAgregarPDV.addEventListener('click', (e) => {
                e.preventDefault();
                this.agregarNuevoPDV();
            });
        }
    }

    agregarNuevoPDV() {
        const contenedorPDVs = document.getElementById('contenedor-pdvs');
        if (!contenedorPDVs) return;

        const index = document.querySelectorAll('.tabla-pdv').length;
        const pdvDiv = document.createElement('div');
        pdvDiv.classList.add('w-full', 'bg-white', 'p-4', 'rounded', 'shadow', 'mb-6', 'tabla-pdv');
        pdvDiv.dataset.pdvIndex = index;

        pdvDiv.innerHTML = window.generarTemplatePDV(index, this.obtenerNombrePDV.bind(this));
        contenedorPDVs.appendChild(pdvDiv);

        // Inicializar eventos para el nuevo PDV
        this.initializePDVEvents(pdvDiv, index);
    }

    obtenerNombrePDV(index) {
        // Intentar obtener los datos del presupuesto desde el cargador
        if (window.presupuestoLoader && window.presupuestoLoader.datosPresupuesto) {
            const puntosDeVenta = window.presupuestoLoader.datosPresupuesto.puntos_de_venta;
            if (puntosDeVenta && puntosDeVenta[index]) {
                const pdv = puntosDeVenta[index];
                
                // Verificar si el nombre está dentro del objeto PDV_relacionados
                if (pdv.PDV_relacionados && pdv.PDV_relacionados.name) {
                    return pdv.PDV_relacionados.name;
                }
                
                // Si no está en PDV_relacionados, intentamos buscar en otras propiedades
                const nombresPosibles = ['Name', 'name', 'PDV_Name', 'Nombre'];
                for (const prop of nombresPosibles) {
                    if (pdv[prop]) {
                        return pdv[prop];
                    }
                }
                
                // Si no encontramos un nombre específico, devolvemos un valor genérico
                return `Punto de Venta ${index + 1}`;
            }
        }
        return null; // Devolver null si no hay datos disponibles
    }

    initializePDVEvents(pdvDiv, pdvIndex) {
        // Botón para agregar escaparate
        const addEscaparateBtn = pdvDiv.querySelector('.add-escaparate');
        if (addEscaparateBtn) {
            addEscaparateBtn.addEventListener('click', () => this.agregarEscaparate(pdvIndex));
        }

        // Botón para eliminar PDV
        const deleteBtn = pdvDiv.querySelector('.eliminar-pdv');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                pdvDiv.remove();
                this.recalcularTotales();
            });
        }

        // Gestión de la foto
        const uploadBtn = pdvDiv.querySelector('.upload-btn-pdv');
        const fileInput = pdvDiv.querySelector('.file-input-pdv');
        
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e, uploadBtn));
        }

        // Campos que actualizan totales
        const montagePdv = pdvDiv.querySelector('.montaje-pdv');
        if (montagePdv) {
            montagePdv.addEventListener('input', () => this.actualizarTotalPDV(pdvIndex));
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
    }

    agregarEscaparate(pdvIndex) {
        const pdvDiv = document.querySelector(`.tabla-pdv[data-pdv-index="${pdvIndex}"]`);
        if (!pdvDiv) return;

        const escaparatesContainer = pdvDiv.querySelector(`#escaparates-pdv-${pdvIndex}`);
        if (!escaparatesContainer) return;

        const escaparateIndex = escaparatesContainer.querySelectorAll('.escaparate-item').length;
        const escaparateDiv = document.createElement('div');
        
        escaparateDiv.innerHTML = window.generarTemplateEscaparate(pdvIndex, escaparateIndex);
        escaparatesContainer.appendChild(escaparateDiv.firstElementChild);

        // Inicializar eventos para el nuevo escaparate
        this.initializeEscaparateEvents(pdvIndex, escaparateIndex);
        
        // Añadir primer elemento al escaparate
        this.agregarElemento(pdvIndex, escaparateIndex);
    }

    initializeEscaparateEvents(pdvIndex, escaparateIndex) {
        const pdvDiv = document.querySelector(`.tabla-pdv[data-pdv-index="${pdvIndex}"]`);
        if (!pdvDiv) return;

        const escaparateItem = pdvDiv.querySelector(`.escaparate-item[data-escaparate-index="${escaparateIndex}"]`);
        if (!escaparateItem) return;

        // Botón para agregar elemento
        const addElementoBtn = escaparateItem.querySelector('.add-elemento');
        if (addElementoBtn) {
            addElementoBtn.addEventListener('click', () => this.agregarElemento(pdvIndex, escaparateIndex));
        }

        // Botón para eliminar escaparate
        const deleteBtn = escaparateItem.querySelector('.eliminar-escaparate');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                escaparateItem.remove();
                this.actualizarTotalPDV(pdvIndex);
            });
        }

        // Actualizar total cuando cambia el nombre del escaparate
        const nombreEscaparate = escaparateItem.querySelector('.nombre-escaparate');
        if (nombreEscaparate) {
            nombreEscaparate.addEventListener('input', () => {
                // Posible lógica para manejar cambios en el nombre
            });
        }
    }

    agregarElemento(pdvIndex, escaparateIndex) {
        const pdvDiv = document.querySelector(`.tabla-pdv[data-pdv-index="${pdvIndex}"]`);
        if (!pdvDiv) return;

        const escaparateItem = pdvDiv.querySelector(`.escaparate-item[data-escaparate-index="${escaparateIndex}"]`);
        if (!escaparateItem) return;

        const elementosContainer = escaparateItem.querySelector('.elementos-container');
        if (!elementosContainer) return;

        const elementoRow = document.createElement('tr');
        elementoRow.innerHTML = window.generarTemplateElemento(true, this.generarOpcionesMateriales.bind(this));
        elementosContainer.appendChild(elementoRow);

        // Inicializar eventos para el nuevo elemento
        this.initializeElementoEvents(elementoRow, pdvIndex, escaparateIndex);
    }

    initializeElementoEvents(elementoRow, pdvIndex, escaparateIndex) {
        // Manejo de cálculos
        const material = elementoRow.querySelector('.material');
        if (material) {
            material.addEventListener('change', () => this.actualizarPrecioMP(elementoRow, pdvIndex, escaparateIndex));
        }

        // Eventos para cálculos automáticos
        ['alto', 'ancho', 'precio-unitario', 'unidades'].forEach(className => {
            const input = elementoRow.querySelector(`.${className}`);
            if (input) {
                input.addEventListener('input', () => this.calcularTotalesElemento(elementoRow, pdvIndex, escaparateIndex));
            }
        });
        
        // Botón para eliminar elemento
        const eliminarBtn = elementoRow.querySelector('.eliminar-elemento');
        if (eliminarBtn) {
            eliminarBtn.addEventListener('click', () => {
                elementoRow.remove();
                this.actualizarTotalEscaparate(pdvIndex, escaparateIndex);
            });
        }
    }

    handleFileUpload(event, button) {
        const file = event.target.files[0];
        if (file) {
            button.textContent = file.name;
            button.classList.add('bg-green-50', 'text-green-700', 'border-green-300');
        }
    }

    actualizarPrecioMP(elementoRow, pdvIndex, escaparateIndex) {
        const material = elementoRow.querySelector('.material');
        const precioMP = elementoRow.querySelector('.precio-mp');
        if (material && precioMP) {
            const materialSeleccionado = material.value;
            precioMP.value = this.materialesDisponibles[materialSeleccionado] || '';
            this.calcularTotalesElemento(elementoRow, pdvIndex, escaparateIndex);
        }
    }

    calcularTotalesElemento(elementoRow, pdvIndex, escaparateIndex) {
        const alto = parseFloat(elementoRow.querySelector('.alto').value) || 0;
        const ancho = parseFloat(elementoRow.querySelector('.ancho').value) || 0;
        const precioUnitario = parseFloat(elementoRow.querySelector('.precio-unitario').value) || 0;
        const unidades = parseInt(elementoRow.querySelector('.unidades').value) || 1;

        const total = (alto * ancho * precioUnitario * unidades).toFixed(2);
        elementoRow.querySelector('.total-elemento').value = total;

        this.actualizarTotalEscaparate(pdvIndex, escaparateIndex);
    }

    actualizarTotalEscaparate(pdvIndex, escaparateIndex) {
        const pdvDiv = document.querySelector(`.tabla-pdv[data-pdv-index="${pdvIndex}"]`);
        if (!pdvDiv) return;

        const escaparateItem = pdvDiv.querySelector(`.escaparate-item[data-escaparate-index="${escaparateIndex}"]`);
        if (!escaparateItem) return;

        const totales = Array.from(escaparateItem.querySelectorAll('.total-elemento'))
            .map(input => parseFloat(input.value) || 0);
        
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

    actualizarTotalPDV(pdvIndex) {
        const pdvDiv = document.querySelector(`.tabla-pdv[data-pdv-index="${pdvIndex}"]`);
        if (!pdvDiv) return;

        // Sumar totales de todos los escaparates
        const totalesEscaparates = Array.from(pdvDiv.querySelectorAll('.total-escaparate'))
            .map(input => parseFloat(input.value) || 0);
        
        const totalEscaparates = totalesEscaparates.reduce((sum, value) => sum + value, 0);
        
        // Obtener valor del montaje
        const montaje = parseFloat(pdvDiv.querySelector('.montaje-pdv').value) || 0;
        
        // Calcular total del PDV (escaparates + montaje)
        const totalPDV = (totalEscaparates + montaje).toFixed(2);
        
        // Actualizar campos
        const totalEscaparatesInput = pdvDiv.querySelector('.total-escaparates-pdv');
        if (totalEscaparatesInput) {
            totalEscaparatesInput.value = totalEscaparates.toFixed(2);
        }
        
        const totalPDVInput = pdvDiv.querySelector('.total-pdv');
        if (totalPDVInput) {
            totalPDVInput.value = totalPDV;
        }

        this.recalcularTotales();
    }

    recalcularTotales() {
        // Calcular el total general sumando todos los totales de PDV
        const totalesPDV = Array.from(document.querySelectorAll('.total-pdv'))
            .map(input => parseFloat(input.value) || 0);
        
        const totalGeneral = totalesPDV.reduce((sum, value) => sum + value, 0).toFixed(2);
        
        // Actualizar total general si existe un elemento para ello
        const totalGeneralInput = document.getElementById('total-general');
        if (totalGeneralInput) {
            totalGeneralInput.value = totalGeneral;
        }
    }

    generarOpcionesMateriales() {
        return Object.entries(this.materialesDisponibles)
            .map(([nombre, precio]) => `<option value="${nombre}">${nombre}</option>`)
            .join('');
    }

    async cargarMateriales() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            
            if (!token) {
                console.error('Token no encontrado en la URL');
                return;
            }
            
            const res = await fetch('/api/materialesPresupuesto', {
                headers: {
                    'Authorization': token
                }
            });
            
            if (!res.ok) throw new Error('Error al cargar materiales');
            const data = await res.json();

            // Actualizar materialesDisponibles
            this.materialesDisponibles = {};
            if (data.materiales && Array.isArray(data.materiales)) {
                data.materiales.forEach(material => {
                    if (material.nombre && material.importe !== undefined) {
                        this.materialesDisponibles[material.nombre] = material.importe;
                    }
                });
            }

            // Actualizar todos los selectores de materiales existentes
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
        } catch (error) {
            console.error('Error al cargar materiales:', error);
        }
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.presupuestosTabla = new PresupuestosTabla();
    });
} else {
    window.presupuestosTabla = new PresupuestosTabla();
} 