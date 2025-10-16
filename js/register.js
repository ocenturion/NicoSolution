// ENDPOINT (ajustar si hace falta)
const API_REGISTER = '/api/auth/register';

const $ = id => document.getElementById(id);

function showAlert(html, type='danger') {
  $('alertContainer').innerHTML = `<div class="alert alert-${type} py-2">${html}</div>`;
  setTimeout(()=> { if ($('alertContainer')) $('alertContainer').innerHTML = ''; }, 5000);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = $('registerForm');
  const btn = $('btnRegister');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // campos
    const name = $('inputName').value.trim();
    const email = $('inputEmail').value.trim();
    const pwd = $('inputPassword').value;
    const conf = $('inputConfirm').value;
    const terms = $('termsCheck').checked;

    // validaciones client
    let ok = true;
    if (!name) { $('inputName').classList.add('is-invalid'); ok = false; } else $('inputName').classList.remove('is-invalid');
    if (!validateEmail(email)) { $('inputEmail').classList.add('is-invalid'); ok = false; } else $('inputEmail').classList.remove('is-invalid');
    if (!pwd || pwd.length < 8) { $('inputPassword').classList.add('is-invalid'); ok = false; } else $('inputPassword').classList.remove('is-invalid');
    if (pwd !== conf) { $('inputConfirm').classList.add('is-invalid'); ok = false; } else $('inputConfirm').classList.remove('is-invalid');
    if (!terms) { $('termsCheck').classList.add('is-invalid'); ok = false; } else $('termsCheck').classList.remove('is-invalid');

    if (!ok) return;

    // llamada al backend
    btn.disabled = true;
    btn.textContent = 'Registrando...';

    try {
      const payload = { name, email, password: pwd };

      let res;
      try {
        res = await fetch(API_REGISTER, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        res = null;
      }

      if (res && res.ok) {
        // si la API devuelve mensaje o datos, podés leerlos
        showAlert('<mark>Cuenta creada correctamente.</mark> Redirigiendo al login...', 'success');
        setTimeout(()=> location.href = 'login.html', 900);
        return;
      }

      // manejar errores comunes
      if (res) {
        if (res.status === 409) {
          showAlert('El email ya está registrado.', 'warning');
        } else {
          try {
            const body = await res.json();
            showAlert(body.message || 'Error al registrar.', 'danger');
          } catch {
            showAlert('Error al registrar. Intentá de nuevo más tarde.', 'danger');
          }
        }
      } else {
        // fallback si no hay backend (modo demo)
        // permitir crear demo: guardar en localStorage (solo para demo)
        const demoUsers = JSON.parse(localStorage.getItem('eventhub_demo_users') || '[]');
        if (demoUsers.find(u => u.email === email)) {
          showAlert('El email ya está registrado (demo).', 'warning');
        } else {
          demoUsers.push({ id: 'demo-' + Date.now(), name, email, password: pwd });
          localStorage.setItem('eventhub_demo_users', JSON.stringify(demoUsers));
          showAlert('<mark>Cuenta creada en modo demo.</mark> Redirigiendo al login...', 'success');
          setTimeout(()=> location.href = 'login.html', 900);
        }
      }
    } finally {
      btn.disabled = false;
      btn.textContent = 'Crear cuenta';
    }
  });
});
