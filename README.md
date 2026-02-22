# Flowenci

Flowenci is an AI-powered interview confidence trainer for students. This repository contains both the React frontend and the Python FastAPI backend.

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **Python** (v3.10+)

---

## 🚀 Running the Application Local Development

To run the full application, you will need to open **two separate terminal windows**: one for the backend and one for the frontend.

### 1. Start the Backend Server (FastAPI)

1. Open a new terminal and navigate to the backend directory:
   ```bash
   cd flowenci-backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your environment variables:
   - Copy `.env.example` to a new file called `.env` in the `flowenci-backend` directory.
   - Open `.env` and configure your `DATABASE_URL` with your **Supabase PostgreSQL** connection string.
   - Example format: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`
5. Start the backend Development Server:
   ```cmd
   uvicorn main:app --reload
   ```
   > The backend API will be running at `http://localhost:8000`. 
   > You can view the API Swagger documentation by visiting `http://localhost:8000/docs`.

### 2. Start the Frontend Server (React + Vite)

1. Open a **second, new terminal** and navigate to the frontend directory:
   ```bash
   cd flowenci-frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   > The frontend app will be running at `http://localhost:5173` (or the port shown in your terminal). Open this link in your browser to view the application!
