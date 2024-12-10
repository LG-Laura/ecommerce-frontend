const items = document.querySelectorAll('.carousel-item');
let currentIndex = 0;

function showNextItem() {
    items[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + 1) % items.length;
    items[currentIndex].classList.add('active');
}

setInterval(showNextItem, 3000); // 
function toggleMenu() {
    const menu = document.querySelector("nav ul");
    const menuRight = document.querySelector(".menu-right");
    menu.classList.toggle("active"); // Alterna el menú principal
    menuRight.classList.toggle("active"); // Alterna la sección de usuario y carrito
}

// Cierra el menú cuando se hace clic en un enlace
document.querySelectorAll("nav ul li a").forEach(link => {
    link.addEventListener("click", () => {
        const menu = document.querySelector("nav ul");
        const menuRight = document.querySelector(".menu-right");
        menu.classList.remove("active");
        menuRight.classList.remove("active");
    });
});

// Oculta el menú al redimensionar la ventana
window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
        const menu = document.querySelector("nav ul");
        const menuRight = document.querySelector(".menu-right");
        menu.classList.remove("active");
        menuRight.classList.remove("active");
    }
});

// Función que se ejecuta al cargar la página
window.onload = function() {
    document.querySelector('.landing').scrollIntoView({ behavior: 'smooth' }); // Mostrar la sección de inicio al cargar
    loadProductsByCategory('todas'); // Cargar todos los productos para mostrarlos al hacer scroll
    updateCartCount(); // Actualiza el conteo del carrito al cargar la página
    updateCartUI();
};

// Función para actualizar el contador del carrito
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || []; // Obtener el carrito desde el almacenamiento local
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0); // Contar la cantidad total de productos
    document.getElementById('cart-count').textContent = cartCount; // Actualizar el contador en la interfaz
}

// Función para cargar productos por categoría
function loadProductsByCategory(category) {
    fetch('https://ecommerce-backend-vevb.onrender.com/products/productosPorCategoria')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener categorías');
            }
            return response.json();
        })
        .then(categorias => {
            const productsContainer = document.getElementById('products-container');
            productsContainer.innerHTML = '';  // Limpiar productos anteriores

            const filteredCategories = category === 'todas' ? categorias : categorias.filter(cat => cat.nombre.toLowerCase() === category);

            filteredCategories.forEach(categoria => {
                const categoriaSection = document.createElement('div');
                categoriaSection.classList.add('category-section');
                categoriaSection.innerHTML = `<h2>${categoria.nombre}</h2>`;

                const categoryProductsContainer = document.createElement('div');
                categoryProductsContainer.classList.add('product-list');

                categoria.productos.forEach(producto => {
                    categoryProductsContainer.innerHTML += `
                        <div class="product-item">
                            <img src="${producto.imageUrl}" alt="${producto.nombre}" />
                            <h3>${producto.nombre}</h3>
                            <p>Precio: $${producto.precio}</p>
                            <span>${producto.precio}</span>
                            <button class="add-to-cart" data-id="${producto.id}" data-name="${producto.nombre}" data-price="${producto.precio}" data-image="${producto.imageUrl}">Agregar al carrito</button>
                        </div>
                    `;
                });
                updateCartCount();

                categoriaSection.appendChild(categoryProductsContainer);
                productsContainer.appendChild(categoriaSection);
            });

            // Agregar event listeners a los botones de agregar al carrito
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', addToCart);
            });
        })
        .catch(error => {
            console.error('Error al cargar productos:', error);
            alert('Error al cargar productos, por favor intente más tarde.');
        });
}

// Función para agregar un producto al carrito
// function addToCart(event) {
//     const button = event.target;
//     const productId = button.getAttribute('data-id');
//     const productName = button.getAttribute('data-name');
//     const productPrice = parseFloat(button.getAttribute('data-price'));
//     const productImage = button.getAttribute('data-image');

//     let cart = JSON.parse(localStorage.getItem('cart')) || [];

//     // Verificar si el producto ya está en el carrito
//     const existingProduct = cart.find(item => item.id === productId);
    
//     if (existingProduct) {
//         existingProduct.quantity = item.precio; // Incrementar cantidad
//     } else {
//         // Agregar nuevo producto
//         cart.push({
//             id: productId,
//             name: productName,
//             price: productPrice,
//             image: productImage,
//             quantity: 1
//         });
//     }

//     localStorage.setItem('cart', JSON.stringify(cart)); // Guardar carrito actualizado
//     updateCartCount(); // Actualizar el contador
// }


document.addEventListener('DOMContentLoaded', () => {
    // Restaurar estado del carrito
    updateCartCount();
});
