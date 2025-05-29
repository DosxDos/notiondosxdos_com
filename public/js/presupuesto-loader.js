/**
 * Clase para cargar y manejar datos del presupuesto
 */
class PresupuestoLoader {
    constructor() {
        this.datosPresupuesto = null;
        
        // Inicializar cuando el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                // Mostrar el spinner inmediatamente al cargar la página
                if (window.spinner) {
                    window.spinner.show();
                }
                this.cargarDatosPresupuesto();
            });
        } else {
            // Mostrar el spinner inmediatamente
            if (window.spinner) {
                window.spinner.show();
            }
            this.cargarDatosPresupuesto();
        }
    }

    async cargarDatosPresupuesto() {
        // Mostrar spinner de carga
        if (window.spinner) {
            window.spinner.show();
        }
        
        try {
            // Extraer el código de OT de la URL
            const urlPath = window.location.pathname;
            const pathParts = urlPath.split('/');
            const codigoOT = pathParts[pathParts.length - 1];
            
            if (!codigoOT) {
                console.error('Código OT no encontrado en la URL');
                if (window.spinner) window.spinner.hide();
                return;
            }
            
            if (!window.apiServices) {
                console.error('ApiServices no está disponible');
                if (window.spinner) window.spinner.hide();
                return;
            }
            
            // Hacer la llamada al endpoint a través del servicio API
            const responseData = await window.apiServices.obtenerPresupuestoPorOT(codigoOT);
            console.log('Datos del presupuesto obtenidos:', responseData);
            
            // Guardar los datos y procesar
            if (responseData.status && responseData.data && responseData.data.data) {
                this.datosPresupuesto = responseData.data.data[0];
                this.inicializarDatosCliente();
                this.inicializarPuntosDeVenta();
            }
            
        } catch (error) {
            console.error('Error al cargar datos del presupuesto:', error);
        } finally {
            // Ocultar el spinner cuando se completa la carga (ya sea con éxito o con error)
            if (window.spinner) {
                window.spinner.hide();
            }
        }
    }
    
    inicializarDatosCliente() {
        if (!this.datosPresupuesto) return;
        
        // Guardar información del cliente en sessionStorage
        const cliente = this.datosPresupuesto.Account_Name || this.datosPresupuesto.Empresa;
        
        if (cliente) {
            sessionStorage.setItem('clienteSeleccionado', JSON.stringify({
                id: cliente.id,
                nombre: cliente.name,
                Account_Name: cliente.name
            }));
            
            // Actualizar nombre del cliente en la interfaz
            const nombreClienteElement = document.getElementById('nombre-cliente-formulario');
            if (nombreClienteElement) {
                nombreClienteElement.textContent = ` - ${cliente.name}`;
            }
        }
    }
    
    inicializarPuntosDeVenta() {
        // Verificar si hay puntos de venta
        if (!this.datosPresupuesto || !this.datosPresupuesto.puntos_de_venta) return;
        
        const pdvs = this.datosPresupuesto.puntos_de_venta;
        console.log(`Encontrados ${pdvs.length} puntos de venta para esta OT`);
        
        if (!window.presupuestosTabla) return;
        
        // Limpiar el contenedor de PDVs
        const contenedorPDVs = document.getElementById('contenedor-pdvs');
        if (!contenedorPDVs) return;
        
        contenedorPDVs.innerHTML = '';
        
        // Crear un PDV por cada punto de venta
        pdvs.forEach((pdv, index) => {
            window.presupuestosTabla.agregarNuevoPDV();
            
            // Esperar a que el DOM se actualice antes de cargar los datos
            setTimeout(() => {
                this.cargarDatosPDV(pdv, index);
            }, 50);
        });
    }
    
    cargarDatosPDV(pdvData, pdvIndex) {
        if (!pdvData) return;
        
        const pdvDiv = document.querySelector(`.tabla-pdv[data-pdv-index="${pdvIndex}"]`);
        if (!pdvDiv) return;
        
        // Cargar datos generales del PDV si existen
        this.cargarDatosGeneralesPDV(pdvDiv, pdvData);
        
        // Cargar escaparates si existen
        if (pdvData.escaparates && pdvData.escaparates.length > 0) {
            // Desplegar automáticamente la sección de escaparates si hay datos
            this.desplegarEscaparatesSiHayDatos(pdvDiv, pdvIndex);
            
            pdvData.escaparates.forEach((escaparate, escaparateIndex) => {
                this.agregarYCargarEscaparate(pdvIndex, escaparate, escaparateIndex);
            });
        }
        
        // Recalcular totales del PDV usando el servicio de calculadora
        if (window.calculadora) {
            window.calculadora.actualizarTotalPDV(pdvIndex);
        }
    }
    
    desplegarEscaparatesSiHayDatos(pdvDiv, pdvIndex) {
        const toggleEscaparatesBtn = pdvDiv.querySelector('.toggle-escaparates');
        if (!toggleEscaparatesBtn) return;
        
        const escaparatesContainer = pdvDiv.querySelector('.escaparates-container');
        if (!escaparatesContainer) return;
        
        // Desplegar la sección de escaparates
        escaparatesContainer.classList.remove('hidden');
        toggleEscaparatesBtn.setAttribute('aria-expanded', 'true');
        toggleEscaparatesBtn.querySelector('span').textContent = 'Colapsar escaparates';
        
        // Rotar el icono
        const toggleIcon = toggleEscaparatesBtn.querySelector('.toggle-icon');
        if (toggleIcon) {
            toggleIcon.classList.add('transform', 'rotate-180');
        }
    }
    
    cargarDatosGeneralesPDV(pdvDiv, pdvData) {
        // Cargar Isla si existe
        if (pdvData.Isla) {
            const islaSelect = pdvDiv.querySelector('.isla-pdv');
            if (islaSelect) islaSelect.value = pdvData.Isla;
        }
        
        // Cargar Montaje si existe
        if (pdvData.Montaje !== undefined) {
            const montajeInput = pdvDiv.querySelector('.montaje-pdv');
            if (montajeInput) montajeInput.value = pdvData.Montaje;
        }
        
        // Cargar OBS si existe
        if (pdvData.OBS) {
            const obsInput = pdvDiv.querySelector('.obs-pdv');
            if (obsInput) obsInput.value = pdvData.OBS;
        }
    }
    
    agregarYCargarEscaparate(pdvIndex, escaparateData, escaparateIndex) {
        // Crear escaparate si no existe
        this.agregarEscaparateSiNoExiste(pdvIndex, escaparateIndex);
        
        // Obtener el contenedor del escaparate
        const pdvDiv = document.querySelector(`.tabla-pdv[data-pdv-index="${pdvIndex}"]`);
        if (!pdvDiv) return;
        
        const escaparateItem = pdvDiv.querySelector(`.escaparate-item[data-escaparate-index="${escaparateIndex}"]`);
        if (!escaparateItem) return;
        
        // Cargar datos básicos del escaparate
        this.cargarDatosEscaparate(escaparateItem, escaparateData);
        
        // Cargar elementos del escaparate
        this.cargarElementosEscaparate(pdvIndex, escaparateIndex, escaparateData);
        
        // Actualizar totales usando la calculadora
        if (window.calculadora) {
            window.calculadora.actualizarTotalEscaparate(pdvIndex, escaparateIndex);
        }
    }
    
    agregarEscaparateSiNoExiste(pdvIndex, escaparateIndex) {
        const pdvDiv = document.querySelector(`.tabla-pdv[data-pdv-index="${pdvIndex}"]`);
        if (!pdvDiv) return;
        
        const escaparatesContainer = pdvDiv.querySelector(`#escaparates-pdv-${pdvIndex}`);
        if (!escaparatesContainer) return;
        
        let escaparateItem = pdvDiv.querySelector(`.escaparate-item[data-escaparate-index="${escaparateIndex}"]`);
        
        // Si no existe el escaparate, crearlo
        if (!escaparateItem && window.presupuestosTabla) {
            window.presupuestosTabla.agregarEscaparate(pdvIndex);
        }
    }
    
    cargarDatosEscaparate(escaparateItem, escaparateData) {
        // Cargar nombre del escaparate
        if (escaparateData.Nombre_del_escaparate) {
            const nombreInput = escaparateItem.querySelector('.nombre-escaparate');
            if (nombreInput) nombreInput.value = escaparateData.Nombre_del_escaparate;
        }
    }
    
    cargarElementosEscaparate(pdvIndex, escaparateIndex, escaparateData) {
        if (!escaparateData.elementos || !Array.isArray(escaparateData.elementos)) return;
        
        const pdvDiv = document.querySelector(`.tabla-pdv[data-pdv-index="${pdvIndex}"]`);
        if (!pdvDiv) return;
        
        const escaparateItem = pdvDiv.querySelector(`.escaparate-item[data-escaparate-index="${escaparateIndex}"]`);
        if (!escaparateItem) return;
        
        const elementosContainer = escaparateItem.querySelector('.elementos-container');
        if (!elementosContainer) return;
        
        // Obtener elementos existentes
        const elementosExistentes = elementosContainer.querySelectorAll('tr');
        
        // Si no hay suficientes filas, agregar las necesarias
        while (elementosExistentes.length < escaparateData.elementos.length) {
            if (window.presupuestosTabla) {
                window.presupuestosTabla.agregarElemento(pdvIndex, escaparateIndex);
            }
        }
        
        // Obtener la lista actualizada de elementos
        const elementosRows = elementosContainer.querySelectorAll('tr');
        
        // Cargar datos en cada fila
        escaparateData.elementos.forEach((elemento, elementoIndex) => {
            if (elementoIndex < elementosRows.length) {
                this.cargarDatosElemento(elementosRows[elementoIndex], elemento, pdvIndex, escaparateIndex);
            }
        });
        
        // Actualizar totales
        if (window.calculadora) {
            window.calculadora.actualizarTotalEscaparate(pdvIndex, escaparateIndex);
        }
    }
    
    cargarDatosElemento(elementoRow, elementoData, pdvIndex, escaparateIndex) {
        // Cargar Material si existe
        if (elementoData.Material) {
            const materialSelect = elementoRow.querySelector('.material');
            if (materialSelect) {
                materialSelect.value = elementoData.Material;
                
                // Actualizar precio materia prima
                const precioMP = elementoRow.querySelector('.precio-mp');
                if (precioMP && window.calculadora && window.calculadora.materialesDisponibles) {
                    precioMP.value = window.calculadora.materialesDisponibles[elementoData.Material] || '';
                }
            }
        }
        
        // Cargar Nombre si existe
        if (elementoData.Nombre) {
            const nombreInput = elementoRow.querySelector('.nombre-elemento');
            if (nombreInput) nombreInput.value = elementoData.Nombre;
        }
        
        // Cargar Alto si existe
        if (elementoData.Alto !== undefined) {
            const altoInput = elementoRow.querySelector('.alto');
            if (altoInput) altoInput.value = elementoData.Alto;
        }
        
        // Cargar Ancho si existe
        if (elementoData.Ancho !== undefined) {
            const anchoInput = elementoRow.querySelector('.ancho');
            if (anchoInput) anchoInput.value = elementoData.Ancho;
        }
        
        // Cargar Precio Unitario si existe
        if (elementoData.Precio_Unitario !== undefined) {
            const precioUnitarioInput = elementoRow.querySelector('.precio-unitario');
            if (precioUnitarioInput) precioUnitarioInput.value = elementoData.Precio_Unitario;
        }
        
        // Cargar Unidades si existe
        if (elementoData.Unidades !== undefined) {
            const unidadesInput = elementoRow.querySelector('.unidades');
            if (unidadesInput) unidadesInput.value = elementoData.Unidades;
        }
        
        // Calcular totales para este elemento
        if (window.calculadora) {
            window.calculadora.calcularTotalesElemento(elementoRow, pdvIndex, escaparateIndex);
        }
    }
    
    // Método retenido para compatibilidad pero ahora con la nueva estructura
    agregarEscaparates(pdvData, index) {
        // Este método se mantiene por compatibilidad, pero ahora usa la nueva estructura
        this.cargarDatosPDV(pdvData, index);
    }
    
    // Método retenido para compatibilidad
    inicializarCamposEscaparate(fila, escaparate) {
        console.log('Método inicializarCamposEscaparate es obsoleto con la nueva estructura');
    }
}

// Crear instancia global
window.presupuestoLoader = new PresupuestoLoader(); 