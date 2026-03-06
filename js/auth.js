/**
 * @file auth.js
 * @description Gestión de la autenticación de usuarios.
 * Maneja el registro de nuevos clientes, el inicio de sesión y la navegación SPA
 * entre las vistas de registro y login en registro.html.
 */

import { registerUser, loginUser } from './api.js';
import { updateCartCount } from './app.js';

/**
 * Inicialización de la lógica de autenticación al cargar el DOM.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Actualizar contador inicial del carrito en el header
    updateCartCount();

    // Elementos de navegación SPA (Single Page Application)
    const viewRegister = document.getElementById('view-register');
    const viewLogin = document.getElementById('view-login');
    const linkToLogin = document.getElementById('link-to-login');
    const linkToRegister = document.getElementById('link-to-register');
    const mensajeDiv = document.getElementById('mensaje');

    // Formularios
    const formRegistro = document.getElementById('registro-form');
    const formLogin = document.getElementById('login-form');

    // Botones de acción
    const btnRegistro = document.getElementById('btn-registro');
    const btnLogin = document.getElementById('btn-login');

    /**
     * Lógica de alternancia (Toggle) entre Vista Registro y Vista Login.
     */
    if (linkToLogin && linkToRegister && viewRegister && viewLogin) {
        linkToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            viewRegister.style.display = 'none';
            viewLogin.style.display = 'block';
            if (mensajeDiv) mensajeDiv.style.display = 'none';
        });

        linkToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            viewLogin.style.display = 'none';
            viewRegister.style.display = 'block';
            if (mensajeDiv) mensajeDiv.style.display = 'none';
        });

        // Inicializar la vista correcta basándose en parámetros de la URL (ej: ?view=login)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('view') === 'login') {
            viewRegister.style.display = 'none';
            viewLogin.style.display = 'block';
        }
    }

    /**
     * Manejo del formulario de REGISTRO.
     * Captura los datos, los envía a Supabase y gestiona la respuesta/errores.
     */
    if (formRegistro) {
        formRegistro.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Extraer valores de los campos
            const nombres = document.getElementById('nombres').value;
            const apellidos = document.getElementById('apellidos').value;
            const email = document.getElementById('email').value;
            const documento = document.getElementById('documento').value;
            const telefono = document.getElementById('telefono').value;
            const direccion = document.getElementById('direccion').value;

            // Bloquear UI durante el proceso
            btnRegistro.disabled = true;
            btnRegistro.textContent = 'Procesando...';
            mensajeDiv.style.display = 'none';

            try {
                const userData = { nombres, apellidos, email, documento, telefono, direccion };
                const response = await registerUser(userData);

                mensajeDiv.textContent = '¡Registro exitoso! Iniciando sesión...';
                mensajeDiv.className = 'success';
                mensajeDiv.style.display = 'block';

                // Almacenar datos de sesión localmente
                localStorage.setItem('userName', nombres);

                // Manejo resiliente del ID retornado por Supabase
                if (response && response.length > 0 && response[0].id_cliente) {
                    localStorage.setItem('userId', response[0].id_cliente);
                } else if (response && response.id_cliente) {
                    localStorage.setItem('userId', response.id_cliente);
                }

                // Redirigir al inicio tras éxito
                setTimeout(() => window.location.href = 'index.html', 1000);
            } catch (error) {
                console.error('Error en el registro:', error);
                mensajeDiv.textContent = 'Hubo un error al registrarte. Verifica tus datos.';
                mensajeDiv.className = 'error';
                mensajeDiv.style.display = 'block';
            } finally {
                btnRegistro.disabled = false;
                btnRegistro.textContent = 'Registrarse';
            }
        });
    }

    /**
     * Manejo del formulario de LOGIN.
     * Verifica las credenciales contra la base de datos de clientes.
     */
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const telefono = document.getElementById('login-telefono').value;

            btnLogin.disabled = true;
            btnLogin.textContent = 'Verificando...';
            mensajeDiv.style.display = 'none';

            try {
                const results = await loginUser(email, telefono);

                if (results && results.length > 0) {
                    const usuario = results[0];
                    mensajeDiv.textContent = '¡Bienvenido de vuelta!';
                    mensajeDiv.className = 'success';
                    mensajeDiv.style.display = 'block';

                    // Guardar UserId y Nombre para uso global en la App
                    localStorage.setItem('userId', usuario.id_cliente || usuario.id);
                    localStorage.setItem('userName', usuario.nombres);

                    setTimeout(() => window.location.href = 'index.html', 800);
                } else {
                    throw new Error('Credenciales inválidas');
                }
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                mensajeDiv.textContent = 'Correo o teléfono incorrectos.';
                mensajeDiv.className = 'error';
                mensajeDiv.style.display = 'block';
            } finally {
                btnLogin.disabled = false;
                btnLogin.textContent = 'Ingresar';
            }
        });
    }
});
