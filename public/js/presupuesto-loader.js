/**
 * Clase para cargar y manejar datos del presupuesto
 */
class PresupuestoLoader {
    constructor() {
        this.datosPresupuesto = null;
        
        // Inicializar cuando el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', async () => {
                await this.cargarDatosPresupuesto();
            });
        } else {
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
                return;
            }
            
            console.log('Obteniendo datos del presupuesto para OT:', codigoOT);
            
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
            
            // Guardar los datos para uso posterior
            if (responseData.status && responseData.data && responseData.data.data) {
                this.datosPresupuesto = responseData.data.data[0];
                
                // Inicializar datos del cliente si existen
                if (this.datosPresupuesto) {
                    this.inicializarDatosCliente();
                    this.inicializarPuntosDeVenta();
                }
            }
            
        } catch (error) {
            console.error('Error al cargar datos del presupuesto:', error);
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
            
            // Actualizar elementos visuales si existen
            const nombreClienteElement = document.getElementById('nombre-cliente-formulario');
            if (nombreClienteElement) {
                nombreClienteElement.textContent = ` - ${cliente.name}`;
            }
        }
    }
    
    inicializarPuntosDeVenta() {
        // Verificar si hay puntos de venta en los datos
        if (!this.datosPresupuesto || !this.datosPresupuesto.puntos_de_venta) {
            console.log('No hay puntos de venta en los datos del presupuesto');
            return;
        }
        
        const pdvs = this.datosPresupuesto.puntos_de_venta;
        console.log(`Encontrados ${pdvs.length} puntos de venta para esta OT`);
        
        // Imprimir la estructura del primer PDV para depuración
        if (pdvs.length > 0) {
            console.log('Estructura del primer PDV:', JSON.stringify(pdvs[0], null, 2));
        }
        
        // Si existe pdvManager, podemos utilizar sus funciones
        if (window.pdvManager) {
            // Limpiar el contenedor de PDVs existente
            const contenedorPDVs = document.getElementById('contenedor-pdvs');
            if (contenedorPDVs) {
                // Vaciar el contenedor antes de añadir los nuevos PDVs
                contenedorPDVs.innerHTML = '';
                
                // Crear un PDV por cada punto de venta del backend
                pdvs.forEach((pdv, index) => {
                    console.log(`Creando PDV #${index + 1}: ${pdv.PDV_relacionados?.name || 'Sin nombre'}`);
                    window.pdvManager.agregarNuevoPDV();
                });
                
                console.log(`Se han creado ${pdvs.length} tablas de PDVs automáticamente`);
                
                // Después de crear todos los PDVs, inicializamos sus datos
                // Esto asegura que todos los elementos DOM ya existen
                setTimeout(() => {
                    pdvs.forEach((pdv, index) => {
                        this.inicializarDatosPDV(pdv, index);
                    });
                }, 100);
            }
        }
    }
    
    inicializarDatosPDV(pdvData, index) {
        // Aquí podemos inicializar campos específicos para cada PDV
        // si el backend nos proporciona esos datos
        
        const tablasPDV = document.querySelectorAll('.tabla-pdv');
        if (tablasPDV.length <= index) return;
        
        const pdvDiv = tablasPDV[index];
        if (!pdvDiv) return;
        
        // Extraer el ID de la tabla para este PDV
        const tablaId = `tabla-pdv-${index}`;
        const tabla = document.getElementById(tablaId);
        if (!tabla) return;
        
        console.log(`Inicializando datos para PDV #${index + 1}: ${pdvData.PDV_relacionados?.name || 'Sin nombre'}`);
        
        // Si hay líneas en el PDV, agregamos una fila por cada línea
        if (pdvData.lineas && pdvData.lineas.length > 0) {
            // Agregar la primera línea si no existe
            if (tabla.querySelector('tbody').children.length === 0 && window.pdvManager) {
                window.pdvManager.agregarFila(index);
            }
            
            // Inicializar los datos de la primera línea
            const primeraLinea = pdvData.lineas[0];
            if (primeraLinea) {
                // Aquí puedes inicializar los campos específicos de la primera línea
                // Por ejemplo, si hay datos de isla
                if (primeraLinea.Isla) {
                    const selectIsla = pdvDiv.querySelector('.isla');
                    if (selectIsla) {
                        selectIsla.value = primeraLinea.Isla;
                    }
                }
                
                // Puedes inicializar más campos según los datos disponibles
            }
            
            // Si hay más líneas, podríamos agregarlas también
            // Esto es solo un ejemplo, adapta según la estructura real de tus datos
        }
        
        // Verificar si hay datos de escaparates
        if (pdvData.escaparates && pdvData.escaparates.length > 0) {
            console.log(`PDV #${index + 1} tiene ${pdvData.escaparates.length} escaparates`);
            
            // Aquí podrías inicializar datos relacionados con escaparates
            // por ejemplo, actualizar el campo de escaparate si existe
            const escaparateInput = pdvDiv.querySelector('.escaparate');
            if (escaparateInput) {
                // Si hay información de escaparates, podríamos mostrarla
                escaparateInput.value = `${pdvData.escaparates.length} escaparates`;
            }
        }
    }
    
    obtenerDatosPresupuesto() {
        return this.datosPresupuesto;
    }
}

// Crear instancia global
window.presupuestoLoader = new PresupuestoLoader(); 