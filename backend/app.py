from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="FastAPI + React App")

@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Requisição recebida: {request.method} {request.url}")
    logger.info(f"Cabeçalhos: {request.headers}")
    response = await call_next(request)
    return response

# Adiciona middleware de host confiável
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Em produção, especifique seus domínios reais
)

# URLs permitidas para CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://fastapi-backend-je9z.onrender.com",
    "https://seu-app.vercel.app",  # Você vai substituir isso com sua URL do Vercel
    "https://*.vercel.app"  # Permite todos os subdomínios do Vercel durante o desenvolvimento
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo de dados
class Task(BaseModel):
    id: int
    title: str
    completed: bool

# Dados de exemplo
tasks = [
    {"id": 1, "title": "Aprender FastAPI", "completed": True},
    {"id": 2, "title": "Aprender React", "completed": False},
    {"id": 3, "title": "Fazer Deploy no Render", "completed": False}
]

@app.get("/")
async def read_root():
    return {"status": "ok", "message": "FastAPI Backend is running"}

@app.get("/api/tasks", response_model=List[Task])
async def get_tasks():
    return tasks

@app.get("/api/hello")
async def hello():
    return {"message": "Olá do FastAPI!"}

@app.post("/api/tasks", response_model=Task)
async def create_task(task: Task):
    tasks.append(task.dict())
    return task

@app.put("/api/tasks/{task_id}", response_model=Task)
async def update_task(task_id: int, task: Task):
    for i, t in enumerate(tasks):
        if t["id"] == task_id:
            tasks[i] = task.dict()
            return task
    return {"error": "Task não encontrada"}

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: int):
    for i, task in enumerate(tasks):
        if task["id"] == task_id:
            del tasks[i]
            return {"message": "Task deletada com sucesso"}
    return {"error": "Task não encontrada"}

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": str(exc.detail)},
    )