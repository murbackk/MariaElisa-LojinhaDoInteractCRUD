
// Verificação de autenticação
function checkAuthentication() {
  const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  const userName = localStorage.getItem('userName');
  
  const authCheck = document.getElementById('auth-check');
  const pagamentoContent = document.getElementById('pagamento-content');
  const userWelcome = document.getElementById('user-welcome');
  const welcomeUserName = document.getElementById('welcome-user-name');
  
  if (isLoggedIn && userName) {
    // Usuário está logado, mostrar conteúdo de pagamento
    authCheck.style.display = 'none';
    pagamentoContent.style.display = 'block';
    userWelcome.style.display = 'block';
    welcomeUserName.textContent = userName;
  } else {
    // Usuário não está logado, mostrar tela de login necessário
    authCheck.style.display = 'block';
    pagamentoContent.style.display = 'none';
  }
}

// Função para finalizar compra (registrar no Firebase)
async function finalizarCompra() {
  const userName = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail');
  const valorTotal = localStorage.getItem('valorTotalCarrinho') || '0.00';
  
  // Aqui você pode adicionar lógica para salvar a compra no Firebase
  // Por exemplo, usando Firestore para registrar a transação
  
  try {
    // Simular salvamento da compra
    const compra = {
      usuario: userName,
      email: userEmail,
      valor: valorTotal,
      data: new Date().toISOString(),
      status: 'concluida'
    };
    
    console.log('Compra registrada:', compra);
    
    // Limpar carrinho
    localStorage.removeItem('valorTotalCarrinho');
    
    // Mostrar mensagem de sucesso e redirecionar
    alert(`Compra finalizada com sucesso!\nUsuário: ${userName}\nValor: R$ ${valorTotal}`);
    window.location.href = '../index.html';
    
  } catch (error) {
    console.error('Erro ao finalizar compra:', error);
    alert('Erro ao finalizar compra. Tente novamente.');
  }
}

// Event listeners para pagamento
document.getElementById("pix-option").onclick = () => {
  document.querySelector(".pagamento-options").style.display = "none";
  document.getElementById("pix-qrcode").style.display = "block";
  document.getElementById("pagamento-realizado").style.display = "block";

  const valor = localStorage.getItem("valorTotalCarrinho") || "0.00";
  gerarQRCode(valor);
};

document.getElementById("cartao-option").onclick = () => {
  document.querySelector(".pagamento-options").style.display = "none";
  document.getElementById("form-cartao").style.display = "block";
};

function gerarPayloadPix(chave, valor, nome, cidade) {
  const formatarValor = parseFloat(valor).toFixed(2);

  const chavePixField = '0014br.gov.bcb.pix' + '01' + chave.length.toString().padStart(2, '0') + chave;
  const chavePixLength = chavePixField.length.toString().padStart(2, '0');

  const payload = [
    '000201',
    '26' + chavePixLength + chavePixField,
    '52040000',
    '5303986',
    '54' + formatarValor.length.toString().padStart(2, '0') + formatarValor,
    '5802BR',
    '59' + nome.length.toString().padStart(2, '0') + nome,
    '60' + cidade.length.toString().padStart(2, '0') + cidade,
    '62070503***'
  ];

  let payloadStr = payload.join('');
  const crc = crc16(payloadStr + '6304');
  payloadStr += '6304' + crc;

  return payloadStr;
}

function crc16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
  }
  return ((crc ^ 0x0000) & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function gerarQRCode(valor) {
  const chavePix = "marcelinomaria159@gmail.com";
  const nomeRecebedor = "MARIA ELISA MURBACK MARCELINO";
  const cidade = "MAMBORE";

  const payload = gerarPayloadPix(chavePix, valor, nomeRecebedor, cidade);

  const qrDiv = document.getElementById("qrcode");
  qrDiv.innerHTML = "";
  new QRCode(qrDiv, {
    text: payload,
    width: 300,
    height: 300
  });
}

function toggleMenu() {
  const menu = document.getElementById("menu-items");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function validarCartao() {
  const input = document.getElementById("numero-cartao").value.replace(/\D/g, "");
  let soma = 0;
  let alternar = false;

  for (let i = input.length - 1; i >= 0; i--) {
    let n = parseInt(input.charAt(i));
    if (alternar) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    soma += n;
    alternar = !alternar;
  }

  const valido = soma % 10 === 0;
  const status = document.getElementById("cartao-status");
  if (valido) {
    status.textContent = "Cartão válido ✅";
    status.style.color = "green";
    document.getElementById("pagamento-realizado").style.display = "block";
  } else {
    status.textContent = "Cartão inválido ❌";
    status.style.color = "red";
  }
}

// Verificar autenticação quando a página carregar
window.onload = () => {
  checkAuthentication();
  
  // Verificar com Firebase também
  setTimeout(() => {
    if (window.firebaseAuth) {
      window.firebaseAuth.onAuthStateChanged((user) => {
        if (user) {
          localStorage.setItem('userLoggedIn', 'true');
          localStorage.setItem('userName', user.displayName || user.email);
          localStorage.setItem('userEmail', user.email);
        } else {
          localStorage.removeItem('userLoggedIn');
          localStorage.removeItem('userName');
          localStorage.removeItem('userEmail');
        }
        checkAuthentication();
      });
    }
  }, 1000);
  
  const valor = localStorage.getItem("valorTotalCarrinho") || "0.00";
  document.getElementById("valor-pix").textContent = `Valor: R$ ${valor}`;
};

// Disponibilizar função globalmente
window.finalizarCompra = finalizarCompra;