/**
 * @file api.js
 * @description Módulo central para la comunicación con la API de Supabase.
 * Proporciona funciones para interactuar con las tablas de productos, clientes y ventas.
 */

// Configuración de conexión con Supabase
export const SUPABASE_URL = 'https://tfpfqxisdmldonulhuny.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcGZxeGlzZG1sZG9udWxodW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDM1OTIsImV4cCI6MjA4Nzc3OTU5Mn0.E3vcjAhRJ1B1YebvpXXEVP4al9hQJTe390VNRwJg_zc';

/**
 * Función genérica para realizar peticiones HTTP a la REST API de Supabase.
 * Maneja la autenticación, cabeceras y errores comunes de red.
 * 
 * @param {string} endpoint - El path del recurso (ej: '/rest/v1/producto')
 * @param {RequestInit} [options={}] - Opciones de la Fetch API (method, body, headers, etc.)
 * @returns {Promise<any>} Los datos parseados de la respuesta o un objeto de éxito.
 * @throws {Error} Si la respuesta no es satisfactoria.
 */
export async function fetchSupabase(endpoint, options = {}) {
    const defaultHeaders = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${SUPABASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Detalles del error de Supabase:', errorBody);
            throw new Error(`Error de Supabase (${response.status}): ${errorBody}`);
        }

        // Manejo de 204 No Content (exitoso sin body)
        if (response.status === 204) return { success: true };

        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    } catch (error) {
        console.error('Error fetching data from Supabase:', error);
        throw error;
    }
}

/**
 * Obtiene todos los productos de la base de datos.
 * Utiliza un join relacional para traer la información del tipo de producto.
 * 
 * @returns {Promise<Array>} Lista de productos con sus categorías.
 */
export async function getProducts() {
    return await fetchSupabase('/rest/v1/producto?select=*,tipo_producto(*)');
}

/**
 * Registra un nuevo cliente en el sistema.
 * 
 * @param {Object} userData - Datos del cliente (nombres, apellidos, email, documento, telefono, direccion).
 * @returns {Promise<Object>} El registro del cliente creado.
 */
export async function registerUser(userData) {
    return await fetchSupabase('/rest/v1/cliente', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
            'Prefer': 'return=representation'
        }
    });
}

/**
 * Busca un cliente por sus credenciales (email y teléfono como "contraseña").
 * 
 * @param {string} email - Correo del cliente.
 * @param {string} telefono - Teléfono del cliente.
 * @returns {Promise<Array>} Array con el cliente encontrado o vacío si no coincide.
 */
export async function loginUser(email, telefono) {
    const response = await fetchSupabase(`/rest/v1/cliente?email=eq.${encodeURIComponent(email)}&telefono=eq.${encodeURIComponent(telefono)}&select=*`);
    return response;
}

/**
 * Registra un nuevo encabezado de venta (pedido).
 * 
 * @param {Object} ventaData - Información de la venta (id_cliente, total, estado, metodo_pago).
 * @returns {Promise<Object>} La venta creada incluyendo el ID generado por la DB.
 */
export async function crearVenta(ventaData) {
    return await fetchSupabase('/rest/v1/venta', {
        method: 'POST',
        body: JSON.stringify(ventaData),
        headers: {
            'Prefer': 'return=representation'
        }
    });
}

/**
 * Registra los detalles individuales de una venta.
 * Soporta inserción masiva mediante un array de objetos.
 * 
 * @param {Array<Object>} detallesData - Lista de detalles (id_venta, id_producto, cantidad, precio_unitario, subtotal).
 * @returns {Promise<Array>} Lista de detalles registrados.
 */
export async function crearDetalleVenta(detallesData) {
    return await fetchSupabase('/rest/v1/detalle_venta', {
        method: 'POST',
        body: JSON.stringify(detallesData),
        headers: {
            'Prefer': 'return=representation'
        }
    });
}
