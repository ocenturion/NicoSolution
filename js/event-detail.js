document.addEventListener("DOMContentLoaded", async () => {
    console.log('entre a event-detail.js')
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");

//   if (!eventId) return;

//   const res = await fetch(`/api/eventos/${eventId}`);
//   const evt = await res.json();
  const evt = "";

  const container = document.getElementById("eventDetail");
    console.log('container: ', container)
  container.innerHTML = `
    <div class="row">
        <div class="col-md-5">
            <img src="${evt.image_url || "https://www.passline.com/imagenes/eventos/7d-damas-gratis-433436-rec.jpg"}" 
            class="card-img-top" 
            height="400" width="55">    
        </div>
        <div class="col-md-7">
            <div class="card-body">
                <h3>7D DAMAS GRATIS (+18)</h3>
                <spam class="text-muted">PARQUE ROCA Parque Roca, Av. Coronel Roca 3490, C1437 CABA Capital Federal, C.A.B.A.</spam>
                <p>VOLVEMOS CON TODO EL 7 DE DICIEMBRE PARA FESTEJAR SU CUMPLE ATR </p>
                <p><strong>Fecha:</strong> 20/12/2025</p>
                <p class="fw-bold text-success fs-5">$15.000</p>
            </div>
        </div>
    </div>
  `;

  document.getElementById("btnBuy").addEventListener("click", () => {
    window.location.href = `cart.html?id=${eventId}`;
  });
});
