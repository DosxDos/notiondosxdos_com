// Módulo para manejar el envío de datos del presupuesto al backend
// Se encarga de recopilar todos los datos del formulario y enviarlos al servidor
class PresupuestoSubmit {
    constructor() {
        this.init();
    }

    // Inicializa el módulo y agrega los event listeners
    init() {
        // Añadir event listener al botón de generar PDF cuando el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    // Configura los event listeners necesarios
    setupEventListeners() {
        const generarPdfBtn = document.getElementById('generar-pdf');
        if (generarPdfBtn) {
            generarPdfBtn.addEventListener('click', () => this.handleGenerarPDF());
        }
    }

    // Maneja el evento de clic en el botón "Generar PDF"
    async handleGenerarPDF() {
        try {
            // Mostrar indicador de carga
            if (window.spinner) {
                window.spinner.show();
            }

            // Recopilar todos los datos del formulario
            const datosCompletos = this.recopilarDatosFormulario();
            
            console.log('Datos recopilados para enviar:', datosCompletos);
            
            // Enviar los datos al backend y recibir el PDF como Blob
            const pdfBlob = await this.enviarDatosAlBackend(datosCompletos);
            
            // Crear una URL para el blob
            const pdfUrl = URL.createObjectURL(pdfBlob);
            
            // Mostrar mensaje de éxito
            alert('El PDF se ha generado correctamente');
            
            // Abrir el PDF en una nueva pestaña
            window.open(pdfUrl, '_blank');
            
        } catch (error) {
            console.error('Error completo al generar el PDF:', error);
            alert(`Error al generar el PDF: ${error.message}`);
        } finally {
            // Ocultar indicador de carga
            if (window.spinner) {
                window.spinner.hide();
            }
        }
    }

    // Recopila todos los datos del formulario
    recopilarDatosFormulario() {
        // Si no hay datos previos cargados, crear un objeto nuevo
        if (!window.presupuestoLoader || !window.presupuestoLoader.datosPresupuesto) {
            console.error('No hay datos de presupuesto cargados');
            return { puntos_de_venta: [] };
        }

        // Partir de los datos originales del presupuesto
        const datosOriginales = window.presupuestoLoader.datosPresupuesto;
        
        // Crear una copia para no modificar los datos originales
        const datosActualizados = { ...datosOriginales };
        
        // Actualizar la lista de puntos de venta con los datos actuales del formulario
        datosActualizados.puntos_de_venta = this.recopilarDatosPDVs();
        
        // Obtener el código de OT desde la URL
        const urlPath = window.location.pathname;
        const pathParts = urlPath.split('/');
        const codigoOT = pathParts[pathParts.length - 1];
        
        // Asegurarse de que el código OT esté en los datos
        if (codigoOT) {
            datosActualizados.C_digo = codigoOT;
        }
        
        // IMPORTANTE: Añadir la propiedad Material a cada escaparate para que funcione con el backend
        if (datosActualizados.puntos_de_venta && Array.isArray(datosActualizados.puntos_de_venta)) {
            datosActualizados.puntos_de_venta.forEach(pdv => {
                if (pdv.escaparates && Array.isArray(pdv.escaparates)) {
                    pdv.escaparates.forEach(escaparate => {
                        // Si el escaparate tiene elemento_de_escaparate con materiales, extraer el nombre del material
                        if (escaparate.elemento_de_escaparate && 
                            escaparate.elemento_de_escaparate.materiales && 
                            escaparate.elemento_de_escaparate.materiales.length > 0 &&
                            escaparate.elemento_de_escaparate.materiales[0].Material) {
                            
                            // Añadir la propiedad Material directamente al escaparate
                            escaparate.Material = escaparate.elemento_de_escaparate.materiales[0].Material;
                        } else if (escaparate.Nombre_del_escaparate) {
                            // Si no hay material disponible, usar el nombre del escaparate como fallback
                            escaparate.Material = escaparate.Nombre_del_escaparate;
                        }
                    });
                }
            });
        }
        
        return datosActualizados;
    }

    // Recopila los datos de todos los PDVs en el formulario
    recopilarDatosPDVs() {
        const puntosDeVenta = [];
        const pdvDivs = document.querySelectorAll('.tabla-pdv');
        
        pdvDivs.forEach((pdvDiv, index) => {
            const pdvData = this.recopilarDatosPDV(pdvDiv, index);
            puntosDeVenta.push(pdvData);
        });
        
        return puntosDeVenta;
    }

    // Recopila los datos de un PDV específico
    recopilarDatosPDV(pdvDiv, index) {
        // Obtener datos originales del PDV si existen
        let pdvData = {};
        if (window.presupuestoLoader && 
            window.presupuestoLoader.datosPresupuesto && 
            window.presupuestoLoader.datosPresupuesto.puntos_de_venta && 
            window.presupuestoLoader.datosPresupuesto.puntos_de_venta[index]) {
            pdvData = { ...window.presupuestoLoader.datosPresupuesto.puntos_de_venta[index] };
        }
        
        // Actualizar datos generales del PDV
        // Montaje
        const montajePdv = pdvDiv.querySelector('.montaje-pdv');
        if (montajePdv) {
            pdvData.Montaje = parseFloat(montajePdv.value) || 0;
        }
        
        // Isla
        const islaPdv = pdvDiv.querySelector('.isla-pdv');
        if (islaPdv) {
            pdvData.Isla = islaPdv.value;
        }
        
        // OBS
        const obsPdv = pdvDiv.querySelector('.obs-pdv');
        if (obsPdv) {
            pdvData.OBS = obsPdv.value;
        }
        
        // Total escaparates
        const totalEscaparatesPdv = pdvDiv.querySelector('.total-escaparates-pdv');
        if (totalEscaparatesPdv) {
            pdvData.Total_Escaparates = parseFloat(totalEscaparatesPdv.value) || 0;
        }
        
        // Eliminar Total_PDV ya que no debe usarse
        if (pdvData.Total_PDV !== undefined) {
            delete pdvData.Total_PDV;
        }
        
        // Recopilar escaparates
        pdvData.escaparates = this.recopilarDatosEscaparates(pdvDiv, index);
        
        return pdvData;
    }

    // Recopila los datos de todos los escaparates de un PDV
    recopilarDatosEscaparates(pdvDiv, pdvIndex) {
        const escaparates = [];
        const escaparateItems = pdvDiv.querySelectorAll('.escaparate-item');
        
        escaparateItems.forEach((escaparateItem, escaparateIndex) => {
            const escaparateData = this.recopilarDatosEscaparate(escaparateItem, pdvIndex, escaparateIndex);
            escaparates.push(escaparateData);
        });
        
        return escaparates;
    }

    // Recopila los datos de un escaparate específico
    recopilarDatosEscaparate(escaparateItem, pdvIndex, escaparateIndex) {
        // Obtener datos originales del escaparate si existen
        let escaparateData = {};
        if (window.presupuestoLoader && 
            window.presupuestoLoader.datosPresupuesto && 
            window.presupuestoLoader.datosPresupuesto.puntos_de_venta && 
            window.presupuestoLoader.datosPresupuesto.puntos_de_venta[pdvIndex] &&
            window.presupuestoLoader.datosPresupuesto.puntos_de_venta[pdvIndex].escaparates &&
            window.presupuestoLoader.datosPresupuesto.puntos_de_venta[pdvIndex].escaparates[escaparateIndex]) {
            escaparateData = { ...window.presupuestoLoader.datosPresupuesto.puntos_de_venta[pdvIndex].escaparates[escaparateIndex] };
        }
        
        // Actualizar datos del escaparate
        // Nombre del escaparate
        const nombreEscaparate = escaparateItem.querySelector('.nombre-escaparate');
        if (nombreEscaparate) {
            escaparateData.Nombre_del_escaparate = nombreEscaparate.value;
            // También actualizar Name para mantener consistencia
            escaparateData.Name = nombreEscaparate.value;
        }
        
        // Tipo de escaparate
        const tipoEscaparate = escaparateItem.querySelector('.tipo-escaparate');
        if (tipoEscaparate) {
            escaparateData.Tipo_de_escaparate = tipoEscaparate.value;
        }
        
        // Total escaparate
        const totalEscaparate = escaparateItem.querySelector('.total-escaparate');
        if (totalEscaparate) {
            escaparateData.Total_Escaparate = parseFloat(totalEscaparate.value) || 0;
        }
        
        // Recopilar elementos del escaparate
        escaparateData.elementos = this.recopilarDatosElementos(escaparateItem, pdvIndex, escaparateIndex);
        
        // Calcular el precio del material basado en el total del escaparate o usar el valor existente
        const pdvDiv = document.querySelector(`.tabla-pdv[data-pdv-index="${pdvIndex}"]`);
        const totalEscaparatesPdv = pdvDiv ? parseFloat(pdvDiv.querySelector('.total-escaparates-pdv')?.value || 0) : 0;
        const numEscaparates = pdvDiv ? pdvDiv.querySelectorAll('.escaparate-item').length : 1;
        
        // Si hay un valor válido para totalEscaparatesPdv, calcular el precio material como promedio
        if (totalEscaparatesPdv > 0 && numEscaparates > 0) {
            escaparateData.Precio_material = (totalEscaparatesPdv / numEscaparates).toFixed(2);
        } else {
            // Si no, usar el valor del atributo data o calcular basado en el total del escaparate
            escaparateData.Precio_material = parseFloat(escaparateItem.getAttribute('data-precio-material')) || 
                                          (escaparateData.Total_Escaparate / (escaparateData.elementos.length || 1));
        }
        
        escaparateData.unidades_material = parseInt(escaparateItem.getAttribute('data-unidades-material')) || 1;
        
        return escaparateData;
    }

    // Recopila los datos de todos los elementos de un escaparate
    recopilarDatosElementos(escaparateItem, pdvIndex, escaparateIndex) {
        const elementos = [];
        const elementosRows = escaparateItem.querySelectorAll('.elemento-escaparate');
        
        elementosRows.forEach((elementoRow, elementoIndex) => {
            const elementoData = this.recopilarDatosElemento(elementoRow);
            elementos.push(elementoData);
        });
        
        return elementos;
    }

    // Recopila los datos de un elemento específico
    recopilarDatosElemento(elementoRow) {
        const elementoData = {};
        
        // Concepto
        const concepto = elementoRow.querySelector('.concepto');
        if (concepto) {
            elementoData.Nombre_del_elemento = concepto.value;
        }
        
        // Alto
        const alto = elementoRow.querySelector('.alto');
        if (alto) {
            elementoData.Alto = parseFloat(alto.value.replace(',', '.')) || 0;
        }
        
        // Ancho
        const ancho = elementoRow.querySelector('.ancho');
        if (ancho) {
            elementoData.Ancho = parseFloat(ancho.value.replace(',', '.')) || 0;
        }
        
        // Material
        const material = elementoRow.querySelector('.material');
        if (material) {
            elementoData.Material = material.value;
        }
        
        // Precio/M.Prima
        const precioMP = elementoRow.querySelector('.precio-mp');
        if (precioMP) {
            elementoData.Precio_MP = parseFloat(precioMP.value.replace(',', '.')) || 0;
        }
        
        // Precio Unitario
        const precioUnitario = elementoRow.querySelector('.precio-unitario');
        if (precioUnitario) {
            elementoData.Precio_Unitario = parseFloat(precioUnitario.value.replace(',', '.')) || 0;
        }
        
        // Unidades
        const unidades = elementoRow.querySelector('.unidades');
        if (unidades) {
            elementoData.Unidades = parseInt(unidades.value) || 1;
        }
        
        // Total elemento
        const totalElemento = elementoRow.querySelector('.total-elemento');
        if (totalElemento) {
            elementoData.Total = parseFloat(totalElemento.value.replace(',', '.')) || 0;
        }
        
        return elementoData;
    }

    // Envía los datos recopilados al backend
    async enviarDatosAlBackend(datos) {
        if (!window.apiServices) {
            throw new Error('ApiServices no está disponible');
        }
        
        // Obtener el código de OT desde la URL
        const urlPath = window.location.pathname;
        const pathParts = urlPath.split('/');
        const codigoOT = pathParts[pathParts.length - 1];
        
        if (!codigoOT) {
            throw new Error('Código OT no encontrado en la URL');
        }
        
        // Verificar que estamos enviando Total_Escaparates en lugar de Total_Escaparate
        console.log('Enviando datos al backend:', {codigoOT, datos});
        
        // Log de valores de Total_Escaparates para cada PDV
        datos.puntos_de_venta.forEach((pdv, index) => {
            console.log(`PDV ${index + 1} (${pdv.PDV_relacionados?.name || 'Sin nombre'}):`, {
                Total_Escaparates: pdv.Total_Escaparates,
                Num_Escaparates: pdv.escaparates?.length || 0,
                Precio_Promedio: pdv.escaparates?.length ? (pdv.Total_Escaparates / pdv.escaparates.length).toFixed(2) : 0
            });
        });
        
        try {
            // Enviar los datos al endpoint correspondiente y recibir el PDF como Blob
            const pdfBlob = await window.apiServices.enviarPresupuestoActualizado(codigoOT, datos);
            
            // También enviamos los datos para crear el presupuesto en Notion
            try {
                const respuestaNotion = await window.apiServices.crearPresupuestoEnNotion(codigoOT, datos);
                console.log('Presupuesto creado en Notion:', respuestaNotion);
            } catch (notionError) {
                console.error('Error al crear presupuesto en Notion:', notionError);
                // No interrumpimos el flujo principal si hay error en Notion
            }
            
            console.log('PDF recibido correctamente, tamaño:', pdfBlob.size);
            return pdfBlob;
        } catch (error) {
            console.error('Error en enviarDatosAlBackend:', error);
            throw error;
        }
    }
}

// Crear instancia global
window.presupuestoSubmit = new PresupuestoSubmit(); 