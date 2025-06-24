const slides = [
  {
    titulo: "Lojinha Distrital",
    descricao: "Confira os produtos oficiais e apoie o distrito!"
  },
  {
    titulo: "Comunicado Mensal",
    descricao: "Leia as novidades e informes importantes deste mês.",
    botao: {
      texto: "Ver Comunicado",
      link: "homepage/comunicado.pdf"
    }
  },
  {
    titulo: "Nossos Projetos",
    descricao: "Em breve, conheça os projetos em andamento no nosso distrito."
  }
];

let current = 0;

function updateSlide() {
  const slide = slides[current];

  // Atualiza o título
  document.getElementById("slide-text").textContent = slide.titulo;

  // Atualiza a descrição
  const descricaoEl = document.getElementById("slide-descricao");
  descricaoEl.textContent = slide.descricao;

  // Atualiza os botões do slide
  const catalogoBtnContainer = document.getElementById("catalogo-btn-container");
  catalogoBtnContainer.innerHTML = "";

  if (slide.titulo === "Lojinha Distrital") {
    const btn = document.createElement("button");
    btn.textContent = "Acessar Catálogo";
    btn.classList.add("catalogo-btn");
    btn.onclick = () => window.location.href = "/catalogo/catalogo.html";
    catalogoBtnContainer.appendChild(btn);
  }

  if (slide.botao) {
    const btn = document.createElement("button");
    btn.textContent = slide.botao.texto;
    btn.classList.add("catalogo-btn");
    btn.onclick = () => window.open(slide.botao.link, "_blank");
    catalogoBtnContainer.appendChild(btn);
  }

  updateDots();
}

function updateDots() {
  const dotsContainer = document.getElementById("dots-container");
  dotsContainer.innerHTML = "";

  slides.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.className = "dot" + (index === current ? " active" : "");
    dot.style.cursor = "pointer";
    dot.onclick = () => {
      current = index;
      updateSlide();
    };
    dotsContainer.appendChild(dot);
  });
}


// Funções para os botões Anterior e Próximo
document.getElementById("prev-btn").onclick = () => {
  current = (current - 1 + slides.length) % slides.length;
  updateSlide();
};

document.getElementById("next-btn").onclick = () => {
  current = (current + 1) % slides.length;
  updateSlide();
};

function toggleMenu() {
  const menu = document.getElementById("menu-items");
  if (menu.style.display === "none" || menu.style.display === "") {
    menu.style.display = "block";
  } else {
    menu.style.display = "none";
  }
}

// Event listener seguro
document.addEventListener('DOMContentLoaded', function() {
  const menuButton = document.querySelector('#menu button');
  if (menuButton) {
    menuButton.addEventListener('click', toggleMenu);
  }
});

// Inicia o slide ao carregar a página
window.onload = updateSlide;

 // Função para lidar com clique no botão de autenticação
    function handleAuthClick() {
      const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
      
      if (isLoggedIn) {
        // Fazer logout
        logoutUser();
      } else {
        // Ir para tela de login
        window.location.href = 'telaLogin/login.html';
      }
    }
    
    // Função para logout
    async function logoutUser() {
      try {
        if (window.firebaseAuth) {
          const { signOut } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
          await signOut(window.firebaseAuth);
        }
        
        // Limpar localStorage
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        
        // Atualizar interface
        updateAuthUI();
        
      } catch (error) {
        console.error("Erro no logout:", error);
      }
    }
    
    // Função para atualizar a interface baseada no estado de autenticação
    function updateAuthUI() {
      const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      const authButton = document.getElementById('auth-button');
      const userInfo = document.getElementById('user-info');
      
      if (isLoggedIn && userName) {
        authButton.textContent = 'Logout';
        userInfo.textContent = `Olá, ${userName}`;
        userInfo.style.display = 'block';
        
        // Check if user is a manager and show management button if they are
        const isManager = localStorage.getItem('userIsManager') === 'true';
        if (isManager) {
          // Create management button if it doesn't exist
          if (!document.getElementById('management-button')) {
            const managementBtn = document.createElement('button');
            managementBtn.id = 'management-button';
            managementBtn.textContent = '⚙️ Gerenciar';
            managementBtn.classList.add('management-btn');
            managementBtn.onclick = () => window.location.href = 'management/management.html';
            document.getElementById('btn-login').appendChild(managementBtn);
          }
        }
      } else {
        authButton.textContent = 'Login';
        userInfo.style.display = 'none';
        
        // Remove management button if it exists
        const managementBtn = document.getElementById('management-button');
        if (managementBtn) {
          managementBtn.remove();
        }
      }
    }
    
    // Verificar estado de autenticação quando a página carregar
    window.addEventListener('load', () => {
      updateAuthUI();
      
      // Verificar com Firebase também
      setTimeout(() => {
        if (window.firebaseAuth) {
          window.firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
              localStorage.setItem('userLoggedIn', 'true');
              localStorage.setItem('userName', user.displayName || user.email);
              localStorage.setItem('userEmail', user.email);
              
              // Verificar se é um gerente e salvar essa informação
              const isManager = user.email === 'murbackmariaelisa@gmail.com';
              localStorage.setItem('userIsManager', isManager ? 'true' : 'false');
            } else {
              localStorage.removeItem('userLoggedIn');
              localStorage.removeItem('userName');
              localStorage.removeItem('userEmail');
              localStorage.removeItem('userIsManager');
            }
            updateAuthUI();
          });
        }
      }, 1000);
    });
    
    // Disponibilizar função globalmente
    window.handleAuthClick = handleAuthClick;