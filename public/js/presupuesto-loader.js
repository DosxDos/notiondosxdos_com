// Clase para cargar y manejar datos del presupuesto
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

    // Carga los datos del presupuesto y actualiza la UI
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
            
            console.log('Iniciando carga de presupuesto para OT:', codigoOT);
            
            // Cargar elementos existentes antes de cargar el presupuesto para que estén disponibles al procesar los elementos del escaparate
            if (window.presupuestosTabla) {
                console.log('Cargando elementos existentes...');
                await window.presupuestosTabla.cargarElementosExistentes();
                console.log('Elementos existentes cargados');
            }
            
            // Hacer la llamada al endpoint a través del servicio API
            console.log('Obteniendo datos del presupuesto desde el backend...');
            const responseData = await window.apiServices.obtenerPresupuestoPorOT(codigoOT);
            console.log('Datos del presupuesto recibidos');
            
            // Guardar los datos y procesar
            if (responseData.status && responseData.data && responseData.data.data) {
                // Crear una copia simplificada para evitar referencias circulares
                const datosCrudos = responseData.data.data[0];
                
                // Usar el controlador de carga para simplificar el objeto
                if (window.controladorCarga) {
                    // Crear una copia simplificada de los datos
                    this.datosPresupuesto = window.controladorCarga.simplificarObjeto(datosCrudos);
                } else {
                    // Fallback en caso de que el controlador no esté disponible
                    this.datosPresupuesto = datosCrudos;
                }
                
                console.log('Datos del presupuesto procesados');
                
                // Verificar la estructura de datos
                if (this.datosPresupuesto.puntos_de_venta) {
                    console.log(`Encontrados ${this.datosPresupuesto.puntos_de_venta.length} puntos de venta`);
                    
                    // Verificar escaparates
                    let totalEscaparates = 0;
                    let totalElementos = 0;
                    
                    // Procesar PDVs de forma secuencial para evitar sobrecarga
                    for (let i = 0; i < this.datosPresupuesto.puntos_de_venta.length; i++) {
                        const pdv = this.datosPresupuesto.puntos_de_venta[i];
                        console.log(`Procesando PDV ${i}...`);
                        
                        if (pdv.escaparates && Array.isArray(pdv.escaparates)) {
                            console.log(`PDV ${i}: ${pdv.escaparates.length} escaparates`);
                            totalEscaparates += pdv.escaparates.length;
                            
                            // Verificar elementos
                            for (let j = 0; j < pdv.escaparates.length; j++) {
                                const escaparate = pdv.escaparates[j];
                                if (escaparate.elementos && Array.isArray(escaparate.elementos)) {
                                    console.log(`PDV ${i}, Escaparate ${j}: ${escaparate.elementos.length} elementos`);
                                    totalElementos += escaparate.elementos.length;
                                } else if (escaparate.elemento_de_escaparate) {
                                    console.log(`PDV ${i}, Escaparate ${j}: 1 elemento_de_escaparate`);
                                    totalElementos += 1;
                                } else {
                                    console.log(`PDV ${i}, Escaparate ${j}: Sin elementos`);
                                }
                            }
                        } else {
                            console.log(`PDV ${i}: Sin escaparates`);
                        }
                    }
                    
                    console.log(`Total: ${totalEscaparates} escaparates, ${totalElementos} elementos`);
                }
                
                // Inicializar la UI con los datos
                this.inicializarDatosCliente();
                this.inicializarPuntosDeVenta();
            } else {
                console.error('Formato de respuesta incorrecto:', responseData);
            }
            
        } catch (error) {
            console.error('Error al cargar datos del presupuesto:', error);
            alert('Error al cargar los datos del presupuesto. Por favor, intente de nuevo más tarde.');
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
        console.log('Inicializando puntos de venta...');
        
        // Verificar si hay puntos de venta
        if (!this.datosPresupuesto || !this.datosPresupuesto.puntos_de_venta) {
            console.warn('No hay puntos de venta en los datos del presupuesto');
            return;
        }
        
        const pdvs = this.datosPresupuesto.puntos_de_venta;
        
        if (!window.presupuestosTabla) {
            console.error('presupuestosTabla no está disponible');
            return;
        }
        
        // Limpiar el contenedor de PDVs
        const contenedorPDVs = document.getElementById('contenedor-pdvs');
        if (!contenedorPDVs) {
            console.error('Contenedor de PDVs no encontrado');
            return;
        }
        
        contenedorPDVs.innerHTML = '';
        
        // Registrar cuántos PDVs hay que cargar
        this.pdvsACargarse = pdvs.length;
        this.pdvsCargados = 0;
        
        console.log(`Creando ${pdvs.length} puntos de venta de forma secuencial...`);
        
        if (!window.controladorCarga) {
            console.error('ControladorCarga no está disponible');
            return;
        }
        
        // Configurar los callbacks necesarios
        const callbacks = {
            agregarPDV: () => window.presupuestosTabla.agregarNuevoPDV(),
            cargarDatosPDV: async (pdvData, pdvIndex) => await this.cargarDatosPDV(pdvData, pdvIndex),
            registrarPDVCargado: () => this.registrarPDVCargado()
        };
        
        // Iniciar el procesamiento secuencial de PDVs
        window.controladorCarga.procesarPDVsSecuencial(pdvs, callbacks);
    }
    
    async cargarDatosPDV(pdvData, pdvIndex) {
        console.log(`Cargando datos del PDV ${pdvIndex}:`, pdvData);
        
        if (!pdvData) {
            console.warn(`PDV ${pdvIndex}: No hay datos para cargar`);
            this.registrarPDVCargado();
            return;
        }
        
        const pdvDiv = document.querySelector(`.tabla-pdv[data-pdv-index="${pdvIndex}"]`);
        if (!pdvDiv) {
            console.error(`PDV ${pdvIndex}: No se encontró el contenedor en el DOM`);
            this.registrarPDVCargado();
            return;
        }
        
        try {
            // Cargar datos generales del PDV si existen
            this.cargarDatosGeneralesPDV(pdvDiv, pdvData);
            
            // Cargar escaparates si existen
            if (pdvData.escaparates && pdvData.escaparates.length > 0) {
                console.log(`PDV ${pdvIndex}: Cargando ${pdvData.escaparates.length} escaparates`);
                
                // Los escaparates permanecen ocultos por defecto aunque haya datos
                // El usuario debe hacer clic en "Desplegar escaparates" para verlos       
                if (!window.controladorCarga) {
                    console.error('ControladorCarga no está disponible');
                    return;
                }
                
                // Configurar los callbacks necesarios
                const callbacks = {
                    agregarYCargarEscaparate: async (pdvIdx, escaparate, escaparateIdx) => 
                        await this.agregarYCargarEscaparate(pdvIdx, escaparate, escaparateIdx)
                };
                
                // Iniciar el procesamiento secuencial de escaparates
                window.controladorCarga.procesarEscaparatesSecuencial(pdvData.escaparates, pdvIndex, callbacks);
            } else {
                console.log(`PDV ${pdvIndex}: No tiene escaparates`);
            }
            
            // Recalcular totales del PDV usando el servicio de calculadora
            if (window.calculadora) {
                window.calculadora.actualizarTotalPDV(pdvIndex);
            }
        } catch (err) {
            console.error(`Error general al cargar PDV ${pdvIndex}:`, err);
        } finally {
            // Registrar que este PDV se ha cargado
            this.registrarPDVCargado();
        }
    }
    
    cargarDatosGeneralesPDV(pdvDiv, pdvData) {
        try {
            // Cargar Isla si existe
            if (pdvData.Isla) {
                const islaSelect = pdvDiv.querySelector('.isla-pdv');
                if (islaSelect) islaSelect.value = pdvData.Isla;
            }
            
            // Cargar Montaje si existe
            if (pdvData.Montaje !== undefined) {
                const montajeInput = pdvDiv.querySelector('.montaje-pdv');
                if (montajeInput) montajeInput.value = pdvData.Montaje;
            } else if (pdvData.montaje !== undefined) {
                const montajeInput = pdvDiv.querySelector('.montaje-pdv');
                if (montajeInput) montajeInput.value = pdvData.montaje;
            }
            
            // Cargar OBS si existe
            if (pdvData.OBS) {
                const obsInput = pdvDiv.querySelector('.obs-pdv');
                if (obsInput) obsInput.value = pdvData.OBS;
            }
            
            // Cargar enlace de fotos si existe en las líneas
            if (pdvData.lineas && Array.isArray(pdvData.lineas) && pdvData.lineas.length > 0) {
                // Buscar el primer enlace de fotos disponible
                let enlaceFotos = null;
                
                // Recorrer todas las líneas buscando la primera que tenga fotos
                for (let i = 0; i < Math.min(pdvData.lineas.length, 20); i++) {
                    const linea = pdvData.lineas[i];
                    if (linea && linea.Fotos) {
                        enlaceFotos = linea.Fotos;
                        break;
                    }
                }
                
                if (enlaceFotos) {
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
        } catch (error) {
            console.error('Error al cargar datos generales del PDV:', error);
        }
    }
    
    async agregarYCargarEscaparate(pdvIndex, escaparateData, escaparateIndex) {
        console.log(`Agregando escaparate ${escaparateIndex} al PDV ${pdvIndex}`);
        
        try {
            // Crear escaparate si no existe
            this.agregarEscaparateSiNoExiste(pdvIndex, escaparateIndex);
            
            // Obtener el contenedor del escaparate
            const pdvDiv = document.querySelector(`.tabla-pdv[data-pdv-index="${pdvIndex}"]`);
            if (!pdvDiv) {
                console.error(`No se encontró el PDV ${pdvIndex} en el DOM`);
                return;
            }
            
            const escaparateItem = pdvDiv.querySelector(`.escaparate-item[data-escaparate-index="${escaparateIndex}"]`);
            if (!escaparateItem) {
                console.error(`No se encontró el escaparate ${escaparateIndex} en el PDV ${pdvIndex}`);
                return;
            }
            
            // Cargar datos básicos del escaparate
            this.cargarDatosEscaparate(escaparateItem, escaparateData);
            
            // Simplificar datos de elementos si son demasiados
            if (escaparateData.elementos && Array.isArray(escaparateData.elementos) && escaparateData.elementos.length > 10) {
                console.warn(`El escaparate ${escaparateIndex} tiene ${escaparateData.elementos.length} elementos. Limitando a 10 para mejorar rendimiento.`);
                escaparateData.elementos = escaparateData.elementos.slice(0, 10);
            }
            
            // Cargar elementos del escaparate
            this.cargarElementosEscaparate(pdvIndex, escaparateIndex, escaparateData);
            
            // Actualizar totales usando la calculadora
            if (window.calculadora) {
                window.calculadora.actualizarTotalEscaparate(pdvIndex, escaparateIndex);
            }
        } catch (error) {
            console.error(`Error al agregar y cargar escaparate ${escaparateIndex} en PDV ${pdvIndex}:`, error);
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
    
    // Busca el nombre descriptivo de un elemento basado en su ID
    buscarNombreElemento(elementoId) {
        if (!elementoId) return '';
        
        // Intentar buscar en los elementos existentes cargados
        if (window.presupuestosTabla && window.presupuestosTabla.elementosExistentesDisponibles) {
            const elementoExistente = window.presupuestosTabla.elementosExistentesDisponibles.find(
                elem => elem.id === elementoId
            );
            
            if (elementoExistente) {
                // Priorizar Nombre_del_elemento de los datos originales si existe
                return elementoExistente.datosOriginales?.Nombre_del_elemento || elementoExistente.Nombre || '';
            }
        }
        
        // Si no se encuentra, devolver cadena vacía
        return '';
    }
    
    async cargarElementosEscaparate(pdvIndex, escaparateIndex, escaparateData) {
        console.log(`Cargando elementos para escaparate ${escaparateIndex} del PDV ${pdvIndex}`);
        
        try {
            // Si hay elementos en la respuesta, usamos esos
            if (escaparateData.elementos && Array.isArray(escaparateData.elementos)) {
                if (!window.controladorCarga) {
                    console.error('ControladorCarga no está disponible');
                    return;
                }
                
                // Configurar los callbacks necesarios
                const callbacks = {
                    obtenerElementosContainer: (pdvIdx, escaparateIdx) => {
                        const pdvDiv = document.querySelector(`.tabla-pdv[data-pdv-index="${pdvIdx}"]`);
                        if (!pdvDiv) return null;
                        
                        const escaparateItem = pdvDiv.querySelector(`.escaparate-item[data-escaparate-index="${escaparateIdx}"]`);
                        if (!escaparateItem) return null;
                        
                        return escaparateItem.querySelector('.elementos-container');
                    },
                    agregarElemento: (pdvIdx, escaparateIdx) => 
                        window.presupuestosTabla.agregarElemento(pdvIdx, escaparateIdx),
                    cargarDatosElemento: (elementoRow, elementoFormateado, pdvIdx, escaparateIdx) => 
                        this.cargarDatosElemento(elementoRow, elementoFormateado, pdvIdx, escaparateIdx),
                    actualizarTotalEscaparate: (pdvIdx, escaparateIdx) => 
                        window.calculadora && window.calculadora.actualizarTotalEscaparate(pdvIdx, escaparateIdx)
                };
                
                // Usar el controlador para cargar elementos de forma optimizada
                await window.controladorCarga.cargarElementosOptimizado(
                    escaparateData, pdvIndex, escaparateIndex, callbacks
                );
                
            } 
            // Si no hay elementos definidos pero hay un elemento_de_escaparate, usamos ese
            else if (escaparateData.elemento_de_escaparate) {
                if (!window.controladorCarga) {
                    console.error('ControladorCarga no está disponible');
                    return;
                }
                
                // Configurar los callbacks necesarios
                const callbacks = {
                    obtenerElementosContainer: (pdvIdx, escaparateIdx) => {
                        const pdvDiv = document.querySelector(`.tabla-pdv[data-pdv-index="${pdvIdx}"]`);
                        if (!pdvDiv) return null;
                        
                        const escaparateItem = pdvDiv.querySelector(`.escaparate-item[data-escaparate-index="${escaparateIdx}"]`);
                        if (!escaparateItem) return null;
                        
                        return escaparateItem.querySelector('.elementos-container');
                    },
                    agregarElemento: (pdvIdx, escaparateIdx) => 
                        window.presupuestosTabla.agregarElemento(pdvIdx, escaparateIdx),
                    buscarNombreElemento: (elementoId) => this.buscarNombreElemento(elementoId),
                    cargarDatosElemento: (elementoRow, elementoFormateado, pdvIdx, escaparateIdx) => 
                        this.cargarDatosElemento(elementoRow, elementoFormateado, pdvIdx, escaparateIdx),
                    actualizarTotalEscaparate: (pdvIdx, escaparateIdx) => 
                        window.calculadora && window.calculadora.actualizarTotalEscaparate(pdvIdx, escaparateIdx)
                };
                
                // Usar el controlador para cargar el elemento de escaparate
                await window.controladorCarga.cargarElementoDeEscaparate(
                    escaparateData, pdvIndex, escaparateIndex, callbacks
                );
            }
            // Si no hay elementos ni elemento_de_escaparate, crear al menos un elemento vacío
            else {
                if (!window.controladorCarga) {
                    console.error('ControladorCarga no está disponible');
                    return;
                }
                
                // Configurar los callbacks necesarios
                const callbacks = {
                    obtenerElementosContainer: (pdvIdx, escaparateIdx) => {
                        const pdvDiv = document.querySelector(`.tabla-pdv[data-pdv-index="${pdvIdx}"]`);
                        if (!pdvDiv) return null;
                        
                        const escaparateItem = pdvDiv.querySelector(`.escaparate-item[data-escaparate-index="${escaparateIdx}"]`);
                        if (!escaparateItem) return null;
                        
                        return escaparateItem.querySelector('.elementos-container');
                    },
                    agregarElemento: (pdvIdx, escaparateIdx) => 
                        window.presupuestosTabla.agregarElemento(pdvIdx, escaparateIdx),
                    actualizarTotalEscaparate: (pdvIdx, escaparateIdx) => 
                        window.calculadora && window.calculadora.actualizarTotalEscaparate(pdvIdx, escaparateIdx)
                };
                
                // Usar el controlador para crear un elemento vacío
                await window.controladorCarga.crearElementoVacio(
                    pdvIndex, escaparateIndex, callbacks
                );
            }
        } catch (error) {
            console.error(`Error general al cargar elementos del escaparate ${escaparateIndex} en PDV ${pdvIndex}:`, error);
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
        } else if (elementoData.Alto_del_elemento !== undefined) {
            const altoInput = elementoRow.querySelector('.alto');
            if (altoInput) altoInput.value = elementoData.Alto_del_elemento;
        }
        
        // Cargar Ancho si existe
        if (elementoData.Ancho !== undefined) {
            const anchoInput = elementoRow.querySelector('.ancho');
            if (anchoInput) anchoInput.value = elementoData.Ancho;
        } else if (elementoData.Ancho_del_elemento !== undefined) {
            const anchoInput = elementoRow.querySelector('.ancho');
            if (anchoInput) anchoInput.value = elementoData.Ancho_del_elemento;
        }

        // Cargar Material y Precio/M.Prima si existe directamente en el objeto
        if (elementoData.Material) {
            const materialSelect = elementoRow.querySelector('.material');
            if (materialSelect) {
                materialSelect.value = elementoData.Material;
            }
            
            // Cargar el Precio/M.Prima si existe directamente
            const precioMPInput = elementoRow.querySelector('.precio-mp');
            if (precioMPInput && elementoData.Precio_MP) {
                precioMPInput.value = elementoData.Precio_MP;
            }
        }
        // Cargar Material y Precio/M.Prima si existe elemento con materiales
        else if (elementoData.Elemento && elementoData.Elemento.materiales && elementoData.Elemento.materiales.length > 0) {
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
        // Buscar en los materiales disponibles por ID
        else if (elementoData.Elemento && elementoData.Elemento.id) {
            // Buscar el elemento correspondiente en los elementos disponibles
            const elementoId = elementoData.Elemento.id;
            const elementoEncontrado = window.presupuestosTabla.elementosExistentesDisponibles.find(
                elem => elem.id === elementoId
            );
            
            if (elementoEncontrado && elementoEncontrado.datosOriginales && 
                elementoEncontrado.datosOriginales.elemento_de_escaparate && 
                elementoEncontrado.datosOriginales.elemento_de_escaparate.materiales && 
                elementoEncontrado.datosOriginales.elemento_de_escaparate.materiales.length > 0) {
                
                const material = elementoEncontrado.datosOriginales.elemento_de_escaparate.materiales[0];
                
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
    
    // Registra que un PDV ha sido cargado y verifica si todos los PDVs han sido cargados
    registrarPDVCargado() {
        this.pdvsCargados++;
        
        // Si todos los PDVs han sido cargados, inicializar los cálculos
        if (this.pdvsCargados >= this.pdvsACargarse) {
            this.inicializarCalculosAutomaticos();
        }
    }
    
    // Inicializa los cálculos automáticos después de cargar todos los datos
    inicializarCalculosAutomaticos() {
        // Esperar un momento para asegurar que el DOM está completamente actualizado
        setTimeout(() => {
            if (window.calculadora) {
                window.calculadora.inicializarCalculos();
            }
        }, 200);
    }
}

// Crear instancia global
window.presupuestoLoader = new PresupuestoLoader(); 