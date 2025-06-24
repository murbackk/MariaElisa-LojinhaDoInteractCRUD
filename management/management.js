// JavaScript for the management panel
// Verifies manager status and manages slides, products, users, and orders

document.addEventListener('DOMContentLoaded', function() {
    checkManagerAuth();
    setupTabNavigation();
    
    // Load data
    loadSlides();
    loadProducts();
    loadUsers();
    loadOrders();
    
    // Setup modals and form handlers
    setupSlideModal();
    setupProductModal();
    setupUserModal();
    
    // Display manager info
    displayManagerInfo();
});

// =============== Authentication & Authorization ===============

// Check if user is a manager
function checkManagerAuth() {
    // Wait for Firebase auth to initialize
    setTimeout(() => {
        if (window.firebaseAuth) {
            window.firebaseAuth.onAuthStateChanged((user) => {
                if (!user) {
                    // No user logged in, redirect to login page
                    window.location.href = '../telaLogin/login.html';
                    return;
                }
                
                // Check if email is the manager's email
                if (user.email === 'murbackmariaelisa@gmail.com') {
                    console.log('Manager authenticated');
                    displayManagerInfo();
                } else {
                    // Not a manager, redirect to home
                    alert('Acesso restrito. Você não tem permissão para acessar esta página.');
                    window.location.href = '../index.html';
                }
            });
        }
    }, 1000);
}

// Display manager information
function displayManagerInfo() {
    const managerName = localStorage.getItem('userName');
    if (managerName) {
        document.getElementById('manager-name').textContent = `Gerente: ${managerName}`;
    }
}

// Logout function
function logoutUser() {
    try {
        if (window.firebaseAuth) {
            window.firebaseAuth.signOut().then(() => {
                // Clear localStorage
                localStorage.removeItem('userLoggedIn');
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');
                
                // Redirect to login
                window.location.href = '../telaLogin/login.html';
            }).catch((error) => {
                console.error("Erro no logout:", error);
            });
        }
    } catch (error) {
        console.error("Erro no logout:", error);
    }
}
window.logoutUser = logoutUser;

// =============== Tab Navigation ===============

function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding content
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// =============== Slide Management ===============

// Slides data
let slidesData = [];

// Load slides from localStorage or default values
function loadSlides() {
    const savedSlides = localStorage.getItem('slides');
    
    if (savedSlides) {
        slidesData = JSON.parse(savedSlides);
    } else {
        // Default slides from the original site
        slidesData = [
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
        // Save default slides
        saveSlides();
    }
    
    // Display slides
    displaySlides();
}

// Save slides to localStorage
function saveSlides() {
    localStorage.setItem('slides', JSON.stringify(slidesData));
    
    // Update the slides on the main page too
    // This ensures consistency between the manager panel and the main site
    if (window.parent && window.parent.slides !== undefined) {
        window.parent.slides = slidesData;
    }
}

// Display slides in the management panel
function displaySlides() {
    const container = document.getElementById('slides-container');
    container.innerHTML = '';
    
    slidesData.forEach((slide, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        
        let buttonHTML = '';
        if (slide.botao) {
            buttonHTML = `
                <div><strong>Botão:</strong> ${slide.botao.texto} (Link: ${slide.botao.link})</div>
            `;
        }
        
        card.innerHTML = `
            <h3>${slide.titulo}</h3>
            <p>${slide.descricao}</p>
            ${buttonHTML}
            <div class="card-actions">
                <button class="edit-btn" onclick="editSlide(${index})">Editar</button>
                <button class="delete-btn" onclick="deleteSlide(${index})">Excluir</button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Set up slide modal (for add/edit)
function setupSlideModal() {
    const modal = document.getElementById('slide-modal');
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const addBtn = document.getElementById('add-slide-btn');
    const form = document.getElementById('slide-form');
    const hasButtonCheckbox = document.getElementById('slide-has-button');
    const buttonDetails = document.getElementById('button-details');
    
    // Close modal on X click
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close modal on Cancel button click
    cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'none';
    });
    
    // Show modal on Add button click
    addBtn.addEventListener('click', () => {
        document.getElementById('slide-modal-title').textContent = 'Adicionar Slide';
        form.reset();
        form.setAttribute('data-mode', 'add');
        document.getElementById('slide-index').value = '';
        buttonDetails.style.display = 'none';
        modal.style.display = 'block';
    });
    
    // Toggle button details visibility
    hasButtonCheckbox.addEventListener('change', function() {
        buttonDetails.style.display = this.checked ? 'block' : 'none';
    });
    
    // Form submission handler
    form.addEventListener('submit', handleSlideFormSubmit);
}

// Handle slide form submission (add or edit)
function handleSlideFormSubmit(e) {
    e.preventDefault();
    
    const mode = e.target.getAttribute('data-mode');
    const titulo = document.getElementById('slide-titulo').value;
    const descricao = document.getElementById('slide-descricao').value;
    const hasButton = document.getElementById('slide-has-button').checked;
    
    let botao = null;
    if (hasButton) {
        const buttonText = document.getElementById('slide-button-text').value;
        const buttonLink = document.getElementById('slide-button-link').value;
        
        if (buttonText && buttonLink) {
            botao = {
                texto: buttonText,
                link: buttonLink
            };
        }
    }
    
    const slideData = {
        titulo,
        descricao,
    };
    
    if (botao) {
        slideData.botao = botao;
    }
    
    if (mode === 'add') {
        // Add new slide
        slidesData.push(slideData);
    } else if (mode === 'edit') {
        // Update existing slide
        const index = parseInt(document.getElementById('slide-index').value);
        slidesData[index] = slideData;
    }
    
    // Save and update display
    saveSlides();
    displaySlides();
    
    // Close modal
    document.getElementById('slide-modal').style.display = 'none';
}

// Edit slide
function editSlide(index) {
    const slide = slidesData[index];
    const form = document.getElementById('slide-form');
    const hasButtonCheckbox = document.getElementById('slide-has-button');
    const buttonDetails = document.getElementById('button-details');
    
    document.getElementById('slide-modal-title').textContent = 'Editar Slide';
    form.setAttribute('data-mode', 'edit');
    document.getElementById('slide-index').value = index;
    document.getElementById('slide-titulo').value = slide.titulo;
    document.getElementById('slide-descricao').value = slide.descricao;
    
    if (slide.botao) {
        hasButtonCheckbox.checked = true;
        buttonDetails.style.display = 'block';
        document.getElementById('slide-button-text').value = slide.botao.texto;
        document.getElementById('slide-button-link').value = slide.botao.link;
    } else {
        hasButtonCheckbox.checked = false;
        buttonDetails.style.display = 'none';
        document.getElementById('slide-button-text').value = '';
        document.getElementById('slide-button-link').value = '';
    }
    
    // Show modal
    document.getElementById('slide-modal').style.display = 'block';
}
window.editSlide = editSlide;

// Delete slide
function deleteSlide(index) {
    if (confirm('Tem certeza que deseja excluir este slide?')) {
        slidesData.splice(index, 1);
        saveSlides();
        displaySlides();
    }
}
window.deleteSlide = deleteSlide;

// =============== Product Management ===============

// Products data
let productsData = [];

// Load products from localStorage or default values
function loadProducts() {
    const savedProducts = localStorage.getItem('products');
    
    if (savedProducts) {
        productsData = JSON.parse(savedProducts);
    } else {
        // Default products from the original site
        productsData = [
            { nome: "Kit Bottom", preco: 20, imagem: "img/Kit Bottom.png" },
            { nome: "Chinelo", preco: 35, imagem: "img/Chinelo.png" },
            { nome: "Boné", preco: 10, imagem: "img/Boné.png" }
        ];
        // Save default products
        saveProducts();
    }
    
    // Display products
    displayProducts();
}

// Save products to localStorage
function saveProducts() {
    localStorage.setItem('products', JSON.stringify(productsData));
    
    // Update the products on the main page too
    if (window.parent && window.parent.itens !== undefined) {
        window.parent.itens = productsData;
    }
}

// Display products in the management panel
function displayProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = '';
    
    productsData.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        
        card.innerHTML = `
            <img src="../${product.imagem}" alt="${product.nome}" class="product-card-image">
            <h3>${product.nome}</h3>
            <p><strong>Preço:</strong> R$ ${product.preco.toFixed(2)}</p>
            <div class="card-actions">
                <button class="edit-btn" onclick="editProduct(${index})">Editar</button>
                <button class="delete-btn" onclick="deleteProduct(${index})">Excluir</button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Set up product modal (for add/edit)
function setupProductModal() {
    const modal = document.getElementById('product-modal');
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const addBtn = document.getElementById('add-product-btn');
    const form = document.getElementById('product-form');
    
    // Close modal on X click
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close modal on Cancel button click
    cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'none';
    });
    
    // Show modal on Add button click
    addBtn.addEventListener('click', () => {
        document.getElementById('product-modal-title').textContent = 'Adicionar Produto';
        form.reset();
        form.setAttribute('data-mode', 'add');
        document.getElementById('product-index').value = '';
        modal.style.display = 'block';
    });
    
    // Form submission handler
    form.addEventListener('submit', handleProductFormSubmit);
}

// Handle product form submission (add or edit)
function handleProductFormSubmit(e) {
    e.preventDefault();
    
    const mode = e.target.getAttribute('data-mode');
    const nome = document.getElementById('product-nome').value;
    const preco = parseFloat(document.getElementById('product-preco').value);
    const imagem = document.getElementById('product-imagem').value;
    
    const productData = {
        nome,
        preco,
        imagem
    };
    
    if (mode === 'add') {
        // Add new product
        productsData.push(productData);
    } else if (mode === 'edit') {
        // Update existing product
        const index = parseInt(document.getElementById('product-index').value);
        productsData[index] = productData;
    }
    
    // Save and update display
    saveProducts();
    displayProducts();
    
    // Close modal
    document.getElementById('product-modal').style.display = 'none';
}

// Edit product
function editProduct(index) {
    const product = productsData[index];
    const form = document.getElementById('product-form');
    
    document.getElementById('product-modal-title').textContent = 'Editar Produto';
    form.setAttribute('data-mode', 'edit');
    document.getElementById('product-index').value = index;
    document.getElementById('product-nome').value = product.nome;
    document.getElementById('product-preco').value = product.preco;
    document.getElementById('product-imagem').value = product.imagem;
    
    // Show modal
    document.getElementById('product-modal').style.display = 'block';
}
window.editProduct = editProduct;

// Delete product
function deleteProduct(index) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        productsData.splice(index, 1);
        saveProducts();
        displayProducts();
    }
}
window.deleteProduct = deleteProduct;

// =============== User Management ===============

// Users data
let usersData = [];

// Load users from localStorage or default values
function loadUsers() {
    const savedUsers = localStorage.getItem('users');
    
    if (savedUsers) {
        usersData = JSON.parse(savedUsers);
    } else {
        // Default users
        usersData = [
            {
                id: '1',
                name: 'Maria Elisa',
                email: 'murbackmariaelisa@gmail.com',
                type: 'manager'
            }
        ];
        // Save default users
        saveUsers();
    }
    
    // Display users
    displayUsers();
}

// Save users to localStorage
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(usersData));
}

// Display users in the management panel
function displayUsers() {
    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = '';
    
    usersData.forEach(user => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.type === 'manager' ? 'Gerente' : 'Usuário'}</td>
            <td>
                <button class="edit-btn" onclick="editUser('${user.id}')">Editar</button>
                <button class="delete-btn" onclick="deleteUser('${user.id}')">Excluir</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Set up user modal (for add/edit)
function setupUserModal() {
    const modal = document.getElementById('user-modal');
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const addBtn = document.getElementById('add-user-btn');
    const form = document.getElementById('user-form');
    
    // Close modal on X click
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close modal on Cancel button click
    cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'none';
    });
    
    // Show modal on Add button click
    addBtn.addEventListener('click', () => {
        document.getElementById('user-modal-title').textContent = 'Adicionar Usuário';
        form.reset();
        form.setAttribute('data-mode', 'add');
        document.getElementById('user-id').value = '';
        modal.style.display = 'block';
    });
    
    // Form submission handler
    form.addEventListener('submit', handleUserFormSubmit);
}

// Generate unique ID for users
function generateUserId() {
    return Date.now().toString();
}

// Handle user form submission (add or edit)
async function handleUserFormSubmit(e) {
    e.preventDefault();
    
    const mode = e.target.getAttribute('data-mode');
    const name = document.getElementById('user-nome').value;
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;
    const type = document.getElementById('user-type').value;
    
    try {
        if (mode === 'add') {
            // Create user in Firebase
            const { createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
            
            // Create a new auth instance for creating users without affecting current user
            const currentUser = window.firebaseAuth.currentUser;
            
            // Create the new user
            const userCredential = await createUserWithEmailAndPassword(window.firebaseAuth, email, password);
            const user = userCredential.user;
            
            // Update the profile with the name
            await updateProfile(user, { displayName: name });
            
            // Add user to local users data
            const userData = {
                id: user.uid,
                name,
                email,
                type
            };
            
            usersData.push(userData);
            
            // Sign back in as the manager if needed
            if (currentUser && currentUser.email !== email) {
                await window.firebaseAuth.signInWithEmailAndPassword(currentUser.email, currentUser.password);
            }
        } else if (mode === 'edit') {
            // Update existing user
            const userId = document.getElementById('user-id').value;
            
            // Find user index
            const userIndex = usersData.findIndex(u => u.id === userId);
            
            if (userIndex !== -1) {
                // Update user data
                usersData[userIndex] = {
                    ...usersData[userIndex],
                    name,
                    email,
                    type
                };
                
                // Firebase users can't be directly updated here,
                // as we don't have access to change their email or role in Firebase
                // This is a simplified version that updates only our local data
            }
        }
        
        // Save and update display
        saveUsers();
        displayUsers();
        
        // Close modal
        document.getElementById('user-modal').style.display = 'none';
    } catch (error) {
        console.error("Error managing user:", error);
        alert(`Erro ao gerenciar usuário: ${error.message}`);
    }
}

// Edit user
function editUser(userId) {
    const user = usersData.find(u => u.id === userId);
    
    if (user) {
        const form = document.getElementById('user-form');
        
        document.getElementById('user-modal-title').textContent = 'Editar Usuário';
        form.setAttribute('data-mode', 'edit');
        document.getElementById('user-id').value = user.id;
        document.getElementById('user-nome').value = user.name;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-password').value = ''; // Can't display password
        document.getElementById('user-type').value = user.type;
        
        // Disable email field as Firebase doesn't allow easy email changes
        document.getElementById('user-email').disabled = true;
        
        // Show modal
        document.getElementById('user-modal').style.display = 'block';
    }
}
window.editUser = editUser;

// Delete user
async function deleteUser(userId) {
    if (confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
        // Find user index
        const userIndex = usersData.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            // Delete user locally
            usersData.splice(userIndex, 1);
            saveUsers();
            displayUsers();
            
            // Note: Deleting users from Firebase requires special admin privileges
            // and typically would be done through a server-side function
            alert('Usuário removido localmente. Observação: O usuário não foi removido do Firebase pois isso requer privilégios administrativos.');
        }
    }
}
window.deleteUser = deleteUser;

// =============== Order Management ===============

// Orders data
let ordersData = [];

// Load orders from localStorage or default values
function loadOrders() {
    const savedOrders = localStorage.getItem('orders');
    
    if (savedOrders) {
        ordersData = JSON.parse(savedOrders);
    } else {
        // Mock orders data (in a real application this would come from a database)
        ordersData = [
            {
                id: 'ORD20230001',
                customer: 'João Silva',
                customerEmail: 'joao@example.com',
                date: '2023-10-15',
                products: [
                    { nome: 'Kit Bottom', qtd: 2, preco: 20 },
                    { nome: 'Boné', qtd: 1, preco: 10 }
                ],
                total: 50.00,
                paymentMethod: 'Cartão de Crédito'
            },
            {
                id: 'ORD20230002',
                customer: 'Maria Santos',
                customerEmail: 'maria@example.com',
                date: '2023-10-16',
                products: [
                    { nome: 'Chinelo', qtd: 1, preco: 35 }
                ],
                total: 35.00,
                paymentMethod: 'Pix'
            }
        ];
        // Save mock orders
        saveOrders();
    }
    
    // Display orders
    displayOrders();
}

// Save orders to localStorage
function saveOrders() {
    localStorage.setItem('orders', JSON.stringify(ordersData));
}

// Display orders in the management panel
function displayOrders() {
    const tbody = document.querySelector('#orders-table tbody');
    tbody.innerHTML = '';
    
    ordersData.forEach(order => {
        const tr = document.createElement('tr');
        
        // Format products list
        const productsText = order.products.map(p => 
            `${p.qtd}x ${p.nome} (R$ ${p.preco.toFixed(2)})`
        ).join('<br>');
        
        tr.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customer}<br><small>${order.customerEmail}</small></td>
            <td>${formatDate(order.date)}</td>
            <td>${productsText}</td>
            <td>R$ ${order.total.toFixed(2)}</td>
            <td>${order.paymentMethod}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Helper function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', options);
}

// Update the window object to make functions available
window.editSlide = editSlide;
window.deleteSlide = deleteSlide;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.logoutUser = logoutUser;