from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.execution import router as execution_router
from app.api.rooms import router as rooms_router
from app.api.ws import router as ws_router

app = FastAPI(title="CollabCompiler API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include HTTP routers
app.include_router(execution_router)
app.include_router(rooms_router)

# Include WebSocket router
app.include_router(ws_router)

@app.get("/")
async def root():
    return {"status": "ok", "message": "CollabCompiler Backend is running"}