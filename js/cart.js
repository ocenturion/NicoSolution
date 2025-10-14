document.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/api/carrito');
  const cart = await res.json();

  const list = document.getElementById('cartItems');
  let total = 0;

  if (!cart.items?.length) {
    list.innerHTML = '<p class="text-center text-muted">Tu carrito está vacío.</p>';
    return;
  }

  cart.items.forEach(item => {
    total += item.price * item.quantity;
    const div = document.createElement('div');
    div.className = 'card mb-3 shadow-sm';
    div.innerHTML = `
      <div class="card-body d-flex justify-content-between align-items-center">
        <div>
          <h6>${item.eventName}</h6>
          <p class="small mb-0">Cantidad: ${item.quantity}</p>
        </div>
        <span class="fw-bold">$${item.price * item.quantity}</span>
      </div>
    `;
    list.appendChild(div);
  });

  document.getElementById('cartTotal').textContent = total.toFixed(2);

  document.getElementById('btnCheckout').addEventListener('click', async () => {
    const resp = await fetch('/api/carrito/checkout', { method: 'POST' });
    if (resp.ok) {
      alert('Compra realizada con éxito 🎟️');
      window.location.href = 'mis-tickets.html';
    } else {
      alert('Error al procesar la compra.');
    }
  });
});
