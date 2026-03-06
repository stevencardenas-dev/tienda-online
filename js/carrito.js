/**
 * @file carrito.js
 * @description Gestión de la lógica del carrito de compras.
 * Controla el renderizado de items, actualización de cantidades, eliminación
 * de productos y el proceso de finalización de compra (Checkout) en la base de datos.
 */

import { showNotification } from './app.js';

/**
 * Renderiza los productos almacenados en el carrito dentro del contenedor de la página.
 * Calcula subtotales y totales en tiempo real.
 */
export function renderCarrito() {
    const contenedor = document.getElementById('carrito-contenedor');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');

    if (!contenedor) return;

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Mostrar estado vacío si no hay items
    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 3rem 0; color: var(--text-slate-500);">
                <span class="material-symbols-outlined" style="font-size: 4rem; opacity: 0.5; margin-bottom: 1rem;">shopping_cart</span>
                <h2>Tu carrito está vacío</h2>
                <p style="margin-bottom: 2rem;">¿Aún no te has decidido? Tenemos productos increíbles esperándote.</p>
                <a href="index.html" class="btn-primary" style="text-decoration: none; display: inline-block;">Explorar Productos</a>
            </div>
        `;
        subtotalEl.textContent = '$0.00';
        totalEl.textContent = '$0.00';
        return;
    }

    let subtotal = 0;
    contenedor.innerHTML = '';

    // Generar dinámicamente cada fila del carrito
    carrito.forEach((item, index) => {
        const itemTotal = item.precio * item.cantidad;
        subtotal += itemTotal;

        const nombreImagen = item.nombre ? item.nombre + '.jfif' : '';
        const imagen = item.nombre ? `assets/imagenes/${nombreImagen}` : 'https://via.placeholder.com/300';

        const card = document.createElement('div');
        card.className = 'cart-item';
        // Estilos inline para asegurar el diseño premium del carrito
        card.style.cssText = `
            display: grid;
            grid-template-columns: 120px 1fr auto;
            gap: 1.5rem;
            background: white;
            border: 1px solid var(--border-slate-200);
            border-radius: 1rem;
            padding: 1rem;
            align-items: center;
        `;

        card.innerHTML = `
            <div class="cart-item-image" style="width: 100%; height: 120px; border-radius: 0.5rem; overflow: hidden; background: #f1f5f9;">
                <img src="${imagen}" alt="${item.nombre}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            
            <div class="cart-item-info">
                <h3 style="margin: 0 0 0.5rem 0; font-size: 1.125rem;">${item.nombre}</h3>
                <p style="margin: 0 0 1rem 0; color: var(--text-slate-500); font-weight: 600;">$${item.precio}</p>
                
                <div class="cart-item-quantity" style="display: flex; align-items: center; gap: 0.5rem; background: var(--background-light); width: fit-content; padding: 0.25rem; border-radius: 0.5rem;">
                    <button class="btn-decrease" data-index="${index}" style="background: white; border: 1px solid var(--border-slate-200); width: 28px; height: 28px; border-radius: 0.25rem; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                        <span class="material-symbols-outlined" style="font-size: 1.25rem;">remove</span>
                    </button>
                    <span style="font-weight: 600; min-width: 2ch; text-align: center;">${item.cantidad}</span>
                    <button class="btn-increase" data-index="${index}" style="background: white; border: 1px solid var(--border-slate-200); width: 28px; height: 28px; border-radius: 0.25rem; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                        <span class="material-symbols-outlined" style="font-size: 1.25rem;">add</span>
                    </button>
                </div>
            </div>
            
            <div class="cart-item-actions" style="display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; height: 100%;">
                <span style="font-weight: 800; font-size: 1.25rem; color: var(--primary);">$${itemTotal.toFixed(2)}</span>
                <button class="btn-remove" data-index="${index}" style="background: none; border: none; color: #ef4444; display: flex; align-items: center; gap: 0.25rem; cursor: pointer; padding: 0; margin-top: auto;">
                    <span class="material-symbols-outlined" style="font-size: 1.25rem;">delete</span> Eliminar
                </button>
            </div>
        `;

        contenedor.appendChild(card);
    });

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    totalEl.textContent = `$${subtotal.toFixed(2)}`;

    attachEventListeners();
}

/**
 * Vincula los eventos de clic a los botones de incremento, decremento y eliminación.
 */
function attachEventListeners() {
    document.querySelectorAll('.btn-increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.currentTarget.getAttribute('data-index');
            updateQuantity(index, 1);
        });
    });

    document.querySelectorAll('.btn-decrease').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.currentTarget.getAttribute('data-index');
            updateQuantity(index, -1);
        });
    });

    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.currentTarget.getAttribute('data-index');
            removeItem(index);
        });
    });
}

/**
 * Actualiza la cantidad de un item específico en el carrito.
 * 
 * @param {number|string} index - Índice del elemento en el array del carrito.
 * @param {number} delta - Cambio en la cantidad (+1 o -1).
 */
function updateQuantity(index, delta) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carrito[index]) {
        carrito[index].cantidad += delta;

        if (carrito[index].cantidad <= 0) {
            carrito.splice(index, 1);
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderCarrito();
    }
}

/**
 * Elimina un producto por completo del carrito.
 * 
 * @param {number|string} index - Índice del elemento a eliminar.
 */
function removeItem(index) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderCarrito();
}

/**
 * Inicialización al cargar el DOM. Solo se ejecuta si existe el contenedor del carrito.
 */
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('carrito-contenedor')) {
        renderCarrito();
        setupCheckout();
    }
});

/**
 * Gestiona el proceso de compra.
 * Valida la sesión de usuario, crea el registro de venta y sus detalles en Supabase.
 */
function setupCheckout() {
    const btnCheckout = document.getElementById('btn-checkout');
    if (!btnCheckout) return;

    btnCheckout.addEventListener('click', async () => {
        const userId = localStorage.getItem('userId');

        // Validación de sesión
        if (!userId) {
            alert('Debes iniciar sesión para completar tu compra.');
            window.location.href = 'registro.html';
            return;
        }

        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        if (carrito.length === 0) {
            alert('Tu carrito está vacío.');
            return;
        }

        try {
            btnCheckout.textContent = 'Procesando pago...';
            btnCheckout.disabled = true;

            // Importación dinámica para evitar carga innecesaria si no se usa
            const { crearVenta, crearDetalleVenta } = await import('./api.js');

            const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

            // 1. Crear el registro maestro de la Venta
            const ventaData = {
                id_cliente: parseInt(userId, 10),
                total: subtotal,
                estado: 'PAGADA',
                metodo_pago: 'TRANSFERENCIA'
            };

            const ventaFetchOpts = await crearVenta(ventaData);

            // Manejo de flexibilidad en la respuesta de la base de datos (id vs id_venta)
            let idVenta;
            if (ventaFetchOpts && ventaFetchOpts.length > 0) {
                idVenta = ventaFetchOpts[0].id_venta || ventaFetchOpts[0].id;
            } else {
                idVenta = ventaFetchOpts.id_venta || ventaFetchOpts.id;
            }

            if (!idVenta) {
                throw new Error('No se pudo obtener el ID de la venta asignado por la base de datos');
            }

            // 2. Preparar e insertar los registros de Detalle Venta
            const detallesData = carrito.map(item => {
                const prodId = parseInt(item.id || item.id_producto, 10);

                if (isNaN(prodId)) {
                    throw new Error('ID de producto inválido en el carrito.');
                }

                return {
                    id_venta: idVenta,
                    id_producto: prodId,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio,
                    subtotal: item.cantidad * item.precio
                };
            });

            await crearDetalleVenta(detallesData);

            // 3. Notificación de éxito y limpieza de estado
            showNotification({
                title: '¡Compra Exitosa!',
                message: 'Tu pedido está siendo procesado. ¡Gracias por confiar en nosotros!',
                type: 'success',
                icon: 'verified_user'
            });

            localStorage.removeItem('carrito');
            // Redireccionar al inicio tras breve pausa
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2500);

        } catch (error) {
            console.error('Error al procesar el pago:', error);
            showNotification({
                title: 'Error en el Pago',
                message: 'Hubo un problema al procesar tu compra. Intenta de nuevo.',
                type: 'error',
                icon: 'error'
            });
            btnCheckout.textContent = 'Proceder al Pago';
            btnCheckout.disabled = false;
        }
    });
}
