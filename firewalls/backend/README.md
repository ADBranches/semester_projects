# 🔥 FirewallX Backend

> **Real-time Firewall Simulation Engine & WebSocket API**
> Powered by **Flask + Flask-Sock + SQLAlchemy**
> Author: **Edwin Bwambale (© 2025)**

---

## 🚀 Overview

**FirewallX** is a **real-time network simulation platform** designed to teach and demonstrate firewall operations, packet filtering, and live traffic inspection.

The **backend service** provides:

* REST API endpoints for rules, logs, and simulation control
* WebSocket interface for real-time packet streaming to connected clients
* Persistent packet and rule storage (via SQLAlchemy + MySQL/PostgreSQL)
* Mock data generation for testing firewall performance

---

## 🧠 Key Features

✅ Real-time **packet simulation engine** (multi-threaded)
✅ Integrated **WebSocket** service for instant UI updates
✅ **Firewall rule engine** for dynamic packet evaluation
✅ **Persistent storage** of packets, logs, and rules
✅ Modular Flask blueprints for clean API structure
✅ Context-safe threading using `app.app_context()`
✅ CORS-enabled Flask configuration (for React frontend)

---

## 🧱 Tech Stack

| Layer                | Technology                               | Purpose                          |
| -------------------- | ---------------------------------------- | -------------------------------- |
| 🐍 Backend Framework | **Flask**                                | Core REST API                    |
| 🔌 Real-Time Engine  | **Flask-Sock (WebSocket)**               | Live packet & simulation feed    |
| 🗃 ORM               | **SQLAlchemy**                           | Models, DB schema & migrations   |
| 🧠 Firewall Engine   | **Custom Rule Evaluator**                | Determines `ALLOW` / `BLOCK`     |
| 🧪 Simulation        | **Threaded Mock Packet Generator**       | Background packet streaming      |
| 🔐 API Design        | **Blueprints + REST JSON**               | Organized modular API            |
| ⚙️ Utils             | **Eventlet / Threading / Random / JSON** | High-performance mock simulation |

---

## 📂 Project Structure

```
backend/
├── app.py                     # Main Flask entry point (creates app)
├── config.py                  # Environment configuration
├── routes/                    # API route blueprints
│   ├── __init__.py
│   ├── packet_routes.py
│   ├── rule_routes.py
│   └── log_routes.py
├── services/                  # Core backend logic
│   ├── websocket_service.py   # Real-time WebSocket simulation handler
│   ├── firewall_engine.py     # Firewall rule evaluator
│   ├── packet_parser.py       # Validates and sanitizes packet data
│   ├── simulator.py           # PacketSimulator class
│   └── mock_data.py           # Randomized packet/rule generators
├── models/                    # SQLAlchemy models
│   ├── __init__.py
│   ├── packet.py
│   ├── rule.py
│   └── log.py
├── utils/                     # Helper modules
│   ├── db.py                  # DB init + session management
│   └── decorators.py          # Route utilities
├── requirements.txt           # Python dependencies
└── README.md
```

---

## ⚙️ Setup Guide

### 1️⃣ Clone the repository

```bash
git clone https://github.com/adbranches/firewallx.git
cd firewallx/backend
```

### 2️⃣ Create & activate a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3️⃣ Install dependencies

```bash
pip install -r requirements.txt
```

### 4️⃣ Configure the environment

Copy or create a `.env` or config file:

```bash
# config.py or .env
SQLALCHEMY_DATABASE_URI = "sqlite:///firewallx.db"
SECRET_KEY = "supersecretkey"
DEBUG = True
```

### 5️⃣ Initialize the database

```bash
python3 -c "from utils.db import init_db; from app import create_app; app=create_app(); init_db(app)"
```

### 6️⃣ Run the backend

```bash
python3 app.py
```

✅ The backend will start on `http://localhost:5001`
✅ WebSocket active on `ws://localhost:5001/ws`

---

## 🧩 API Endpoints

### 🔸 Health Check

```
GET /api/health
→ { "message": "FirewallX backend is running!" }
```

### 🔸 Rules

```
GET /api/rules
POST /api/rules
PUT /api/rules/<id>
DELETE /api/rules/<id>
```

### 🔸 Packets

```
POST /api/packets/simulate
GET /api/packets
```

### 🔸 Logs

```
GET /api/logs
```

---

## 🌐 WebSocket Endpoints

**URL:** `ws://localhost:5001/ws`

### Events:

| Type                | Direction       | Description                          |
| ------------------- | --------------- | ------------------------------------ |
| `start_simulation`  | Client → Server | Starts background packet generator   |
| `stop_simulation`   | Client → Server | Stops the simulation                 |
| `simulate_packet`   | Client → Server | Sends a custom packet for evaluation |
| `PACKET_RESULT`     | Server → Client | Emits evaluated packet + decision    |
| `simulation_status` | Server → Client | Sends simulation running/stopped     |
| `error`             | Server → Client | Error messages                       |

Example message from backend:

```json
{
  "type": "PACKET_RESULT",
  "packet": {
    "src_ip": "192.168.1.22",
    "dest_ip": "10.0.0.5",
    "port": 443,
    "protocol": "TCP",
    "timestamp": "2025-10-27T06:00:12Z"
  },
  "log": {
    "decision": "ALLOW",
    "reason": "Rule match: allow HTTPS traffic"
  }
}
```

---

## 🧠 Internal Services Explained

### 🔹 `websocket_service.py`

Handles all connected clients, broadcasts simulation packets, and routes message events.

### 🔹 `firewall_engine.py`

Core decision engine that compares packets against stored rules.

### 🔹 `simulator.py`

Class-based packet generator for standalone or integrated simulation.

### 🔹 `packet_parser.py`

Validates incoming packet structure (`src_ip`, `dest_ip`, `port`, `protocol`).

---

## 🧪 Running Simulation

### Start Simulation

```bash
curl -X POST http://localhost:5001/api/simulation/start
```

### Stop Simulation

```bash
curl -X POST http://localhost:5001/api/simulation/stop
```

### Watch Live in Frontend

Open [http://localhost:5173](http://localhost:5173)
and hit **Start Sim** — packets will stream live via WebSocket.

---

## 🧰 Troubleshooting

| Issue                                            | Cause                                     | Fix                                                 |
| ------------------------------------------------ | ----------------------------------------- | --------------------------------------------------- |
| `WebSocket closed before connection established` | Frontend loaded before backend            | Start backend first                                 |
| `[No Flask Context]`                             | Thread not wrapped in `app.app_context()` | Safe to ignore, or wrap loop                        |
| `Failed to fetch /api/*`                         | CORS or proxy misconfig                   | Ensure CORS enabled + Vite proxy set                |
| DB errors                                        | Missing schema                            | Run `init_db()` again                               |
| Rules not applying                               | Empty DB or bad rule logic                | Recreate sample rules or check `firewall_engine.py` |

---

## 🧑‍💻 Contributing

We welcome collaboration and feature suggestions!

1. Fork this repo
2. Create a feature branch

   ```bash
   git checkout -b feature/improve-websocket-handling
   ```
3. Commit & push the changes
4. Open a Pull Request 🎉

**Code style**:

* Follow PEP8
* Document functions clearly
* Use meaningful commit messages

---

## 🧾 License

Licensed under the **MIT License**.
You’re free to use, modify, and share with attribution.

---

## 🌟 Credits

* **Lead Developer:** Edwin Bwambale
* **Institution:** Uganda Technology and Management University (UTAMU)
* **Backend Stack:** Flask + Flask-Sock + SQLAlchemy
* **Frontend Integration:** React + Vite + TypeScript
* **Special Thanks:** GDSC UTAMU, CyberStars, IEEEXtreme teams for collaboration & testing.

---