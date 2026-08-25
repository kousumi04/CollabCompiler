from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.execution import router as execution_router

app = FastAPI(title="CollabCompiler API")

# Relaxed CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(execution_router)

@app.get("/")
async def root():
    return {"status": "ok", "message": "CollabCompiler Backend is running"}