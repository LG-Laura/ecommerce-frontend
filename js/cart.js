// Al cargar la página
window.onload = function() {
    loadCart();
    updateCartCount();
};

// Cargar el carrito desde localStorage y backend
function loadCart() {
    const cartList = document.getElementById('cart-list');
    const totalAmount = document.getElementById('total-amount');
    const userId = localStorage.getItem('userId');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let total = 0;

    // Limpiar la lista de productos antes de cargar los nuevos
    cartList.innerHTML = '';

    // Si el usuario está logueado, obtener los productos de la base de datos
    if (userId) {
        fetch(`http://localhost:5000/api/users/${userId}/cart`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json())
        .then(dbCart => {
            dbCart.forEach(item => {
                // Combinamos los productos de localStorage y los productos de la base de datos
                const existingProduct = cart.find(cartItem => cartItem.productId === item.productId);
                if (!existingProduct) {
                    cart.push({
                        productId: item.productId,
                        nombre: item.nombre,
                        precio: item.precio,
                        imageUrl: item.imageUrl,
                        quantity: item.cantidad
                    });
                } else {
                    existingProduct.quantity = item.cantidad; // Actualizamos la cantidad
                }
            });

            // Guardar el carrito combinado en localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartUI(cart);
            totalAmount.textContent = `$${calculateTotal(cart).toFixed(2)}`;
        })
        .catch(error => console.error('Error al cargar el carrito:', error));
    } else {
        updateCartUI(cart);
        totalAmount.textContent = `$${calculateTotal(cart).toFixed(2)}`;
    }
}

// Función para actualizar la UI con los productos del carrito
function updateCartUI(cart) {
    const cartList = document.getElementById('cart-list');
    const totalAmount = document.getElementById('total-amount');
    let total = 0;

    cartList.innerHTML = '';

    if (cart.length === 0 || cart.length === "" ) {
        cartList.innerHTML = '<p>Tu carrito está vacío.</p>';
    } else {
        cart.forEach(item => {
            total += item.precio * item.quantity;

            const productElement = document.createElement('div');
            productElement.classList.add('cart-item');
            productElement.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.nombre}" />
                <h3>${item.nombre}</h3>
                <p>Precio: $${item.precio}</p>
                <div>
                    <button onclick="decreaseQuantity(${item.productId})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="increaseQuantity(${item.productId})">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.productId})">Eliminar</button>
            `;
            cartList.appendChild(productElement);
        });
        updateCartCount();
    }

    totalAmount.textContent = `$${total.toFixed(2)}`;
}

// Calcular el total del carrito
function calculateTotal(cart) {
    return cart.reduce((total, item) => total + (item.precio * item.quantity), 0);
}

// Agregar producto al carrito
async function addToCart(productId) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (!isLoggedIn) {
        showLoginModal(); // Muestra el modal de inicio de sesión
        return;
    }

    const userId = localStorage.getItem('userId');
    try {
        const productResponse = await fetch(`http://localhost:5000/api/products/${productId}`);
        if (!productResponse.ok) throw new Error('Producto no encontrado.');

        const product = await productResponse.json();
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        const existingProduct = cart.find(item => item.productId === product.id);

        if (!existingProduct) {
            cart.push({ 
                productId: product.id, 
                nombre: product.nombre, 
                precio: product.precio, 
                imageUrl: product.imageUrl, 
                quantity: 1 
            });
        } else {
            existingProduct.quantity += 1; // Incrementar la cantidad
        }

        localStorage.setItem('cart', JSON.stringify(cart));

        // Sincronizar con el backend
        await fetch(`http://localhost:5000/api/users/${userId}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ cartItems: cart })
        });

        updateCartUI(cart); // Actualizar la UI
        updateCartCount(); // Actualizar el contador
    } catch (error) {
        console.error('Error al agregar el producto al carrito:', error);
    }
}


// Cerrar sesión y guardar carrito en la base de datos
function logoutUser() {
    const userId = localStorage.getItem('userId');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length > 0) {
        const formattedCart = cart.map(item => ({
            productId: item.productId,
            cantidad: item.quantity
        }));

        fetch(`http://localhost:5000/api/users/${userId}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ cartItems: formattedCart })
        })
        .then(() => {
            localStorage.clear();
            window.location.href = 'index.html'; // Redirigir al inicio
        })
        .catch(error => console.error('Error al guardar el carrito:', error));
    } else {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

// Actualizar el contador del carrito
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}


// Aumentar la cantidad de un producto en el carrito
function increaseQuantity(productId) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = cart.find(item => item.productId === productId);

    if (product) {
        product.quantity += 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI(cart);
        updateCartCount();
    }
}

// Disminuir la cantidad de un producto en el carrito
function decreaseQuantity(productId) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = cart.find(item => item.productId === productId);

    if (product && product.quantity > 1) {
        product.quantity -= 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI(cart);
        updateCartCount();
    } else if (product) {
        removeFromCart(productId); // Eliminar el producto si la cantidad es 1
    }
}

// Eliminar producto del carrito
function removeFromCart(productId) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.filter(item => item.productId !== productId);

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    updateCartUI(updatedCart);
    updateCartCount();

    // Sincronizar con el backend
    const userId = localStorage.getItem('userId');
    if (userId) {
        fetch(`http://localhost:5000/api/users/${userId}/cart/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).catch(error => console.error('Error al eliminar del backend:', error));
    }
}



// Función para mostrar el modal de advertencia de inicio de sesión
function showLoginModal() {
    // Crear el modal
    const modal = document.createElement('div');
    modal.id = 'login-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';  // Fondo más oscuro para resaltar el modal
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000'; // Asegura que el modal quede sobre otros elementos

    // Contenido del modal
    modal.innerHTML = `
        <div style="background-color: white; padding: 30px; border-radius: 10px; text-align: center; width: 300px; max-width: 90%; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);">
            <h3 style="font-size: 24px; margin-bottom: 20px; color: #333;">Iniciar Sesión</h3>
            <p style="font-size: 16px; color: #555; margin-bottom: 20px;">Para agregar productos al carrito, por favor inicie sesión.</p>
            <button id="login-accept" style="margin: 10px; padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Aceptar</button>
            <button id="login-close" style="margin: 10px; padding: 10px 20px; background-color: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">Salir</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Event listeners para los botones
    document.getElementById('login-accept').addEventListener('click', () => {
        window.location.href = 'login.html'; // Redirigir a la página de login
    });

    document.getElementById('login-close').addEventListener('click', () => {
        modal.remove(); // Cerrar el modal
    });
}

// Redirección al checkout de Mercado Pago
function proceedToPayment() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalAmount = calculateTotal(cart);

    if (cart.length > 0) {
        fetch('http://localhost:5000/api/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                cartItems: cart,
                totalAmount: totalAmount
            })
        })
        .then(response => response.json())
        .then(paymentData => {
            // Redirigir a la URL de Mercado Pago
            window.location.href = paymentData.paymentUrl;
        })
        .catch(error => console.error('Error al proceder con el pago:', error));
    }
}