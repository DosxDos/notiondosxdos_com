// Controlador para la carga optimizada de datos de presupuestos
class ControladorCarga {
    constructor() {
        // Propiedades para seguimiento de carga
        this.pdvsACargarse = 0;
        this.pdvsCargados = 0;
    }

    // Procesa los PDVs de forma secuencial con pausas para evitar bloqueos
    async procesarPDVsSecuencial(pdvs, callbacks) {
        // Validar callbacks requeridos
        if (!callbacks || !callbacks.agregarPDV || !callbacks.cargarDatosPDV || !callbacks.registrarPDVCargado) {
            console.error('Faltan callbacks requeridos para procesarPDVsSecuencial');
            return;
        }

        // Registrar cuántos PDVs hay que cargar
        this.pdvsACargarse = pdvs.length;
        this.pdvsCargados = 0;
        
        console.log(`Creando ${pdvs.length} puntos de venta de forma secuencial...`);
        
        // Función interna para procesar cada PDV
        const procesarPDV = async (indice) => {
            if (indice >= pdvs.length) {
                console.log('Todos los PDVs han sido procesados');
                return;
            }
            
            console.log(`Procesando PDV ${indice}/${pdvs.length}...`);
            
            try {
                // Agregar el PDV al DOM
                callbacks.agregarPDV();
                
                // Esperar a que el DOM se actualice - pausa más larga
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Cargar los datos del PDV
                try {
                    await callbacks.cargarDatosPDV(pdvs[indice], indice);
                } catch (err) {
                    console.error(`Error al cargar datos del PDV ${indice}:`, err);
                }
                
                // Pausa más larga antes de procesar el siguiente PDV
                // Esto da tiempo al navegador para renderizar y evitar bloqueos
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Procesar el siguiente PDV usando setTimeout para evitar bloquear el hilo principal
                setTimeout(() => procesarPDV(indice + 1), 0);
            } catch (err) {
                console.error(`Error general al procesar PDV ${indice}:`, err);
                callbacks.registrarPDVCargado(); // Asegurarse de que se registre como cargado
                
                // Continuar con el siguiente PDV a pesar del error, con un retraso
                setTimeout(() => procesarPDV(indice + 1), 300);
            }
        };
        
        // Iniciar el procesamiento secuencial con un pequeño retraso inicial
        setTimeout(() => procesarPDV(0), 100);
    }

    // Procesa escaparates de un PDV de forma secuencial
    async procesarEscaparatesSecuencial(escaparates, pdvIndex, callbacks) {
        // Validar callbacks requeridos
        if (!callbacks || !callbacks.agregarYCargarEscaparate) {
            console.error('Faltan callbacks requeridos para procesarEscaparatesSecuencial');
            return;
        }

        // Función interna para procesar cada escaparate
        const procesarEscaparate = async (indice) => {
            if (indice >= escaparates.length) {
                return; // Todos los escaparates procesados
            }
            
            try {
                await callbacks.agregarYCargarEscaparate(pdvIndex, escaparates[indice], indice);
                // Pequeña pausa entre escaparates
                await new Promise(resolve => setTimeout(resolve, 100));
                // Procesar el siguiente escaparate
                procesarEscaparate(indice + 1);
            } catch (err) {
                console.error(`Error al cargar escaparate ${indice} del PDV ${pdvIndex}:`, err);
                // Continuar con el siguiente escaparate a pesar del error
                procesarEscaparate(indice + 1);
            }
        };
        
        // Iniciar el procesamiento secuencial de escaparates
        procesarEscaparate(0);
    }

    // Carga elementos de un escaparate de forma optimizada
    async cargarElementosOptimizado(escaparateData, pdvIndex, escaparateIndex, callbacks) {
        // Validar callbacks requeridos
        if (!callbacks || !callbacks.obtenerElementosContainer || !callbacks.agregarElemento || 
            !callbacks.cargarDatosElemento || !callbacks.actualizarTotalEscaparate) {
            console.error('Faltan callbacks requeridos para cargarElementosOptimizado');
            return;
        }

        // Obtener el contenedor de elementos
        const elementosContainer = callbacks.obtenerElementosContainer(pdvIndex, escaparateIndex);
        if (!elementosContainer) {
            console.error(`No se encontró el contenedor de elementos en el escaparate ${escaparateIndex} del PDV ${pdvIndex}`);
            return;
        }
        
        // Obtener elementos existentes
        const elementosExistentes = elementosContainer.querySelectorAll('tr');
        
        // Limitar el número de elementos a procesar para evitar sobrecarga
        const elementosAProcesar = Math.min(escaparateData.elementos.length, 5); // Máximo 5 elementos por escaparate
        console.log(`Procesando ${elementosAProcesar} elementos de ${escaparateData.elementos.length} disponibles`);
        
        // Agregar elementos faltantes de forma asíncrona
        const agregarElementosPendientes = async () => {
            for (let i = elementosExistentes.length; i < elementosAProcesar; i++) {
                callbacks.agregarElemento(pdvIndex, escaparateIndex);
                // Pequeña pausa para evitar bloquear el navegador
                if (i % 2 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }
        };
        
        // Agregar elementos de forma asíncrona
        await agregarElementosPendientes();
        
        // Obtener la lista actualizada de elementos
        const elementosRows = elementosContainer.querySelectorAll('tr');
        
        // Cargar datos en cada fila de forma asíncrona
        const cargarDatosElementos = async () => {
            for (let i = 0; i < elementosAProcesar; i++) {
                if (i < elementosRows.length) {
                    try {
                        const elemento = escaparateData.elementos[i];
                        // Crear un objeto con el formato esperado por cargarDatosElemento
                        const elementoFormateado = {
                            Nombre_del_elemento: elemento.Nombre_del_elemento || '',
                            Nombre: elemento.Name || '',
                            Alto: elemento.Alto_del_elemento || elemento.Alto || '',
                            Ancho: elemento.Ancho_del_elemento || elemento.Ancho || '',
                            Material: elemento.materiales && elemento.materiales.length > 0 ? 
                                     elemento.materiales[0].Material : '',
                            Precio_MP: elemento.materiales && elemento.materiales.length > 0 ? 
                                      elemento.materiales[0].Precio : '',
                            Unidades: elemento.Unidades || 1,
                            // Mantener referencia al elemento original
                            Elemento: elemento
                        };
                        
                        callbacks.cargarDatosElemento(elementosRows[i], elementoFormateado, pdvIndex, escaparateIndex);
                        
                        // Pequeña pausa cada 2 elementos para no bloquear el navegador
                        if (i % 2 === 1) {
                            await new Promise(resolve => setTimeout(resolve, 30));
                        }
                    } catch (err) {
                        console.error(`Error al cargar elemento ${i} del escaparate ${escaparateIndex} en PDV ${pdvIndex}:`, err);
                    }
                }
            }
        };
        
        // Ejecutar la carga de datos
        await cargarDatosElementos();
        
        // Actualizar totales
        callbacks.actualizarTotalEscaparate(pdvIndex, escaparateIndex);
    }

    // Carga un elemento asociado a un escaparate
    async cargarElementoDeEscaparate(escaparateData, pdvIndex, escaparateIndex, callbacks) {
        // Validar callbacks requeridos
        if (!callbacks || !callbacks.obtenerElementosContainer || !callbacks.agregarElemento || 
            !callbacks.buscarNombreElemento || !callbacks.cargarDatosElemento || !callbacks.actualizarTotalEscaparate) {
            console.error('Faltan callbacks requeridos para cargarElementoDeEscaparate');
            return;
        }

        // Obtener el contenedor de elementos
        const elementosContainer = callbacks.obtenerElementosContainer(pdvIndex, escaparateIndex);
        if (!elementosContainer) {
            console.error(`No se encontró el contenedor de elementos en el escaparate ${escaparateIndex} del PDV ${pdvIndex}`);
            return;
        }
        
        // Asegurarnos de que haya al menos una fila de elemento
        if (elementosContainer.querySelectorAll('tr').length === 0) {
            callbacks.agregarElemento(pdvIndex, escaparateIndex);
        }
        
        // Obtener la primera fila
        const elementoRow = elementosContainer.querySelector('tr');
        if (elementoRow) {
            // Acceder a la información del elemento
            const elementoInfo = escaparateData.elemento_de_escaparate;
            
            // Buscar el nombre descriptivo del elemento
            const nombreElemento = callbacks.buscarNombreElemento(elementoInfo.id) || elementoInfo.name || '';
            
            // Buscar el elemento correspondiente en los elementos disponibles
            const elementoId = elementoInfo.id;
            const elementoEncontrado = window.presupuestosTabla.elementosExistentesDisponibles.find(
                elem => elem.id === elementoId
            );
            
            // Crear un objeto con los datos del elemento_de_escaparate
            const elementoData = {
                Nombre_del_elemento: nombreElemento,
                Nombre: escaparateData.Name || escaparateData.Nombre_del_escaparate || '',
                Alto: elementoEncontrado?.Alto_del_elemento || elementoEncontrado?.datosOriginales?.Alto_del_elemento || '',
                Ancho: elementoEncontrado?.Ancho_del_elemento || elementoEncontrado?.datosOriginales?.Ancho_del_elemento || '',
                Elemento: escaparateData.elemento_de_escaparate
            };
            
            // Cargar los datos en la fila
            callbacks.cargarDatosElemento(elementoRow, elementoData, pdvIndex, escaparateIndex);
        }
        
        // Actualizar totales
        callbacks.actualizarTotalEscaparate(pdvIndex, escaparateIndex);
    }

    // Crea un elemento vacío en un escaparate
    async crearElementoVacio(pdvIndex, escaparateIndex, callbacks) {
        // Validar callbacks requeridos
        if (!callbacks || !callbacks.obtenerElementosContainer || !callbacks.agregarElemento || !callbacks.actualizarTotalEscaparate) {
            console.error('Faltan callbacks requeridos para crearElementoVacio');
            return;
        }

        // Obtener el contenedor de elementos
        const elementosContainer = callbacks.obtenerElementosContainer(pdvIndex, escaparateIndex);
        if (!elementosContainer) {
            console.error(`No se encontró el contenedor de elementos en el escaparate ${escaparateIndex} del PDV ${pdvIndex}`);
            return;
        }
        
        // Asegurarnos de que haya al menos una fila de elemento
        if (elementosContainer.querySelectorAll('tr').length === 0) {
            callbacks.agregarElemento(pdvIndex, escaparateIndex);
        }
        
        // Actualizar totales
        callbacks.actualizarTotalEscaparate(pdvIndex, escaparateIndex);
    }

    // Simplifica objetos para evitar referencias circulares
    simplificarObjeto(obj, profundidad = 0, maxProfundidad = 10) {
        if (profundidad > maxProfundidad) {
            return "[Objeto anidado]";
        }
        
        if (!obj || typeof obj !== 'object') {
            return obj;
        }
        
        // Si es un array, simplificar cada elemento
        if (Array.isArray(obj)) {
            return obj.map(item => this.simplificarObjeto(item, profundidad + 1, maxProfundidad));
        }
        
        // Si es un objeto, simplificar cada propiedad
        const resultado = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                // Ignorar propiedades que podrían causar referencias circulares
                if (key === 'parent' || key === 'children' || key === 'referencias') {
                    resultado[key] = "[Referencia omitida]";
                } else {
                    resultado[key] = this.simplificarObjeto(obj[key], profundidad + 1, maxProfundidad);
                }
            }
        }
        return resultado;
    }
}

// Crear instancia global
window.controladorCarga = new ControladorCarga(); 