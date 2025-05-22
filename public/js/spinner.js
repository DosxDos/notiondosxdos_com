class Spinner {
    constructor() {
        this.spinnerHTML = `
            <div id="spinner" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
                <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-700"></div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', this.spinnerHTML);
        this.spinner = document.getElementById('spinner');
    }

    show() {
        this.spinner.classList.remove('hidden');
    }

    hide() {
        this.spinner.classList.add('hidden');
    }
}

// Crear instancia global
window.spinner = new Spinner();