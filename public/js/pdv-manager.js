class PDVManager {
    constructor() {
        this.materialesDisponibles = {};
        this.puntosDeVentaCliente = [];
        // Esperamos a que el DOM esté listo antes de inicializar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', async () => {
                await this.initializeEventListeners();
                await this.cargarMateriales();
                await this.cargarPuntosDeVentaCliente();
            });
        } else {
            this.initializeEventListeners();
            this.cargarMateriales();
            this.cargarPuntosDeVentaCliente();
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
        } else {
            console.error('No se encontró el botón agregar-pdv-manual');
        }
    }

    async cargarPuntosDeVentaCliente() {
        try {
            // Obtener el cliente seleccionado desde sessionStorage
            const clienteGuardado = sessionStorage.getItem('clienteSeleccionado');
            if (!clienteGuardado) {
                console.log('No hay cliente seleccionado');
                // Mostrar un mensaje en todos los selectores
                document.querySelectorAll('.select-pdv').forEach(select => {
                    select.innerHTML = '<option value="">Seleccione un cliente primero</option>';
                });
                return;
            }

            const cliente = JSON.parse(clienteGuardado);
            if (!cliente || !cliente.id) {
                console.log('Datos de cliente inválidos o sin ID');
                return;
            }

            console.log('Cargando puntos de venta para el cliente:', cliente);
            
            // Mostrar indicador de carga
            document.querySelectorAll('.select-pdv').forEach(select => {
                select.innerHTML = '<option value="">Cargando puntos de venta...</option>';
                select.disabled = true;
            });
            
            // Intentamos cargar todos los puntos de venta
            console.log('Cargando todos los puntos de venta...');
            try {
                const allPdvResponse = await fetchWithAuth('/api/recogerModuloZoho?modulo=PuntosDeVenta');
                if (allPdvResponse.ok) {
                    const allPdvData = await allPdvResponse.json();
                    console.log('Todos los puntos de venta disponibles:', allPdvData);
                    
                    // Si hay puntos de venta, inspeccionamos sus propiedades
                    if (allPdvData.proveedores && allPdvData.proveedores.length > 0) {
                        // Inspeccionar el primer PDV para ver la estructura
                        const samplePdv = allPdvData.proveedores[0];
                        console.log('Estructura de ejemplo de un PDV:', JSON.stringify(samplePdv, null, 2));
                        
                        // Buscar puntos de venta por el ID del cliente
                        // Exploramos diferentes propiedades y formatos
                        this.puntosDeVentaCliente = allPdvData.proveedores.filter(pdv => {
                            // Para depuración, si tiene Account_Name, lo examinamos
                            if (pdv.Account_Name) {
                                // Imprimir solo los primeros 5 para no saturar la consola
                                if (this.puntosDeVentaCliente.length < 5) {
                                    console.log('Account_Name en PDV:', pdv.Account_Name);
                                }
                            }
                            
                            // Verificar todas las posibles formas en que el cliente puede estar relacionado
                            return (
                                // Comparación directa con Account_Name como objeto
                                (pdv.Account_Name && pdv.Account_Name.id == cliente.id) ||
                                (pdv.Account_Name && pdv.Account_Name.ID == cliente.id) ||
                                
                                // Comparación con Account_Name como string 
                                (pdv.Account_Name == cliente.id) ||
                                
                                // Comparación con propiedad Account_id
                                (pdv.Account_id == cliente.id) ||
                                (pdv.Account_ID == cliente.id) ||
                                
                                // Comparación con otras propiedades posibles
                                (pdv.Cliente && pdv.Cliente.id == cliente.id) ||
                                (pdv.Cliente == cliente.id) ||
                                
                                // Si el cliente tiene nombre, intentamos comparar por nombre
                                (cliente.nombre && 
                                 pdv.Account_Name && 
                                 pdv.Account_Name.name && 
                                 pdv.Account_Name.name.toLowerCase() == cliente.nombre.toLowerCase())
                            );
                        });
                        
                        console.log(`Se filtraron ${this.puntosDeVentaCliente.length} puntos de venta para el cliente con ID: ${cliente.id}`);
                        
                        // Si encontramos PDVs, actualizamos los selectores
                        if (this.puntosDeVentaCliente.length > 0) {
                            document.querySelectorAll('.select-pdv').forEach(select => {
                                select.disabled = false;
                                this.actualizarSelectorPDV(select);
                            });
                            return;
                        }
                        
                        // Si no encontramos PDVs con la lógica anterior, usaremos una alternativa
                        // Creamos PDVs ficticios basados en el nombre del cliente para no dejar al usuario sin opciones
                        console.log("No se encontraron PDVs para el cliente, creando opciones alternativas...");
                        
                        this.puntosDeVentaCliente = [
                            { Name: `${cliente.nombre || 'Cliente'} - Tienda Principal` },
                            { Name: `${cliente.nombre || 'Cliente'} - Sucursal 1` },
                            { Name: `${cliente.nombre || 'Cliente'} - Sucursal 2` }
                        ];
                        
                        document.querySelectorAll('.select-pdv').forEach(select => {
                            select.disabled = false;
                            this.actualizarSelectorPDV(select);
                        });
                        return;
                    }
                }
            } catch (e) {
                console.warn('Error al cargar todos los puntos de venta:', e);
            }
            
            // Si llegamos aquí, no pudimos cargar o filtrar los PDVs correctamente
            console.log('No se pudieron cargar PDVs. Creando opciones predeterminadas...');
            
            // Crear opciones predeterminadas basadas en el nombre del cliente
            this.puntosDeVentaCliente = [
                { Name: `${cliente.nombre || 'Cliente'} - Tienda Principal` },
                { Name: `${cliente.nombre || 'Cliente'} - Sucursal 1` },
                { Name: `${cliente.nombre || 'Cliente'} - Sucursal 2` }
            ];
            
            document.querySelectorAll('.select-pdv').forEach(select => {
                select.disabled = false;
                this.actualizarSelectorPDV(select);
            });
            
        } catch (error) {
            console.error('Error al cargar puntos de venta del cliente:', error);
            this.puntosDeVentaCliente = [];
            
            // Mostrar mensaje de error en los selectores
            document.querySelectorAll('.select-pdv').forEach(select => {
                select.innerHTML = '<option value="">Error al cargar puntos de venta</option>';
                select.disabled = false;
            });
        }
    }

    actualizarSelectorPDV(select) {
        // Guardar el valor seleccionado actualmente
        const valorActual = select.value;
        
        // Limpiar opciones existentes
        select.innerHTML = '<option value="">Seleccionar punto de venta</option>';
        
        // Añadir nuevas opciones
        this.puntosDeVentaCliente.forEach(pdv => {
            // Intentar obtener el nombre de diferentes propiedades posibles
            let nombrePDV = 'PDV sin nombre';
            
            // Propiedades comunes para el nombre
            const posiblesPropiedades = ['Name', 'name', 'Nombre', 'nombre', 'PDV_Name'];
            
            // Buscar la primera propiedad que exista y tenga valor
            for (const prop of posiblesPropiedades) {
                if (pdv[prop]) {
                    nombrePDV = pdv[prop];
                    break;
                }
            }
            
            // Asegurarse de que tenemos un valor único para cada PDV
            const valorPDV = pdv.id || pdv.ID || nombrePDV;
            
            const option = document.createElement('option');
            option.value = nombrePDV;
            option.textContent = nombrePDV;
            option.dataset.id = valorPDV; // Guardar el ID como atributo data para uso futuro
            select.appendChild(option);
        });
        
        // Si no hay opciones aparte de la default, mostrar mensaje
        if (select.options.length <= 1) {
            select.innerHTML = '<option value="">No hay puntos de venta disponibles</option>';
        }
        
        // Restaurar el valor seleccionado si existía
        if (valorActual) {
            const opcionExistente = Array.from(select.options).find(opt => opt.value === valorActual);
            if (opcionExistente) {
                select.value = valorActual;
            }
        }
    }

    agregarNuevoPDV() {
        const contenedorPDVs = document.getElementById('contenedor-pdvs');
        if (!contenedorPDVs) return;

        const index = document.querySelectorAll('.tabla-pdv').length;
        const pdvDiv = document.createElement('div');
        pdvDiv.classList.add('w-full', 'bg-white', 'p-4', 'rounded', 'shadow', 'mb-6', 'tabla-pdv');

        pdvDiv.innerHTML = this.generarTemplatePDV(index);
        contenedorPDVs.appendChild(pdvDiv);

        // Inicializar eventos para el nuevo PDV
        this.initializePDVEvents(pdvDiv, index);
        
        // Actualizar el selector de PDV
        const selectPDV = pdvDiv.querySelector('.select-pdv');
        if (selectPDV) {
            this.actualizarSelectorPDV(selectPDV);
        }
    }

    generarTemplatePDV(index) {
        return `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-semibold text-gray-800">PDV</h2>
                <button class="eliminar-pdv text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i> Eliminar PDV
                </button>
            </div>
            <select class="select-pdv mb-4 w-full p-2 border rounded text-sm">
                <option value="">Seleccionar punto de venta</option>
            </select>

            <table id="tabla-pdv-${index}" class="w-full text-sm bg-white rounded-md shadow border border-gray-200 mb-4">
                <thead class="bg-red-700 text-white text-sm text-center">
                    <tr>
                        <th class="p-3">Foto</th>
                        <th class="p-3">Isla</th>
                        <th class="p-3">Concepto</th>
                        <th class="p-3">Alto</th>
                        <th class="p-3">Ancho</th>
                        <th class="p-3">Material</th>
                        <th class="p-3">Precio/M.Prima</th>
                        <th class="p-3">Precio Unitario</th>
                        <th class="p-3">Unidades</th>
                        <th class="p-3">Margen</th>
                        <th class="p-3">Total</th>
                        <th class="p-3">Escaparate</th>
                        <th class="p-3">Total Escaparate</th>
                        <th class="p-3">Montaje</th>
                        <th class="p-3">OBS</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>

            <div class="flex justify-end mt-2">
                <button class="add-row bg-red-700 text-white px-3 py-1 rounded hover:bg-red-800 transition"
                        data-target="tabla-pdv-${index}">
                    + Añadir línea
                </button>
            </div>
        `;
    }

    initializePDVEvents(pdvDiv, index) {
        // Botón para agregar fila
        const addRowBtn = pdvDiv.querySelector('.add-row');
        if (addRowBtn) {
            addRowBtn.addEventListener('click', () => this.agregarFila(index));
        }

        // Botón para eliminar PDV
        const deleteBtn = pdvDiv.querySelector('.eliminar-pdv');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => pdvDiv.remove());
        }
    }

    agregarFila(tableIndex) {
        const table = document.getElementById(`tabla-pdv-${tableIndex}`);
        if (!table) return;

        const tbody = table.querySelector('tbody');
        const esFilaInicial = tbody.children.length === 0;
        const newRow = document.createElement('tr');
        newRow.classList.add('border-b', 'text-center');

        newRow.innerHTML = this.generarTemplateFilaPDV(esFilaInicial);
        tbody.appendChild(newRow);

        // Inicializar eventos de la nueva fila
        this.initializeRowEvents(newRow, esFilaInicial);
    }

    generarTemplateFilaPDV(esFilaInicial = false) {
        return `
            <td class="p-2">
                ${esFilaInicial ? `
                    <input type="file" class="file-input hidden">
                    <button class="upload-btn w-full p-1.5 text-sm border border-gray-300 rounded bg-gray-50">
                        Subir foto
                    </button>
                ` : ''}
            </td>
            <td class="p-2">
                ${esFilaInicial ? `
                    <select class="isla w-full p-1.5 border rounded">
                        <option value="">Seleccionar</option>
                        <option value="GC">GC</option>
                        <option value="TFE">TFE</option>
                        <option value="LZT">LZT</option>
                        <option value="FTV">FTV</option>
                        <option value="HIERRO">HIERRO</option>
                        <option value="GOMERA">GOMERA</option>
                        <option value="PALMA">PALMA</option>
                    </select>
                ` : ''}
            </td>
            <td class="p-2">
                <input type="text" class="w-full p-1.5 border rounded text-sm" placeholder="Concepto">
            </td>
            <td class="p-2">
                <input type="number" step="0.01" class="dimension w-16 p-1.5 border rounded text-sm" placeholder="Alto">
            </td>
            <td class="p-2">
                <input type="number" step="0.01" class="dimension w-16 p-1.5 border rounded text-sm" placeholder="Ancho">
            </td>
            <td class="p-2">
                <select class="material w-full p-1.5 border rounded">
                    <option value="">Seleccionar</option>
                    ${this.generarOpcionesMateriales()}
                </select>
            </td>
            <td class="p-2">
                <input type="number" step="0.01" class="precio-mp w-20 p-1.5 border rounded">
            </td>
            <td class="p-2">
                <input type="number" step="0.01" class="precio-unitario w-20 p-1.5 border rounded">
            </td>
            <td class="p-2">
                <input type="number" class="unidades w-16 p-1.5 border rounded text-sm" value="1">
            </td>
            <td class="p-2">
                <input type="number" step="0.01" class="margen w-20 p-1.5 border rounded">
            </td>
            <td class="p-2">
                <input type="number" step="0.01" class="total w-20 p-1.5 border rounded">
            </td>
            <td class="p-2">
                ${esFilaInicial ? `
                    <input type="text" class="escaparate w-24 p-1.5 border rounded">
                ` : ''}
            </td>
            <td class="p-2">
                ${esFilaInicial ? `
                    <input type="number" step="0.01" class="total-escaparate w-24 p-1.5 border rounded">
                ` : ''}
            </td>
            <td class="p-2">
                ${esFilaInicial ? `
                    <input type="number" step="0.01" class="montaje w-20 p-1.5 border rounded">
                ` : ''}
            </td>
            <td class="p-2">
                ${esFilaInicial ? `
                    <input type="text" step="0.01" class="obs w-20 p-1.5 border rounded">
                ` : ''}
        `;
    }

    generarOpcionesMateriales() {
        return Object.entries(this.materialesDisponibles)
            .map(([nombre, precio]) => `<option value="${nombre}">${nombre}</option>`)
            .join('');
    }

    initializeRowEvents(row, esFilaInicial) {
        if (esFilaInicial) {
            // Manejo de foto
            const uploadBtn = row.querySelector('.upload-btn');
            const fileInput = row.querySelector('.file-input');
            
            if (uploadBtn && fileInput) {
                uploadBtn.addEventListener('click', () => fileInput.click());
                fileInput.addEventListener('change', (e) => this.handleFileUpload(e, uploadBtn));
            }
        }

        // Manejo de cálculos
        const material = row.querySelector('.material');
        if (material) {
            material.addEventListener('change', () => this.actualizarPrecioMP(row));
        }

        // Eventos para cálculos automáticos
        ['dimension', 'precio-unitario', 'unidades'].forEach(className => {
            const input = row.querySelector(`.${className}`);
            input?.addEventListener('input', () => this.calcularTotales(row));
        });
    }

    handleFileUpload(event, button) {
        const file = event.target.files[0];
        if (file) {
            button.textContent = file.name;
            button.classList.add('bg-green-50', 'text-green-700', 'border-green-300');
        }
    }

    actualizarPrecioMP(row) {
        const material = row.querySelector('.material');
        const precioMP = row.querySelector('.precio-mp');
        if (material && precioMP) {
            const materialSeleccionado = material.value;
            precioMP.value = this.materialesDisponibles[materialSeleccionado] || '';
            this.calcularTotales(row);
        }
    }

    calcularTotales(row) {
        const alto = parseFloat(row.querySelector('input[placeholder="Alto"]').value) || 0;
        const ancho = parseFloat(row.querySelector('input[placeholder="Ancho"]').value) || 0;
        const precioUnitario = parseFloat(row.querySelector('.precio-unitario').value) || 0;
        const unidades = parseInt(row.querySelector('.unidades').value) || 1;

        const total = (alto * ancho * precioUnitario * unidades).toFixed(2);
        row.querySelector('.total').value = total;

        this.actualizarTotalPDV(row.closest('table'));
    }

    actualizarTotalPDV(table) {
        const totales = Array.from(table.querySelectorAll('.total'))
            .map(input => parseFloat(input.value) || 0);
        
        const totalPDV = totales.reduce((sum, value) => sum + value, 0).toFixed(2);
        const inputTotalPDV = table.querySelector('tfoot input');
        if (inputTotalPDV) {
            inputTotalPDV.value = totalPDV;
        }
    }

    async cargarMateriales() {
        try {
            const res = await fetchWithAuth('/api/materialesPresupuesto');
            if (!res.ok) throw new Error('Error al cargar materiales');
            const data = await res.json();
            console.log('Datos de materiales recibidos en PDVManager:', data);

            // Actualizar materialesDisponibles
            this.materialesDisponibles = {};
            if (data.materiales && Array.isArray(data.materiales)) {
                data.materiales.forEach(material => {
                    if (material.nombre && material.importe !== undefined) {
                        this.materialesDisponibles[material.nombre] = material.importe;
                    }
                });
            }
            console.log('Materiales disponibles en PDVManager:', this.materialesDisponibles);

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
                    this.actualizarPrecioMP(select.closest('tr'));
                }
            });
        } catch (error) {
            console.error('Error al cargar materiales en PDVManager:', error);
        }
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        if (typeof requireAuth === 'function' && !requireAuth()) {
            console.log('Usuario no autenticado');
            return;
        }
        window.pdvManager = new PDVManager();
        await window.pdvManager.cargarMateriales();
    });
} else {
    if (typeof requireAuth === 'function' && requireAuth()) {
        window.pdvManager = new PDVManager();
        window.pdvManager.cargarMateriales();
    }
} 