# Trabalho 2 Bimestre DW1 

## Resumo do Projeto

Implementei com sucesso um sistema de login/cadastro conectado ao Firebase Authentication no projeto da lojinha. O sistema agora exige que os usuários façam login antes de finalizar compras.

## Funcionalidades Implementadas

### 1. Tela de Login/Cadastro
- **Localização**: `/telaLogin/login.html`
- **Funcionalidades**:
  - Formulário de login com email e senha
  - Formulário de cadastro com nome, email e senha
  - Recuperação de senha via email
  - Validação de campos obrigatórios
  - Mensagens de erro e sucesso
  - Design responsivo com gradiente moderno

### 2. Integração com Firebase
- **SDK**: Firebase v10.7.1 via CDN
- **Serviços utilizados**:
  - Firebase Authentication
  - Criação de contas com email/senha
  - Login com email/senha
  - Recuperação de senha
  - Gerenciamento de estado de autenticação

### 3. Sistema de Autenticação na Página Principal
- **Botão dinâmico**: Mostra "Login" ou "Logout" conforme o estado
- **Informações do usuário**: Exibe nome do usuário quando logado
- **Persistência**: Mantém estado de login entre sessões

### 4. Proteção da Página de Pagamento
- **Verificação obrigatória**: Usuários não logados não podem acessar o pagamento
- **Tela de bloqueio**: Mostra mensagem explicativa e botão para login
- **Redirecionamento**: Após login, usuário pode finalizar a compra
- **Registro de compras**: Sistema registra dados da transação

## Estrutura de Arquivos

```
lojinha-firebase/
├── index.html                 # Página principal com botão login/logout
├── telaLogin/
│   ├── login.html            # Tela de login/cadastro
│   ├── login.css             # Estilos da tela de login
│   └── login.js              # Lógica de autenticação
├── pagamento/
│   ├── pagamento.html        # Página de pagamento protegida
│   └── pagamento.js          # Lógica de pagamento com verificação
├── firebase.json             # Configuração do Firebase
└── [outros arquivos do projeto original]
```

## Como Configurar o Firebase

Para usar o sistema, você precisa:

1. **Criar um projeto no Firebase Console**:
   - Acesse https://console.firebase.google.com
   - Crie um novo projeto
   - Ative o Authentication
   - Configure o provedor Email/Password

2. **Obter as credenciais**:
   - No console do Firebase, vá em Configurações do Projeto
   - Na seção "Seus apps", adicione um app web
   - Copie as credenciais de configuração

3. **Atualizar os arquivos**:
   - Substitua as configurações em `index.html` (linhas 100-107)
   - Substitua as configurações em `telaLogin/login.html` (linhas 50-57)
   - Substitua as configurações em `pagamento/pagamento.html` (linhas 134-141)

## Fluxo de Funcionamento

1. **Usuário acessa a loja**: Vê botão "Login" no canto superior direito
2. **Clica em Login**: É redirecionado para tela de login/cadastro
3. **Faz cadastro ou login**: Sistema valida e autentica via Firebase
4. **Retorna à loja**: Botão agora mostra "Logout" e nome do usuário
5. **Adiciona produtos ao carrinho**: Funcionalidade normal
6. **Clica em "PAGAR"**: Sistema verifica se está logado
7. **Se não logado**: Mostra tela pedindo login
8. **Se logado**: Permite finalizar compra e registra transação

## Recursos de Segurança

- Validação de email e senha no frontend e backend (Firebase)
- Senhas com mínimo de 6 caracteres
- Recuperação de senha via email
- Estado de autenticação persistente
- Verificação obrigatória antes de compras

## Testes Realizados

✅ Navegação entre páginas  
✅ Alternância entre formulários de login e cadastro  
✅ Verificação de autenticação na página de pagamento  
✅ Exibição correta da tela de "Login Necessário"  
✅ Botão dinâmico de login/logout na página principal  
✅ Responsividade em diferentes tamanhos de tela  

## Próximos Passos

Para colocar em produção:
1. Configure o projeto Firebase com suas credenciais
2. Teste o cadastro e login com emails reais
3. Configure domínios autorizados no Firebase Console
4. Faça deploy do projeto em um servidor web

O sistema está pronto para uso e segue as melhores práticas de autenticação web moderna.

