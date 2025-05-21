document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#loginForm');
    const errorMessage = document.getElementById('error-message');
    
    if (!form) {
        console.error('No se encontró el formulario de login');
        return;
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = form.querySelector('input[name="email"]').value;
        const password = form.querySelector('input[name="password"]').value;
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                window.location.replace('/presupuestos');
            } else {
                errorMessage.textContent = data.message || 'Error al iniciar sesión';
                errorMessage.classList.remove('hidden');
            }
        } catch (error) {
            errorMessage.textContent = 'Error al intentar conectar con el servidor';
            errorMessage.classList.remove('hidden');
        }
    });
}); 