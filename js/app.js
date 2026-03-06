/**
 * @file app.js
 * @description Lógica principal de la aplicación. Gestiona la visualización de productos,
 * filtrado, búsqueda dinámica, gestión de sesión de usuario y notificaciones.
 */

import { getProducts } from './api.js';

/** @type {Array} Almacén global de productos cargados desde la API */
let todosLosProductos = [];

/**
 * Inicialización de la aplicación al cargar el DOM.
 * Configura el estado inicial, verifica la sesión y prepara los componentes principales.
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('App iniciada. Lista para integrarse con Supabase.');

    try {
        todosLosProductos = await getProducts();
        renderProductos(todosLosProductos);
        setupFiltros();
    } catch (error) {
        console.error('Error al iniciar la app:', error);
        const contenedor = document.getElementById('productos');
        if (contenedor) {
            contenedor.innerHTML = '<p class="error">Error al cargar los productos. Por favor, intenta más tarde.</p>';
        }
    }

    // Lógica para verificar sesión en la barra de navegación
    const userName = localStorage.getItem('userName');
    const btnRegister = document.getElementById('btn-register');
    const btnUser = document.getElementById('btn-user');
    const userNameDisplay = document.getElementById('user-name-display');

    if (userName && btnRegister && btnUser && userNameDisplay) {
        btnRegister.style.display = 'none';
        btnUser.classList.add('btn-user-logged');
        userNameDisplay.textContent = userName;
        userNameDisplay.style.display = 'inline';
    } else if (btnUser) {
        // Redirigir a registro si no hay sesión iniciada al hacer clic en usuario
        btnUser.addEventListener('click', () => {
            window.location.href = 'registro.html';
        });
    }

    // Inicializar componentes
    setupUserModal();
    updateCartCount();
    setupSearch();
    setupHeroButtons();
});

/**
 * Configura la barra de búsqueda dinámica.
 * Filtra los productos en tiempo real y alterna entre la vista de Inicio y la de Resultados.
 */
function setupSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const heroSection = document.querySelector('.hero');
    const homeCategories = document.getElementById('home-categories');
    const productsSection = document.getElementById('products-section');
    const productsTitle = document.getElementById('products-category-title');

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (query.length > 0) {
            // Mostrar sección de resultados
            if (heroSection) heroSection.style.display = 'none';
            if (homeCategories) homeCategories.style.display = 'none';
            if (productsSection) productsSection.style.display = 'block';
            if (productsTitle) productsTitle.textContent = 'Todos los productos';

            const filtrados = todosLosProductos.filter(prod => {
                const nombre = prod.nombre ? prod.nombre.toLowerCase() : "";
                const categoria = (prod.tipo_producto && prod.tipo_producto.nombre)
                    ? prod.tipo_producto.nombre.toLowerCase()
                    : "";
                return nombre.includes(query) || categoria.includes(query);
            });

            renderProductos(filtrados);
        } else {
            // Restaurar vista de inicio
            if (heroSection) heroSection.style.display = 'flex';
            if (homeCategories) homeCategories.style.display = 'flex';
            if (productsSection) productsSection.style.display = 'none';
        }
    });
}

/**
 * Configura los botones de la sección Hero.
 * Implementa el desplazamiento suave hacia el catálogo o categorías.
 */
function setupHeroButtons() {
    const btnCatalog = document.getElementById('btn-hero-catalog');

    if (btnCatalog) {
        btnCatalog.addEventListener('click', () => {
            const categoriesSection = document.getElementById('home-categories');
            if (categoriesSection) {
                categoriesSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

/**
 * Gestiona el modal de perfil de usuario.
 * Muestra información del usuario logueado y permite cerrar sesión.
 */
function setupUserModal() {
    const btnUser = document.getElementById('btn-user');
    const userModal = document.getElementById('user-modal');
    const closeUserModal = document.getElementById('close-user-modal');
    const btnLogout = document.getElementById('btn-logout');

    const modalInitial = document.getElementById('modal-user-initial');
    const modalName = document.getElementById('modal-user-name');

    if (!userModal || !btnUser) return;

    btnUser.addEventListener('click', (e) => {
        const userName = localStorage.getItem('userName');
        if (userName) {
            e.preventDefault();
            modalName.textContent = userName;
            modalInitial.textContent = userName.charAt(0).toUpperCase();
            userModal.classList.add('active');
        }
    });

    closeUserModal.addEventListener('click', () => {
        userModal.classList.remove('active');
    });

    userModal.addEventListener('click', (e) => {
        if (e.target === userModal) {
            userModal.classList.remove('active');
        }
    });

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            userModal.classList.remove('active');
            window.location.href = 'registro.html?view=login';
        });
    }
}

/**
 * Configura los filtros de categoría tanto en el navbar como en los bloques de la home.
 * Cambia la interfaz entre la vista principal (con Hero) y la vista de categoría (SPA).
 */
function setupFiltros() {
    const triggers = document.querySelectorAll('.nav-link, .category-row-item');
    const heroSection = document.querySelector('.hero');
    const homeCategories = document.getElementById('home-categories');
    const productsSection = document.getElementById('products-section');
    const productsTitle = document.getElementById('products-category-title');

    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();

            const target = e.target.closest('[data-categoria]');
            if (!target) return;

            const categoria = target.getAttribute('data-categoria');
            if (!categoria) return;

            // Gestionar estado visual del menú
            document.querySelectorAll('nav .nav-link').forEach(nav => {
                if (nav.getAttribute('data-categoria') === categoria) {
                    nav.classList.add('active');
                } else {
                    nav.classList.remove('active');
                }
            });

            if (categoria === 'Todas') {
                if (heroSection) heroSection.style.display = 'flex';
                if (homeCategories) homeCategories.style.display = 'grid';
                if (productsSection) productsSection.style.display = 'none';
            } else {
                if (heroSection) heroSection.style.display = 'none';
                if (homeCategories) homeCategories.style.display = 'none';
                if (productsSection) productsSection.style.display = 'block';
                if (productsTitle) productsTitle.textContent = categoria;

                // Filtrado resiliente (acentos y mayúsculas)
                const normalizar = (texto) => texto ? texto.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
                const catObjetivo = normalizar(categoria);

                const filtrados = todosLosProductos.filter(prod => {
                    let catProducto = "";
                    if (prod.tipo_producto && prod.tipo_producto.nombre) {
                        catProducto = prod.tipo_producto.nombre;
                    } else if (typeof prod.tipo_producto === 'string') {
                        catProducto = prod.tipo_producto;
                    }
                    return normalizar(catProducto) === catObjetivo;
                });
                renderProductos(filtrados);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

/**
 * Genera y visualiza las tarjetas de producto en el contenedor principal.
 * 
 * @param {Array<Object>} productos - Lista de objetos de producto a renderizar.
 */
export function renderProductos(productos) {
    const contenedor = document.getElementById('productos');
    if (!contenedor) return;

    if (!productos || productos.length === 0) {
        contenedor.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-slate-500);">No se encontraron productos en esta categoría.</p>';
        return;
    }

    contenedor.innerHTML = '';
    productos.forEach(producto => {
        const card = createProductCard(producto);
        contenedor.appendChild(card);
    });

    // Re-vincular eventos de compra a los nuevos botones renderizados
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const prodData = e.currentTarget.closest('.product-card').dataset;
            const producto = {
                id: parseInt(prodData.id, 10),
                nombre: prodData.nombre,
                precio: parseFloat(prodData.precio)
            };
            agregarAlCarrito(producto);
        });
    });
}

/**
 * Añade un producto al carrito en localStorage y actualiza la UI.
 * 
 * @param {Object} producto - Datos básicos del producto (id, nombre, precio).
 */
function agregarAlCarrito(producto) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    const index = carrito.findIndex(item => item.id === producto.id);
    if (index !== -1) {
        carrito[index].cantidad += 1;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    updateCartCount();

    showNotification({
        title: '¡Producto Añadido!',
        message: `${producto.nombre} ya está en tu carrito.`,
        type: 'success',
        icon: 'shopping_cart'
    });
}

/**
 * Actualiza el contador numérico de items en el icono del carrito (header).
 */
export function updateCartCount() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    const badges = document.querySelectorAll('#cart-count');
    badges.forEach(badge => {
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    });
}

/**
 * Construye el elemento DOM de una tarjeta de producto con sus estilos y datos.
 * 
 * @param {Object} producto - Objeto completo del producto desde Supabase.
 * @returns {HTMLElement} La tarjeta de producto lista para ser insertada.
 */
function createProductCard(producto) {
    const div = document.createElement('div');
    div.className = 'product-card';

    const nombreCategoria = producto.tipo_producto && producto.tipo_producto.nombre
        ? producto.tipo_producto.nombre
        : (producto.tipo_producto || 'General');

    const nombreImagen = producto.nombre ? producto.nombre + '.jfif' : '';
    const imagen = producto.nombre ? `assets/imagenes/${nombreImagen}` : 'https://via.placeholder.com/300';
    const precioOriginal = producto.precio_oferta ? `<span class="price-old">$${producto.precio_oferta}</span>` : '';

    const cardId = producto.id_producto || producto.id;

    div.innerHTML = `
        <div class="product-image">
            <img src="${imagen}" alt="${producto.nombre || 'Producto'}">
            <div class="card-actions">
                <button class="add-btn">
                    <span class="material-symbols-outlined">add_shopping_cart</span>
                    Añadir al Carrito
                </button>
            </div>
        </div>
        <div class="product-info">
            <span class="product-category">${nombreCategoria}</span>
            <h3 class="product-title">${producto.nombre || 'Producto sin nombre'}</h3>
            <div class="product-price">
                <span class="price-current">$${producto.precio || 0}</span>
                ${precioOriginal}
            </div>
        </div>
    `;

    div.dataset.id = cardId;
    div.dataset.nombre = producto.nombre || 'Producto';
    div.dataset.precio = producto.precio || 0;

    return div;
}

/**
 * Crea y muestra un mensaje de notificación (Toast) temporal en la pantalla.
 * 
 * @param {Object} config - Configuración de la notificación.
 * @param {string} config.title - Título en negrita.
 * @param {string} config.message - Mensaje descriptivo.
 * @param {string} [config.type='success'] - Tipo visual: 'success' | 'error' | 'warning'.
 * @param {string} [config.icon='info'] - Nombre del icono de Material symbols.
 */
export function showNotification({ title, message, type = 'success', icon = 'info' }) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    toast.innerHTML = `
        <div class="toast-icon">
            <span class="material-symbols-outlined">${icon}</span>
        </div>
        <div class="toast-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => toast.classList.add('active'), 10);

    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}
