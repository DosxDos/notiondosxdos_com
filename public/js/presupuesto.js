document.addEventListener('DOMContentLoaded', () => {
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

