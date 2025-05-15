let materialesDisponibles = {}; //variable global de materiales con su precio
let todosLosClientes = [];
let clienteSeleccionado = null;

document.addEventListener('DOMContentLoaded', async () => {
    await cargarMateriales();
    await cargarClientes();

    //Lógica de buscador_cliente

    const inputBuscador = document.getElementById('buscador-cliente');
    const sugerenciasUl = document.getElementById('sugerencias-clientes');
    const nombreClienteSpan = document.getElementById('nombre-cliente');
    const infoCliente = document.getElementById('info-cliente');
    const listaOTs = document.getElementById('lista-ots');
    const botonNuevaOt = document.getElementById('crear-nueva-ot');

    // Autocompletado
    inputBuscador.addEventListener('input', () => {
        const termino = inputBuscador.value.toLowerCase();
        sugerenciasUl.innerHTML = '';
        if (!termino) {
            sugerenciasUl.classList.add('hidden');
            return;
        }

        const filtrados = todosLosClientes.filter(c =>
            c.Account_Name?.toLowerCase().includes(termino) || c.Account_Name?.name?.toLowerCase().includes(termino)
        );

        if (filtrados.length === 0) {
            sugerenciasUl.classList.add('hidden');
            return;
        }

        filtrados.slice(0, 10).forEach(cliente => {
            const li = document.createElement('li');
            li.textContent = cliente.Account_Name?.name || cliente.Account_Name || 'Nombre desconocido';
            li.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
            li.addEventListener('click', async () => {
                clienteSeleccionado = cliente;
                inputBuscador.value = li.textContent;
                sugerenciasUl.classList.add('hidden');
                nombreClienteSpan.textContent = li.textContent;
                infoCliente.classList.remove('hidden');
                await mostrarOTsDelCliente(cliente);
            });
            sugerenciasUl.appendChild(li);
        });

        sugerenciasUl.classList.remove('hidden');
    });

    // Botón nueva OT
    const contenedorFormularioNuevaOt = document.getElementById('formulario-nueva-ot');

    botonNuevaOt.addEventListener('click', () => {
        // Oculta la lista de OTs
        document.getElementById('info-cliente').classList.add('hidden');

        // Muestra el formulario de nueva OT
        contenedorFormularioNuevaOt?.classList.remove('hidden');

        // Si necesitas pasar el nombre del cliente
        const nombre = clienteSeleccionado.Account_Name?.name || 'Nombre desconocido';
        document.getElementById('nombre-cliente-formulario').textContent = nombre;
    });


    async function cargarClientes() {
        try {
            const res = await fetch('/api/recogerModuloZoho?modulo=Clientes');
            const json = await res.json();
            todosLosClientes = json.proveedores || [];
        } catch (err) {
            console.error('Error al cargar clientes:', err);
        }
    }

    async function mostrarOTsDelCliente(cliente) {
        const idCliente = cliente.id;
        try {
            const res = await fetch(`/api/recogerModuloZoho?modulo=OTs&criteria=(Account_Name.id:equals:${idCliente})`);
            const json = await res.json();

            listaOTs.innerHTML = '';
            const ots = json.proveedores || [];

            if (ots.length === 0) {
                listaOTs.innerHTML = '<li class="text-gray-500">Este cliente no tiene OTs registradas.</li>';
                return;
            }

            ots.forEach(ot => {
                const li = document.createElement('li');
                li.innerHTML = `
          <a href="/presupuesto/${ot.C_digo}" class="text-red-700 hover:underline">
            ${ot.Deal_Name || 'OT sin nombre'} (Código: ${ot.C_digo})
          </a>
        `;
                listaOTs.appendChild(li);
            });
        } catch (err) {
            console.error('Error al cargar OTs del cliente:', err);
        }
    }

    //Lógica de ot_existente

    // Traer los materiales desde el backend para mostrar en el select
    async function cargarMateriales() {
        try {
            const res = await fetch('/api/materiales'); // Poner ruta real del backend
            const json = await res.json();

            // Convertimos a diccionario: { nombre: precio }
            materialesDisponibles = {};
            json.data.forEach(material => {
                materialesDisponibles[material.nombre] = material.precio;
            });
        } catch (error) {
            console.warn('No se pudieron cargar los materiales del backend. Se usará una lista de prueba.');
            materialesDisponibles = {
                "Vinilo ácido": 12.5,
                "Foam 5mm": 7.2,
                "Metacrilato": 15.0,
                "Vinilo ácido 2": 13.5,
                "Foam 5mm 2": 7.5,
                "Metacrilato 2": 17.0,
                "Vinilo ácido 3": 14.5,
                "Foam 5mm 3": 9.2,
                "Metacrilato 3": 16.0
            };
        }
    }

    // Botón para añadir filas
    document.querySelectorAll('.add-row').forEach(button => {
        button.addEventListener('click', event => {
            const tableId = event.target.getAttribute('data-target');
            const table = document.getElementById(tableId);
            const tbody = table.querySelector('tbody');

            const newRow = document.createElement('tr');
            newRow.classList.add('border-b', 'text-center');


            newRow.innerHTML = `
        <td class="p-2"><label class="cursor-pointer inline-block px-3 py-1.5 bg-red-700 text-white text-sm rounded hover:bg-red-800">
        Seleccionar archivo<input type="file" accept="image/*" class="hidden file-input"></label>
        </td>
        <td class="p-2"><select class="w-full p-1.5 border border-gray-300 rounded"><option value="">Seleccionar</option></select></td>
        <td class="p-2"><input type="number" placeholder="Alto" step="any" class="w-16 p-1.5 border rounded text-sm"></td>
        <td class="p-2"><input type="number" placeholder="Ancho" step="any" class="w-16 p-1.5 border rounded text-sm"></td>
        <td class="p-2"><select class="w-full p-1.5 border border-gray-300 rounded"><option value="">Seleccionar</option></select></td>
        <td class="p-2"><input type="number" class="w-20 p-1.5 border rounded" placeholder="MP"></td>
        <td class="p-2"><input type="number" class="w-20 p-1.5 border rounded" placeholder="Unitario"></td>
        <td class="p-2"><input type="number" placeholder="Unidades" class="w-16 p-1.5 border rounded text-sm"></td>
        <td class="p-2"><input type="number" class="w-20 p-1.5 border rounded" placeholder="Total"></td>
        <td class="p-2"><input type="number" class="w-20 p-1.5 border rounded" placeholder="Total esc."></td>
        <td class="p-2"><input type="number" class="w-20 p-1.5 border rounded" placeholder="Montaje"></td>
      `;

            // --- Obtener el SELECT de materiales y el input de "Precio MP"
            const selects = newRow.querySelectorAll('select');
            const selectMaterial = selects[1]; // es el segundo select (Material)
            const inputs = newRow.querySelectorAll('input');
            const inputPrecioMP = inputs[3]; // es el 5º input (Precio Materia Prima)

            // --- Poblar el SELECT de materiales
            Object.entries(materialesDisponibles).forEach(([nombre, precio]) => {
                const option = document.createElement('option');
                option.value = nombre;
                option.textContent = nombre;
                selectMaterial.appendChild(option);
            });

            // --- Al seleccionar un material, mostrar su precio automáticamente
            selectMaterial.addEventListener('change', () => {
                const material = selectMaterial.value;
                const precio = materialesDisponibles[material];
                inputPrecioMP.value = precio !== undefined ? precio : '';
            });

            tbody.appendChild(newRow);

            //permitir subir imágenes
            const fileInput = newRow.querySelector('.file-input');
            const cell = fileInput.closest('td');

            fileInput.addEventListener('change', () => {
                const file = fileInput.files[0];
                if (file) {
                    const url = URL.createObjectURL(file);

                    const link = document.createElement('a');
                    link.href = url;
                    link.target = '_blank';
                    link.textContent = 'Ver imagen';
                    link.className = 'block w-full p-1.5 text-sm border border-gray-300 rounded bg-gray-50 text-center text-gray-800 hover:text-black no-underline';

                    cell.innerHTML = ''; // Limpiar celda
                    cell.appendChild(link);
                }
            });

        });
    });

    // Botón "Generar PDF"
    document.getElementById('generar-pdf').addEventListener('click', async () => {
        const data = {
            codigoOT: document.querySelector('p strong').nextSibling.textContent.trim(), // código OT
            puntos_de_venta: []
        };

        document.querySelectorAll('table').forEach((table, index) => {
            const pdvName = document.querySelectorAll('h2')[index]?.textContent.replace('PDV: ', '').trim();
            const rows = table.querySelectorAll('tbody tr');
            const elementos = [];

            rows.forEach(row => {
                const inputs = row.querySelectorAll('input, select');

                // Verifica si los inputs numéricos tienen valores válidos
                const isValid = [...inputs].every(input => {
                    if (input.type === 'number' && input.value !== '') {
                        return !isNaN(parseFloat(input.value));
                    }
                    return true; // si no es number, se ignora
                });

                if (!isValid) {
                    alert('Por favor, asegúrate de que todos los campos numéricos contengan valores válidos.');
                    throw new Error('Valores no numéricos detectados');
                }

                elementos.push({
                    foto: inputs[0]?.value || '',
                    concepto: inputs[1]?.value || '',
                    alto: inputs[2]?.value || '',
                    ancho: inputs[3]?.value || '',
                    material: inputs[4]?.value || '',
                    precioMP: inputs[5]?.value || '',
                    precioUnitario: inputs[6]?.value || '',
                    unidades: inputs[7]?.value || '',
                    total: inputs[8]?.value || '',
                    totalEscaparate: inputs[9]?.value || '',
                    montaje: inputs[10]?.value || ''
                });
            });


            data.puntos_de_venta.push({
                nombre: pdvName,
                elementos
            });
        });

        try {
            const response = await fetch('/api/generar-pdf', { // Poner aquí ruta real del backend
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Error al generar PDF');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Forzar descarga del PDF
            const a = document.createElement('a');
            a.href = url;
            a.download = `Presupuesto_${data.codigoOT}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Ocurrió un error al generar el PDF');
            console.error(err);
        }
    });
});

document.querySelectorAll('.default-file-input').forEach(input => {
    input.addEventListener('change', () => {
        const file = input.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const cell = input.closest('td');

            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.textContent = 'Ver imagen';
            link.className = 'block w-full p-1.5 text-sm border border-gray-300 rounded bg-gray-50 text-center text-gray-800 no-underline hover:text-black';

            cell.innerHTML = '';
            cell.appendChild(link);
        }
    });
});

