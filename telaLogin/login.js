// Elementos do DOM
const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const messageDiv = document.getElementById("message");

// Formulários
const loginFormElement = document.getElementById("loginForm");
const registerFormElement = document.getElementById("registerForm");

// Campos de input
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");

// Link esqueceu senha
const forgotPasswordLink = document.getElementById("forgotPasswordLink");

// Funções de navegação entre abas
loginTab.addEventListener("click", () => {
    switchTab("login");
});

registerTab.addEventListener("click", () => {
    switchTab("register");
});

function switchTab(tab) {
    if (tab === "login") {
        loginTab.classList.add("active");
        registerTab.classList.remove("active");
        loginForm.classList.add("active");
        registerForm.classList.remove("active");
    } else {
        registerTab.classList.add("active");
        loginTab.classList.remove("active");
        registerForm.classList.add("active");
        loginForm.classList.remove("active");
    }
    clearMessage();
}

// Funções de mensagem
function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
}

function clearMessage() {
    messageDiv.style.display = 'none';
    messageDiv.className = 'message';
}

// Função para verificar se o usuário está logado
function checkAuthState() {
    if (window.firebaseAuth) {
        window.firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                // Usuário está logado, redirecionar para a loja
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userName', user.displayName || user.email);
                localStorage.setItem('userEmail', user.email);
                window.location.href = '../index.html';
            }
        });
    }
}

// Aguardar o Firebase carregar
window.addEventListener('load', () => {
    setTimeout(() => {
        checkAuthState();
        setupEventListeners();
    }, 1000);
});

function setupEventListeners() {
    // Event listener para o formulário de login
    loginFormElement.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();
        
        if (!email || !password) {
            showMessage("Por favor, preencha todos os campos.", "error");
            return;
        }
        
        try {
            // Desabilitar botão durante o processo
            const submitBtn = loginFormElement.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Entrando...';
            
            // Importar função de login do Firebase
            const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
            
            const userCredential = await signInWithEmailAndPassword(window.firebaseAuth, email, password);
            const user = userCredential.user;
            
            showMessage("Login realizado com sucesso!", "success");
            
            // Salvar dados do usuário no localStorage
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userName', user.displayName || user.email);
            localStorage.setItem('userEmail', user.email);
            
            // Verificar se é um gerente e salvar essa informação
            const isManager = email === 'murbackmariaelisa@gmail.com';
            localStorage.setItem('userIsManager', isManager ? 'true' : 'false');
            
            // Redirecionar para a página inicial após 1 segundo
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
            
        } catch (error) {
            console.error("Erro no login:", error);
            let errorMessage = "Erro ao fazer login. Tente novamente.";
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = "Usuário não encontrado.";
                    break;
                case 'auth/wrong-password':
                    errorMessage = "Senha incorreta.";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "Email inválido.";
                    break;
                case 'auth/too-many-requests':
                    errorMessage = "Muitas tentativas. Tente novamente mais tarde.";
                    break;
            }
            
            showMessage(errorMessage, "error");
        } finally {
            // Reabilitar botão
            const submitBtn = loginFormElement.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Entrar';
        }
    });

    // Event listener para o formulário de cadastro
    registerFormElement.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const name = registerName.value.trim();
        const email = registerEmail.value.trim();
        const password = registerPassword.value.trim();
        
        if (!name || !email || !password) {
            showMessage("Por favor, preencha todos os campos.", "error");
            return;
        }
        
        if (password.length < 6) {
            showMessage("A senha deve ter pelo menos 6 caracteres.", "error");
            return;
        }
        
        try {
            // Desabilitar botão durante o processo
            const submitBtn = registerFormElement.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Cadastrando...';
            
            // Importar funções do Firebase
            const { createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
            
            const userCredential = await createUserWithEmailAndPassword(window.firebaseAuth, email, password);
            const user = userCredential.user;
            
            // Atualizar o perfil do usuário com o nome
            await updateProfile(user, {
                displayName: name
            });
            
            showMessage("Cadastro realizado com sucesso!", "success");
            
            // Salvar dados do usuário no localStorage
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userName', name);
            localStorage.setItem('userEmail', email);
            
            // Verificar se é um gerente e salvar essa informação
            const isManager = email === 'murbackmariaelisa@gmail.com';
            localStorage.setItem('userIsManager', isManager ? 'true' : 'false');
            
            // Redirecionar para a página inicial após 1 segundo
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
            
        } catch (error) {
            console.error("Erro no cadastro:", error);
            let errorMessage = "Erro ao criar conta. Tente novamente.";
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = "Este email já está em uso.";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "Email inválido.";
                    break;
                case 'auth/weak-password':
                    errorMessage = "Senha muito fraca.";
                    break;
            }
            
            showMessage(errorMessage, "error");
        } finally {
            // Reabilitar botão
            const submitBtn = registerFormElement.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Cadastrar';
        }
    });

    // Event listener para esqueceu a senha
    forgotPasswordLink.addEventListener("click", async (e) => {
        e.preventDefault();
        
        const email = loginEmail.value.trim();
        
        if (!email) {
            showMessage("Digite seu email no campo acima para recuperar a senha.", "error");
            return;
        }
        
        try {
            const { sendPasswordResetEmail } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
            
            await sendPasswordResetEmail(window.firebaseAuth, email);
            showMessage("Email de recuperação enviado! Verifique sua caixa de entrada.", "success");
            
        } catch (error) {
            console.error("Erro ao enviar email de recuperação:", error);
            let errorMessage = "Erro ao enviar email de recuperação.";
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = "Email não encontrado.";
            }
            
            showMessage(errorMessage, "error");
        }
    });
}

// Função para logout (será usada em outras páginas)
window.logoutUser = async function() {
    try {
        const { signOut } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        await signOut(window.firebaseAuth);
        
        // Limpar localStorage
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        
        // Redirecionar para login
        window.location.href = 'telaLogin/login.html';
    } catch (error) {
        console.error("Erro no logout:", error);
    }
};

