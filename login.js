document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    const btn = document.querySelector('.btn-login');

    // Estado de carga para dar sensación de procesamiento real
    btn.innerHTML = '<i class="ph ph-spinner-gap" style="animation: spin 1s linear infinite;"></i> Autenticando...';
    btn.disabled = true;
    errorDiv.style.display = 'none';

    setTimeout(() => {
        // Validación de prueba
        if (user === 'admin@uct.cl' && pass === 'admin123') {
            // Guardamos un token de sesión simulado en el navegador
            sessionStorage.setItem('edupay_sesion_activa', 'true');
            // Redirigimos al panel principal (asumiendo que tu dashboard se llama index.html)
            window.location.href = 'index.html'; 
        } else {
            // Error de credenciales
            errorDiv.style.display = 'block';
            btn.innerHTML = 'Acceder al Sistema';
            btn.disabled = false;
        }
    }, 1000); // Simulamos 1 segundo de latencia de red
});