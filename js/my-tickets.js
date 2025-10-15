// Endpoints
const API_TICKETS = '/api/users/me/tickets';    // espera lista de tickets del usuario
const API_ORDERS  = '/api/users/me/orders';     // historial de compras

const $ = id => document.getElementById(id);

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthOrRedirect();
  await loadTickets();
  await loadOrdersHistory();

  // logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('eventhub_token');
    location.href = 'login.html';
  });
});

function getToken() {
  return localStorage.getItem('eventhub_token');
}
function authHeader() {
  const t = getToken();
  return t ? { 'Authorization': 'Bearer ' + t } : {};
}
async function checkAuthOrRedirect() {
  try {
    const r = await fetch('/api/auth/me', { headers: authHeader() });
    if (!r.ok) location.href = 'login.html';
  } catch {
    location.href = 'login.html';
  }
}

// Render status badge
function statusBadge(status) {
  const s = (status||'').toLowerCase();
  if (s === 'active') return `<span class="badge status-badge active">Activo</span>`;
  if (s === 'used') return `<span class="badge status-badge used">Usado</span>`;
  return `<span class="badge status-badge cancelled">Cancelado</span>`;
}

// Descargar imagen (QR) helper
function downloadImage(url, filename='ticket-qr.png') {
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }).catch(err => alert('No se pudo descargar el QR.'));
}

// Cargar tickets
async function loadTickets() {
  const container = $('ticketsList');
  container.innerHTML = '';

  let tickets;
  try {
    const res = await fetch(API_TICKETS, { headers: authHeader(), credentials: 'include' });
    tickets = res.ok ? await res.json() : mockTickets();
  } catch (err) {
    console.warn('Fallo al obtener tickets, usando mock.', err);
    tickets = mockTickets();
  }

  if (!tickets || tickets.length === 0) {
    container.innerHTML = `<div class="text-center py-4 text-muted">No tienes tickets comprados.</div>`;
    return;
  }

  tickets.forEach(t => {
    // t: { id, eventId, title, image_url, start_at, location_name, price, qr_url, status, purchased_at }
    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `
      <div class="card ticket-card overflow-hidden">
        <img src="${escape(t.image_url || 'assets/img/event-sample.jpg')}" alt="${escape(t.title)}" style="width:100%;height:160px;object-fit:cover">
        <div class="p-3 d-flex gap-3">
          <div class="centered" style="min-width:130px">
            <img src="${escape(t.qr_url || 'assets/img/qr-placeholder.png')}" class="qr-img" alt="QR ticket">
            <div class="mt-2 d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary btn-download">Descargar</button>
            </div>
          </div>
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="mb-1">${escape(t.title)}</h6>
                <div class="small text-muted">${new Date(t.start_at).toLocaleString()} • ${escape(t.location_name || '')}</div>
              </div>
              <div class="text-end">
                <div class="fw-bold mb-1">$${(t.price||0).toFixed(2)}</div>
                ${statusBadge(t.status)}
              </div>
            </div>
            <p class="mt-2 small text-truncate" style="max-height:3.6rem;overflow:hidden">${escape(t.description||'')}</p>
            <div class="mt-3 small text-muted">Comprado: ${new Date(t.purchased_at || t.issued_at || Date.now()).toLocaleString()}</div>
          </div>
        </div>
      </div>
    `;
    // attach download handler
    col.querySelector('.btn-download').addEventListener('click', () => {
      downloadImage(t.qr_url, `ticket-${t.id}.png`);
    });

    container.appendChild(col);
  });
}

// Cargar historial de compras (orders)
async function loadOrdersHistory() {
  const container = $('ordersHistory');
  container.innerHTML = '';
  let orders;
  try {
    const res = await fetch(API_ORDERS, { headers: authHeader(), credentials: 'include' });
    orders = res.ok ? await res.json() : mockOrders();
  } catch (err) {
    console.warn('Fallo al obtener orders, usando mock.', err);
    orders = mockOrders();
  }

  if (!orders || orders.length === 0) {
    container.innerHTML = `<div class="list-group-item text-muted">Sin historial de compras.</div>`;
    return;
  }

  orders.forEach(o => {
    const el = document.createElement('div');
    el.className = 'list-group-item';
    el.innerHTML = `
      <div class="d-flex justify-content-between">
        <div>
          <div class="fw-bold">Orden #${escape(o.order_number || o.id)}</div>
          <div class="small text-muted">${new Date(o.created_at).toLocaleString()}</div>
        </div>
        <div class="text-end">
          <div class="fw-bold">$${(o.total_amount||0).toFixed(2)}</div>
          <div class="small text-muted">${o.status}</div>
        </div>
      </div>
    `;
    container.appendChild(el);
  });
}

// UTIL: escape
function escape(s=''){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

// MOCKS (solo si no hay backend)
function mockTickets(){
  return [
    { id:'t1', eventId:'evt-1', title:'Concierto Indie', description:'Entrada general', image_url:'assets/img/event-sample.jpg', start_at: new Date(Date.now()+86400000).toISOString(), location_name:'Club Central', price:2500, qr_url:'assets/img/qr-placeholder.png', status:'active', purchased_at: new Date().toISOString() },
    { id:'t2', eventId:'evt-2', title:'Feria de Arte', description:'Entrada VIP', image_url:'assets/img/event-sample.jpg', start_at: new Date(Date.now()+172800000).toISOString(), location_name:'La Rural', price:1200, qr_url:'assets/img/qr-placeholder.png', status:'used', purchased_at: new Date(Date.now()-86400000).toISOString() }
  ];
}
function mockOrders(){
  return [
    { id:'ord-1', order_number:'0001', created_at:new Date(Date.now()-86400000).toISOString(), total_amount:3700, status:'paid' }
  ];
}
