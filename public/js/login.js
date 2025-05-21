document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#loginForm');
    const errorMessage = document.getElementById('error-message');
    
    if (!form) {
        console.error('No se encontró el formulario de login');
        return;
    }

    console.log('Formulario de login inicializado');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Formulario enviado');
        
        const email = form.querySelector('input[name="email"]').value;
        const password = form.querySelector('input[name="password"]').value;
        
        try {
            console.log('Enviando petición de login...');
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            console.log('Respuesta recibida:', response.status);
            const data = await response.json();
            console.log('Datos de la respuesta:', data);
            
            if (response.ok && data.token) {
                console.log('Login exitoso, guardando token...');
                localStorage.setItem('token', data.token);
                console.log('Token guardado:', data.token);
                console.log('Navegando a /presupuestos con autenticación...');
                await navigateWithAuth('/presupuestos');
            } else {
                console.error('Error de login:', data);
                errorMessage.textContent = data.message || 'Error al iniciar sesión';
                errorMessage.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error en la petición:', error);
            errorMessage.textContent = 'Error al intentar conectar con el servidor';
            errorMessage.classList.remove('hidden');
        }
    });
}); 