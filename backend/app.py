import os
import json
import logging
import anthropic
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="FastAPI + React App")

# Middleware para logging de requisições
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Requisição recebida: {request.method} {request.url}")
    logger.info(f"Headers: {request.headers}")
    try:
        response = await call_next(request)
        logger.info(f"Resposta enviada: Status {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Erro na requisição: {str(e)}")
        raise

# Middleware para hosts confiáveis
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]
)

# Configuração do CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173", 
    "https://fastapi-backend-je9z.onrender.com",
    "https://fastapireactproject.vercel.app",
    "http://fastapireactproject.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Modelos Pydantic
class Task(BaseModel):
    id: int
    title: str
    completed: bool

class TaskList(BaseModel):
    tasks: List[str]

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    tasks: Optional[List[dict]] = None

# Cliente Anthropic
api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    raise ValueError("ANTHROPIC_API_KEY não está definida no ambiente")

client = anthropic.Client(api_key=api_key)

# Dados iniciais
tasks = [
    {"id": 1, "title": "Aprender FastAPI", "completed": True},
    {"id": 2, "title": "Aprender React", "completed": False},
    {"id": 3, "title": "Fazer Deploy no Render", "completed": False},
    {"id": 4, "title": "Ir a academia", "completed": True},
    {"id": 5, "title": "Ir ao Shopping", "completed": True},
]

@app.post("/api/chat")
async def chat(message: ChatMessage):
    try:
        logger.info(f"Chat endpoint called with message: {message.message}")
        
        # Construindo o prompt
        system_message = """Você é um assistente que ajuda a criar tarefas.
        Quando identificar um pedido de criação de tarefas, extraia os títulos com base na mensagem do usuário.
        Se houver múltiplas tarefas, liste uma por linha.
        Exemplo de resposta para "Preciso estudar Python e fazer exercícios":
        Estudar Python
        Fazer exercícios"""

        user_message = {
            "role": "user",
            "content": message.message
        }

        logger.info("Enviando requisição para Claude...")

        # Chamada para a API do Claude
        response = client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=1000,
            temperature=0,
            system=system_message,
            messages=[user_message]
        )

        logger.info(f"Resposta recebida do Claude: {response}")

        # Processando múltiplas tarefas
        response_lines = [line.strip() for line in response.content[0].text.split('\n') if line.strip()]
        created_tasks = []
        
        for line in response_lines:
            task = {
                "id": len(tasks) + 1,
                "title": line,
                "completed": False
            }
            tasks.append(task)
            created_tasks.append(task)

        logger.info(f"Tarefas criadas: {len(created_tasks)}")

        # Verificando se é um pedido de tarefa
        is_task_request = any(keyword in message.message.lower() 
                            for keyword in ["criar tarefa", "nova tarefa", "adicionar tarefa", "fazer tarefa", "lista de tarefas"])

        if is_task_request:
            if len(created_tasks) > 1:
                response_text = f"✨ Criei {len(created_tasks)} tarefas:\n" + "\n".join([f"- {task['title']}" for task in created_tasks])
            else:
                response_text = f"✨ Tarefa criada: {created_tasks[0]['title']}" if created_tasks else "Nenhuma tarefa identificada"
            
            return ChatResponse(response=response_text, tasks=created_tasks)
        else:
            return ChatResponse(response="\n".join(response_lines))

    except Exception as e:
        logger.error(f"Erro no chat: {str(e)}")
        logger.exception("Stack trace completo:")
        raise HTTPException(
            status_code=500,
            detail={
                "error": str(e),
                "message": "Erro ao processar mensagem no chat"
            }
        )

@app.get("/")
async def read_root():
    return {"status": "ok", "message": "FastAPI Backend is running"}

@app.get("/api/tasks", response_model=List[Task])
async def get_tasks():
    logger.info("Buscando todas as tarefas")
    return tasks

@app.post("/api/tasks", response_model=Task)
async def create_task(task: Task):
    logger.info(f"Criando nova tarefa: {task.dict()}")
    tasks.append(task.dict())
    return task

@app.post("/api/tasks/bulk", response_model=List[Task])
async def create_bulk_tasks(task_list: TaskList):
    logger.info(f"Criando {len(task_list.tasks)} tarefas")
    created_tasks = []
    for title in task_list.tasks:
        task = {
            "id": len(tasks) + 1,
            "title": title,
            "completed": False
        }
        tasks.append(task)
        created_tasks.append(task)
    return created_tasks

@app.put("/api/tasks/{task_id}", response_model=Task)
async def update_task(task_id: int, task: Task):
    logger.info(f"Atualizando tarefa {task_id}: {task.dict()}")
    for i, t in enumerate(tasks):
        if t["id"] == task_id:
            tasks[i] = task.dict()
            return task
    raise HTTPException(status_code=404, detail="Task não encontrada")

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: int):
    logger.info(f"Deletando tarefa {task_id}")
    for i, task in enumerate(tasks):
        if task["id"] == task_id:
            del tasks[i]
            return {"message": "Task deletada com sucesso"}
    raise HTTPException(status_code=404, detail="Task não encontrada")

# Tratamento de exceções global
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    logger.error(f"HTTPException: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": str(exc.detail)},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Erro não tratado: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"message": "Erro interno do servidor"},
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 5009))
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=port,
        log_level="info"
    )