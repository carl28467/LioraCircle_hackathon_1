# LioraCircle
LioraCircle is a comprehensive family health and lifestyle management application powered by an intelligent AI assistant named **Liora**. It helps families manage their health data, schedules, kitchen inventory, and more, all in one place.
## Features
-   **Dashboard**: Get an at-a-glance view of your family's health and activities.
-   **AI Assistant (Liora)**: An intelligent chat interface to interact with your data, ask for health advice, and manage app features.
-   **Family Circle**: Manage family members, view their profiles, and invite new members.
-   **Health Vitals**: Track and monitor vital signs for each family member.
-   **Smart Kitchen**: Manage your kitchen inventory, track item health, and get recipe suggestions.
-   **Schedule**: Organize family events, routines, and tasks.
-   **Liora Memory**: A central hub for the AI to save, analyze, and display individual and family data insights.
## Tech Stack
### Frontend
-   **Framework**: React (with Vite)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **UI Components**: Radix UI, Lucide React
-   **Animations**: Framer Motion
-   **Routing**: React Router
### Backend
-   **Framework**: FastAPI (Python)
-   **Server**: Uvicorn
-   **Database & Auth**: Supabase
-   **AI/LLM**: Google Generative AI / OpenAI
## Prerequisites
-   Node.js (v18 or higher)
-   Python (v3.10 or higher)
-   Supabase Account (for Database and Auth)
-   OpenAI or Google Gemini API Key (for Liora AI)
## Installation
### 1. Clone the repository
```bash
git clone <repository-url>
cd LioraCircle
```
### 2. Frontend Setup
Navigate to the root directory (where `package.json` is located) and install dependencies:
```bash
npm install
```
### 3. Backend Setup
Navigate to the `backend` directory and install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```
### 4. Environment Variables
#### Backend
Create a `.env` file in the `backend` directory with the following variables:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
# OR
GEMINI_API_KEY=your_gemini_api_key
```
#### Frontend
Create a `.env` file in the root directory (if needed for specific frontend config, though Supabase client usually expects these):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
## Running the Application
### Start the Backend Server
From the root directory (or `backend` directory depending on your path configuration):
```bash
# If running from root
python -m uvicorn backend.main:app --reload --port 8000
```
### Start the Frontend Development Server
From the root directory:
```bash
npm run dev
```
The application will be available at `http://localhost:5173` (or the port shown in your terminal).
## Project Structure
-   `src/`: Frontend source code
    -   `components/`: Reusable UI components
    -   `pages/`: Application pages (Dashboard, FamilyCircle, etc.)
    -   `context/`: React context providers (Auth, etc.)
-   `backend/`: Backend source code
    -   `main.py`: Entry point for the FastAPI application
    -   `routers/`: API route definitions
    -   `agents/`: AI agent logic
    -   `core/`: Core utilities and database connections
