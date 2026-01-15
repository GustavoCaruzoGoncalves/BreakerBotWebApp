# **BreakerBot WebApp - Painel de Gerenciamento 🎛️**

## **Overview**
BreakerBot WebApp é a interface web de gerenciamento do [BreakerBot](https://github.com/GustavoCaruzoGoncalves/BreakerBot). Permite que usuários visualizem suas estatísticas, configurem preferências e acompanhem rankings diretamente pelo navegador, sem precisar interagir com o bot via WhatsApp.

## **Key Features**
- **Autenticação via WhatsApp** – Login seguro usando código enviado pelo bot diretamente no seu WhatsApp.
- **Perfil do Usuário** – Visualize nível, XP, prestígio, mensagens enviadas e conquistas.
- **Configurações Personalizadas** – Defina nome personalizado, ative/desative menções e configure emoji de reação.
- **Ranking** – Acompanhe o ranking de XP e veja quem ganhou o bônus diário.
- **Amigo Secreto** – Visualize grupos de amigo secreto, participantes e quem você tirou no sorteio.
- **Painel Admin** – Administradores têm acesso a configurações avançadas e backups.
- **Modo Escuro** – Interface adaptável com suporte a tema claro, escuro e automático.

## **Tecnologias**
- **Next.js 14** – Framework React com App Router
- **TypeScript** – Tipagem estática
- **Tailwind CSS** – Estilização utilitária
- **shadcn/ui** – Componentes de UI
- **Framer Motion** – Animações fluidas
- **next-themes** – Gerenciamento de temas

## **Installation & Setup**

### **Prerequisites**
- **Node.js** (v18 ou superior)
- **npm** ou **yarn**
- **BreakerBot API** rodando (veja o [repositório principal](https://github.com/GustavoCaruzoGoncalves/BreakerBot))

### **Installation Steps**

#### **1. Clone o Repositório**
```sh
git clone https://github.com/GustavoCaruzoGoncalves/BreakerBotWebApp.git
cd BreakerBotWebApp
```

#### **2. Configure as Variáveis de Ambiente**
```sh
cp .env.example .env.local
```
Edite `.env.local` e configure a URL da API:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### **3. Instale as Dependências**
```sh
npm install
```

#### **4. Execute em Desenvolvimento**
```sh
npm run dev
```
Acesse http://localhost:3000

## **Production Deployment**

### **Build para Produção**
```sh
npm run build
```

### **Executar com PM2**
```sh
npm run server
```

### **Comandos PM2**
```sh
npm run stop      # Para o servidor
npm run restart   # Reinicia o servidor
```

## **Configuração com Nginx**
Para servir em produção com domínio próprio, configure o Nginx como proxy reverso:

```nginx
server {
    listen 80;
    server_name app.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## **Estrutura do Projeto**
```
BreakerBotWebApp/
├── app/                    # Páginas (App Router)
│   ├── dashboard/          # Área logada
│   │   ├── page.tsx        # Perfil
│   │   ├── ranking/        # Ranking
│   │   ├── amigo-secreto/  # Amigo Secreto
│   │   └── settings/       # Configurações (admin)
│   ├── login/              # Página de login
│   └── verify/             # Verificação de código
├── components/             # Componentes reutilizáveis
├── contexts/               # Contextos React (Auth)
├── hooks/                  # Hooks customizados
└── lib/                    # Utilitários e API client
```

## **Integração com BreakerBot**
Este webapp se comunica com a API REST do BreakerBot. Certifique-se de que:

1. O BreakerBot está rodando com a API habilitada (`npm run startwapi`)
2. A variável `CORS_ORIGINS` no `.env` do BreakerBot inclui a URL do webapp
3. A variável `NEXT_PUBLIC_API_URL` aponta para a API corretamente

## **License**
Este projeto é licenciado sob a MIT License.

## **Contributing**
Contribuições são bem-vindas! Abra uma issue ou envie um pull request.
