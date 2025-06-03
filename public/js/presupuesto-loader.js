/**
 * Clase para cargar y manejar datos del presupuesto
 */
class PresupuestoLoader {
    constructor() {
        this.datosPresupuesto = null;
        this.pdvsACargarse = 0;
        this.pdvsCargados = 0;
        
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

    /**
     * Carga los datos del presupuesto y actualiza la UI
     */
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
            
            // Cargar elementos existentes antes de cargar el presupuesto
            // para que estén disponibles al procesar los elementos del escaparate
            if (window.presupuestosTabla) {
                await window.presupuestosTabla.cargarElementosExistentes();
                console.log('Elementos existentes cargados antes del presupuesto');
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
        
        // Registrar cuántos PDVs hay que cargar
        this.pdvsACargarse = pdvs.length;
        this.pdvsCargados = 0;
        
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
        if (!pdvData) {
            this.registrarPDVCargado();
            return;
        }
        
        const pdvDiv = document.querySelector(`.tabla-pdv[data-pdv-index="${pdvIndex}"]`);
        if (!pdvDiv) {
            this.registrarPDVCargado();
            return;
        }
        
        // Cargar datos generales del PDV si existen
        this.cargarDatosGeneralesPDV(pdvDiv, pdvData);
        
        // Cargar escaparates si existen
        if (pdvData.escaparates && pdvData.escaparates.length > 0) {
            // Los escaparates permanecen ocultos por defecto aunque haya datos
            // El usuario debe hacer clic en "Desplegar escaparates" para verlos
            
            pdvData.escaparates.forEach((escaparate, escaparateIndex) => {
                this.agregarYCargarEscaparate(pdvIndex, escaparate, escaparateIndex);
            });
        }
        
        // Recalcular totales del PDV usando el servicio de calculadora
        if (window.calculadora) {
            window.calculadora.actualizarTotalPDV(pdvIndex);
        }
        
        // Registrar que este PDV se ha cargado
        this.registrarPDVCargado();
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
        
        // Cargar enlace de fotos si existe en las líneas
        if (pdvData.lineas && Array.isArray(pdvData.lineas) && pdvData.lineas.length > 0) {
            // Buscar el primer enlace de fotos disponible
            const enlaceFotos = pdvData.lineas.find(linea => linea.Fotos)?.Fotos;
            
            if (enlaceFotos) {
                console.log('Enlace de fotos encontrado:', enlaceFotos);
                
                // Buscar el contenedor de enlaces de fotos
                const enlaceFotosContainer = pdvDiv.querySelector('.enlace-fotos-container');
                if (enlaceFotosContainer) {
                    // Crear el enlace HTML
                    enlaceFotosContainer.innerHTML = `
                        <a href="${enlaceFotos}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                            <i class="fas fa-images mr-1"></i> Ver fotos
                        </a>
                    `;
                }
            }
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
        // Cargar nombre del escaparate (priorizar Name sobre Nombre_del_escaparate)
        const nombreInput = escaparateItem.querySelector('.nombre-escaparate');
        if (nombreInput) {
            nombreInput.value = escaparateData.Name || escaparateData.Nombre_del_escaparate || '';
        }
        
        // Cargar tipo de escaparate
        const tipoInput = escaparateItem.querySelector('.tipo-escaparate');
        if (tipoInput && escaparateData.Tipo_de_escaparate) {
            tipoInput.value = escaparateData.Tipo_de_escaparate;
        }

        // Verificar si hay un elemento asociado al escaparate
        if (escaparateData.elemento_de_escaparate) {
            // Guardamos la referencia para usarla al cargar los elementos
            escaparateItem.dataset.tieneElemento = 'true';
            escaparateItem.dataset.elementoId = escaparateData.elemento_de_escaparate.id;
        }
    }
    
    /**
     * Busca el nombre descriptivo de un elemento basado en su ID
     * @param {string} elementoId - ID del elemento a buscar
     * @returns {string} - Nombre descriptivo del elemento o cadena vacía
     */
    buscarNombreElemento(elementoId) {
        if (!elementoId) return '';
        
        // Intentar buscar en los elementos existentes cargados
        if (window.presupuestosTabla && window.presupuestosTabla.elementosExistentesDisponibles) {
            const elementoExistente = window.presupuestosTabla.elementosExistentesDisponibles.find(
                elem => elem.id === elementoId
            );
            
            if (elementoExistente) {
                console.log('Elemento encontrado en tabla:', elementoExistente);
                return elementoExistente.Nombre || '';
            }
        }
        
        // Si no se encuentra, devolver cadena vacía
        return '';
    }
    
    cargarElementosEscaparate(pdvIndex, escaparateIndex, escaparateData) {
        // Si hay elementos en la respuesta, usamos esos
        if (escaparateData.elementos && Array.isArray(escaparateData.elementos)) {
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
        // Si no hay elementos definidos pero hay un elemento_de_escaparate, usamos ese
        else if (escaparateData.elemento_de_escaparate) {
            const pdvDiv = document.querySelector(`.tabla-pdv[data-pdv-index="${pdvIndex}"]`);
            if (!pdvDiv) return;
            
            const escaparateItem = pdvDiv.querySelector(`.escaparate-item[data-escaparate-index="${escaparateIndex}"]`);
            if (!escaparateItem) return;
            
            const elementosContainer = escaparateItem.querySelector('.elementos-container');
            if (!elementosContainer) return;
            
            // Asegurarnos de que haya al menos una fila de elemento
            if (elementosContainer.querySelectorAll('tr').length === 0) {
                if (window.presupuestosTabla) {
                    window.presupuestosTabla.agregarElemento(pdvIndex, escaparateIndex);
                }
            }
            
            // Obtener la primera fila
            const elementoRow = elementosContainer.querySelector('tr');
            if (elementoRow) {
                // Acceder a la información del elemento
                const elementoInfo = escaparateData.elemento_de_escaparate;
                console.log('Elemento info del backend:', elementoInfo);
                
                // Buscar el nombre descriptivo del elemento
                const nombreElemento = this.buscarNombreElemento(elementoInfo.id) || elementoInfo.name || '';
                console.log('Nombre encontrado para elemento:', nombreElemento);
                
                // Crear un objeto con los datos del elemento_de_escaparate
                const elementoData = {
                    Nombre_del_elemento: nombreElemento,
                    Nombre: escaparateData.Name || escaparateData.Nombre_del_escaparate || '',
                    Alto: escaparateData.Alto_del_elemento || escaparateData.Alto_del_Suelo || '',
                    Ancho: escaparateData.Ancho_del_elemento || escaparateData.Ancho_del_Suelo || '',
                    Elemento: escaparateData.elemento_de_escaparate
                };
                
                // Cargar los datos en la fila
                this.cargarDatosElemento(elementoRow, elementoData, pdvIndex, escaparateIndex);
            }
            
            // Actualizar totales
            if (window.calculadora) {
                window.calculadora.actualizarTotalEscaparate(pdvIndex, escaparateIndex);
            }
        }
    }
    
    cargarDatosElemento(elementoRow, elementoData, pdvIndex, escaparateIndex) {
        // Cargar concepto (priorizar Nombre_del_elemento sobre Nombre)
        const conceptoInput = elementoRow.querySelector('.concepto');
        if (conceptoInput) {
            conceptoInput.value = elementoData.Nombre_del_elemento || elementoData.Nombre || '';
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

        // Cargar Material y Precio/M.Prima si existe elemento con materiales
        if (elementoData.Elemento && elementoData.Elemento.materiales && elementoData.Elemento.materiales.length > 0) {
            const material = elementoData.Elemento.materiales[0]; // Tomamos el primer material
            
            // Cargar el Material
            const materialSelect = elementoRow.querySelector('.material');
            if (materialSelect && material.Material) {
                materialSelect.value = material.Material;
            }
            
            // Cargar el Precio/M.Prima
            const precioMPInput = elementoRow.querySelector('.precio-mp');
            if (precioMPInput && material.Precio) {
                precioMPInput.value = material.Precio;
            }
        }
        // Si el material viene en el formato tradicional
        else if (elementoData.Material) {
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
    
    /**
     * Registra que un PDV ha sido cargado y verifica si todos los PDVs han sido cargados
     */
    registrarPDVCargado() {
        this.pdvsCargados++;
        
        // Si todos los PDVs han sido cargados, inicializar los cálculos
        if (this.pdvsCargados >= this.pdvsACargarse) {
            console.log('Todos los PDVs han sido cargados. Inicializando cálculos...');
            this.inicializarCalculosAutomaticos();
        }
    }
    
    /**
     * Inicializa los cálculos automáticos después de cargar todos los datos
     */
    inicializarCalculosAutomaticos() {
        // Esperar un momento para asegurar que el DOM está completamente actualizado
        setTimeout(() => {
            if (window.calculadora) {
                window.calculadora.inicializarCalculos();
                console.log('Cálculos inicializados automáticamente');
            }
        }, 200);
    }
}

// Crear instancia global
window.presupuestoLoader = new PresupuestoLoader(); 