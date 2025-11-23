# Metro SP - Sistema de Monitoramento de Obras (Frontend)

Interface web moderna desenvolvida em React + TypeScript para o sistema de monitoramento de obras do Metro de São Paulo.

## 🚀 Funcionalidades

- **Autenticação segura** com JWT
- **Dashboard intuitivo** com resumo dos relatórios
- **Análise de progresso** com upload de múltiplas imagens
- **Visualização de relatórios** gerados pela IA
- **Download de relatórios em PDF**
- **Interface responsiva** para desktop e mobile
- **Componentes modernos** com Shadcn/ui

## 🛠️ Tecnologias

- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes de interface
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **React Hook Form** - Formulários
- **Sonner** - Notificações
- **Lucide React** - Ícones

## 📋 Pré-requisitos

- Node.js 18 ou superior
- NPM ou Bun
- Backend da aplicação rodando (veja instruções do backend)

## 🔧 Instalação

1. **Clone ou baixe o projeto**

2. **Instale as dependências:**
```bash
npm install
# ou
bun install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Metro Monitor
VITE_APP_VERSION=1.0.0
```

4. **Execute em modo desenvolvimento:**
```bash
npm run dev
# ou
bun dev
```

5. **Acesse a aplicação:**
```
http://localhost:5173
```

## 🏗️ Build para Produção

```bash
npm run build
# ou
bun run build
```

Os arquivos de produção serão gerados na pasta `dist/`.

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   └── ui/             # Componentes de interface (Shadcn/ui)
├── hooks/              # Hooks personalizados
│   ├── use-auth.tsx    # Gerenciamento de autenticação
│   └── use-toast.ts    # Sistema de notificações
├── lib/                # Utilitários e configurações
│   ├── api.ts          # Cliente API e tipos
│   └── utils.ts        # Funções utilitárias
├── pages/              # Páginas da aplicação
│   ├── Dashboard.tsx   # Página principal
│   ├── Login.tsx       # Página de login
│   ├── Register.tsx    # Página de cadastro
│   ├── Analysis.tsx    # Página de nova análise
│   ├── ReportDetail.tsx# Detalhes do relatório
│   ├── Project.tsx     # Página do projeto (legacy)
│   ├── Reports.tsx     # Lista de relatórios (legacy)
│   └── NotFound.tsx    # Página 404
├── App.tsx             # Componente principal
├── main.tsx            # Ponto de entrada
└── index.css           # Estilos globais
```

## 🔗 Integração com Backend

O frontend se conecta com o backend Python Flask através das seguintes rotas:

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Cadastro
- `GET /api/auth/profile` - Perfil do usuário
- `GET /api/auth/verify` - Verificar token

### Análises e Relatórios
- `POST /api/reports/analyze` - Nova análise
- `GET /api/reports/reports` - Listar relatórios
- `GET /api/reports/reports/{id}` - Detalhes do relatório
- `GET /api/reports/download/{id}` - Download PDF

## 🎨 Fluxo da Aplicação

1. **Login/Cadastro** - Usuário faz autenticação
2. **Dashboard** - Visualiza resumo dos relatórios e acesso rápido
3. **Nova Análise** - Upload de imagem modelo e imagens atuais
4. **Processamento** - Backend processa com IA e gera relatório
5. **Visualização** - Usuário vê detalhes da análise
6. **Download** - Pode baixar relatório em PDF

## 🚦 Estados da Aplicação

### Autenticação
- Token JWT armazenado no localStorage
- Verificação automática na inicialização
- Redirecionamento automático para login se não autenticado

### Upload de Imagens
- Validação de tamanho (máx 16MB por imagem)
- Suporte a múltiplas imagens atuais
- Preview dos arquivos selecionados
- Indicadores de progresso durante upload

### Relatórios
- Lista paginada com resumo
- Visualização detalhada com progresso
- Download de PDFs
- Indicadores visuais de progresso

## 🎯 Componentes Principais

### `useAuth` Hook
Gerencia todo o estado de autenticação:
- Login/logout
- Verificação de token
- Dados do usuário

### `api.ts`
Cliente HTTP configurado:
- Interceptors para token automático
- Tratamento de erros
- Tipos TypeScript

### Páginas Principais
- **Dashboard**: Overview com cartões de relatórios recentes
- **Analysis**: Formulário de upload com validações
- **ReportDetail**: Visualização completa do relatório

## 🔧 Desenvolvimento

### Scripts Disponíveis
```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run preview      # Preview do build
npm run lint         # Verificar código
```

### Padrões de Código
- TypeScript strict mode
- ESLint configurado
- Componentes funcionais com hooks
- CSS-in-JS com Tailwind

## 🐛 Resolução de Problemas

### Erro de CORS
Certifique-se que o backend está configurado para aceitar requisições da origem do frontend.

### Erro de conexão com API
Verifique se:
- Backend está rodando na porta correta
- URL da API está correta no `.env`
- Firewall não está bloqueando a conexão

### Erro de autenticação
- Limpe o localStorage: `localStorage.clear()`
- Verifique se o backend JWT está funcionando
- Confirme se as rotas de auth estão corretas

## 📱 Responsividade

A aplicação é totalmente responsiva:
- **Desktop**: Layout com sidebar e múltiplas colunas
- **Tablet**: Adaptação do grid e espaçamentos
- **Mobile**: Stack vertical e menu colapsável

## 🔒 Segurança

- Tokens JWT com expiração automática
- Validação de uploads no frontend e backend
- Sanitização de dados de entrada
- HTTPS em produção (recomendado)

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Upload da pasta dist/ para Netlify
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📄 Licença

Este projeto faz parte do sistema de monitoramento de obras do Metro de São Paulo.

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para questões técnicas ou dúvidas sobre o sistema, entre em contato com a equipe de desenvolvimento.