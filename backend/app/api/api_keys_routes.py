from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from cryptography.fernet import Fernet
import base64
import os

router = APIRouter(prefix="/api-keys", tags=["api-keys"])

# Generate or load encryption key
def get_encryption_key():
    key = os.getenv("ENCRYPTION_KEY")
    if not key:
        # Generate a new key if none exists (for development)
        key = Fernet.generate_key()
        print(f"Generated encryption key: {key.decode()}")
        print("Please set ENCRYPTION_KEY environment variable for production")
    else:
        key = key.encode()
    return key

class APIKeyRequest(BaseModel):
    provider: str
    encrypted_key: str

class APIKeyResponse(BaseModel):
    provider: str
    has_key: bool

@router.post("/store")
async def store_api_key(request: APIKeyRequest):
    """Store an encrypted API key for a provider"""
    try:
        # For now, we'll just return success
        # In a real implementation, you'd store this in a secure database
        return {
            "success": True,
            "message": f"API key for {request.provider} stored successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error storing API key: {str(e)}")

@router.get("/check/{provider}")
async def check_api_key(provider: str):
    """Check if an API key exists for a provider"""
    try:
        # For now, always return that no key exists
        # In a real implementation, you'd check your secure storage
        return APIKeyResponse(provider=provider, has_key=False)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking API key: {str(e)}")

@router.delete("/{provider}")
async def delete_api_key(provider: str):
    """Delete an API key for a provider"""
    try:
        # For now, just return success
        # In a real implementation, you'd delete from secure storage
        return {
            "success": True,
            "message": f"API key for {provider} deleted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting API key: {str(e)}")
