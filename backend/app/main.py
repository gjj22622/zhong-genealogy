from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, persons

app = FastAPI(title="鐘氏族譜 API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(persons.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
