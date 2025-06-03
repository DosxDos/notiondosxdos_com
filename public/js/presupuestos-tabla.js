/**
 * Clase para gestionar las tablas de presupuestos de PDVs y escaparates
 */
class PresupuestosTabla {
    constructor() {
        this.materialesDisponibles = {};
        this.puntosDeVentaDisponibles = [];
        this.elementosExistentesDisponibles = [];

        // Inicializar cuando el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', async () => {
                await this.initializeEventListeners();
                await this.cargarDatos();
            });
        } else {
            this.initializeEventListeners();
            this.cargarDatos();
        }
    }

    async cargarDatos() {
        // Cargar todos los datos necesarios en paralelo
        await Promise.all([
            this.cargarMateriales(),
            this.cargarPuntosDeVenta(),
            this.cargarElementosExistentes()
        ]);
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

        // Inicializar eventos para el nuevo PDV usando EventHandlers
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
        // Usar EventHandlers para inicializar todos los eventos del PDV
        window.EventHandlers.initializePDVEvents(pdvDiv, pdvIndex, {
            agregarEscaparate: this.agregarEscaparate.bind(this),
            cargarOpcionesPDV: this.cargarOpcionesPDV.bind(this)
        });
    }

    agregarEscaparate(pdvIndex) {
        // Usar TableUtils para encontrar los elementos necesarios
        const { pdvDiv } = window.TableUtils.encontrarElementos(pdvIndex);
        if (!pdvDiv) return;

        const escaparatesContainer = pdvDiv.querySelector(`#escaparates-pdv-${pdvIndex}`);
        if (!escaparatesContainer) return;

        const escaparateIndex = escaparatesContainer.querySelectorAll('.escaparate-item').length;
        const escaparateDiv = document.createElement('div');
        
        escaparateDiv.innerHTML = window.generarTemplateEscaparate(pdvIndex, escaparateIndex);
        escaparatesContainer.appendChild(escaparateDiv.firstElementChild);

        // Inicializar eventos para el nuevo escaparate usando EventHandlers
        this.initializeEscaparateEvents(pdvIndex, escaparateIndex);
        
        // Añadir primer elemento al escaparate
        this.agregarElemento(pdvIndex, escaparateIndex);
    }

    initializeEscaparateEvents(pdvIndex, escaparateIndex) {
        // Usar TableUtils para encontrar los elementos necesarios
        const { escaparateItem } = window.TableUtils.encontrarElementos(pdvIndex, escaparateIndex);
        if (!escaparateItem) return;

        // Usar EventHandlers para inicializar todos los eventos del escaparate
        window.EventHandlers.initializeEscaparateEvents(
            escaparateItem, 
            pdvIndex, 
            escaparateIndex, 
            {
                agregarElemento: this.agregarElemento.bind(this),
                agregarElementoExistente: this.agregarElementoExistente.bind(this)
            }
        );
    }

    agregarElemento(pdvIndex, escaparateIndex) {
        // Usar TableUtils para encontrar los elementos necesarios
        const { elementosContainer } = window.TableUtils.encontrarElementos(pdvIndex, escaparateIndex);
        if (!elementosContainer) return;

        const elementoRow = document.createElement('tr');
        elementoRow.innerHTML = window.generarTemplateElemento(true, this.generarOpcionesMateriales.bind(this));
        elementosContainer.appendChild(elementoRow);

        // Inicializar eventos para el nuevo elemento usando EventHandlers
        window.EventHandlers.initializeElementoEvents(elementoRow, pdvIndex, escaparateIndex);
        
        // Inicializar cálculos automáticamente cuando se agrega un nuevo elemento manualmente
        setTimeout(() => {
            if (window.calculadora) {
                window.calculadora.calcularPrecioUnitario(elementoRow, pdvIndex, escaparateIndex);
            }
        }, 50);
    }

    async cargarMateriales() {
        try {
            if (!window.apiServices) {
                console.error('ApiServices no está disponible');
                return;
            }
            
            const data = await window.apiServices.obtenerMateriales();

            // Actualizar materialesDisponibles en calculadora
            window.calculadora.actualizarMaterialesDisponibles(data);
            
            // Actualizar selectores de materiales
            window.calculadora.actualizarSelectoresMateriales();
        } catch (error) {
            console.error('Error al cargar materiales:', error);
        }
    }

    async cargarPuntosDeVenta() {
        try {
            if (!window.apiServices) {
                console.error('ApiServices no está disponible');
                return;
            }
            
            this.puntosDeVentaDisponibles = await window.apiServices.obtenerPuntosDeVenta();
            
            // Actualizar los selects existentes
            this.actualizarSelectsPDV();
        } catch (error) {
            console.error('Error al cargar puntos de venta:', error);
        }
    }
    
    cargarOpcionesPDV(selectElement) {
        if (!selectElement) return;
        
        // Usar TableUtils para actualizar el select
        window.TableUtils.actualizarSelect(
            selectElement,
            // Filtrar y ordenar los PDVs válidos
            window.TableUtils.ordenarArray(
                this.puntosDeVentaDisponibles.filter(pdv => pdv && pdv.id && (pdv.Name || pdv.name)),
                // Función para obtener el nombre para ordenar
                pdv => (pdv.Name || pdv.name || '').toLowerCase()
            ),
            // Función para obtener el texto a mostrar
            pdv => pdv.Name || pdv.name,
            // Función para obtener el valor
            pdv => pdv.id,
            // Mantener la primera opción (opción "Seleccionar")
            true
        );
    }
    
    actualizarSelectsPDV() {
        document.querySelectorAll('.nombre-pdv').forEach(select => this.cargarOpcionesPDV(select));
    }

    /**
     * Genera opciones HTML para selectores de materiales
     * @returns {string} HTML con opciones
     */
    generarOpcionesMateriales() {
        return window.calculadora.generarOpcionesMateriales();
    }

    /**
     * Agrega un elemento existente al escaparate
     * @param {number} pdvIndex - Índice del PDV
     * @param {number} escaparateIndex - Índice del escaparate
     */
    agregarElementoExistente(pdvIndex, escaparateIndex) {
        // Usar TableUtils para encontrar los elementos necesarios
        const { elementosContainer } = window.TableUtils.encontrarElementos(pdvIndex, escaparateIndex);
        if (!elementosContainer) return;
        
        // Generar opciones de conceptos solo si hay elementos disponibles
        if (!this.elementosExistentesDisponibles.length) {
            console.warn('No hay elementos existentes disponibles para agregar');
            return;
        }

        const elementoRow = document.createElement('tr');
        elementoRow.innerHTML = window.generarTemplateElementoExistente(
            true,
            this.generarOpcionesMateriales.bind(this),
            this.generarOpcionesElementosExistentes.bind(this)
        );
        elementosContainer.appendChild(elementoRow);

        // Inicializar eventos para elementos existentes
        window.EventHandlers.initializeElementoExistenteEvents(
            elementoRow, 
            pdvIndex, 
            escaparateIndex, 
            this.actualizarCamposDesdeElementoExistente.bind(this)
        );
        
        // Inicializar cálculos automáticamente cuando se agrega un elemento existente
        setTimeout(() => {
            if (window.calculadora) {
                window.calculadora.calcularPrecioUnitario(elementoRow, pdvIndex, escaparateIndex);
            }
        }, 50);
    }

    /**
     * Actualiza los campos de un elemento basado en el elemento existente seleccionado
     * @param {Element} elementoRow - Fila del elemento
     * @param {string} elementoId - ID del elemento existente seleccionado
     * @param {number} pdvIndex - Índice del PDV
     * @param {number} escaparateIndex - Índice del escaparate
     */
    actualizarCamposDesdeElementoExistente(elementoRow, elementoId, pdvIndex, escaparateIndex) {
        if (!elementoId) return;

        // Buscar el elemento existente por ID
        const elementoExistente = this.elementosExistentesDisponibles.find(elem => elem.id === elementoId);
        if (!elementoExistente) return;
        
        console.log('Elemento seleccionado:', elementoExistente);
        
        // Acceder a los datos originales
        const datosOriginales = elementoExistente.datosOriginales;
        
        // Rellenar el campo concepto con el nombre del elemento (priorizar Nombre_del_elemento)
        const conceptoInput = elementoRow.querySelector('.concepto');
        if (conceptoInput) {
            conceptoInput.value = datosOriginales.Nombre_del_elemento || elementoExistente.Nombre;
        }

        // Actualizar alto y ancho con los valores específicos del elemento
        const altoInput = elementoRow.querySelector('.alto');
        if (altoInput) {
            altoInput.value = datosOriginales.Alto_del_elemento || elementoExistente.Alto || '';
        }
        
        const anchoInput = elementoRow.querySelector('.ancho');
        if (anchoInput) {
            anchoInput.value = datosOriginales.Ancho_del_elemento || elementoExistente.Ancho || '';
        }
        
        // Actualizar material si existe
        const materialInput = elementoRow.querySelector('.material');
        if (materialInput && elementoExistente.Material) {
            materialInput.value = elementoExistente.Material;
        }

        // Manejar el precio del material si existe
        const precioMP = elementoRow.querySelector('.precio-mp');
        if (precioMP) {
            // Intentar obtener el precio del material desde los datos originales
            const datosMaterial = datosOriginales.elemento_de_escaparate?.materiales?.[0];
            if (datosMaterial && datosMaterial.Precio) {
                precioMP.value = datosMaterial.Precio;
            } else {
                // Si no existe, intentar actualizar desde calculadora
                window.calculadora.actualizarPrecioMP(elementoRow, pdvIndex, escaparateIndex);
            }
        }

        // Actualizar precio unitario si existe
        const precioUnitario = elementoRow.querySelector('.precio-unitario');
        if (precioUnitario && elementoExistente.Precio_Unitario) {
            precioUnitario.value = elementoExistente.Precio_Unitario;
        }
        
        // Actualizar unidades si existe el campo en los datos originales
        const unidadesInput = elementoRow.querySelector('.unidades');
        if (unidadesInput && datosOriginales.Unidades) {
            unidadesInput.value = datosOriginales.Unidades;
        }

        // Recalcular totales
        window.calculadora.calcularTotalesElemento(elementoRow, pdvIndex, escaparateIndex);
    }

    /**
     * Genera las opciones HTML para el selector de elementos existentes
     * @returns {string} HTML con las opciones
     */
    generarOpcionesElementosExistentes() {
        return this.elementosExistentesDisponibles
            .map(elem => {
                // Obtener datos originales para información más precisa
                const original = elem.datosOriginales || elem;
                
                // Usar Nombre_del_elemento como descripción principal
                let descripcion = original.Nombre_del_elemento || elem.Nombre;      
                
                return `<option value="${elem.id}">${descripcion}</option>`;
            })
            .join('');
    }

    /**
     * Carga los elementos existentes desde el API
     */
    async cargarElementosExistentes() {
        try {
            if (!window.apiServices) {
                console.error('ApiServices no está disponible');
                return;
            }
            
            // Obtener elementos desde Zoho
            const elementosZoho = await window.apiServices.obtenerElementosExistentes();
            console.log('Elementos cargados:', elementosZoho);
            
            // Mostrar los nombres originales de los elementos para depuración
            elementosZoho.forEach(elem => {
                console.log(`Elemento ID ${elem.id}:`, {
                    'name': elem.name,
                    'Name': elem.Name,
                    'Nombre_del_elemento': elem.Nombre_del_elemento,
                    'Nombre_del_escaparate': elem.Nombre_del_escaparate
                });
            });
            
            // Procesar los elementos para tener un formato uniforme
            this.elementosExistentesDisponibles = elementosZoho.map(elem => {
                // Determinar el mejor nombre para el elemento
                const nombreElemento = elem.Nombre_del_elemento || 
                                       elem.Nombre_del_escaparate || 
                                       elem.Name || 
                                       elem.name || 
                                       'Elemento sin nombre';
                
                return {
                    id: elem.id,
                    // Usar el Nombre_del_elemento como prioridad para el nombre
                    Nombre: nombreElemento,
                    // Usar las dimensiones específicas del elemento
                    Alto: elem.Alto_del_elemento || elem.Alto_del_Suelo || elem.Superior || elem.Alto || '',
                    Ancho: elem.Ancho_del_elemento || elem.Ancho_del_Suelo || elem.Inferior || elem.Ancho || '',
                    // Verificar si hay materiales en elemento_de_escaparate
                    Material: elem.elemento_de_escaparate?.materiales?.[0]?.Material || elem.Material || '',
                    Precio_Unitario: elem.Precio_Unitario || '',
                    // Guardar la referencia completa por si necesitamos más datos
                    datosOriginales: elem
                };
            });
            
            console.log('Elementos procesados:', this.elementosExistentesDisponibles);
            
            // Actualizar los selects existentes si hubiera alguno ya en la página
            this.actualizarSelectsElementosExistentes();
        } catch (error) {
            console.error('Error al cargar elementos existentes:', error);
            this.elementosExistentesDisponibles = [];
        }
    }
    
    /**
     * Actualiza todos los selectores de elementos existentes en la página
     */
    actualizarSelectsElementosExistentes() {
        document.querySelectorAll('.concepto-select').forEach(select => {
            // Usar TableUtils para actualizar el select
            window.TableUtils.actualizarSelect(
                select,
                this.elementosExistentesDisponibles,
                // Función para obtener el texto a mostrar
                elem => elem.Nombre || elem.Name || elem.name || 'Elemento sin nombre',
                // Función para obtener el valor
                elem => elem.id,
                // Mantener la primera opción (opción "Seleccionar concepto")
                true
            );
        });
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