// Variables y elementos iniciales
const productForm = document.getElementById('productForm');
const addProductBtn = document.getElementById('addProductBtn');
const productModal = document.getElementById('productModal');
const closeFormBtn = document.getElementById('closeFormBtn');
const productCategorySelect = document.getElementById('productCategory');

let editProductId = null; // Almacena el ID del producto a editar

// Configuración inicial al cargar la página
document.addEventListener("DOMContentLoaded", initializeUserSession);

function initializeUserSession() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const username = localStorage.getItem('username');
  const userNameElement = document.getElementById('user-name');
  const logoutButton = document.getElementById('logout-btn');

  if (isLoggedIn && username) {
    userNameElement.textContent = `Hola: ${username}`;
    logoutButton.style.display = 'block';
  } else {
    userNameElement.textContent = '';
    logoutButton.style.display = 'none';
  }
}

// Mostrar formulario de agregar producto
addProductBtn.addEventListener('click', async () => {
  editProductId = null; 
  productModal.style.display = 'block';
  document.getElementById('modalTitle').textContent = "Agregar Nuevo Producto";
  await cargarCategorias();
  productForm.reset(); 
});

// Cerrar el formulario
closeFormBtn.addEventListener('click', () => {
  productModal.style.display = 'none';
});

// Cargar productos
async function cargarProductos() {
  try {
    const response = await fetch('https://ecommerce-backend-vevb.onrender.com/api/products/all', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    if (!response.ok) throw new Error(response.statusText);

    const productos = await response.json();
    const productsTable = document.getElementById('productsTable').querySelector('tbody');
    productsTable.innerHTML = ''; 

    productos.forEach(producto => {
      const row = productsTable.insertRow();
      row.innerHTML = `
        <td><img src="${producto.imageUrl}" alt="${producto.nombre}" width="50" height="50"></td>
        <td>${producto.nombre}</td>
        <td>${producto.descripcion}</td>
        <td>${producto.precio}</td>
        <td>${producto.stock}</td>
        <td>${producto.categoria ? producto.categoria.nombre : 'Sin categoría'}</td>
        <td>
          <button onclick="editarProducto(${producto.id})">Editar</button>
          <button onclick="eliminarProducto(${producto.id})">Eliminar</button>
        </td>
      `;
    });
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
}

// Cargar categorías
async function cargarCategorias() {
  try {
    const response = await fetch('https://ecommerce-backend-vevb.onrender.com/api/products/categorias', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    if (!response.ok) throw new Error('Error al obtener categorías');

    const categorias = await response.json();
    productCategorySelect.innerHTML = '<option value="">Seleccione una categoría</option>';

    categorias.forEach(categoria => {
      const option = document.createElement('option');
      option.value = categoria.id;
      option.textContent = categoria.nombre;
      productCategorySelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error en cargarCategorias:', error);
  }
}

// Enviar datos de producto al servidor
productForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const producto = {
    nombre: document.getElementById('productName').value,
    descripcion: document.getElementById('productDescription').value,
    precio: parseFloat(document.getElementById('productPrice').value),
    stock: parseInt(document.getElementById('productStock').value),
    categoriaId: parseInt(productCategorySelect.value),
    imageUrl: document.getElementById('productImageUrl').value
  };

  try {
    const url = editProductId 
      ? `https://ecommerce-backend-vevb.onrender.com/api/products/${editProductId}`
      : `https://ecommerce-backend-vevb.onrender.com/api/products`;

    const response = await fetch(url, {
      method: editProductId ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(producto)
    });

    if (response.ok) {
      await cargarProductos();
      productModal.style.display = 'none';
    } else {
      console.error('Error al guardar el producto:', response.statusText);
    }
  } catch (error) {
    console.error('Error al enviar el producto:', error);
  }
});

// Función para editar producto
async function editarProducto(id) {
  try {
    const response = await fetch(`https://ecommerce-backend-vevb.onrender.com/api/products/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    if (!response.ok) throw new Error('Error al obtener el producto');

    const producto = await response.json();
    document.getElementById('modalTitle').textContent = "Editar Producto";
    document.getElementById('productName').value = producto.nombre;
    document.getElementById('productDescription').value = producto.descripcion;
    document.getElementById('productPrice').value = producto.precio;
    document.getElementById('productStock').value = producto.stock;
    document.getElementById('productImageUrl').value = producto.imageUrl;

    await cargarCategorias(); 
    /////agregue esto para corregir el modal al editar que no mostraba la categoria de la base de datos
    productCategorySelect.value = producto.categoriaId || '';
    editProductId = id; 
    productModal.style.display = 'block';
  } catch (error) {
    console.error('Error al editar producto:', error);
  }
}

// Eliminar producto del servidor
async function eliminarProducto(id) {
  if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
    try {
      const response = await fetch(`https://ecommerce-backend-vevb.onrender.com/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        console.log('Producto eliminado exitosamente');
        await cargarProductos();
      } else {
        console.error('Error al eliminar el producto:', response.statusText);
      }
    } catch (error) {
      console.error('Error en eliminarProducto:', error);
    }
  }
}

// Función para cerrar sesión
function logoutUser() {
  localStorage.removeItem('token');
  localStorage.setItem('isLoggedIn', 'false');
  localStorage.removeItem('username');
  localStorage.removeItem('roleId');
  localStorage.removeItem('cartCount');

  window.location.href = 'index.html';
}

// Buscar productos con autocompletado
document.getElementById('searchInput').addEventListener('input', async function () {
  const searchTerm = this.value.toLowerCase();
  try {
    const response = await fetch(`https://ecommerce-backend-vevb.onrender.com/api/products/search?query=${searchTerm}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    if (!response.ok) throw new Error(response.statusText);

    const productos = await response.json();
    const productsTable = document.getElementById('productsTable').querySelector('tbody');
    productsTable.innerHTML = '';

    productos.forEach(producto => {
      const row = productsTable.insertRow();
      row.innerHTML = `
        <td><img src="${producto.imageUrl}" alt="${producto.nombre}" width="50" height="50"></td>
        <td>${producto.nombre}</td>
        <td>${producto.descripcion}</td>
        <td>${producto.precio}</td>
        <td>${producto.stock}</td>
        <td>${producto.categoria ? producto.categoria.nombre : 'Sin categoría'}</td>
        <td>
          <button class="delete-btn" onclick="eliminarProducto(${producto.id})">Eliminar</button>
          <button onclick="editarProducto(${producto.id})">Editar</button>
        </td>
      `;
    });
  } catch (error) {
    console.error('Error en la búsqueda de productos:', error);
  }
});


// Inicializar carga de productos al cargar la página
cargarProductos();

