# 🔥 FirewallX Frontend

> **Real-time Network Firewall Simulation and Visualization Dashboard**
> Built with **React + TypeScript + Vite**, powered by a **Flask WebSocket backend**.
> Author: **Edwin Bwambale** (© 2025)

---

## 🚀 Overview

**FirewallX** is a network-security simulation platform that allows users to:

* Visualize real-time packet flow and firewall rule evaluation.
* Start, stop, and monitor simulated traffic in a secure sandbox.
* Create, update, and delete firewall rules dynamically.
* Inspect live logs of decisions (`ALLOW` / `BLOCK`) via WebSocket updates.
* View simulation metrics on an interactive dashboard.

This repository contains the **frontend** client, built in **React + TypeScript + Vite**, which communicates with the backend (`Flask + Socket/REST`) running on port **5001**.

---

## 🧱 Tech Stack

| Layer         | Technology                               | Description                         |
| ------------- | ---------------------------------------- | ----------------------------------- |
| ⚛️ Frontend   | **React 18 + TypeScript + Vite**         | Fast SPA with modular components    |
| 🎨 Styling    | **Tailwind CSS + NativeWind components** | Modern responsive UI                |
| 🔁 Routing    | **React Router DOM v6**                  | Declarative client-side navigation  |
| 🧠 State Mgmt | **Context API + Hooks**                  | Centralized simulation / rule state |
| 🔌 WebSockets | **Flask-Sock / WS**                      | Real-time packet streaming          |
| 🧰 Tooling    | **ESLint + Prettier**                    | Consistent code formatting          |
| 🧪 Build Tool | **Vite 5 (HMR)**                         | Lightning-fast dev & build pipeline |

---

## 📂 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── App.tsx             # Main app with routes
│   ├── main.tsx            # Entry point
│   ├── components/         # Reusable UI + layout components
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/             # Buttons, Cards, Spinners
│   ├── pages/              # Page views
│   │   ├── Dashboard.tsx
│   │   ├── Simulator.tsx
│   │   ├── RuleManager.tsx
│   │   └── Logs.tsx
│   ├── context/            # React Contexts
│   │   ├── PacketContext.tsx
│   │   ├── RuleContext.tsx
│   │   └── AppProvider.tsx
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API / WebSocket / Rule / Packet services
│   ├── types/              # Shared TypeScript interfaces
│   └── utils/              # Constants + helpers
├── vite.config.ts          # Dev server + proxy config
└── README.md
```

---

## ⚙️ Development Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/adbranches/firewallx.git
cd firewallx/frontend
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Run the Flask backend (in a separate terminal)

```bash
cd ../backend
python3 app.py
```

### 4️⃣ Start the Vite dev server

```bash
npm run dev
```

Now open 👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🔗 Environment & Proxy

The frontend automatically proxies all API calls to the Flask backend running on **port 5001**.
This is configured in **vite.config.ts**:

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5001',
      changeOrigin: true,
    },
  },
}
```

If you use WebSockets, they’ll connect to `ws://localhost:5001/ws`.

---

## 🧭 Navigation Routes

| Path         | Component     | Purpose                     |
| ------------ | ------------- | --------------------------- |
| `/`          | `Dashboard`   | Overview of packets & rules |
| `/simulator` | `Simulator`   | Start/stop live simulation  |
| `/rules`     | `RuleManager` | Manage firewall rules       |
| `/logs`      | `Logs`        | View recent packet logs     |
| `/about`     | Inline page   | Project info & team credits |

---

## 🧑‍💻 Contributing Guide

We welcome contributions from the community!

### 🪜 Steps

1. **Fork** this repository.
2. **Create a branch** for the feature or fix:

   ```bash
   git checkout -b feature/improve-navbar
   ```
3. **Commit changes**:

   ```bash
   git commit -m "Enhanced Navbar navigation and styling"
   ```
4. **Push** and open a **Pull Request**.

### ✅ Contribution Guidelines

* Follow ESLint + Prettier formatting.
* Keep components small, composable, and typed.
* Write meaningful commit messages.
* Test WebSocket interactions with a running backend before submitting.

---

## 🧪 Testing Simulation

1. Start both **backend** and **frontend**.
2. Visit **Simulator** → click **Start Sim**.
3. Watch real-time packets appear in **Dashboard** and **Logs**.
4. Adjust **Rules** to `ALLOW` / `BLOCK` traffic and observe changes instantly.

---

## 🧠 Troubleshooting

| Issue                                            | Likely Cause                            | Fix                       |
| ------------------------------------------------ | --------------------------------------- | ------------------------- |
| `WebSocket closed before connection established` | Backend not running on 5001             | Start Flask app first     |
| Dashboard says *Backend Disconnected*            | `/api/health` unreachable               | Verify backend URL/proxy  |
| No packets displayed                             | Simulation stopped                      | Click **Start Sim**       |
| `[No Flask Context] Simulated packet`            | Background thread outside Flask context | Safe – informational only |

---

## 🧾 License

This project is licensed under the **MIT License**.
Feel free to use, modify, and distribute it with attribution.

---

## 🌟 Acknowledgments

* **Uganda Technology and Management University (UTAMU)** — for inspiration.
* **Flask-Sock & React Router DOM** — for reliable real-time integration.
* **Community Contributors** — for continuous feedback and testing.

---

**FirewallX Frontend**
`© 2025 Edwin Bwambale – All Rights Reserved`

---
