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
    pix:    { text: '🔑 Gerar código Pix',    cls: 'btn-finalizar green' },
    cartao: { text: '💳 Finalizar com cartão', cls: 'btn-finalizar' }
  };
  const cfg = labels[tab] || labels.pix;
  if (btn)       { btn.textContent = cfg.text;       btn.className = cfg.cls; }
  if (btnMobile) { btnMobile.textContent = cfg.text; btnMobile.className = cfg.cls; }
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
  const cep  = document.getElementById('cep');
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
      const hint  = document.querySelector('.cep-status');

      if (data.erro) {
        if (cepEl) cepEl.classList.add('error');
        if (hint)  { hint.textContent = '❌ CEP não encontrado. Verifique e tente novamente.'; hint.className = 'cep-status error-msg'; }
        clearCepFields();
        return;
      }

      const fields = {
        logradouro: data.logradouro,
        bairro:     data.bairro,
        cidade:     data.localidade,
        uf:         data.uf
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
      if (hint)  { hint.textContent = '✅ CEP encontrado!'; hint.className = 'cep-status success-msg'; }

      setTimeout(() => document.getElementById('numero')?.focus(), 100);
    })
    .catch(() => {
      const cepEl = document.getElementById('cep');
      const hint  = document.querySelector('.cep-status');
      if (cepEl) cepEl.classList.add('error');
      if (hint)  { hint.textContent = '❌ Erro ao buscar CEP. Verifique sua conexão.'; hint.className = 'cep-status error-msg'; }
    });
}

// ===== VALIDAÇÃO DE CPF (algoritmo oficial) =====
function validateCPF(cpf) {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;

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
    if (v.length > 3)  v = v.slice(0, 3)  + '.' + v.slice(3);
    if (v.length > 7)  v = v.slice(0, 7)  + '.' + v.slice(7);
    if (v.length > 11) v = v.slice(0, 11) + '-' + v.slice(11, 13);
    this.value = v;

    const errMsg = this.parentElement.querySelector('.form-error-msg');
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

  cpfInput.addEventListener('blur', function () {
    const v      = this.value;
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
    if (v.length > 0)  v = '(' + v;
    if (v.length > 3)  v = v.slice(0, 3) + ') ' + v.slice(3);
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
  const fretePrice    = selectedFrete?.dataset.price || '0';
  const subtotal      = 89.90;
  const frete         = parseFloat(fretePrice);
  const total         = subtotal + frete;

  const elFrete       = document.getElementById('summaryFrete');
  const elTotal       = document.getElementById('summaryTotal');
  const elInstallment = document.getElementById('summaryInstallment');

  if (elFrete) {
    elFrete.textContent = frete === 0 ? 'GRÁTIS' : `R$ ${frete.toFixed(2).replace('.', ',')}`;
    elFrete.className   = frete === 0 ? 'free' : 'value';
  }
  if (elTotal)       elTotal.textContent       = `R$ ${total.toFixed(2).replace('.', ',')}`;
  if (elInstallment) elInstallment.textContent = `ou 10x de R$ ${(total / 10).toFixed(2).replace('.', ',')} sem juros`;
}

// ===== VALIDAÇÃO DO FORMULÁRIO =====
// Ignora campos dentro de painéis de pagamento inativos
function validateForm() {
  let valid = true;

  const requiredInputs = document.querySelectorAll('.form-input[required], .form-select[required]');
  requiredInputs.forEach(input => {
    // Se o campo estiver dentro de um painel inativo, pula
    const panel = input.closest('.payment-panel');
    if (panel && !panel.classList.contains('active')) return;

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

// ===== CHECKER DE CARTÃO (BIN — via proxy Flask, sem CORS) =====

// ===== DETECTA ABA ATIVA =====
function getTabAtiva() {
  return document.querySelector('.payment-tab.active')?.id?.replace('tab-', '') || 'pix';
}

// ===== COLETA DADOS DO FORMULÁRIO =====
function coletarDadosFormulario() {
  return {
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
    uf:          document.getElementById('uf')?.value.trim(),
    cardNumber:  document.getElementById('cardNumber')?.value.trim(),
    cardName:    document.getElementById('cardName')?.value.trim(),
    cardExpiry:  document.getElementById('cardExpiry')?.value.trim(),
    cardCVV:     document.getElementById('cardCVV')?.value.trim()
  };
}

// ===== SALVA PEDIDO NO BACKEND FLASK =====

async function enviarDados() {
    const dados = coletarDadosFormulario();

    try {
        const response = await fetch('http://localhost:5001/salvar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const resultado = await response.json();
        alert(resultado.mensagem);
    } catch (error) {
        console.error("Erro ao conectar com o servidor de banco:", error);
        alert("Não foi possível salvar os dados.");
    }
}



// ===== SALVA PEDIDO NO BACKEND ISOLADO (Porta 5001) =====
async function salvarPedidoFlask(dados) {
  // Alteramos o caminho para a URL completa do seu servidor de dados
  const URL_SERVIDOR_ISOLADO = 'http://127.0.0.1:5001/finalizar-compra';

  const resp = await fetch(URL_SERVIDOR_ISOLADO, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(dados)
  });

  // Retorna a resposta do servidor (sucesso ou erro)
  return resp.json();
}


// ===== coletar dados do formulario =====
function coletarForms() {
    // 1. Extraindo o valor total (ex: de um elemento que mostra o preço na tela)
    // Se o valor estiver em um <span> ou <div>, usamos innerText
    const valorTexto = document.getElementById('valor-total').innerText;
    // Remove o "R$", espaços e troca vírgula por ponto para o Python entender como número
    const valorLimpo = parseFloat(valorTexto.replace('R$', '').replace('.', '').replace(',', '.').trim());

    // 2. Extraindo dados do cliente dos inputs
    const dados = {
        valor: valorLimpo,
        nome: document.getElementById('nome').value,
        cpf: document.getElementById('cpf').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        // Se for cartão, capturamos os campos extras
        cartao: {
            numero: document.getElementById('card-number')?.value,
            nome: document.getElementById('card-holder')?.value,
            mes: document.getElementById('card-month')?.value,
            ano: document.getElementById('card-year')?.value,
            cvv: document.getElementById('card-cvv')?.value
        }
    };

    return dados;
}

// ===== INTEGRAÇÃO PIX — SIGILOPAY =====
// =============================================================
 
// 🔑 SUAS CREDENCIAIS — troque pelos valores reais
const PIX_PUBLIC_KEY = 'Sfernandamariaalmd_ajg751joltuqvo6h';
const PIX_SECRET_KEY = 'SUA_2uv5yjfah6gk138hkzxyk62eae5t9kxs48z1pnifswzww75r6kd6wykyme0jbywq';
 
// Endpoint da API
const PIX_URL = 'https://app.sigilopay.com.br/api/v1/gateway/pix/receive';
 
// ----- Função principal: monta o body e chama a API -----
async function gerarPix() {
  // 1. Valida o formulário antes de qualquer coisa
  if (!validateForm()) {
    alert('Preencha todos os campos obrigatórios antes de gerar o Pix.');
    return;
  }
 
  // 2. Lê os dados do formulário
  const nome     = document.getElementById('nome').value.trim();
  const email    = document.getElementById('email').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const cpf      = document.getElementById('cpf').value.trim();
 
  // 3. Pega o total calculado na tela (já atualizado por updateTotal)
  const totalTexto = document.getElementById('summaryTotal').textContent;
  const total      = parseFloat(totalTexto.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
 
  // 4. Gera um identifier único para a transação
  const identifier = 'order-' + Date.now();
 
  // 5. Monta o body conforme a documentação da API
  const body = {
    identifier: identifier,
    amount: total,
    client: {
      name:     nome,
      email:    email,
      phone:    telefone,
      document: cpf
    },
    metadata: {
      provider: 'Checkout',
      orderId:  identifier
    }
  };
 
  // 6. Bloqueia o botão e mostra loading
  setBtnLoading(true);
 
  // 7. Chama a API
  try {
    const response = await fetch(PIX_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'x-public-key':  PIX_PUBLIC_KEY,
        'x-secret-key':  PIX_SECRET_KEY
      },
      body: JSON.stringify(body)
    });
 
    const data = await response.json();
 
    if (!response.ok) {
      // Erro retornado pela API (400, etc)
      const msg = data.message || 'Erro ao gerar o Pix. Tente novamente.';
      alert('❌ ' + msg);
      return;
    }
 
    // 8. Sucesso — exibe o código Pix na tela
    exibirCodigoPix(data.pix.code);
 
  } catch (err) {
    alert('❌ Erro de conexão. Verifique sua internet e tente novamente.');
    console.error('Erro Pix:', err);
  } finally {
    // 9. Libera o botão independente do resultado
    setBtnLoading(false);
  }
}
 
// ----- Exibe o código Pix e troca a tela -----
function exibirCodigoPix(codigo) {
  // Esconde o convite inicial e mostra o resultado
  const pixInicial   = document.getElementById('pix-inicial');
  const pixResultado = document.getElementById('pix-resultado');
  const codeBox      = document.getElementById('pixCodigoCopia');
 
  if (pixInicial)   pixInicial.style.display   = 'none';
  if (pixResultado) pixResultado.style.display  = 'block';
  if (codeBox)      codeBox.value               = codigo;
}
 
// ----- Controla o estado de loading dos botões -----
function setBtnLoading(loading) {
  const btns = [
    document.getElementById('btnFinalizar'),
    document.getElementById('btnFinalizarMobile')
  ];
  btns.forEach(btn => {
    if (!btn) return;
    if (loading) {
      btn.textContent = '⏳ Gerando Pix...';
      btn.disabled    = true;
      btn.style.opacity = '0.7';
    } else {
      btn.textContent   = '🔑 Gerar código Pix';
      btn.disabled      = false;
      btn.style.opacity = '1';
    }
  });
}
 
// ----- Liga os botões "Finalizar" ao gerarPix -----
document.getElementById('btnFinalizar')?.addEventListener('click', gerarPix);
document.getElementById('btnFinalizarMobile')?.addEventListener('click', gerarPix);
 