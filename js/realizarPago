document.getElementById('checkout-btn').addEventListener('click', realizarPago);

async function realizarPago() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('El carrito está vacío. Agrega productos antes de realizar el pago.');
        return;
    }

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const total = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);

    try {
        // Registrar la orden en el backend
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ cartItems: cart, total }),
        });

        if (!response.ok) throw new Error('Error al crear la orden.');
        const data = await response.json();

        // Redirigir a Mercado Pago
        const mercadoPagoUrl = `https://www.mercadopago.com/checkout/v1/redirect?order_id=${data.orderId}`;
        window.location.href = mercadoPagoUrl;

    } catch (error) {
        console.error('Error al realizar el pago:', error);
        alert('Hubo un error al procesar el pago. Intenta nuevamente.');
    }
}
