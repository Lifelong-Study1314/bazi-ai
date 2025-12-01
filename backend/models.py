"""
Pydantic models for API requests
"""

from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    """Request model for BAZI analysis"""
    birth_date: str  # Format: YYYY-MM-DD
    birth_hour: int  # Format: 0-23
    gender: str      # "male" or "female"
    language: str = "en"  # "en", "zh-TW", or "zh-CN"
    
    class Config:
        json_schema_extra = {
            "example": {
                "birth_date": "1990-05-15",
                "birth_hour": 14,
                "gender": "male",
                "language": "en"
            }
        }
