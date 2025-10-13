const API_EVENTS = '/api/events';

const $ = id => document.getElementById(id);

document.addEventListener('DOMContentLoaded', async () => {
  initMap();
  await fetchEvents();
});

// ---------- MAPA ----------
let map;
function initMap() {
  map = L.map('map').setView([-34.6, -58.4], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
}

// ---------- EVENTOS ----------
async function fetchEvents() {
  try {
    const res = await fetch(API_EVENTS, { headers: authHeader() });
    const data = res.ok ? await res.json() : mockEvents();
    renderEvents(data);
    plotEvents(data);
  } catch {
    renderEvents(mockEvents());
    plotEvents(mockEvents());
  }
}

function renderEvents(events) {
  const list = $('eventsList');
  list.innerHTML = '';
  for (const evt of events) {
    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `
      <div class="card event-card p-3 shadow-sm">
        <div class="row">
          <div class="col-md-5">
            <img src="${evt.image_url || 'https://www.passline.com/imagenes/eventos/7d-damas-gratis-433436-rec.jpg'}" 
             class="card-img-top rounded mb-3" 
             alt="${evt.title}" 
             height="300" width="55">
          </div>
          <div class="col-md-7">
            <div class="card-body">
              <h6 class="card-title fw-bold">${evt.title}</h6>
              <p class="text-muted small mb-1">${evt.location_name}</p>
              <p class="small">${evt.description}</p>
              <div class="d-flex justify-content-between align-items-center mt-3">
                <span class="fw-bold">$${evt.base_price}</span>
                <a href="event-detail.html?id=${evt.id}" class="btn btn-sm btn-primary">Ver detalle</a>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    list.appendChild(col);
  }
}

function plotEvents(events) {
  events.forEach(e => {
    if (e.location_lat && e.location_lng) {
      L.marker([e.location_lat, e.location_lng])
        .addTo(map)
        .bindPopup(`<b>${e.title}</b><br>${e.location_name}`);
    }
  });
}

// ---------- MOCK ----------
function mockEvents() {
  return [
    {
      id: 1,
      title: 'Concierto Indie',
      location_name: 'Club Central',
      description: 'Bandas emergentes de la ciudad',
      base_price: 2500,
      location_lat: -34.6037,
      location_lng: -58.3816
    },
    {
      id: 2,
      title: 'Feria de Arte',
      location_name: 'La Rural',
      description: 'Exposición y talleres de arte contemporáneo',
      base_price: 1800,
      location_lat: -34.5875,
      location_lng: -58.4091
    }
  ];
}
