# Liora AI Backend

## Setup

1.  Create a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    .\venv\Scripts\activate
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Configure environment variables:
    - Copy `.env.example` to `.env` (or just edit `.env` created by the agent).
    - Fill in `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`.

## Running the Server

```bash
uvicorn main:app --reload
```

## API Documentation

Once running, visit:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
