# **BreakerBot WebApp - Management Dashboard 🎛️**

## **Overview**
BreakerBot WebApp is the web management interface for [BreakerBot](https://github.com/GustavoCaruzoGoncalves/BreakerBot). It allows users to view their statistics, configure preferences, and track rankings directly from the browser, without needing to interact with the bot via WhatsApp.

## **Key Features**
- **WhatsApp Authentication** – Secure login using a code sent by the bot directly to your WhatsApp.
- **User Profile** – View level, XP, prestige, messages sent, and achievements.
- **Custom Settings** – Set a custom name, enable/disable mentions, and configure reaction emoji.
- **Ranking** – Track the XP ranking and see who won the daily bonus.
- **Secret Santa** – View Secret Santa groups, participants, and who you drew in the raffle.
- **Admin Panel** – Administrators have access to advanced settings and backups.
- **Dark Mode** – Adaptive interface with support for light, dark, and automatic themes.

## **Technologies**
- **Next.js 14** – React framework with App Router
- **TypeScript** – Static typing
- **Tailwind CSS** – Utility-first styling
- **shadcn/ui** – UI components
- **Framer Motion** – Smooth animations
- **next-themes** – Theme management

## **Installation & Setup**

### **Prerequisites**
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **BreakerBot API** running (see the [main repository](https://github.com/GustavoCaruzoGoncalves/BreakerBot))

### **Installation Steps**

#### **1. Clone the Repository**
```sh
git clone https://github.com/GustavoCaruzoGoncalves/BreakerBotWebApp.git
cd BreakerBotWebApp
```

#### **2. Configure Environment Variables**
```sh
cp .env.example .env.local
```
Edit `.env.local` and set the API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### **3. Install Dependencies**
```sh
npm install
```

#### **4. Run in Development**
```sh
npm run dev
```
Access http://localhost:3000

## **Production Deployment**

### **Build for Production**
```sh
npm run build
```

### **Run with PM2**
```sh
npm run server
```

### **PM2 Commands**
```sh
npm run stop      # Stop the server
npm run restart   # Restart the server
```

## **Nginx Configuration**
To serve in production with your own domain, configure Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name app.yourdomain.com;

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

## **Project Structure**
```
BreakerBotWebApp/
├── app/                    # Pages (App Router)
│   ├── dashboard/          # Logged-in area
│   │   ├── page.tsx        # Profile
│   │   ├── ranking/        # Ranking
│   │   ├── amigo-secreto/  # Secret Santa
│   │   └── settings/       # Settings (admin)
│   ├── login/              # Login page
│   └── verify/             # Code verification
├── components/             # Reusable components
├── contexts/               # React contexts (Auth)
├── hooks/                  # Custom hooks
└── lib/                    # Utilities and API client
```

## **BreakerBot Integration**
This webapp communicates with the BreakerBot REST API. Make sure that:

1. BreakerBot is running with the API enabled (`npm run startwapi`)
2. The `CORS_ORIGINS` variable in BreakerBot's `.env` includes the webapp URL
3. The `NEXT_PUBLIC_API_URL` variable points to the API correctly

## **License**
This project is licensed under the MIT License.

## **Contributing**
Contributions are welcome! Open an issue or submit a pull request.
