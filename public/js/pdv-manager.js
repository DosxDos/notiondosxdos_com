class PDVManager {
    constructor() {
        this.materialesDisponibles = {};
        // Esperamos a que el DOM esté listo antes de inicializar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeEventListeners();
            });
        } else {
            this.initializeEventListeners();
        }
    }

    initializeEventListeners() {
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
    }

    generarTemplatePDV(index) {
        return `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-semibold text-gray-800">PDV</h2>
                <button class="eliminar-pdv text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i> Eliminar PDV
                </button>
            </div>
            <input type="text" placeholder="Nombre del punto de venta" 
                   class="mb-4 w-full p-2 border rounded text-sm">

            <table id="tabla-pdv-${index}" class="w-full text-sm bg-white rounded-md shadow border border-gray-200 mb-4">
                <thead class="bg-red-700 text-white text-sm text-center">
                    <tr>
                        <th class="p-3">Foto</th>
                        <th class="p-3">Concepto</th>
                        <th class="p-3">Alto</th>
                        <th class="p-3">Ancho</th>
                        <th class="p-3">Material</th>
                        <th class="p-3">Precio/M.Prima</th>
                        <th class="p-3">Precio Unitario</th>
                        <th class="p-3">Unidades</th>
                        <th class="p-3">Total</th>
                        <th class="p-3">Escaparate</th>
                        <th class="p-3">Total Escaparate</th>
                        <th class="p-3">Montaje</th>
                        <th class="p-3">Acciones</th>
                    </tr>
                </thead>
                <tbody></tbody>
                <tfoot>
                    <tr>
                        <td colspan="9"></td>
                        <td class="p-2 font-bold text-right">Total PDV:</td>
                        <td class="p-2 text-center">
                            <input type="number" class="w-24 p-1.5 border rounded text-right" readonly>
                        </td>
                        <td colspan="2"></td>
                    </tr>
                </tfoot>
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
        const newRow = document.createElement('tr');
        newRow.classList.add('border-b', 'text-center');

        newRow.innerHTML = this.generarTemplateFilaPDV();
        tbody.appendChild(newRow);

        // Inicializar eventos de la nueva fila
        this.initializeRowEvents(newRow);
    }

    generarTemplateFilaPDV() {
        return `
            <td class="p-2">
                <input type="file" class="file-input hidden">
                <button class="upload-btn w-full p-1.5 text-sm border border-gray-300 rounded bg-gray-50">
                    Subir foto
                </button>
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
                <input type="number" step="0.01" class="precio-mp w-20 p-1.5 border rounded" readonly>
            </td>
            <td class="p-2">
                <input type="number" step="0.01" class="precio-unitario w-20 p-1.5 border rounded">
            </td>
            <td class="p-2">
                <input type="number" class="unidades w-16 p-1.5 border rounded text-sm" value="1">
            </td>
            <td class="p-2">
                <input type="number" step="0.01" class="total w-20 p-1.5 border rounded" readonly>
            </td>
            <td class="p-2">
                <input type="text" class="escaparate w-24 p-1.5 border rounded">
            </td>
            <td class="p-2">
                <input type="number" step="0.01" class="total-escaparate w-24 p-1.5 border rounded" readonly>
            </td>
            <td class="p-2">
                <input type="number" step="0.01" class="montaje w-20 p-1.5 border rounded">
            </td>
            <td class="p-2">
                <button class="eliminar-fila text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    }

    generarOpcionesMateriales() {
        return Object.entries(this.materialesDisponibles)
            .map(([nombre, precio]) => `<option value="${nombre}">${nombre}</option>`)
            .join('');
    }

    initializeRowEvents(row) {
        // Manejo de foto
        const uploadBtn = row.querySelector('.upload-btn');
        const fileInput = row.querySelector('.file-input');
        
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e, uploadBtn));

        // Manejo de cálculos
        const material = row.querySelector('.material');
        material.addEventListener('change', () => this.actualizarPrecioMP(row));

        // Eventos para cálculos automáticos
        ['dimension', 'precio-unitario', 'unidades'].forEach(className => {
            const input = row.querySelector(`.${className}`);
            input?.addEventListener('input', () => this.calcularTotales(row));
        });

        // Botón eliminar fila
        const deleteBtn = row.querySelector('.eliminar-fila');
        deleteBtn?.addEventListener('click', () => row.remove());
    }

    handleFileUpload(event, button) {
        const file = event.target.files[0];
        if (file) {
            button.textContent = file.name;
            button.classList.add('bg-green-50', 'text-green-700', 'border-green-300');
        }
    }

    actualizarPrecioMP(row) {
        const material = row.querySelector('.material').value;
        const precioMP = row.querySelector('.precio-mp');
        precioMP.value = this.materialesDisponibles[material] || '';
        this.calcularTotales(row);
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

    // Método para cargar los materiales disponibles
    async cargarMateriales() {
        try {
            if (typeof fetchWithAuth !== 'function') {
                console.error('fetchWithAuth no está definido. Asegúrate de que auth.js está cargado.');
                return;
            }

            const response = await fetchWithAuth('/api/recogerModuloZoho?modulo=PreciosMaterialesYServ');
            if (!response.ok) {
                throw new Error(`Error al cargar materiales: ${response.status}`);
            }
            const data = await response.json();
            
            if (!data || !data.proveedores) {
                throw new Error('Formato de respuesta inválido');
            }

            this.materialesDisponibles = {};
            data.proveedores.forEach(material => {
                if (material.nombre && material.precio) {
                    this.materialesDisponibles[material.nombre] = material.precio;
                }
            });
        } catch (error) {
            console.error('Error al cargar materiales:', error);
            // Materiales de prueba por defecto
            this.materialesDisponibles = {
                "Vinilo ácido": 12.5,
                "Foam 5mm": 7.2,
                "Metacrilato": 15.0
            };
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