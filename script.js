// ─── OUTPUTS ───────────────────────────────────────────────────────────────────
const apiOutput      = document.getElementById('apiOutput');
const profileOutput  = document.getElementById('profileOutput');
const adminApiOutput = document.getElementById('adminApiOutput');
const usersOutput    = document.getElementById('usersOutput');
const booksList      = document.getElementById('booksList');

// ─── URLS ──────────────────────────────────────────────────────────────────────
const usersUrl = '/api/users';
const booksUrl = '/api/books';

// ─── TOKEN ─────────────────────────────────────────────────────────────────────
const getToken   = () => localStorage.getItem('token');
const setToken   = (t) => localStorage.setItem('token', t);
const clearToken = () => localStorage.removeItem('token');

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function show(el, data) {
  el.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}

async function api(url, opts = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res  = await fetch(url, { ...opts, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erro na requisição.');
  return data;
}

// ─── TABS ──────────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

// ─── NAV USER STATE ────────────────────────────────────────────────────────────
function updateNavUser(name) {
  const greeting = document.getElementById('userGreeting');
  const logoutBtn = document.getElementById('navLogoutBtn');
  if (name) {
    greeting.textContent = `Olá, ${name}`;
    logoutBtn.style.display = 'inline-block';
  } else {
    greeting.textContent = '';
    logoutBtn.style.display = 'none';
  }
}

document.getElementById('navLogoutBtn').addEventListener('click', () => {
  clearToken();
  updateNavUser(null);
  show(apiOutput, 'Sessão encerrada.');
});

// ─── CORES POR CATEGORIA ───────────────────────────────────────────────────────
const categoryColors = {
  'romance':    ['#fce4ec','#c2185b'],
  'sci-fi':     ['#e3f2fd','#1565c0'],
  'ficção':     ['#e8f5e9','#2e7d32'],
  'terror':     ['#212121','#ef5350'],
  'biografia':  ['#fff8e1','#e65100'],
  'história':   ['#f3e5f5','#6a1b9a'],
  'fantasia':   ['#e0f7fa','#00695c'],
  'padrão':     ['#f5f0e8','#5d4037'],
};

function getBookColors(category = '') {
  const key = Object.keys(categoryColors).find(k =>
    category.toLowerCase().includes(k)
  ) || 'padrão';
  return categoryColors[key];
}

// ─── RENDERIZAR LIVROS ─────────────────────────────────────────────────────────
function renderBooks(books) {
  if (!books.length) {
    booksList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <p>Nenhum livro encontrado.</p>
      </div>`;
    return;
  }

  booksList.innerHTML = books.map(b => {
    const [bg, fg] = getBookColors(b.category);
    const stockClass = b.stock === 0 ? 'stock-out' : b.stock <= 3 ? 'stock-low' : 'stock-ok';
    const stockLabel = b.stock === 0 ? 'Esgotado' : b.stock <= 3 ? `Últimas ${b.stock} unid.` : `${b.stock} em estoque`;
    return `
      <div class="book-card ${b.active ? '' : 'book-unavailable'}">
        <div class="book-cover" style="background:${bg}; color:${fg}">📗</div>
        <div class="book-body">
          <div class="book-category">${b.category}</div>
          <div class="book-title">${b.title}</div>
          <div class="book-author">${b.author}</div>
          <div class="book-footer">
            <span class="book-price">R$ ${Number(b.price).toFixed(2)}</span>
            <span class="book-stock ${stockClass}">${stockLabel}</span>
          </div>
          <div class="book-id">${b._id}</div>
        </div>
      </div>`;
  }).join('');
}

// ─── LOJA ──────────────────────────────────────────────────────────────────────
document.getElementById('loadBooksBtn').addEventListener('click', async () => {
  try {
    const data = await api(booksUrl);
    renderBooks(data);
  } catch (err) {
    booksList.innerHTML = `<p style="color:var(--accent);padding:20px">${err.message}</p>`;
  }
});

document.getElementById('searchInput').addEventListener('input', async (e) => {
  const q = e.target.value.trim();
  if (!q) return;
  try {
    const data = await api(`${booksUrl}?search=${encodeURIComponent(q)}`);
    renderBooks(data);
  } catch (err) { /* silencioso */ }
});

// ─── CONTA ─────────────────────────────────────────────────────────────────────
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const data = await api(`${usersUrl}/register`, {
      method: 'POST',
      body: JSON.stringify({
        name:     document.getElementById('registerName').value,
        email:    document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
        role:     'user'
      })
    });
    show(apiOutput, data);
    e.target.reset();
  } catch (err) { show(apiOutput, err.message); }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const data = await api(`${usersUrl}/login`, {
      method: 'POST',
      body: JSON.stringify({
        email:    document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
      })
    });
    setToken(data.token);
    updateNavUser(data.user.name);
    show(apiOutput, data);
    e.target.reset();
  } catch (err) { show(apiOutput, err.message); }
});

document.getElementById('loadProfileBtn').addEventListener('click', async () => {
  try {
    const data = await api(`${usersUrl}/me`);
    show(profileOutput, data);
  } catch (err) { show(profileOutput, err.message); }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  clearToken();
  updateNavUser(null);
  show(apiOutput, 'Sessão encerrada.');
  show(profileOutput, 'Faça login para ver seu perfil.');
});

// ─── ADMIN: LIVROS ─────────────────────────────────────────────────────────────
document.getElementById('createBookForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const data = await api(booksUrl, {
      method: 'POST',
      body: JSON.stringify({
        title:       document.getElementById('bookTitle').value,
        author:      document.getElementById('bookAuthor').value,
        description: document.getElementById('bookDescription').value,
        price:       parseFloat(document.getElementById('bookPrice').value),
        category:    document.getElementById('bookCategory').value,
        stock:       parseInt(document.getElementById('bookStock').value),
        isbn:        document.getElementById('bookIsbn').value || undefined,
        publisher:   document.getElementById('bookPublisher').value || undefined,
        pages:       parseInt(document.getElementById('bookPages').value) || undefined,
      })
    });
    show(adminApiOutput, data);
    e.target.reset();
  } catch (err) { show(adminApiOutput, err.message); }
});

document.getElementById('updateBookForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const id = document.getElementById('updateBookId').value;
    const payload = {};
    const title  = document.getElementById('updateBookTitle').value;
    const author = document.getElementById('updateBookAuthor').value;
    const price  = document.getElementById('updateBookPrice').value;
    const stock  = document.getElementById('updateBookStock').value;
    const active = document.getElementById('updateBookActive').value;
    if (title)  payload.title  = title;
    if (author) payload.author = author;
    if (price)  payload.price  = parseFloat(price);
    if (stock !== '') payload.stock = parseInt(stock);
    if (active) payload.active = active === 'true';
    const data = await api(`${booksUrl}/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    show(adminApiOutput, data);
    e.target.reset();
  } catch (err) { show(adminApiOutput, err.message); }
});

document.getElementById('deleteBookForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const id   = document.getElementById('deleteBookId').value;
    const data = await api(`${booksUrl}/${id}`, { method: 'DELETE' });
    show(adminApiOutput, data);
    e.target.reset();
  } catch (err) { show(adminApiOutput, err.message); }
});

// ─── ADMIN: USUÁRIOS ───────────────────────────────────────────────────────────
document.getElementById('loadUsersBtn').addEventListener('click', async () => {
  try {
    const data = await api(usersUrl);
    show(usersOutput, data);
  } catch (err) { show(usersOutput, err.message); }
});

// ─── PWA ───────────────────────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
