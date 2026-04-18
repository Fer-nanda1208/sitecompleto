// --- Gallery ---
const images = [
  'https://a-static.mlcdn.com.br/420x420/jogo-de-panelas-antiaderente-ceramico-fogao-inducao-kit-10-pecas-pratic-cook-marmol-mimo-style/magazinegeraiscomercio/ut4797-1/abfea51a7041aaf997996521e2a1dd7c.jpeg',
  'https://a-static.mlcdn.com.br/420x420/jogo-de-panelas-antiaderente-ceramico-fogao-inducao-kit-10-pecas-pratic-cook-marmol-mimo-style/magazinegeraiscomercio/ut4797-1/313021f7492baafea5776811bfcd0e40.jpeg',
  'https://a-static.mlcdn.com.br/420x420/jogo-de-panelas-antiaderente-ceramico-fogao-inducao-kit-10-pecas-pratic-cook-marmol-mimo-style/magazinegeraiscomercio/ut4797-1/9d4da30f2d4e601fa29cb33bd729c1ff.jpeg'
];

function changeImage(index, btn) {
  document.getElementById('mainImage').src = images[index];
  document.querySelectorAll('.thumb-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// --- Description toggle ---
let descExpanded = false;
function toggleDesc() {
  const block = document.getElementById('descBlock');
  const factsheet = document.getElementById('factsheetBlock');
  descExpanded = !descExpanded;
  if (descExpanded) {
    block.classList.remove('description-collapsed');
    factsheet.style.display = 'block';
    document.getElementById('seeMoreBtn').style.display = 'none';
  } else {
    block.classList.add('description-collapsed');
    factsheet.style.display = 'none';
    document.getElementById('seeMoreBtn').style.display = 'flex';
  }
}

// --- Modals ---
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalOutside(e, id) {
  if (e.target === document.getElementById(id)) closeModal(id);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
    });
    document.body.style.overflow = '';
  }
});

// --- Tabs (installments) ---
function switchTab(id) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  event.target.classList.add('active');
}

// --- CEP formatting ---
function formatCEP(input) {
  let v = input.value.replace(/\D/g, '');
  if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5, 8);
  input.value = v;
}

function calcShipping() {
  const cep = document.getElementById('cepInput').value.replace(/\D/g, '');
  if (cep.length < 8) {
    alert('Por favor, informe um CEP válido com 8 dígitos.');
    return;
  }
  document.getElementById('shippingResult').classList.add('show');
}

// --- Buy option selection ---
function selectBuyOption(el) {
  document.querySelectorAll('.buy-option').forEach(o => {
    o.style.borderColor = 'var(--grey-border)';
    o.style.background = '';
  });
  el.style.borderColor = 'var(--blue)';
  el.style.background = 'var(--blue-light)';
}

// --- Buy Now: redirect to checkout ---
function buyNow() {
  window.location.href = '/checkout';
}

// --- Prevent back-navigation from checkout returning to index ---
// Push a duplicate state so that if the user presses back FROM checkout,
// they end up redirected to the home page instead of getting stuck mid-flow.
history.pushState(null, '', window.location.href);
window.addEventListener('popstate', function () {
  window.location.href = '/';
});


document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
});