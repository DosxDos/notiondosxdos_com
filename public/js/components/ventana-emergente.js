// Clase para manejar ventanas emergentes personalizadas
class VentanaEmergente {
    constructor() {
        this.modalContainer = null;
        this.init();
    }

    init() {
        // Crear el contenedor modal si no existe
        if (!this.modalContainer) {
            this.modalContainer = document.createElement('div');
            this.modalContainer.id = 'modal-container';
            this.modalContainer.classList.add('hidden', 'fixed', 'inset-0', 'bg-gray-600', 'bg-opacity-50', 'overflow-y-auto', 'h-full', 'w-full', 'flex', 'items-center', 'justify-center', 'z-50');
            document.body.appendChild(this.modalContainer);
        }
    }

    // Muestra una ventana de confirmación con opciones personalizadas
    async mostrarConfirmacion(opciones) {
        const {
            titulo = 'Confirmar',
            mensaje = '¿Estás seguro?',
            textoBotonSi = 'Sí',
            textoBotonNo = 'No',
            claseBotonSi = 'bg-blue-600 hover:bg-blue-700',
            claseBotonNo = 'bg-gray-500 hover:bg-gray-600'
        } = opciones;

        return new Promise((resolve) => {
            // Crear el contenido del modal
            const modalContent = document.createElement('div');
            modalContent.classList.add('bg-white', 'p-6', 'rounded-lg', 'shadow-xl', 'max-w-md', 'mx-auto');
            
            modalContent.innerHTML = `
                <div class="mb-4">
                    <h3 class="text-lg font-medium text-gray-900">${titulo}</h3>
                    <p class="text-gray-600 mt-2">${mensaje}</p>
                </div>
                <div class="flex justify-end space-x-3">
                    <button id="btn-modal-no" class="px-4 py-2 text-white ${claseBotonNo} rounded">${textoBotonNo}</button>
                    <button id="btn-modal-si" class="px-4 py-2 text-white ${claseBotonSi} rounded">${textoBotonSi}</button>
                </div>
            `;
            
            // Limpiar el contenedor modal y añadir el nuevo contenido
            this.modalContainer.innerHTML = '';
            this.modalContainer.appendChild(modalContent);
            
            // Mostrar el modal
            this.modalContainer.classList.remove('hidden');
            
            // Configurar los eventos de los botones
            const btnSi = document.getElementById('btn-modal-si');
            const btnNo = document.getElementById('btn-modal-no');
            
            btnSi.addEventListener('click', () => {
                this.ocultar();
                resolve(true);
            });
            
            btnNo.addEventListener('click', () => {
                this.ocultar();
                resolve(false);
            });
        });
    }

    // Oculta la ventana emergente
    ocultar() {
        if (this.modalContainer) {
            this.modalContainer.classList.add('hidden');
        }
    }
}

// Crear una instancia global
window.ventanaEmergente = new VentanaEmergente(); 