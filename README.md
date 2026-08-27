# CollabCompiler 💻🤝

A high-performance, real-time collaborative code editor built for seamless pair programming, technical interviews, and rapid prototyping.

## 📖 About The Project

CollabCompiler solves the friction of setting up shared coding environments. Instead of relying on screen sharing or sending code snippets back and forth, developers can instantly generate a secure, ephemeral room and code together in real time directly from their browser.

### How the Collaboration Flows

1. **Create & Share:** A user (the **Leader**) creates a room and shares the unique **Room ID**.
2. **Join & Sync:** A second user (the **Member**) joins the room. The backend instantly synchronizes their editor with the current code, selected language, and the Leader's live cursor position.
3. **Collaborate with Control:** To prevent typing conflicts, CollabCompiler uses a strict **Control Ownership state machine**. Only one person can type at a time, but control can be seamlessly passed back and forth. The Leader retains ultimate authority and can override to take control back instantly.
4. **Execute & Review:** The active controller can execute the code using a live compiler engine. The execution state, including a synchronized loading spinner and final terminal output, is broadcast to both users simultaneously, ensuring everyone sees the exact same results.

## 🎯 Perfect For

* **Technical Interviews:** Conduct seamless remote coding assessments with full visibility.
* **Hackathons & Competitive Coding:** Collaborate effortlessly with teammates during hackathons, open-source sprints, or algorithm challenges.
* **Pair Programming:** Debug complex logic together without the hassle of pushing and pulling commits for every small change.

## ✨ Core Features

* **Real-Time Synchronization:** Instantaneous code and language state propagation powered by WebSockets.
* **Server-Authoritative Control:** A strict Leader/Member state machine manages input permissions and prevents typing conflicts.
* **Remote Cursors:** Custom Monaco Editor integrations provide visual awareness of peer cursor positions.

  * 🟡 Gold for Leader
  * 🟢 Emerald for Member
* **Secure Execution Engine:** JDoodle API integration hardened with 5-second rate limiting and 50KB payload validation.
* **State Recovery:** In-memory backend caching ensures seamless reconnections and synchronization for late joiners or page refreshes.

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Monaco Editor
* Zustand

### Backend

* FastAPI
* Python
* WebSockets
* Uvicorn
* Pydantic Settings

### Production Infrastructure

* **Frontend:** Vercel
* **Backend:** Render

## 🚀 Local Quick Start

### 1. Backend Initialization

Navigate to the backend directory, install the required Python packages, and launch the Uvicorn server.

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Frontend Initialization

Navigate to the frontend directory, install Node dependencies, and start the Vite development server.

```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Configuration

Ensure your local environment variables are properly configured before running the application.

#### Backend — `backend/.env`

```env
JDOODLE_CLIENT_ID=your_client_id
JDOODLE_CLIENT_SECRET=your_client_secret
```

#### Frontend — `frontend/.env.local`

```env
VITE_API_URL=your_backend_api_url
VITE_WS_URL=your_websocket_url
```

## 🔄 Collaboration Flow

```text
Leader
  │
  ▼
Create Room
  │
  ▼
Share Room ID
  │
  ▼
Member Joins Room
  │
  ▼
Backend Synchronizes:
├── Code
├── Selected Language
├── Cursor Position
└── Control Ownership
  │
  ▼
Active Controller Writes Code
  │
  ▼
Execute Code
  │
  ▼
Synchronized Loading State
  │
  ▼
Shared Terminal Output
```

## 🔐 Control Ownership Model

```text
Leader Creates Room
        │
        ▼
Leader Has Control
        │
        ▼
Member Joins Room
        │
        ▼
Control Can Be Passed
        │
        ├──► Leader
        │
        └──► Member
               │
               ▼
       Leader Can Override
```

## ⚡ Key Highlights

* Real-time collaborative coding
* Secure ephemeral rooms
* Live code synchronization
* Remote cursor tracking
* Controlled editing permissions
* Synchronized code execution
* Shared terminal output
* Reconnection and state recovery
* Production-ready frontend and backend deployment
