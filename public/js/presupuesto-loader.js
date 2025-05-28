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
        try {
            // Obtener el código OT de la URL
            const urlPath = window.location.pathname;
            const pathParts = urlPath.split('/');
            const codigoOT = pathParts[pathParts.length - 1];
            
            // Obtener el token de la URL
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            
            if (!codigoOT || !token) {
                console.error('Código OT o token no encontrados en la URL');
                if (window.spinner) window.spinner.hide();
                return;
            }
            
            // Hacer la llamada al endpoint
            const response = await fetch(`/api/presupuestoEscaparate/${codigoOT}`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error al obtener los datos del presupuesto: ${response.status}`);
            }
            
            const responseData = await response.json();
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
        
        // Recalcular totales del PDV
        if (window.presupuestosTabla) {
            window.presupuestosTabla.actualizarTotalPDV(pdvIndex);
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
        
        // Actualizar totales
        if (window.presupuestosTabla) {
            window.presupuestosTabla.actualizarTotalEscaparate(pdvIndex, escaparateIndex);
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
        // Determinar cuántos elementos hay en el escaparate
        // En el modelo de datos que muestras, parece que hay elementos nombrados del 1 al 10
        const elementosExistentes = [];
        
        for (let i = 1; i <= 10; i++) {
            const elementoKey = `Elemento${i}`;
            const altoKey = `ALT${i}`;
            const anchoKey = `ANC${i}`;
            const materialKey = `Material${i}`;
            const unidadesKey = `UD${i}`;
            
            // Si hay datos para este elemento, lo agregamos
            if (escaparateData[elementoKey]) {
                elementosExistentes.push({
                    concepto: escaparateData[elementoKey],
                    alto: escaparateData[altoKey],
                    ancho: escaparateData[anchoKey],
                    material: escaparateData[materialKey],
                    unidades: escaparateData[unidadesKey]
                });
            }
        }
        
        // Si no hay elementos definidos, intentamos usar datos generales
        if (elementosExistentes.length === 0 && escaparateData.Name) {
            elementosExistentes.push({
                concepto: escaparateData.Name,
                alto: escaparateData.Alto_del_Suelo || escaparateData.Alto,
                ancho: escaparateData.Ancho_del_Suelo || escaparateData.Ancho,
                material: escaparateData.Material || '',
                unidades: escaparateData.UD1 || '1'
            });
        }
        
        // Cargar los elementos encontrados
        const pdvDiv = document.querySelector(`.tabla-pdv[data-pdv-index="${pdvIndex}"]`);
        if (!pdvDiv) return;
        
        const escaparateItem = pdvDiv.querySelector(`.escaparate-item[data-escaparate-index="${escaparateIndex}"]`);
        if (!escaparateItem) return;
        
        const elementosContainer = escaparateItem.querySelector('.elementos-container');
        if (!elementosContainer) return;
        
        // Limpiar elementos existentes
        elementosContainer.innerHTML = '';
        
        // Agregar los elementos cargados
        elementosExistentes.forEach((elemento, idx) => {
            if (window.presupuestosTabla) {
                window.presupuestosTabla.agregarElemento(pdvIndex, escaparateIndex);
                
                // Obtener el último elemento agregado
                const elementoRows = elementosContainer.querySelectorAll('.elemento-escaparate');
                if (elementoRows.length > idx) {
                    const elementoRow = elementoRows[idx];
                    this.cargarDatosElemento(elementoRow, elemento, pdvIndex, escaparateIndex);
                }
            }
        });
    }
    
    cargarDatosElemento(elementoRow, elementoData, pdvIndex, escaparateIndex) {
        // Cargar concepto
        const conceptoInput = elementoRow.querySelector('.concepto');
        if (conceptoInput && elementoData.concepto) {
            conceptoInput.value = elementoData.concepto;
        }
        
        // Cargar alto
        const altoInput = elementoRow.querySelector('.alto');
        if (altoInput && elementoData.alto) {
            altoInput.value = elementoData.alto;
        }
        
        // Cargar ancho
        const anchoInput = elementoRow.querySelector('.ancho');
        if (anchoInput && elementoData.ancho) {
            anchoInput.value = elementoData.ancho;
        }
        
        // Cargar material
        const materialSelect = elementoRow.querySelector('.material');
        if (materialSelect && elementoData.material) {
            materialSelect.value = elementoData.material;
            
            // Actualizar precio materia prima basado en el material
            if (window.presupuestosTabla) {
                window.presupuestosTabla.actualizarPrecioMP(elementoRow, pdvIndex, escaparateIndex);
            }
        }
        
        // Cargar unidades
        const unidadesInput = elementoRow.querySelector('.unidades');
        if (unidadesInput && elementoData.unidades) {
            unidadesInput.value = elementoData.unidades;
        }
        
        // Calcular totales
        if (window.presupuestosTabla) {
            window.presupuestosTabla.calcularTotalesElemento(elementoRow, pdvIndex, escaparateIndex);
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