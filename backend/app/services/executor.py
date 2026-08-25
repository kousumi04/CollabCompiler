import os
import time
from pathlib import Path
import httpx
from typing import Dict, Any
from dotenv import load_dotenv
from app.schemas.execution import ExecuteCodeRequest, ExecuteCodeResponse

# Explicitly load .env from the backend root directory (CollabCompiler/backend/.env)
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(dotenv_path=BACKEND_DIR / ".env")

JDOODLE_API_URL = "https://api.jdoodle.com/v1/execute"
JDOODLE_CLIENT_ID = os.getenv("JDOODLE_CLIENT_ID", "").strip()
JDOODLE_CLIENT_SECRET = os.getenv("JDOODLE_CLIENT_SECRET", "").strip()

# JDoodle Language mappings (language code and version index)
LANGUAGE_CONFIG: Dict[str, Dict[str, str]] = {
    "python": {"language": "python3", "versionIndex": "4"},  # Python 3.9.9
    "javascript": {"language": "nodejs", "versionIndex": "4"},  # Node 17.1.0
    "cpp": {"language": "cpp17", "versionIndex": "1"},  # C++ 17 (g++ 11.2.0)
    "c": {"language": "c", "versionIndex": "5"},  # C (gcc 11.2.0)
    "java": {"language": "java", "versionIndex": "4"},  # Java JDK 17.0.1
    "rust": {"language": "rust", "versionIndex": "4"}  # Rust 1.56.1
}

class CodeExecutionService:
    @staticmethod
    async def run_code(request: ExecuteCodeRequest) -> ExecuteCodeResponse:
        if not JDOODLE_CLIENT_ID or not JDOODLE_CLIENT_SECRET:
            return ExecuteCodeResponse(
                stdout="",
                stderr="Server configuration error: Missing JDoodle credentials in .env file.",
                exit_code=1,
                status="internal_error"
            )

        lang_key = request.language.lower()
        if lang_key not in LANGUAGE_CONFIG:
            return ExecuteCodeResponse(
                stdout="",
                stderr=f"Unsupported language: '{request.language}'",
                exit_code=1,
                status="unsupported_language"
            )

        config = LANGUAGE_CONFIG[lang_key]
        
        payload = {
            "clientId": JDOODLE_CLIENT_ID,
            "clientSecret": JDOODLE_CLIENT_SECRET,
            "script": request.code,
            "stdin": request.stdin or "",
            "language": config["language"],
            "versionIndex": config["versionIndex"]
        }

        start_time = time.time()
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(JDOODLE_API_URL, json=payload)
            
            elapsed_time = round(time.time() - start_time, 3)

            if response.status_code != 200:
                return ExecuteCodeResponse(
                    stdout="",
                    stderr=f"JDoodle API error: {response.text}",
                    exit_code=1,
                    status="execution_engine_error",
                    execution_time=elapsed_time
                )

            data = response.json()
            
            output = data.get("output", "")
            error_status = data.get("error", "")
            
            if error_status and str(error_status).lower() != "none":
                return ExecuteCodeResponse(
                    stdout="",
                    stderr=f"{error_status}\n{output}".strip(),
                    exit_code=1,
                    status="error",
                    execution_time=elapsed_time
                )

            return ExecuteCodeResponse(
                stdout=output,
                stderr="",
                exit_code=0,
                status="success",
                execution_time=elapsed_time
            )

        except httpx.TimeoutException:
            return ExecuteCodeResponse(
                stdout="",
                stderr="Execution timed out after 15 seconds.",
                exit_code=124,
                status="timeout",
                execution_time=round(time.time() - start_time, 3)
            )
        except Exception as exc:
            return ExecuteCodeResponse(
                stdout="",
                stderr=f"Internal executor failure: {str(exc)}",
                exit_code=1,
                status="internal_error",
                execution_time=round(time.time() - start_time, 3)
            )