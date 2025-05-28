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
            
            // Esperar a que el DOM se actualice antes de añadir escaparates
            setTimeout(() => {
                this.agregarEscaparates(pdv, index);
            }, 50);
        });
    }
    
    agregarEscaparates(pdvData, index) {
        if (!pdvData.escaparates || !pdvData.escaparates.length) return;
        
        const tabla = document.getElementById(`tabla-pdv-${index}`);
        if (!tabla || !window.presupuestosTabla) return;
        
        // Agregar una fila por cada escaparate
        pdvData.escaparates.forEach((escaparate, escIndex) => {
            window.presupuestosTabla.agregarFila(index);
            
            // Inicializar datos en la fila creada
            const tbody = tabla.querySelector('tbody');
            if (tbody && tbody.children[escIndex]) {
                const fila = tbody.children[escIndex];
                this.inicializarCamposEscaparate(fila, escaparate);
            }
        });
    }
    
    inicializarCamposEscaparate(fila, escaparate) {
        // Mapeo simple de campos comunes
        const campos = [
            { selector: 'input[placeholder="Concepto"]', prop: 'Name' },
            { selector: 'input[placeholder="Alto"]', prop: 'Alto' },
            { selector: 'input[placeholder="Ancho"]', prop: 'Ancho' },
            { selector: '.material', prop: 'Material' },
            { selector: '.precio-mp', prop: 'Precio_MP' },
            { selector: '.precio-unitario', prop: 'Precio_unitario' },
            { selector: '.unidades', prop: 'Unidades' },
            { selector: '.margen', prop: 'Margen' },
            { selector: '.total', prop: 'Total' }
        ];
        
        // Asignar valores a los campos
        campos.forEach(campo => {
            const elemento = fila.querySelector(campo.selector);
            if (elemento && escaparate[campo.prop] !== undefined) {
                elemento.value = escaparate[campo.prop];
            }
        });
        
        // Calcular totales si es necesario
        if (window.presupuestosTabla) {
            window.presupuestosTabla.calcularTotales(fila);
        }
    }
}

// Crear instancia global
window.presupuestoLoader = new PresupuestoLoader(); 