function registerUser() {
    const name = document.getElementById('name').value;
    const lastName = document.getElementById('lastName').value;
    const telefono = document.getElementById('telefono').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Crear objeto con los datos del usuario
    const userData = {
        nombre: name,
        apellido: lastName,
        telefono,
        email,
        password
    };

    // Hacer la solicitud POST a la API de registro
    fetch('https://ecommerce-backend-cade.onrender.com/api/auth/registro', { // Cambia el puerto si es necesario
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en el registro');
        }
        return response.json();
    })
    .then(data => {
        // Mostrar el mensaje en el modal
        showModal(data.msg);
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000); // Espera 2 segundos antes de redirigir
    })
    .catch(error => {
        console.error('Error:', error);
        showModal('Error al registrar el usuario. Intenta nuevamente.');
    });
}

function loginUser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const loginData = { email, password };

    fetch('https://ecommerce-backend-cade.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
             
            localStorage.setItem('token', data.token);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', data.user.nombre);
            localStorage.setItem('userId', data.user.id); // Asegúrate de que este campo esté presente
            localStorage.setItem('roleId', data.user.roleId);
            //localStorage.setItem('cartCount', 0); // Este es un valor adicional para el contador de carrito


            // Actualiza la barra de navegación
            updateNavBar(true, data.user.nombre);

            showModal('Login exitoso, redirigiendo...');

            setTimeout(() => {
                if (data.user.roleId === 1) {
                    window.location.href = 'adminPanel.html';
                    updateCartCount();
                } else if (data.user.roleId === 2) {
                    window.location.href = 'index.html';
                }
            }, 2000); // Espera 2 segundos antes de redirigir

            
        } else {

            showModal('Error al iniciar sesión. Intenta nuevamente.');
        }
    })
    .catch(error => {
        showModal('Error al iniciar sesión. Intenta nuevamente.');
    });
}

// Función para mostrar el modal
function showModal(message) {
    const modal = document.getElementById('successModal');
    const modalMessage = document.getElementById('modalMessage');
    modalMessage.textContent = message; // Establecer el mensaje del modal
    modal.style.display = 'block'; // Mostrar el modal
}

// Función para cerrar el modal
function closeModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'none'; // Ocultar el modal
}

// Añadir evento al botón de cerrar el modal
document.addEventListener('DOMContentLoaded', () => {
    const closeButton = document.querySelector('.close-button');
    closeButton.addEventListener('click', closeModal);

    // Cerrar el modal al hacer clic fuera del contenido
    window.onclick = function(event) {
        const modal = document.getElementById('successModal');
        if (event.target === modal) {
            closeModal();
        }
    };
});

// Configuración inicial al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username');
    
    // Asignar evento al botón de login de la barra de navegación
    const loginMenuItem = document.getElementById('login-menu-item');
    const userNameElement = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-btn');

    if (loginMenuItem) {
        loginMenuItem.addEventListener('click', () => {
            window.location.href = './login.html';
        });
    }

    if (isLoggedIn && username) {
        loginMenuItem.style.display = 'none';
        userNameElement.textContent = `Hola, ${username}`;
        logoutButton.style.display = 'block';
        
    } else {
        loginMenuItem.style.display = 'block';
        userNameElement.textContent = '';
        logoutButton.style.display = 'none';

         // Vaciar el carrito si el usuario no está logueado
         localStorage.removeItem('cart');
         updateCartCount();
    }

    updateNavBar(isLoggedIn, username, loginMenuItem, userNameElement, logoutButton);
});


// function logoutUser() {
//     const userId = localStorage.getItem('userId');
//     const token = localStorage.getItem('token');
//     const cart = JSON.parse(localStorage.getItem('cart')) || [];

//     if (userId && cart.length > 0) {
//         fetch(`http://localhost:5000/api/users/${userId}/cart`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`,
//             },
//             body: JSON.stringify({ cartItems: cart }),
//         }).then(() => {
//             localStorage.clear();
//             window.location.href = 'index.html';
//         }).catch(error => console.error('Error al guardar el carrito:', error));
//     } else {
//         localStorage.clear();
//         window.location.href = 'index.html';
//     }
// }

async function saveCart(userId, token) {
    try {
        await fetch(`https://ecommerce-backend-cade.onrender.com/api/users/${userId}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ cartItems: cart }),
        });
        console.log('Carrito guardado en el backend.');
    } catch (error) {
        console.error('Error al guardar el carrito:', error);
    }
}

// Actualizar la barra de navegación
function updateNavBar(isLoggedIn = false, username = '') {
    const loginMenuItem = document.getElementById('login-menu-item');
    const userNameElement = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-btn');

    if (loginMenuItem && userNameElement && logoutButton) {
        if (isLoggedIn && username) {
            loginMenuItem.style.display = 'none';
            userNameElement.textContent = `Hola, ${username}`;
            logoutButton.style.display = 'block';
        } else {
            loginMenuItem.style.display = 'block';
            userNameElement.textContent = '';
            logoutButton.style.display = 'none';
            updateCartCount();
        }
    }
}

// Asignar el evento al botón de login
document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', loginUser);
    }
});

