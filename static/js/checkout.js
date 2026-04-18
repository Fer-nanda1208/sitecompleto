// ===== SELEÇÃO DE FRETE =====
document.querySelectorAll('.frete-option').forEach(option => {
  option.addEventListener('click', () => {
    document.querySelectorAll('.frete-option').forEach(o => o.classList.remove('selected'));
    option.classList.add('selected');
    updateTotal();
  });
});

// ===== ABAS DE PAGAMENTO =====
function switchPayment(tab) {
  document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.payment-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('panel-' + tab).classList.add('active');
  updateFinalBtn(tab);
}

function updateFinalBtn(tab) {
  const btn = document.getElementById('btnFinalizar');
  const btnMobile = document.getElementById('btnFinalizarMobile');
  const labels = {
    pix: { text: '🔑 Finalizar com Pix', cls: 'btn-finalizar green' },
    cartao: { text: '💳 Finalizar compra', cls: 'btn-finalizar' },
    boleto: { text: '📄 Gerar boleto', cls: 'btn-finalizar' }
  };
  const cfg = labels[tab] || labels.cartao;
  if (btn) { btn.textContent = cfg.text; btn.className = cfg.cls; }
  if (btnMobile) { btnMobile.textContent = cfg.text; btnMobile.className = cfg.cls + ' mobile-only'; }
}

// ===== BUSCA DE CEP (ViaCEP real) =====
const cepInput = document.getElementById('cep');
if (cepInput) {
  cepInput.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '');
    if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5, 8);
    this.value = v;

    const digits = v.replace('-', '');
    if (digits.length === 8) {
      fetchCEP(digits);
    } else {
      // Limpa feedback visual enquanto digita
      this.classList.remove('valid', 'error');
      clearCepFields();
    }
  });
}

function clearCepFields() {
  ['logradouro', 'bairro', 'cidade'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.classList.remove('valid', 'error'); }
  });
  const uf = document.getElementById('uf');
  if (uf) uf.value = '';
}

function setCepLoading(loading) {
  const cep = document.getElementById('cep');
  const hint = document.querySelector('.cep-status');
  if (!cep) return;
  if (loading) {
    cep.classList.remove('valid', 'error');
    if (hint) { hint.textContent = '🔄 Buscando CEP...'; hint.className = 'cep-status loading'; }
  }
}

function fetchCEP(cep) {
  setCepLoading(true);

  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then(r => {
      if (!r.ok) throw new Error('Erro de rede');
      return r.json();
    })
    .then(data => {
      const cepEl = document.getElementById('cep');
      const hint = document.querySelector('.cep-status');

      if (data.erro) {
        // CEP não encontrado
        if (cepEl) cepEl.classList.add('error');
        if (hint) { hint.textContent = '❌ CEP não encontrado. Verifique e tente novamente.'; hint.className = 'cep-status error-msg'; }
        clearCepFields();
        return;
      }

      // Sucesso — preenche os campos
      const fields = {
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        uf: data.uf
      };

      Object.entries(fields).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el && value) {
          el.value = value;
          el.classList.add('valid');
          el.classList.remove('error');
        }
      });

      if (cepEl) { cepEl.classList.add('valid'); cepEl.classList.remove('error'); }
      if (hint) { hint.textContent = '✅ CEP encontrado!'; hint.className = 'cep-status success-msg'; }

      // Foca no campo número após preencher
      setTimeout(() => document.getElementById('numero')?.focus(), 100);
    })
    .catch(() => {
      const cepEl = document.getElementById('cep');
      const hint = document.querySelector('.cep-status');
      if (cepEl) cepEl.classList.add('error');
      if (hint) { hint.textContent = '❌ Erro ao buscar CEP. Verifique sua conexão.'; hint.className = 'cep-status error-msg'; }
    });
}

// ===== VALIDAÇÃO DE CPF (algoritmo oficial) =====
function validateCPF(cpf) {
  const digits = cpf.replace(/\D/g, '');

  if (digits.length !== 11) return false;

  // Rejeita sequências repetidas (ex: 000.000.000-00, 111.111.111-11)
  if (/^(\d)\1{10}$/.test(digits)) return false;

  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;

  // Calcula o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[10])) return false;

  return true;
}

// ===== MÁSCARA CPF + VALIDAÇÃO em tempo real =====
const cpfInput = document.getElementById('cpf');
if (cpfInput) {
  cpfInput.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '');
    if (v.length > 3) v = v.slice(0, 3) + '.' + v.slice(3);
    if (v.length > 7) v = v.slice(0, 7) + '.' + v.slice(7);
    if (v.length > 11) v = v.slice(0, 11) + '-' + v.slice(11, 13);
    this.value = v;

    const errMsg = this.parentElement.querySelector('.form-error-msg');

    // Só valida quando o CPF está completo (14 chars com máscara)
    if (v.length === 14) {
      if (validateCPF(v)) {
        this.classList.add('valid');
        this.classList.remove('error');
        if (errMsg) errMsg.classList.remove('show');
      } else {
        this.classList.add('error');
        this.classList.remove('valid');
        if (errMsg) { errMsg.textContent = 'CPF inválido. Verifique os números digitados.'; errMsg.classList.add('show'); }
      }
    } else {
      this.classList.remove('valid', 'error');
      if (errMsg) errMsg.classList.remove('show');
    }
  });

  // Valida também ao perder o foco
  cpfInput.addEventListener('blur', function () {
    const v = this.value;
    const errMsg = this.parentElement.querySelector('.form-error-msg');
    if (v.length > 0 && v.length < 14) {
      this.classList.add('error');
      if (errMsg) { errMsg.textContent = 'CPF incompleto.'; errMsg.classList.add('show'); }
    }
  });
}

// ===== MÁSCARA TELEFONE =====
const telInput = document.getElementById('telefone');
if (telInput) {
  telInput.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '');
    if (v.length > 0) v = '(' + v;
    if (v.length > 3) v = v.slice(0, 3) + ') ' + v.slice(3);
    if (v.length > 10) v = v.slice(0, 10) + '-' + v.slice(10, 14);
    this.value = v;
  });
}

// ===== MÁSCARA CARTÃO =====
let binDebounceTimer = null;
const cardNumInput = document.getElementById('cardNumber');
if (cardNumInput) {
  cardNumInput.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').slice(0, 16);
    v = v.match(/.{1,4}/g)?.join(' ') || v;
    this.value = v;
  });
}

// ===== MÁSCARA VALIDADE =====
const cardExpInput = document.getElementById('cardExpiry');
if (cardExpInput) {
  cardExpInput.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '');
    if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
    this.value = v;
  });
}

// ===== MÁSCARA CVV =====
const cvvInput = document.getElementById('cardCVV');
if (cvvInput) {
  cvvInput.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 4);
  });
}

// ===== ATUALIZAR TOTAL =====
function updateTotal() {
  const selectedFrete = document.querySelector('.frete-option.selected');
  const fretePrice = selectedFrete?.dataset.price || '0';
  const subtotal = 99.00;
  const frete = parseFloat(fretePrice);
  const total = subtotal + frete;

  const elFrete = document.getElementById('summaryFrete');
  const elTotal = document.getElementById('summaryTotal');
  const elInstallment = document.getElementById('summaryInstallment');

  if (elFrete) {
    elFrete.textContent = frete === 0 ? 'GRÁTIS' : `R$ ${frete.toFixed(2).replace('.', ',')}`;
    elFrete.className = frete === 0 ? 'free' : 'value';
  }
  if (elTotal) {
    elTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
  }
  if (elInstallment) {
    const parcel = (total / 10).toFixed(2).replace('.', ',');
    elInstallment.textContent = `ou 10x de R$ ${parcel} sem juros`;
  }
}

// ===== VALIDAÇÃO DO FORMULÁRIO =====
function validateForm() {
  let valid = true;

  // Campos obrigatórios padrão
  const requiredInputs = document.querySelectorAll('.form-input[required], .form-select[required]');
  requiredInputs.forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('error');
      input.classList.remove('valid');
      const errMsg = input.parentElement.querySelector('.form-error-msg');
      if (errMsg) errMsg.classList.add('show');
      valid = false;
    } else {
      input.classList.remove('error');
      input.classList.add('valid');
      const errMsg = input.parentElement.querySelector('.form-error-msg');
      if (errMsg) errMsg.classList.remove('show');
    }
  });

  // Valida CPF separadamente
  const cpfEl = document.getElementById('cpf');
  if (cpfEl && cpfEl.value) {
    if (!validateCPF(cpfEl.value)) {
      cpfEl.classList.add('error');
      cpfEl.classList.remove('valid');
      const errMsg = cpfEl.parentElement.querySelector('.form-error-msg');
      if (errMsg) { errMsg.textContent = 'CPF inválido. Verifique os números digitados.'; errMsg.classList.add('show'); }
      valid = false;
    }
  }

  return valid;
}

// ===== CHECKER DE CARTÃO (BIN — 6 primeiros dígitos) =====
if (cardNumInput) {
  cardNumInput.addEventListener('input', function () {
    // Máscara já aplicada acima; aqui só fazemos o BIN check
    const digits = this.value.replace(/\D/g, '');
    const binStatus = document.querySelector('.bin-status');

    // Reseta visual enquanto o usuário ainda digita
    this.classList.remove('valid', 'error');
    if (binStatus) { binStatus.textContent = ''; binStatus.className = 'bin-status'; }

    clearTimeout(binDebounceTimer);

    // Consulta BIN somente quando o usuário digitou ao menos 6 dígitos
    if (digits.length >= 6) {
      binDebounceTimer = setTimeout(() => fetchBIN(digits.slice(0, 6)), 600);
    }
  });
}

function fetchBIN(bin) {
  const input = document.getElementById('cardNumber');
  const binStatus = document.querySelector('.bin-status');

  if (binStatus) { binStatus.textContent = '🔄 Verificando cartão...'; binStatus.className = 'bin-status loading'; }

  fetch(`https://lookup.binlist.net/${bin}`, {
    headers: { 'Accept-Version': '3' }
  })
    .then(r => {
      if (r.status === 404) throw new Error('not_found');
      if (!r.ok) throw new Error('network');
      return r.json();
    })
    .then(data => {
      // BIN válido — monta label descritivo
      const scheme = (data.scheme || '').toUpperCase();           // VISA, MASTERCARD…
      const type   = data.type   ? ` · ${data.type}`   : '';     // debit / credit
      const brand  = data.brand  ? ` · ${data.brand}`  : '';     // Electron, Maestro…
      const bank   = data.bank?.name ? ` — ${data.bank.name}` : '';
      const label  = `✅ ${scheme}${type}${brand}${bank}`;

      if (input)     { input.classList.add('valid'); input.classList.remove('error'); }
      if (binStatus) { binStatus.textContent = label; binStatus.className = 'bin-status success-msg'; }
    })
    .catch(err => {
      const msg = err.message === 'not_found'
        ? '❌ Cartão não reconhecido. Verifique os números.'
        : '⚠️ Não foi possível verificar o cartão agora.';

      if (input)     { input.classList.add('error'); input.classList.remove('valid'); }
      if (binStatus) { binStatus.textContent = msg; binStatus.className = 'bin-status error-msg'; }
    });
}

// ===== ENVIO DOS DADOS AO BACKEND FLASK =====
async function enviarPedidoFlask() {
  const dados = {
    nome:        document.getElementById('nome')?.value.trim(),
    cpf:         document.getElementById('cpf')?.value.trim(),
    email:       document.getElementById('email')?.value.trim(),
    telefone:    document.getElementById('telefone')?.value.trim(),
    cep:         document.getElementById('cep')?.value.trim(),
    logradouro:  document.getElementById('logradouro')?.value.trim(),
    numero:      document.getElementById('numero')?.value.trim(),
    complemento: document.getElementById('complemento')?.value.trim() || null,
    bairro:      document.getElementById('bairro')?.value.trim(),
    cidade:      document.getElementById('cidade')?.value.trim(),
    uf:          document.getElementById('uf')?.value.trim()
  };

  const resp = await fetch('/finalizar-compra', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });

  return resp.json(); // { status: "sucesso" } ou { status: "erro", mensagem: "..." }
}

// ===== SUBMIT / FINALIZAR =====
document.getElementById('btnFinalizar')?.addEventListener('click', async function () {
  if (!validateForm()) {
    const firstError = document.querySelector('.form-input.error, .form-select.error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Desabilita o botão enquanto envia para evitar duplo clique
  this.disabled = true;
  this.textContent = '⏳ Enviando...';

  try {
    const resultado = await enviarPedidoFlask();

    if (resultado.status === 'sucesso') {
      openSuccessModal();
    } else {
      showToast(`❌ Erro ao finalizar: ${resultado.mensagem || 'tente novamente.'}`, 'error');
    }
  } catch (e) {
    showToast('❌ Falha de conexão com o servidor. Tente novamente.', 'error');
  } finally {
    // Reabilita o botão independente do resultado
    this.disabled = false;
    updateFinalBtn(document.querySelector('.payment-tab.active')?.id?.replace('tab-', '') || 'pix');
  }
});

// ===== MODAL DE SUCESSO =====
function openSuccessModal() {
  document.getElementById('successModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
  document.getElementById('successModal').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('successModal')?.addEventListener('click', function (e) {
  if (e.target === this) closeSuccessModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSuccessModal();
});

// ===== CUPOM =====
document.getElementById('btnCupom')?.addEventListener('click', function () {
  const input = document.getElementById('cupomInput');
  const val = input?.value.trim().toUpperCase();
  if (!val) return;

  const coupons = { 'MAGALU10': 10, 'FRETE0': 0, 'PROMO20': 20 };

  if (coupons[val] !== undefined) {
    showToast('✅ Cupom aplicado com sucesso!', 'success');
    input.classList.add('valid');
    input.readOnly = true;
    this.textContent = 'Remover';
    this.style.color = 'var(--error)';
    this.style.borderColor = 'var(--error)';
    this.onclick = () => removeCupom(input, this);
  } else {
    showToast('❌ Cupom inválido ou expirado.', 'error');
    input.classList.add('error');
    setTimeout(() => input.classList.remove('error'), 2000);
  }
});

function removeCupom(input, btn) {
  input.value = '';
  input.readOnly = false;
  input.classList.remove('valid');
  btn.textContent = 'Aplicar';
  btn.style.color = '';
  btn.style.borderColor = '';
  btn.onclick = null;
}

// ===== TOAST =====
function showToast(msg, type) {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
    background: ${type === 'success' ? '#1d6a3e' : '#b00215'};
    color: white; padding: 12px 24px; border-radius: 100px;
    font-size: 14px; font-weight: 600; z-index: 9999;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    animation: fadeInUp 0.3s ease;
    white-space: nowrap;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===== INICIALIZAR =====
document.addEventListener('DOMContentLoaded', () => {
  updateTotal();

  // Limpa erro ao digitar (exceto CPF que tem validação própria)
  document.querySelectorAll('.form-input:not(#cpf)').forEach(input => {
    input.addEventListener('input', function () {
      if (this.value.trim()) {
        this.classList.remove('error');
        const errMsg = this.parentElement.querySelector('.form-error-msg');
        if (errMsg) errMsg.classList.remove('show');
      }
    });
  });

  // Botão mobile de finalizar
  const btnMobile = document.getElementById('btnFinalizarMobile');
  if (btnMobile) {
    btnMobile.addEventListener('click', () => {
      document.getElementById('btnFinalizar')?.click();
    });
  }
});