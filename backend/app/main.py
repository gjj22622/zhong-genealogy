from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, persons, submissions, admin

app = FastAPI(title="鐘氏族譜 API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://gjj22622.github.io",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(persons.router)
app.include_router(submissions.router)
app.include_router(admin.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
