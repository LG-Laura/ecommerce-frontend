// Función que se ejecuta al cargar la página
window.onload = function() {
    document.querySelector('.landing').scrollIntoView({ behavior: 'smooth' }); // Mostrar la sección de inicio al cargar
    loadProductsByCategory('todas'); // Cargar todos los productos para mostrarlos al hacer scroll
};

// Agregar event listeners a cada elemento del menú
document.querySelectorAll('nav a').forEach(menuItem => {
    menuItem.addEventListener('click', function(event) {
        event.preventDefault();
        
        const selectedCategory = this.getAttribute('data-category');

        if (selectedCategory === 'inicio') {
            // Si se selecciona "Inicio", desplazarse a la sección de inicio
            document.querySelector('.landing').scrollIntoView({ behavior: 'smooth' });
        } else {
            // Desplazarse a la sección de productos y cargar los productos de la categoría seleccionada
            document.getElementById('category-products').scrollIntoView({ behavior: 'smooth' });
            loadProductsByCategory(selectedCategory);
        }
    });
});

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

            // Filtrar categorías según la selección (mostrar todas si es 'todas')
            const filteredCategories = category === 'todas' ? categorias : categorias.filter(cat => cat.nombre.toLowerCase() === category);

            // Mostrar categorías según la selección
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
                            <button class="add-to-cart" data-id="${producto.id}">Agregar al carrito</button>
                        </div>
                    `;
                });

                // Añadir productos al contenedor de la categoría
                categoriaSection.appendChild(categoryProductsContainer);
                productsContainer.appendChild(categoriaSection);
            });


            // Agregar event listener a los botones de 'Agregar al carrito' después de cargar los productos
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', function(event) {
                    const productId = event.target.getAttribute('data-id');
                    addToCart(productId); // Llama a la función addToCart de cart.js
                });
            });
        })
        .catch(error => {
            console.error('Error al cargar productos:', error);
            alert('Error al cargar productos, por favor intente más tarde.');
        });
}

