const API_ME = '/api/users/me';
const API_UPDATE = '/api/users/me';            // PUT
const API_CHANGE_PWD = '/api/auth/change-password'; // POST { currentPassword, newPassword }

const $ = id => document.getElementById(id);
const showAlert = (msg, type='success') => {
  $('alertContainer').innerHTML = `<div class="alert alert-${type} py-2">${msg}</div>`;
  setTimeout(()=> { if ($('alertContainer')) $('alertContainer').innerHTML = ''; }, 4000);
};

function authHeader() {
  const t = localStorage.getItem('eventhub_token');
  return t ? { 'Authorization': 'Bearer ' + t } : {};
}

// Cargar datos del usuario
async function loadProfile() {
  try {
    const r = await fetch(API_ME, { headers: {...authHeader()} , credentials: 'include' });
    if (!r.ok) {
      // si 401 -> redirigir al login
      if (r.status === 401) return location.href = 'login.html';
      throw new Error('No se pudo obtener perfil');
    }
    const u = await r.json();
    $('inputName').value = u.name || '';
    $('inputEmail').value = u.email || '';
  } catch (err) {
    console.error(err);
    showAlert('Error al cargar perfil (modo demo).', 'warning');
  }
}

// Guardar cambios (nombre/email)
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();

  $('#profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('inputName').value.trim();
    const email = $('inputEmail').value.trim();
    if (!name) { $('inputName').classList.add('is-invalid'); return; } else $('inputName').classList.remove('is-invalid');
    if (!validateEmail(email)) { $('inputEmail').classList.add('is-invalid'); return; } else $('inputEmail').classList.remove('is-invalid');

    const payload = { name, email };
    try {
      const res = await fetch(API_UPDATE, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      if (res.ok) {
        showAlert('Perfil actualizado correctamente.', 'success');
      } else if (res.status === 409) {
        showAlert('El email ya está en uso.', 'danger');
      } else {
        const txt = await res.text();
        showAlert('Error al actualizar: ' + txt, 'danger');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error de conexión al actualizar perfil.', 'danger');
    }
  });

  // Cambiar contraseña
  $('#changePwdForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const current = $('currentPwd').value;
    const nw = $('newPwd').value;
    const conf = $('confirmNewPwd').value;

    if (!current) { $('currentPwd').classList.add('is-invalid'); return; } else $('currentPwd').classList.remove('is-invalid');
    if (nw.length < 8) { $('newPwd').classList.add('is-invalid'); return; } else $('newPwd').classList.remove('is-invalid');
    if (nw !== conf) { $('confirmNewPwd').classList.add('is-invalid'); return; } else $('confirmNewPwd').classList.remove('is-invalid');

    $('pwdAlert').innerHTML = `<div class="spinner-border spinner-border-sm" role="status"></div> Actualizando...`;

    try {
      const res = await fetch(API_CHANGE_PWD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ currentPassword: current, newPassword: nw }),
        credentials: 'include'
      });
      if (res.ok) {
        $('pwdAlert').innerHTML = `<div class="alert alert-success py-2">Contraseña actualizada correctamente.</div>`;
        setTimeout(() => {
          const modalEl = document.getElementById('changePwdModal');
          const bs = bootstrap.Modal.getInstance(modalEl);
          if (bs) bs.hide();
          $('currentPwd').value = $('newPwd').value = $('confirmNewPwd').value = '';
          $('pwdAlert').innerHTML = '';
        }, 1000);
      } else if (res.status === 400) {
        const body = await res.json();
        $('pwdAlert').innerHTML = `<div class="alert alert-danger py-2">${body.message || 'Error en contraseña'}</div>`;
      } else {
        $('pwdAlert').innerHTML = `<div class="alert alert-danger py-2">Error al cambiar contraseña.</div>`;
      }
    } catch (err) {
      console.error(err);
      $('pwdAlert').innerHTML = `<div class="alert alert-danger py-2">Error de conexión.</div>`;
    }
  });

  // logout
  $('#logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('eventhub_token');
    location.href = 'login.html';
  });
});

// util
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// shorthand for querySelector by id (used above)
function $(selector) { return document.querySelector(selector); }
