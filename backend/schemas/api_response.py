from typing import Any

from pydantic import BaseModel


class ApiError(BaseModel):
    code: str
    message: str


class ApiResponse(BaseModel):
    success: bool
    data: Any | None
    error: ApiError | None


def success_response(data: Any):
    return {"success": True, "data": data, "error": None}


def error_response(code: str, message: str):
    return {"success": False, "data": None, "error": {"code": code, "message": message}}
