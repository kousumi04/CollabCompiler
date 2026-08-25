from fastapi import APIRouter
from app.schemas.execution import ExecuteCodeRequest, ExecuteCodeResponse
from app.services.executor import CodeExecutionService

router = APIRouter(prefix="/api", tags=["Execution"])

@router.post("/execute", response_model=ExecuteCodeResponse)
async def execute_code(request: ExecuteCodeRequest):
    return await CodeExecutionService.run_code(request)