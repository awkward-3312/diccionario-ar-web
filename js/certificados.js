const SUPABASE_URL = 'https://yzdjpwdoutjeuuvxmqmv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZGpwd2RvdXRqZXV1dnhtcW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MTg2NTMsImV4cCI6MjA2NTA5NDY1M30.WgC0o1VLVCMTi2cKiGC6OIPHrwgjTAav3DQ_k7JUGEg';
const supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const ALLOWED_EMAILS = [
  'betza@certificate.com',
  'ingrid@certificate.com',
  'asly@certificate.com',
  'karen@certificate.com'
];

function isAuthorized(email) {
  return ALLOWED_EMAILS.includes((email || '').toLowerCase());
}

async function getSession() {
  const { data } = await supa.auth.getSession();
  return data.session;
}

function formatDate(str) {
  const d = new Date(str);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
}

let certificadosData = [];

function renderCertificados(lista) {
  const tbody = document.querySelector('#tablaCertificados tbody');
  tbody.innerHTML = '';

  if (!lista || lista.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="8" class="sin-datos">No hay certificados disponibles</td>`;
    tbody.appendChild(tr);
    return;
  }

  const hoy = new Date();
  const limite = 30 * 24 * 60 * 60 * 1000; // 30 días

  lista.forEach(row => {
    const tr = document.createElement('tr');

    const vto = row.fecha_vencimiento ? new Date(row.fecha_vencimiento) : null;
    if (vto) {
      const diff = vto - hoy;
      if (diff < 0) {
        tr.classList.add('expirado');
      } else if (diff <= limite) {
        tr.classList.add('por-vencer');
      } else {
        tr.classList.add('valido');
      }
    }

    tr.innerHTML = `
      <td data-label="Laboratorio">${row.laboratorio || ''}</td>
      <td data-label="País">${row.pais || ''}</td>
      <td data-label="Tipo Producto">${row.tipo_producto || ''}</td>
      <td data-label="Forma Farmacéutica">${row.forma_farmaceutica || ''}</td>
      <td data-label="Tipo Certificado">${row.tipo_certificado || ''}</td>
      <td data-label="Fecha Emisión">${row.fecha_emision ? formatDate(row.fecha_emision) : ''}</td>
      <td data-label="Fecha Vencimiento">${row.fecha_vencimiento ? formatDate(row.fecha_vencimiento) : ''}</td>
      <td data-label="PDF"><button class="btn-pdf" onclick="window.open('${row.archivo_pdf}','_blank')">Ver PDF</button></td>`;
    tbody.appendChild(tr);
  });
}

function populateFilters(data) {
  const paisSelect = document.getElementById('filterPais');
  const prodSelect = document.getElementById('filterTipoProducto');
  const certSelect = document.getElementById('filterTipoCertificado');

  const paises = [...new Set(data.map(r => r.pais).filter(Boolean))];
  const prods = [...new Set(data.map(r => r.tipo_producto).filter(Boolean))];
  const certs = [...new Set(data.map(r => r.tipo_certificado).filter(Boolean))];

  paisSelect.innerHTML = '<option value="">Todos los países</option>' +
    paises.map(p => `<option value="${p}">${p}</option>`).join('');
  prodSelect.innerHTML = '<option value="">Todos los productos</option>' +
    prods.map(p => `<option value="${p}">${p}</option>`).join('');
  certSelect.innerHTML = '<option value="">Todos los certificados</option>' +
    certs.map(p => `<option value="${p}">${p}</option>`).join('');
}

function applyFilters() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const pais = document.getElementById('filterPais').value;
  const tipoProd = document.getElementById('filterTipoProducto').value;
  const tipoCert = document.getElementById('filterTipoCertificado').value;

  const filtrados = certificadosData.filter(row => {
    const texto = `${row.laboratorio || ''} ${row.pais || ''} ${row.tipo_producto || ''} ${row.forma_farmaceutica || ''} ${row.tipo_certificado || ''}`.toLowerCase();
    const matchSearch = !search || texto.includes(search);
    const matchPais = !pais || row.pais === pais;
    const matchProd = !tipoProd || row.tipo_producto === tipoProd;
    const matchCert = !tipoCert || row.tipo_certificado === tipoCert;
    return matchSearch && matchPais && matchProd && matchCert;
  });
  renderCertificados(filtrados);
}

async function loadCertificados() {
  const loader = document.getElementById('loader');
  const errorEl = document.getElementById('error');
  loader.style.display = 'block';
  const { data, error } = await supa
    .from('dataBase')
    .select('*')
    .order('fecha_emision', { ascending: false });
  loader.style.display = 'none';
  if (error) {
    errorEl.textContent = 'Error al cargar los certificados.';
    console.error(error);
    return;
  }
  certificadosData = data || [];
  populateFilters(certificadosData);
  renderCertificados(certificadosData);
}

async function setupLogin() {
  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('error');
  const loader = document.getElementById('loader');
  const btn = document.getElementById('btn-ingresar');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    loader.style.display = 'block';
    btn.disabled = true;
    const { data, error } = await supa.auth.signInWithPassword({
      email: document.getElementById('correo').value.trim(),
      password: document.getElementById('clave').value
    });
    loader.style.display = 'none';
    btn.disabled = false;
    if (error || !data.session) {
      errorEl.textContent = 'Credenciales inválidas.';
      return;
    }
    if (!isAuthorized(data.user.email)) {
      alert('Access not authorized');
      await supa.auth.signOut();
      window.location.href = 'certificados-login.html';
      return;
    }
    window.location.href = 'certificados.html';
  });
}

async function setupDashboard() {
  const session = await getSession();
  if (!session) {
    window.location.href = 'certificados-login.html';
    return;
  }
  if (!isAuthorized(session.user.email)) {
    alert('Access not authorized');
    await supa.auth.signOut();
    window.location.href = 'certificados-login.html';
    return;
  }

  document.getElementById('cerrar-sesion').addEventListener('click', async () => {
    await supa.auth.signOut();
    window.location.href = 'certificados-login.html';
  });
  document.getElementById('searchInput').addEventListener('input', applyFilters);
  document.getElementById('filterPais').addEventListener('change', applyFilters);
  document.getElementById('filterTipoProducto').addEventListener('change', applyFilters);
  document.getElementById('filterTipoCertificado').addEventListener('change', applyFilters);

  loadCertificados();
}

document.addEventListener('DOMContentLoaded', async () => {
  const path = window.location.pathname;
  if (path.includes('certificados-login.html')) {
    const session = await getSession();
    if (session && isAuthorized(session.user.email)) {
      window.location.href = 'certificados.html';
      return;
    }
    if (session && !isAuthorized(session.user.email)) {
      await supa.auth.signOut();
    }
    setupLogin();
  } else if (path.includes('certificados.html')) {
    setupDashboard();
  }
});
