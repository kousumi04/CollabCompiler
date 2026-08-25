from typing import Optional
from pydantic import BaseModel, Field

class ExecuteCodeRequest(BaseModel):
    language: str = Field(..., description="Programming language key (e.g. python, javascript, cpp)")
    code: str = Field(..., min_length=1, max_length=65536, description="Source code text to execute")
    stdin: Optional[str] = Field(default="", max_length=10000, description="Optional standard input")

class ExecuteCodeResponse(BaseModel):
    stdout: str
    stderr: str
    exit_code: Optional[int] = None
    status: str
    execution_time: Optional[float] = None